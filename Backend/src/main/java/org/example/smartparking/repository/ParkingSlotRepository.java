package org.example.smartparking.repository;

import org.example.smartparking.entity.ParkingSlot;
import org.example.smartparking.entity.SlotStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {
    List<ParkingSlot> findByParkingId(Long parkingId);
    List<ParkingSlot> findByParkingIdAndStatus(Long parkingId, SlotStatus status);
    long countByParkingIdAndStatus(Long parkingId, SlotStatus status);
    long countByStatus(SlotStatus status);
}


