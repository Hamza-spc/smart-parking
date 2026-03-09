package org.example.smartparking.repository;

import org.example.smartparking.entity.Reservation;
import org.example.smartparking.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserId(Long userId);
    List<Reservation> findByUserIdAndStatus(Long userId, ReservationStatus status);

    @Query("SELECT r FROM Reservation r WHERE r.parkingSlot.id = :slotId " +
            "AND r.status = 'ACTIVE' " +
            "AND r.startTime < :endTime AND r.endTime > :startTime")
    List<Reservation> findConflictingReservations(
            @Param("slotId") Long slotId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.status = 'ACTIVE'")
    long countActiveReservations();

    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.createdAt >= :since")
    long countReservationsSince(@Param("since") LocalDateTime since);
}

