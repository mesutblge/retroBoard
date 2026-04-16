package com.retroboard.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateTeamRequest(
        @NotBlank String name
) {}
