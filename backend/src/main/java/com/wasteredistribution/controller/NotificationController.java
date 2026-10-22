package com.wasteredistribution.controller;

import com.wasteredistribution.config.SessionAuthFilter;
import com.wasteredistribution.dto.NotificationResponse;
import com.wasteredistribution.service.DonationRequestService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final DonationRequestService donationRequestService;

    public NotificationController(DonationRequestService donationRequestService) {
        this.donationRequestService = donationRequestService;
    }

    @GetMapping("/mine")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(HttpServletRequest request) {
        Long receiverId = receiverId(request);
        return ResponseEntity.ok(donationRequestService.findNotifications(receiverId));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markRead(
            @PathVariable Long notificationId, HttpServletRequest request) {
        Long receiverId = receiverId(request);
        return ResponseEntity.ok(donationRequestService.markNotificationRead(receiverId, notificationId));
    }

    private Long receiverId(HttpServletRequest request) {
        Object type = request.getAttribute(SessionAuthFilter.AUTHENTICATED_USER_TYPE);
        Object id = request.getAttribute(SessionAuthFilter.AUTHENTICATED_USER_ID);
        if (!"RECEIVER".equals(type) || !(id instanceof Long)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Receiver access is required.");
        }
        return (Long) id;
    }
}
