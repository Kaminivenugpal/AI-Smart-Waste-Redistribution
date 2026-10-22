package com.wasteredistribution.dto;

import java.time.LocalDateTime;

public record AvailableDonationResponse(
        Long itemId,
        String name,
        String description,
        String category,
        String quantity,
        String location,
        String imagePath,
        String condition,
        String priority,
        String estimatedShelfLife,
        String donorName,
        String donorEmail,
        String donorPhone,
        String donorLocation,
        LocalDateTime createdAt) {
}
