package com.retroboard.backend.repository;

import com.retroboard.backend.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByInviteCode(String inviteCode);
    boolean existsByName(String name);
}
