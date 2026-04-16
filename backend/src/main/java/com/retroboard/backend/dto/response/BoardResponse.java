package com.retroboard.backend.dto.response;

import com.retroboard.backend.entity.Board;

import java.time.LocalDateTime;
import java.util.List;

public record BoardResponse(
        Long id,
        String name,
        String sprintName,
        LocalDateTime createdAt,
        List<CardResponse> cards
) {
    public static BoardResponse from(Board board) {
        return new BoardResponse(
                board.getId(),
                board.getName(),
                board.getSprintName(),
                board.getCreatedAt(),
                board.getCards().stream().map(CardResponse::from).toList()
        );
    }
}
