package com.wasteredistribution.repository;

import com.wasteredistribution.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);
    Optional<Notification> findByIdAndReceiverId(Long id, Long receiverId);
}
