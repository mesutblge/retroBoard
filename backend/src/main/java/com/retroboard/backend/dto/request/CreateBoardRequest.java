package com.retroboard.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateBoardRequest(
        @NotBlank String name,
        String sprintName
) {}
