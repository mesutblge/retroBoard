package com.retroboard.backend.dto.response;

import com.retroboard.backend.entity.Card;

import java.time.LocalDateTime;

public record CardResponse(
        Long id,
        String content,
        Card.ColumnType columnType,
        int voteCount,
        int sortOrder,
        String createdBy,
        boolean anonymous,
        boolean mine,
        LocalDateTime createdAt
) {
    public static CardResponse from(Card card, Long currentUserId) {
        return new CardResponse(
                card.getId(),
                card.getContent(),
                card.getColumnType(),
                card.getVoteCount(),
                card.getSortOrder(),
                card.isAnonymous() ? "Anonim" : card.getCreatedBy().getFullName(),
                card.isAnonymous(),
                currentUserId != null && card.getCreatedBy().getId().equals(currentUserId),
                card.getCreatedAt()
        );
    }

    public static CardResponse from(Card card) {
        return from(card, null);
    }
}
