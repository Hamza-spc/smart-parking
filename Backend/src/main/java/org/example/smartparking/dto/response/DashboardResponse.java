package org.example.smartparking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private long totalParkings;
    private long totalSlots;
    private long availableSlots;
    private long totalUsers;
    private long activeReservations;
    private long todayReservations;
    private Double totalRevenue;
}

