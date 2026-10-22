package com.wasteredistribution.service;

import com.wasteredistribution.dto.AvailableDonationResponse;
import com.wasteredistribution.dto.DonationRequestResponse;
import com.wasteredistribution.dto.NotificationResponse;
import com.wasteredistribution.entity.DonationRequest;
import com.wasteredistribution.entity.Item;
import com.wasteredistribution.entity.Notification;
import com.wasteredistribution.entity.Receiver;
import com.wasteredistribution.repository.DonationRequestRepository;
import com.wasteredistribution.repository.ItemRepository;
import com.wasteredistribution.repository.NotificationRepository;
import com.wasteredistribution.repository.ReceiverRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class DonationRequestService {

    private static final Set<String> RESERVED_STATUSES =
            Set.of("ACCEPTED", "PICKUP_SCHEDULED", "PICKED_UP");

    private final DonationRequestRepository requestRepository;
    private final ItemRepository itemRepository;
    private final ReceiverRepository receiverRepository;
    private final NotificationRepository notificationRepository;

    public DonationRequestService(
            DonationRequestRepository requestRepository,
            ItemRepository itemRepository,
            ReceiverRepository receiverRepository,
            NotificationRepository notificationRepository) {
        this.requestRepository = requestRepository;
        this.itemRepository = itemRepository;
        this.receiverRepository = receiverRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional(readOnly = true)
    public List<AvailableDonationResponse> findAvailableItems(String category, String location) {
        String normalizedCategory = normalizeFilter(category);
        String normalizedLocation = normalizeFilter(location);
        return requestRepository.findAvailableItems(normalizedCategory, normalizedLocation)
                .stream()
                .map(item -> {
                    var analysis = item.getAnalysisResult();
                    var donor = item.getDonor();
                    return new AvailableDonationResponse(
                            item.getId(),
                            item.getName(),
                            item.getDescription(),
                            item.getCategory(),
                            item.getQuantity(),
                            item.getLocation(),
                            item.getImagePath(),
                            analysis == null ? null : analysis.getItemCondition(),
                            analysis == null ? null : analysis.getPriority(),
                            analysis == null ? null : analysis.getEstimatedShelfLife(),
                            donor.getName(),
                            donor.getEmail(),
                            donor.getPhone(),
                            donor.getLocation(),
                            item.getCreatedAt());
                })
                .toList();
    }

    @Transactional
    public DonationRequestResponse createRequest(Long receiverId, Long itemId, String note) {
        Receiver receiver = receiverRepository.findById(receiverId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Receiver account not found."));
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Donation item not found."));

        if (requestRepository.existsByItemIdAndStatusIn(itemId, RESERVED_STATUSES)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This donation is no longer available.");
        }
        if (requestRepository.existsByItemIdAndReceiverIdAndStatus(itemId, receiverId, "REQUESTED")) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already have a pending request for this donation.");
        }
        if (note != null && note.length() > 1000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request note must be 1000 characters or fewer.");
        }

        DonationRequest request = DonationRequest.builder()
                .item(item)
                .receiver(receiver)
                .donorId(item.getDonor().getId())
                .status("REQUESTED")
                .note(note == null || note.isBlank() ? null : note.trim())
                .build();
        return DonationRequestResponse.from(requestRepository.save(request));
    }

    @Transactional(readOnly = true)
    public List<DonationRequestResponse> findReceiverRequests(Long receiverId) {
        return requestRepository.findByReceiverIdOrderByCreatedAtDesc(receiverId)
                .stream().map(DonationRequestResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<DonationRequestResponse> findDonorRequests(Long donorId) {
        return requestRepository.findByDonorIdOrderByCreatedAtDesc(donorId)
                .stream().map(DonationRequestResponse::from).toList();
    }

    @Transactional
    public DonationRequestResponse decideRequest(Long donorId, Long requestId, String decision) {
        String nextStatus = decision == null ? "" : decision.trim().toUpperCase();
        if (!"ACCEPTED".equals(nextStatus) && !"REJECTED".equals(nextStatus)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Decision must be ACCEPTED or REJECTED.");
        }

        DonationRequest request = findRequest(requestId);
        requireDonor(request, donorId);
        if (!"REQUESTED".equals(request.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This request has already been decided.");
        }
        if ("ACCEPTED".equals(nextStatus)
                && requestRepository.existsByItemIdAndStatusIn(request.getItem().getId(), RESERVED_STATUSES)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Another request has already reserved this donation.");
        }

        request.setStatus(nextStatus);
        DonationRequest saved = requestRepository.save(request);
        createNotification(saved, "ACCEPTED".equals(nextStatus)
                ? "Your request for " + saved.getItem().getName() + " was accepted."
                : "Your request for " + saved.getItem().getName() + " was declined.");
        return DonationRequestResponse.from(saved);
    }

    @Transactional
    public DonationRequestResponse schedulePickup(
            Long requestId,
            String userType,
            Long userId,
            LocalDateTime scheduledAt,
            String pickupLocation) {
        DonationRequest request = findRequest(requestId);
        requireParticipant(request, userType, userId);
        if (!"ACCEPTED".equals(request.getStatus()) && !"PICKUP_SCHEDULED".equals(request.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Pickup can be coordinated after a request is accepted.");
        }
        if (scheduledAt == null || !scheduledAt.isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a pickup time in the future.");
        }
        if (pickupLocation != null && pickupLocation.length() > 250) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pickup location must be 250 characters or fewer.");
        }

        request.setPickupScheduledAt(scheduledAt);
        request.setPickupLocation(pickupLocation == null || pickupLocation.isBlank()
                ? request.getItem().getLocation() : pickupLocation.trim());
        request.setStatus("PICKUP_SCHEDULED");
        DonationRequest saved = requestRepository.save(request);
        createNotification(saved, "Pickup for " + saved.getItem().getName()
                + " is scheduled for " + scheduledAt + ".");
        return DonationRequestResponse.from(saved);
    }

    @Transactional
    public DonationRequestResponse markPickedUp(Long requestId, String userType, Long userId) {
        DonationRequest request = findRequest(requestId);
        requireParticipant(request, userType, userId);
        if (!"PICKUP_SCHEDULED".equals(request.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Pickup must be scheduled before it can be completed.");
        }

        request.setStatus("PICKED_UP");
        DonationRequest saved = requestRepository.save(request);
        createNotification(saved, "Pickup for " + saved.getItem().getName() + " is marked complete.");
        return DonationRequestResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> findNotifications(Long receiverId) {
        return notificationRepository.findByReceiverIdOrderByCreatedAtDesc(receiverId)
                .stream().map(NotificationResponse::from).toList();
    }

    @Transactional
    public NotificationResponse markNotificationRead(Long receiverId, Long notificationId) {
        Notification notification = notificationRepository.findByIdAndReceiverId(notificationId, receiverId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found."));
        notification.setRead(true);
        return NotificationResponse.from(notificationRepository.save(notification));
    }

    private DonationRequest findRequest(Long requestId) {
        return requestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Donation request not found."));
    }

    private void requireDonor(DonationRequest request, Long donorId) {
        if (!request.getDonorId().equals(donorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This request belongs to another donor.");
        }
    }

    private void requireParticipant(DonationRequest request, String userType, Long userId) {
        boolean donor = "DONOR".equals(userType) && request.getDonorId().equals(userId);
        boolean receiver = "RECEIVER".equals(userType) && request.getReceiver().getId().equals(userId);
        if (!donor && !receiver) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the donor or receiver can coordinate this pickup.");
        }
    }

    private void createNotification(DonationRequest request, String message) {
        notificationRepository.save(Notification.builder()
                .receiver(request.getReceiver())
                .donationRequest(request)
                .message(message)
                .build());
    }

    private String normalizeFilter(String filter) {
        return filter == null || filter.isBlank() ? null : filter.trim();
    }
}
