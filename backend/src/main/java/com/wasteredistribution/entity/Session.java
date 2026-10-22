package com.wasteredistribution.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Represents an authenticated session token stored in the `sessions` table.
 *
 * userId deliberately has no foreign-key constraint because it may reference
 * either the `donors` table or the `receivers` table depending on userType.
 * Enforcement is handled in the service layer.
 *
 * token is a 32-character UUID (without dashes), unique per session.
 * userType is either "DONOR" or "RECEIVER".
 */
@Entity
@Table(name = "sessions", indexes = {
    @Index(name = "idx_sessions_token", columnList = "token", unique = true),
    @Index(name = "idx_sessions_user", columnList = "user_id, user_type")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 32-character UUID without dashes, used as the Bearer token value.
     * Length 64 to allow future token format changes without a migration.
     */
    @Column(nullable = false, unique = true, length = 64)
    private String token;

    /**
     * Either "DONOR" or "RECEIVER" — determines which table userId refers to.
     */
    @Column(name = "user_type", nullable = false, length = 20)
    private String userType;

    /**
     * Primary key of the donor or receiver record (no FK constraint by design).
     */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    /**
     * Session expiry timestamp. Sessions with expiresAt in the past are invalid.
     */
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    /**
     * Set automatically on first persist.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
