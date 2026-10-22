package com.wasteredistribution.controller;

import com.wasteredistribution.config.SessionAuthFilter;
import com.wasteredistribution.dto.ItemResponse;
import com.wasteredistribution.dto.AvailableDonationResponse;
import com.wasteredistribution.entity.Item;
import com.wasteredistribution.service.DonationRequestService;
import com.wasteredistribution.service.ItemService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    @Autowired
    private ItemService itemService;

    @Autowired
    private DonationRequestService donationRequestService;

    @GetMapping("/available")
    public ResponseEntity<List<AvailableDonationResponse>> getAvailableDonations(
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "location", required = false) String location,
            HttpServletRequest request) {
        requireAuthenticatedUserType(request, "RECEIVER");
        return ResponseEntity.ok(donationRequestService.findAvailableItems(category, location));
    }

    @PostMapping("/analyze-and-save")
    public ResponseEntity<ItemResponse> analyzeAndSaveItem(
            @RequestParam("donorId") Long donorId,
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false, defaultValue = "") String description,
            @RequestParam("category") String category,
            @RequestParam("quantity") String quantity,
            @RequestParam("location") String location,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            HttpServletRequest request) {

        requireAuthenticatedDonor(request, donorId);

        ItemResponse response = itemService.analyzeAndSaveItem(
                donorId, name, description, category, quantity, location, imageFile);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/donor/{donorId}")
    public ResponseEntity<List<Item>> getItemsByDonor(
            @PathVariable Long donorId, HttpServletRequest request) {
        requireAuthenticatedDonor(request, donorId);
        return ResponseEntity.ok(itemService.getItemsByDonor(donorId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemResponse> getItemDetails(
            @PathVariable Long id, HttpServletRequest request) {
        Long donorId = authenticatedDonorId(request);
        return ResponseEntity.ok(itemService.getItemDetails(id, donorId));
    }

    private void requireAuthenticatedDonor(HttpServletRequest request, Long donorId) {
        if (!donorId.equals(authenticatedDonorId(request))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only access your own items.");
        }
    }

    private Long authenticatedDonorId(HttpServletRequest request) {
        return authenticatedUserId(request, "DONOR");
    }

    private Long authenticatedUserId(HttpServletRequest request, String requiredType) {
        Object userType = request.getAttribute(SessionAuthFilter.AUTHENTICATED_USER_TYPE);
        Object userId = request.getAttribute(SessionAuthFilter.AUTHENTICATED_USER_ID);
        if (!requiredType.equals(userType) || !(userId instanceof Long)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, requiredType + " access is required.");
        }
        return (Long) userId;
    }

    private void requireAuthenticatedUserType(HttpServletRequest request, String requiredType) {
        authenticatedUserId(request, requiredType);
    }
}
