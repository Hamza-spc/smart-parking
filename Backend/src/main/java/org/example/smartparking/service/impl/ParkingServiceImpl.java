package org.example.smartparking.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.smartparking.dto.request.ParkingRequest;
import org.example.smartparking.dto.response.ParkingResponse;
import org.example.smartparking.entity.Parking;
import org.example.smartparking.entity.SlotStatus;
import org.example.smartparking.exception.ResourceNotFoundException;
import org.example.smartparking.repository.ParkingRepository;
import org.example.smartparking.repository.ParkingSlotRepository;
import org.example.smartparking.service.ParkingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ParkingServiceImpl implements ParkingService {

    private final ParkingRepository parkingRepository;
    private final ParkingSlotRepository parkingSlotRepository;

    @Override
    @Transactional
    public ParkingResponse createParking(ParkingRequest request) {
        Parking parking = Parking.builder()
                .name(request.getName())
                .address(request.getAddress())
                .description(request.getDescription())
                .totalSlots(request.getTotalSlots())
                .pricePerHour(request.getPricePerHour())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .active(true)
                .build();

        parking = parkingRepository.save(parking);
        return mapToResponse(parking);
    }

    @Override
    @Transactional
    public ParkingResponse updateParking(Long id, ParkingRequest request) {
        Parking parking = parkingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking not found with id: " + id));

        parking.setName(request.getName());
        parking.setAddress(request.getAddress());
        parking.setDescription(request.getDescription());
        parking.setTotalSlots(request.getTotalSlots());
        parking.setPricePerHour(request.getPricePerHour());
        parking.setLatitude(request.getLatitude());
        parking.setLongitude(request.getLongitude());

        parking = parkingRepository.save(parking);
        return mapToResponse(parking);
    }

    @Override
    @Transactional
    public void deleteParking(Long id) {
        Parking parking = parkingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking not found with id: " + id));
        parkingRepository.delete(parking);
    }

    @Override
    @Transactional(readOnly = true)
    public ParkingResponse getParkingById(Long id) {
        Parking parking = parkingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking not found with id: " + id));
        return mapToResponse(parking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ParkingResponse> getAllParkings() {
        return parkingRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ParkingResponse> getActiveParkings() {
        return parkingRepository.findByActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ParkingResponse> searchParkings(String name) {
        return parkingRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ParkingResponse mapToResponse(Parking parking) {
        long availableSlots = parkingSlotRepository.countByParkingIdAndStatus(
                parking.getId(), SlotStatus.AVAILABLE);

        return ParkingResponse.builder()
                .id(parking.getId())
                .name(parking.getName())
                .address(parking.getAddress())
                .description(parking.getDescription())
                .totalSlots(parking.getTotalSlots())
                .availableSlots(availableSlots)
                .pricePerHour(parking.getPricePerHour())
                .active(parking.getActive())
                .latitude(parking.getLatitude())
                .longitude(parking.getLongitude())
                .createdAt(parking.getCreatedAt())
                .build();
    }
}

