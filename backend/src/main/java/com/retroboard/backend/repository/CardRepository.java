package com.retroboard.backend.repository;

import com.retroboard.backend.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByBoardIdOrderByVoteCountDesc(Long boardId);

    @Modifying
    @Query("DELETE FROM Card c WHERE c.board.team.company.id = :companyId")
    void deleteByCompanyId(Long companyId);
}
