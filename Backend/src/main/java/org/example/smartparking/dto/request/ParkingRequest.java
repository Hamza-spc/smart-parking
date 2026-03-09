package org.example.smartparking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParkingRequest {

    @NotBlank(message = "Parking name is required")
    @Size(max = 150, message = "Name must not exceed 150 characters")
    private String name;

    @NotBlank(message = "Address is required")
    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotNull(message = "Total slots is required")
    @Positive(message = "Total slots must be a positive number")
    private Integer totalSlots;

    @NotNull(message = "Price per hour is required")
    @Positive(message = "Price per hour must be positive")
    private Double pricePerHour;

    private Double latitude;

    private Double longitude;
}

