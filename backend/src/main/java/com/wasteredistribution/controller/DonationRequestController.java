package com.wasteredistribution.controller;

import com.wasteredistribution.config.SessionAuthFilter;
import com.wasteredistribution.dto.CreateDonationRequest;
import com.wasteredistribution.dto.DonationRequestResponse;
import com.wasteredistribution.dto.PickupUpdateRequest;
import com.wasteredistribution.service.DonationRequestService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/donation-requests")
public class DonationRequestController {

    private final DonationRequestService donationRequestService;

    public DonationRequestController(DonationRequestService donationRequestService) {
        this.donationRequestService = donationRequestService;
    }

    @PostMapping
    public ResponseEntity<DonationRequestResponse> createRequest(
            @RequestBody CreateDonationRequest body, HttpServletRequest request) {
        Long receiverId = requireUser(request, "RECEIVER");
        if (body == null || body.itemId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A donation item is required.");
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(donationRequestService.createRequest(receiverId, body.itemId(), body.note()));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<DonationRequestResponse>> getMyRequests(HttpServletRequest request) {
        String userType = userType(request);
        Long userId = requireUser(request, userType);
        if ("DONOR".equals(userType)) {
            return ResponseEntity.ok(donationRequestService.findDonorRequests(userId));
        }
        if ("RECEIVER".equals(userType)) {
            return ResponseEntity.ok(donationRequestService.findReceiverRequests(userId));
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Donor or receiver access is required.");
    }

    @PatchMapping("/{requestId}/decision")
    public ResponseEntity<DonationRequestResponse> decideRequest(
            @PathVariable Long requestId,
            @RequestParam String decision,
            HttpServletRequest request) {
        Long donorId = requireUser(request, "DONOR");
        return ResponseEntity.ok(donationRequestService.decideRequest(donorId, requestId, decision));
    }

    @PutMapping("/{requestId}/pickup")
    public ResponseEntity<DonationRequestResponse> schedulePickup(
            @PathVariable Long requestId,
            @RequestBody PickupUpdateRequest body,
            HttpServletRequest request) {
        if (body == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pickup details are required.");
        }
        return ResponseEntity.ok(donationRequestService.schedulePickup(
                requestId,
                userType(request),
                requireUser(request, userType(request)),
                body.scheduledAt(),
                body.pickupLocation()));
    }

    @PatchMapping("/{requestId}/pickup/complete")
    public ResponseEntity<DonationRequestResponse> markPickedUp(
            @PathVariable Long requestId, HttpServletRequest request) {
        String type = userType(request);
        Long userId = requireUser(request, type);
        return ResponseEntity.ok(donationRequestService.markPickedUp(requestId, type, userId));
    }

    private String userType(HttpServletRequest request) {
        Object type = request.getAttribute(SessionAuthFilter.AUTHENTICATED_USER_TYPE);
        if (!(type instanceof String)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required.");
        }
        return (String) type;
    }

    private Long requireUser(HttpServletRequest request, String expectedType) {
        Object type = request.getAttribute(SessionAuthFilter.AUTHENTICATED_USER_TYPE);
        Object id = request.getAttribute(SessionAuthFilter.AUTHENTICATED_USER_ID);
        if (!expectedType.equals(type) || !(id instanceof Long)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, expectedType + " access is required.");
        }
        return (Long) id;
    }
}
