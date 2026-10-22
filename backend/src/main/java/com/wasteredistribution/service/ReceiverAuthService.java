package com.wasteredistribution.service;

import com.wasteredistribution.dto.AuthRequest;
import com.wasteredistribution.dto.AuthResponse;
import com.wasteredistribution.dto.RegisterRequest;
import com.wasteredistribution.entity.Receiver;
import com.wasteredistribution.entity.Session;
import com.wasteredistribution.repository.ReceiverRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ReceiverAuthService {

    private final ReceiverRepository receiverRepository;
    private final PasswordEncoder passwordEncoder;
    private final SessionService sessionService;

    public ReceiverAuthService(
            ReceiverRepository receiverRepository,
            PasswordEncoder passwordEncoder,
            SessionService sessionService) {
        this.receiverRepository = receiverRepository;
        this.passwordEncoder = passwordEncoder;
        this.sessionService = sessionService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request == null
                || isBlank(request.getName())
                || isBlank(request.getEmail())
                || isBlank(request.getPassword())
                || isBlank(request.getLocation())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Name, email, password, and location are required.");
        }
        if (request.getName().trim().length() > 100
                || request.getEmail().trim().length() > 150
                || request.getLocation().trim().length() > 200
                || request.getPhone() != null && request.getPhone().length() > 20
                || request.getOrganizationName() != null && request.getOrganizationName().length() > 150) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "One or more receiver fields are too long.");
        }
        String email = request.getEmail().trim();
        if (receiverRepository.existsByEmailIgnoreCase(email)) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Email is already registered. Please login.")
                    .build();
        }

        Receiver receiver = Receiver.builder()
                .name(request.getName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .location(request.getLocation())
                .organizationName(request.getOrganizationName())
                .build();
        Receiver savedReceiver = receiverRepository.save(receiver);
        Session session = sessionService.createSession(savedReceiver.getId(), "RECEIVER");

        return AuthResponse.builder()
                .success(true)
                .message("Receiver account registered successfully.")
                .receiver(savedReceiver)
                .token(session.getToken())
                .build();
    }

    @Transactional
    public AuthResponse login(AuthRequest request) {
        if (request == null || isBlank(request.getEmail()) || isBlank(request.getPassword())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Email and password are required.")
                    .build();
        }
        return receiverRepository.findByEmailIgnoreCase(request.getEmail().trim())
                .filter(receiver -> passwordEncoder.matches(request.getPassword(), receiver.getPassword()))
                .map(receiver -> {
                    Session session = sessionService.createSession(receiver.getId(), "RECEIVER");
                    return AuthResponse.builder()
                            .success(true)
                            .message("Login successful.")
                            .receiver(receiver)
                            .token(session.getToken())
                            .build();
                })
                .orElseGet(() -> AuthResponse.builder()
                        .success(false)
                        .message("Invalid email or password.")
                        .build());
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
