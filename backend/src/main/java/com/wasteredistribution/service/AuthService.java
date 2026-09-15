package com.wasteredistribution.service;

import com.wasteredistribution.dto.AuthRequest;
import com.wasteredistribution.dto.AuthResponse;
import com.wasteredistribution.dto.RegisterRequest;
import com.wasteredistribution.entity.Donor;
import com.wasteredistribution.repository.DonorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private DonorRepository donorRepository;

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
                .password(request.getPassword()) // Beginner-friendly plaintext / hashed demo pass
                .phone(request.getPhone())
                .location(request.getLocation())
                .build();

        Donor savedDonor = donorRepository.save(donor);

        return AuthResponse.builder()
                .success(true)
                .message("Donor registered successfully!")
                .donor(savedDonor)
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        Optional<Donor> donorOpt = donorRepository.findByEmail(request.getEmail());

        if (donorOpt.isEmpty()) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Account not found with this email.")
                    .build();
        }

        Donor donor = donorOpt.get();
        if (!donor.getPassword().equals(request.getPassword())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Invalid email or password.")
                    .build();
        }

        return AuthResponse.builder()
                .success(true)
                .message("Login successful!")
                .donor(donor)
                .build();
    }
}
