package org.example.smartparking.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.smartparking.dto.request.ReservationRequest;
import org.example.smartparking.dto.response.ReservationResponse;
import org.example.smartparking.entity.*;
import org.example.smartparking.exception.BadRequestException;
import org.example.smartparking.exception.ResourceNotFoundException;
import org.example.smartparking.repository.ParkingSlotRepository;
import org.example.smartparking.repository.ReservationRepository;
import org.example.smartparking.repository.UserRepository;
import org.example.smartparking.service.ReservationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ReservationResponse createReservation(ReservationRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ParkingSlot slot = parkingSlotRepository.findById(request.getParkingSlotId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Parking slot not found with id: " + request.getParkingSlotId()));

        if (slot.getStatus() != SlotStatus.AVAILABLE) {
            throw new BadRequestException("Parking slot is not available");
        }

        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new BadRequestException("End time must be after start time");
        }

        // Check for conflicting reservations
        List<Reservation> conflicts = reservationRepository.findConflictingReservations(
                slot.getId(), request.getStartTime(), request.getEndTime());
        if (!conflicts.isEmpty()) {
            throw new BadRequestException("Parking slot is already reserved for the selected time period");
        }

        // Calculate total price
        long hours = Duration.between(request.getStartTime(), request.getEndTime()).toHours();
        if (hours < 1) hours = 1; // minimum 1 hour
        double totalPrice = hours * slot.getParking().getPricePerHour();

        Reservation reservation = Reservation.builder()
                .user(user)
                .parkingSlot(slot)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(ReservationStatus.ACTIVE)
                .totalPrice(totalPrice)
                .build();

        reservation = reservationRepository.save(reservation);

        // Update slot status
        slot.setStatus(SlotStatus.RESERVED);
        parkingSlotRepository.save(slot);

        // Create payment record
        Payment payment = Payment.builder()
                .reservation(reservation)
                .user(user)
                .amount(totalPrice)
                .status(PaymentStatus.PENDING)
                .build();
        reservation.setPayment(payment);
        reservationRepository.save(reservation);

        return mapToResponse(reservation);
    }

    @Override
    @Transactional
    public ReservationResponse cancelReservation(Long id, String userEmail) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + id));

        if (!reservation.getUser().getEmail().equals(userEmail)) {
            throw new BadRequestException("You can only cancel your own reservations");
        }

        if (reservation.getStatus() != ReservationStatus.ACTIVE) {
            throw new BadRequestException("Only active reservations can be cancelled");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);

        // Free up the slot
        ParkingSlot slot = reservation.getParkingSlot();
        slot.setStatus(SlotStatus.AVAILABLE);
        parkingSlotRepository.save(slot);

        // Refund payment
        if (reservation.getPayment() != null) {
            reservation.getPayment().setStatus(PaymentStatus.REFUNDED);
        }

        return mapToResponse(reservation);
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationResponse getReservationById(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + id));
        return mapToResponse(reservation);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponse> getUserReservations(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return reservationRepository.findByUserId(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponse> getAllReservations() {
        return reservationRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ReservationResponse mapToResponse(Reservation reservation) {
        return ReservationResponse.builder()
                .id(reservation.getId())
                .userId(reservation.getUser().getId())
                .userFullName(reservation.getUser().getFullName())
                .parkingSlotId(reservation.getParkingSlot().getId())
                .slotNumber(reservation.getParkingSlot().getSlotNumber())
                .parkingName(reservation.getParkingSlot().getParking().getName())
                .startTime(reservation.getStartTime())
                .endTime(reservation.getEndTime())
                .status(reservation.getStatus().name())
                .totalPrice(reservation.getTotalPrice())
                .createdAt(reservation.getCreatedAt())
                .build();
    }
}

