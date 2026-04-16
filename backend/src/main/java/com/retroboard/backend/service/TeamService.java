package com.retroboard.backend.service;

import com.retroboard.backend.dto.request.CreateTeamRequest;
import com.retroboard.backend.dto.response.TeamResponse;
import com.retroboard.backend.entity.Team;
import com.retroboard.backend.entity.User;
import com.retroboard.backend.exception.ResourceNotFoundException;
import com.retroboard.backend.repository.TeamRepository;
import com.retroboard.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;

    public List<TeamResponse> getTeams(User currentUser) {
        return teamRepository.findByCompany(currentUser.getCompany()).stream()
                .map(TeamResponse::from)
                .toList();
    }

    @Transactional
    public TeamResponse createTeam(CreateTeamRequest request, User currentUser) {
        if (!currentUser.isAdmin()) {
            throw new SecurityException("Yalnizca admin takim olusturabilir.");
        }
        Team team = Team.builder()
                .name(request.name())
                .company(currentUser.getCompany())
                .build();
        return TeamResponse.from(teamRepository.save(team));
    }

    @Transactional
    public void deleteTeam(Long teamId, User currentUser) {
        if (!currentUser.isAdmin()) {
            throw new SecurityException("Yalnizca admin takim silebilir.");
        }
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Takim bulunamadi: " + teamId));
        if (!team.getCompany().getId().equals(currentUser.getCompany().getId())) {
            throw new SecurityException("Bu takima erisim yetkiniz yok.");
        }
        teamRepository.delete(team);
    }

    @Transactional
    public TeamResponse addMember(Long teamId, Long userId, User currentUser) {
        if (!currentUser.isAdmin()) {
            throw new SecurityException("Yalnizca admin uye ekleyebilir.");
        }
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Takim bulunamadi: " + teamId));
        if (!team.getCompany().getId().equals(currentUser.getCompany().getId())) {
            throw new SecurityException("Bu takima erisim yetkiniz yok.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanici bulunamadi: " + userId));
        if (!user.getCompany().getId().equals(currentUser.getCompany().getId())) {
            throw new SecurityException("Baska sirketteki kullanici eklenemez.");
        }
        if (!team.getMembers().contains(user)) {
            team.getMembers().add(user);
        }
        return TeamResponse.from(teamRepository.save(team));
    }

    @Transactional
    public TeamResponse removeMember(Long teamId, Long userId, User currentUser) {
        if (!currentUser.isAdmin()) {
            throw new SecurityException("Yalnizca admin uye cikarabilir.");
        }
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Takim bulunamadi: " + teamId));
        if (!team.getCompany().getId().equals(currentUser.getCompany().getId())) {
            throw new SecurityException("Bu takima erisim yetkiniz yok.");
        }
        team.getMembers().removeIf(u -> u.getId().equals(userId));
        return TeamResponse.from(teamRepository.save(team));
    }
}
