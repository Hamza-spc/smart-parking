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
public class ParkingResponse {
    private Long id;
    private String name;
    private String address;
    private String description;
    private Integer totalSlots;
    private Long availableSlots;
    private Double pricePerHour;
    private Boolean active;
    private Double latitude;
    private Double longitude;
    private LocalDateTime createdAt;
}

