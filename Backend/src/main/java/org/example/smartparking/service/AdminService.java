package org.example.smartparking.service;

import org.example.smartparking.dto.response.DashboardResponse;
import org.example.smartparking.dto.response.UserResponse;

import java.util.List;

public interface AdminService {
    DashboardResponse getDashboard();
    List<UserResponse> getAllUsers();
}

