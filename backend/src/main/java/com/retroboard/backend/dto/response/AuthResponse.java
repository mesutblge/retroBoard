package com.retroboard.backend.dto.response;

public record AuthResponse(
        String token,
        String email,
        String fullName
) {}
