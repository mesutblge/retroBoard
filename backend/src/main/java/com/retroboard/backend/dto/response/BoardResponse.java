package com.retroboard.backend.dto.response;

import com.retroboard.backend.entity.Board;
import com.retroboard.backend.entity.Card;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

public record BoardResponse(
        Long id,
        String name,
        Long teamId,
        String teamName,
        boolean revealed,
        LocalDateTime createdAt,
        List<CardResponse> cards
) {
    public static BoardResponse from(Board board, Long currentUserId) {
        return new BoardResponse(
                board.getId(),
                board.getName(),
                board.getTeam().getId(),
                board.getTeam().getName(),
                board.isRevealed(),
                board.getCreatedAt(),
                board.getCards().stream()
                        .sorted(Comparator.comparingInt(Card::getSortOrder)
                                .thenComparing(Card::getCreatedAt))
                        .map(c -> CardResponse.from(c, currentUserId))
                        .toList()
        );
    }

    public static BoardResponse from(Board board) {
        return from(board, null);
    }
}
