package com.wasteredistribution.service;

import com.wasteredistribution.dto.AuthRequest;
import com.wasteredistribution.dto.AuthResponse;
import com.wasteredistribution.dto.RegisterRequest;
import com.wasteredistribution.entity.Donor;
import com.wasteredistribution.entity.Session;
import com.wasteredistribution.repository.DonorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private DonorRepository donorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SessionService sessionService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (donorRepository.existsByEmail(request.getEmail())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Email is already registered. Please login.")
                    .build();
        }

        Donor donor = Donor.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .location(request.getLocation())
                .build();

        Donor savedDonor = donorRepository.save(donor);
        Session session = sessionService.createSession(savedDonor.getId(), "DONOR");

        return AuthResponse.builder()
                .success(true)
                .message("Donor registered successfully!")
                .donor(savedDonor)
                .token(session.getToken())
                .build();
    }

    @Transactional
    public AuthResponse login(AuthRequest request) {
        Optional<Donor> donorOpt = donorRepository.findByEmail(request.getEmail());

        if (donorOpt.isEmpty()) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Account not found with this email.")
                    .build();
        }

        Donor donor = donorOpt.get();
        if (!passwordMatchesAndMigrate(donor, request.getPassword())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Invalid email or password.")
                    .build();
        }

        Session session = sessionService.createSession(donor.getId(), "DONOR");

        return AuthResponse.builder()
                .success(true)
                .message("Login successful!")
                .donor(donor)
                .token(session.getToken())
                .build();
    }

    @Transactional
    public AuthResponse logout(String token) {
        sessionService.revokeSession(token);
        return AuthResponse.builder()
                .success(true)
                .message("Logout successful.")
                .build();
    }

    private boolean passwordMatchesAndMigrate(Donor donor, String rawPassword) {
        String storedPassword = donor.getPassword();
        if (storedPassword == null || rawPassword == null) {
            return false;
        }

        if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$")
                || storedPassword.startsWith("$2y$")) {
            return passwordEncoder.matches(rawPassword, storedPassword);
        }

        if (!storedPassword.equals(rawPassword)) {
            return false;
        }

        donor.setPassword(passwordEncoder.encode(rawPassword));
        donorRepository.save(donor);
        return true;
    }
}
