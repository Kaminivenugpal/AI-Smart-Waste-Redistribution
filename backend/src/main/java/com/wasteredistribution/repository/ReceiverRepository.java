package com.wasteredistribution.repository;

import com.wasteredistribution.entity.Receiver;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReceiverRepository extends JpaRepository<Receiver, Long> {
    Optional<Receiver> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
}
