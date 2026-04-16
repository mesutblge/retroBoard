package com.retroboard.backend.repository;

import com.retroboard.backend.entity.Board;
import com.retroboard.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BoardRepository extends JpaRepository<Board, Long> {
    List<Board> findByCreatedByOrderByCreatedAtDesc(User user);
}
