package com.retroboard.backend.controller;

import com.retroboard.backend.dto.request.UpdateProfileRequest;
import com.retroboard.backend.dto.response.UserResponse;
import com.retroboard.backend.entity.User;
import com.retroboard.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserResponse>> getUsers(@AuthenticationPrincipal User user) {
        if (!user.isAdmin()) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(userService.getUsersByCompany(user));
    }

    @PatchMapping("/{userId}/role")
    public ResponseEntity<UserResponse> updateRole(
            @PathVariable Long userId,
            @RequestParam User.Role role,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(userService.updateRole(userId, role, currentUser));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
            @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(userService.updateProfile(request, currentUser));
    }
}
