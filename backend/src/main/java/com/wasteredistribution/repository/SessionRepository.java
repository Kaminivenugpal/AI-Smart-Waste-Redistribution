package com.wasteredistribution.repository;

import com.wasteredistribution.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link Session} entities.
 *
 * Provides token-based lookup and cleanup operations used by
 * {@link com.wasteredistribution.service.SessionService}.
 */
@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {

    /**
     * Find a session by its bearer token value.
     *
     * @param token 32-char UUID without dashes
     * @return an Optional containing the session if found
     */
    Optional<Session> findByToken(String token);

    /**
     * Delete a specific session by token (used during logout).
     *
     * @param token 32-char UUID without dashes
     */
    void deleteByToken(String token);

    /**
     * Purge all sessions whose expiry timestamp is before the given time.
     * Intended to be called by a scheduled cleanup job.
     *
     * @param now the cutoff time — all sessions expiring before this will be removed
     */
    void deleteByExpiresAtBefore(LocalDateTime now);
}
