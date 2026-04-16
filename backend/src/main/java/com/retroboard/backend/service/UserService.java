package com.retroboard.backend.service;

import com.retroboard.backend.dto.request.UpdateProfileRequest;
import com.retroboard.backend.dto.response.UserResponse;
import com.retroboard.backend.entity.User;
import com.retroboard.backend.exception.EmailAlreadyExistsException;
import com.retroboard.backend.exception.ResourceNotFoundException;
import com.retroboard.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponse> getUsersByCompany(User currentUser) {
        return userRepository.findByCompany(currentUser.getCompany()).stream()
                .map(UserResponse::from)
                .toList();
    }

    @Transactional
    public UserResponse updateRole(Long userId, User.Role role, User currentUser) {
        if (!currentUser.isAdmin()) {
            throw new SecurityException("Yalnizca admin rol degistirebilir.");
        }
        if (currentUser.getId().equals(userId)) {
            throw new IllegalArgumentException("Kendi rolunu degistiremezsin.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanici bulunamadi: " + userId));
        if (!user.getCompany().getId().equals(currentUser.getCompany().getId())) {
            throw new SecurityException("Baska sirketteki kullanicinin rolunu degistiremezsin.");
        }
        user.setRole(role);
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request, User currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Kullanici bulunamadi."));

        if (request.fullName() != null && !request.fullName().isBlank()) {
            user.setFullName(request.fullName().trim());
        }

        if (request.email() != null && !request.email().isBlank()) {
            String newEmail = request.email().trim();
            if (!newEmail.equals(user.getEmail())) {
                if (userRepository.existsByEmail(newEmail)) {
                    throw new EmailAlreadyExistsException("Bu email zaten kullaniliyor.");
                }
                user.setEmail(newEmail);
            }
        }

        if (request.newPassword() != null && !request.newPassword().isBlank()) {
            if (request.currentPassword() == null || request.currentPassword().isBlank()) {
                throw new IllegalArgumentException("Mevcut sifre gerekli.");
            }
            if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
                throw new IllegalArgumentException("Mevcut sifre yanlis.");
            }
            if (request.newPassword().length() < 6) {
                throw new IllegalArgumentException("Yeni sifre en az 6 karakter olmali.");
            }
            user.setPassword(passwordEncoder.encode(request.newPassword()));
        }

        return UserResponse.from(userRepository.save(user));
    }
}
