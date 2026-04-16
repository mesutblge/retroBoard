package com.retroboard.backend.repository;

import com.retroboard.backend.entity.Company;
import com.retroboard.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByCompany(Company company);
    int countByCompany(Company company);

    @Modifying
    @Query("DELETE FROM User u WHERE u.company.id = :companyId")
    void deleteByCompanyId(Long companyId);
}
