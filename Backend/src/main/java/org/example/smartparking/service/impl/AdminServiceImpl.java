package org.example.smartparking.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.smartparking.dto.response.DashboardResponse;
import org.example.smartparking.dto.response.UserResponse;
import org.example.smartparking.entity.SlotStatus;
import org.example.smartparking.repository.*;
import org.example.smartparking.service.AdminService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final ParkingRepository parkingRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;
    private final PaymentRepository paymentRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        long totalParkings = parkingRepository.count();
        long totalSlots = parkingSlotRepository.count();
        long availableSlots = parkingSlotRepository.countByStatus(SlotStatus.AVAILABLE);
        long totalUsers = userRepository.count();
        long activeReservations = reservationRepository.countActiveReservations();
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        long todayReservations = reservationRepository.countReservationsSince(todayStart);
        Double totalRevenue = paymentRepository.getTotalRevenue();

        return DashboardResponse.builder()
                .totalParkings(totalParkings)
                .totalSlots(totalSlots)
                .availableSlots(availableSlots)
                .totalUsers(totalUsers)
                .activeReservations(activeReservations)
                .todayReservations(todayReservations)
                .totalRevenue(totalRevenue)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> UserResponse.builder()
                        .id(user.getId())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .phone(user.getPhone())
                        .role(user.getRole().name())
                        .createdAt(user.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}


