package com.wasteredistribution.dto;

import java.time.LocalDateTime;

public record PickupUpdateRequest(LocalDateTime scheduledAt, String pickupLocation) {
}
