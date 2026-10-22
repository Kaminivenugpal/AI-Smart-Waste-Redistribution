package com.wasteredistribution.service;

import com.wasteredistribution.entity.Session;
import com.wasteredistribution.repository.SessionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class SessionService {

    private final SessionRepository sessionRepository;
    private final long expiryDays;

    public SessionService(
            SessionRepository sessionRepository,
            @Value("${session.token.expiry.days:7}") long expiryDays) {
        this.sessionRepository = sessionRepository;
        this.expiryDays = expiryDays;
    }

    @Transactional
    public Session createSession(Long userId, String userType) {
        Session session = Session.builder()
                .token(UUID.randomUUID().toString().replace("-", ""))
                .userId(userId)
                .userType(userType)
                .expiresAt(LocalDateTime.now().plusDays(expiryDays))
                .build();
        return sessionRepository.save(session);
    }

    @Transactional
    public Optional<Session> findValidSession(String token) {
        Optional<Session> session = sessionRepository.findByToken(token);
        if (session.isPresent() && !session.get().getExpiresAt().isAfter(LocalDateTime.now())) {
            sessionRepository.delete(session.get());
            return Optional.empty();
        }
        return session;
    }

    @Transactional
    public void revokeSession(String token) {
        if (token != null && !token.isBlank()) {
            sessionRepository.deleteByToken(token);
        }
    }
}
