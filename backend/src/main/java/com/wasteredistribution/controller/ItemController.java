package com.wasteredistribution.controller;

import com.wasteredistribution.dto.ItemResponse;
import com.wasteredistribution.entity.Item;
import com.wasteredistribution.service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "*")
public class ItemController {

    @Autowired
    private ItemService itemService;

    @PostMapping("/analyze-and-save")
    public ResponseEntity<ItemResponse> analyzeAndSaveItem(
            @RequestParam("donorId") Long donorId,
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false, defaultValue = "") String description,
            @RequestParam("category") String category,
            @RequestParam("quantity") String quantity,
            @RequestParam("location") String location,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {

        ItemResponse response = itemService.analyzeAndSaveItem(
                donorId, name, description, category, quantity, location, imageFile);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/donor/{donorId}")
    public ResponseEntity<List<Item>> getItemsByDonor(@PathVariable Long donorId) {
        return ResponseEntity.ok(itemService.getItemsByDonor(donorId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemResponse> getItemDetails(@PathVariable Long id) {
        return ResponseEntity.ok(itemService.getItemDetails(id));
    }
}
