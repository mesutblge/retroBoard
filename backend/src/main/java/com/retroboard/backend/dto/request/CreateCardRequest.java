package com.retroboard.backend.dto.request;

import com.retroboard.backend.entity.Card.ColumnType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateCardRequest(
        @NotBlank String content,
        @NotNull ColumnType columnType,
        boolean anonymous
) {}
