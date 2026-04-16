package com.retroboard.backend.dto.request;

public record UpdateProfileRequest(
        String fullName,
        String email,
        String currentPassword,
        String newPassword
) {}
