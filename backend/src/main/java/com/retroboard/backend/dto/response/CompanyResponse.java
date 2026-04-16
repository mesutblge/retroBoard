package com.retroboard.backend.dto.response;

import com.retroboard.backend.entity.Company;

public record CompanyResponse(
        Long id,
        String name,
        String inviteCode
) {
    public static CompanyResponse from(Company company) {
        return new CompanyResponse(company.getId(), company.getName(), company.getInviteCode());
    }
}
