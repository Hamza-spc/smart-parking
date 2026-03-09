package org.example.smartparking.service;

import org.example.smartparking.dto.request.ParkingRequest;
import org.example.smartparking.dto.response.ParkingResponse;

import java.util.List;

public interface ParkingService {
    ParkingResponse createParking(ParkingRequest request);
    ParkingResponse updateParking(Long id, ParkingRequest request);
    void deleteParking(Long id);
    ParkingResponse getParkingById(Long id);
    List<ParkingResponse> getAllParkings();
    List<ParkingResponse> getActiveParkings();
    List<ParkingResponse> searchParkings(String name);
}

