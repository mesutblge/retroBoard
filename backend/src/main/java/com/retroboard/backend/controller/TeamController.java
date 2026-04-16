package com.retroboard.backend.controller;

import com.retroboard.backend.dto.request.CreateTeamRequest;
import com.retroboard.backend.dto.response.TeamResponse;
import com.retroboard.backend.entity.User;
import com.retroboard.backend.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @GetMapping
    public ResponseEntity<List<TeamResponse>> getTeams(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(teamService.getTeams(user));
    }

    @PostMapping
    public ResponseEntity<TeamResponse> createTeam(@Valid @RequestBody CreateTeamRequest request,
                                                    @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(teamService.createTeam(request, user));
    }

    @DeleteMapping("/{teamId}")
    public ResponseEntity<Void> deleteTeam(@PathVariable Long teamId,
                                            @AuthenticationPrincipal User user) {
        teamService.deleteTeam(teamId, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{teamId}/members/{userId}")
    public ResponseEntity<TeamResponse> addMember(@PathVariable Long teamId,
                                                   @PathVariable Long userId,
                                                   @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(teamService.addMember(teamId, userId, user));
    }

    @DeleteMapping("/{teamId}/members/{userId}")
    public ResponseEntity<TeamResponse> removeMember(@PathVariable Long teamId,
                                                      @PathVariable Long userId,
                                                      @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(teamService.removeMember(teamId, userId, user));
    }
}
