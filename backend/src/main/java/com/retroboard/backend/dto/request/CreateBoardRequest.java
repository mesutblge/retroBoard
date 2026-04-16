package com.retroboard.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateBoardRequest(
        @NotBlank String name,
        @NotNull Long teamId
) {}
