package com.retroboard.backend.repository;

import com.retroboard.backend.entity.Board;
import com.retroboard.backend.entity.Company;
import com.retroboard.backend.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BoardRepository extends JpaRepository<Board, Long> {
    List<Board> findByTeam_CompanyOrderByCreatedAtDesc(Company company);
    List<Board> findByTeamInOrderByCreatedAtDesc(List<Team> teams);
}
