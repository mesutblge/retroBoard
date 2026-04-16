package com.retroboard.backend.repository;

import com.retroboard.backend.entity.Company;
import com.retroboard.backend.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByCompany(Company company);
    int countByCompany(Company company);

    @Modifying
    @Query("DELETE FROM Team t WHERE t.company.id = :companyId")
    void deleteByCompanyId(Long companyId);
}
