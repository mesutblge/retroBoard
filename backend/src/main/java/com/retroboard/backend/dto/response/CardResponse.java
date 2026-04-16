package com.retroboard.backend.dto.response;

import com.retroboard.backend.entity.Card;

import java.time.LocalDateTime;

public record CardResponse(
        Long id,
        String content,
        Card.ColumnType columnType,
        int voteCount,
        String createdBy,
        LocalDateTime createdAt
) {
    public static CardResponse from(Card card) {
        return new CardResponse(
                card.getId(),
                card.getContent(),
                card.getColumnType(),
                card.getVoteCount(),
                card.getCreatedBy().getFullName(),
                card.getCreatedAt()
        );
    }
}
