package com.wasteredistribution.dto;

import com.wasteredistribution.entity.DonationRequest;

import java.time.LocalDateTime;

public record DonationRequestResponse(
        Long id,
        Long itemId,
        String itemName,
        String category,
        String quantity,
        String condition,
        String itemLocation,
        String donorName,
        String donorEmail,
        String donorPhone,
        String receiverName,
        String receiverOrganization,
        String receiverEmail,
        String receiverPhone,
        String status,
        String note,
        String pickupLocation,
        LocalDateTime pickupScheduledAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

    public static DonationRequestResponse from(DonationRequest request) {
        var item = request.getItem();
        var donor = item.getDonor();
        var analysis = item.getAnalysisResult();
        var receiver = request.getReceiver();
        return new DonationRequestResponse(
                request.getId(),
                item.getId(),
                item.getName(),
                item.getCategory(),
                item.getQuantity(),
                analysis == null ? null : analysis.getItemCondition(),
                item.getLocation(),
                donor.getName(),
                donor.getEmail(),
                donor.getPhone(),
                receiver.getName(),
                receiver.getOrganizationName(),
                receiver.getEmail(),
                receiver.getPhone(),
                request.getStatus(),
                request.getNote(),
                request.getPickupLocation(),
                request.getPickupScheduledAt(),
                request.getCreatedAt(),
                request.getUpdatedAt());
    }
}
