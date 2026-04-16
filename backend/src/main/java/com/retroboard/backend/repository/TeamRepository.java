package com.retroboard.backend.repository;

import com.retroboard.backend.entity.Company;
import com.retroboard.backend.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByCompany(Company company);
}
