package com.retroboard.backend.dto.response;

import com.retroboard.backend.entity.Team;

import java.util.List;

public record TeamResponse(
        Long id,
        String name,
        List<UserResponse> members
) {
    public static TeamResponse from(Team team) {
        List<UserResponse> members = team.getMembers().stream()
                .map(UserResponse::from)
                .toList();
        return new TeamResponse(team.getId(), team.getName(), members);
    }
}
