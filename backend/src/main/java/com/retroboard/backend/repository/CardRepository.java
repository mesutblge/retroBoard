package com.retroboard.backend.repository;

import com.retroboard.backend.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByBoardIdOrderByVoteCountDesc(Long boardId);
}
