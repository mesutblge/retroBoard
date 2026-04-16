package com.retroboard.backend.dto.response;

import com.retroboard.backend.entity.Board;

import java.time.LocalDateTime;
import java.util.List;

public record BoardResponse(
        Long id,
        String name,
        Long teamId,
        String teamName,
        LocalDateTime createdAt,
        List<CardResponse> cards
) {
    public static BoardResponse from(Board board) {
        return new BoardResponse(
                board.getId(),
                board.getName(),
                board.getTeam().getId(),
                board.getTeam().getName(),
                board.getCreatedAt(),
                board.getCards().stream().map(CardResponse::from).toList()
        );
    }
}
