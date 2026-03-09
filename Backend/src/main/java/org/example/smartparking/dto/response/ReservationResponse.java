package org.example.smartparking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationResponse {
    private Long id;
    private Long userId;
    private String userFullName;
    private Long parkingSlotId;
    private String slotNumber;
    private String parkingName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private Double totalPrice;
    private LocalDateTime createdAt;
}

