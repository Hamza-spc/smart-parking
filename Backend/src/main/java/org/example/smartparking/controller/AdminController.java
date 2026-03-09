package org.example.smartparking.controller;

import lombok.RequiredArgsConstructor;
import org.example.smartparking.dto.response.*;
import org.example.smartparking.service.AdminService;
import org.example.smartparking.service.PaymentService;
import org.example.smartparking.service.ReservationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final ReservationService reservationService;
    private final PaymentService paymentService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        DashboardResponse response = adminService.getDashboard();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> response = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/reservations")
    public ResponseEntity<ApiResponse<List<ReservationResponse>>> getAllReservations() {
        List<ReservationResponse> response = reservationService.getAllReservations();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getAllPayments() {
        List<PaymentResponse> response = paymentService.getAllPayments();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

