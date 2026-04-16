package com.retroboard.backend.dto.response;

import com.retroboard.backend.entity.User;

public record AuthResponse(
        String token,
        String email,
        String fullName,
        User.Role role
) {}
