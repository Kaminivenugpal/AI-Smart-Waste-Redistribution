package com.wasteredistribution.dto;

import com.wasteredistribution.entity.Notification;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        Long donationRequestId,
        String message,
        boolean read,
        LocalDateTime createdAt) {

    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getDonationRequest().getId(),
                notification.getMessage(),
                notification.isRead(),
                notification.getCreatedAt());
    }
}
