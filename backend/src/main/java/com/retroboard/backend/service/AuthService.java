package com.retroboard.backend.service;

import com.retroboard.backend.dto.request.LoginRequest;
import com.retroboard.backend.dto.request.RegisterRequest;
import com.retroboard.backend.dto.response.AuthResponse;
import com.retroboard.backend.entity.Company;
import com.retroboard.backend.entity.User;
import com.retroboard.backend.exception.EmailAlreadyExistsException;
import com.retroboard.backend.exception.ResourceNotFoundException;
import com.retroboard.backend.repository.CompanyRepository;
import com.retroboard.backend.repository.UserRepository;
import com.retroboard.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException("Bu email zaten kullaniliyor: " + request.email());
        }

        Company company;
        User.Role role;

        boolean creatingCompany = request.companyName() != null && !request.companyName().isBlank();
        boolean joiningCompany = request.inviteCode() != null && !request.inviteCode().isBlank();

        if (creatingCompany) {
            if (companyRepository.existsByName(request.companyName())) {
                throw new IllegalArgumentException("Bu sirket adi zaten mevcut: " + request.companyName());
            }
            company = Company.builder()
                    .name(request.companyName())
                    .inviteCode(UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase())
                    .build();
            companyRepository.save(company);
            role = User.Role.ADMIN;
        } else if (joiningCompany) {
            company = companyRepository.findByInviteCode(request.inviteCode())
                    .orElseThrow(() -> new ResourceNotFoundException("Gecersiz davet kodu."));
            role = User.Role.USER;
        } else {
            throw new IllegalArgumentException("Sirket adi veya davet kodu gerekli.");
        }

        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .role(role)
                .company(company)
                .build();

        userRepository.save(user);
        String token = jwtUtil.generateToken(user);
        return buildAuthResponse(token, user, company, role == User.Role.ADMIN);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email()).orElseThrow();
        String token = jwtUtil.generateToken(user);
        Company company = user.getCompany();
        return buildAuthResponse(token, user, company, user.isAdmin());
    }

    private AuthResponse buildAuthResponse(String token, User user, Company company, boolean isAdmin) {
        String inviteCode = (company != null && isAdmin) ? company.getInviteCode() : null;
        String companyName = company != null ? company.getName() : null;
        Long companyId = company != null ? company.getId() : null;
        return new AuthResponse(token, user.getEmail(), user.getFullName(), user.getRole(), companyId, companyName, inviteCode);
    }
}
