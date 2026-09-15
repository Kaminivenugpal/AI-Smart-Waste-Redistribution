package com.wasteredistribution.service;

import com.wasteredistribution.dto.AIAnalysisDTO;
import com.wasteredistribution.dto.ItemResponse;
import com.wasteredistribution.entity.AnalysisResult;
import com.wasteredistribution.entity.Donor;
import com.wasteredistribution.entity.Item;
import com.wasteredistribution.repository.AnalysisResultRepository;
import com.wasteredistribution.repository.DonorRepository;
import com.wasteredistribution.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class ItemService {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private DonorRepository donorRepository;

    @Autowired
    private AnalysisResultRepository analysisResultRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private AIServiceClient aiServiceClient;

    @Transactional
    public ItemResponse analyzeAndSaveItem(Long donorId, String name, String description,
                                           String category, String quantity, String location,
                                           MultipartFile imageFile) {

        Donor donor = donorRepository.findById(donorId)
                .orElseThrow(() -> new RuntimeException("Donor not found with ID: " + donorId));

        // 1. Store Uploaded Image
        String imagePath = fileStorageService.storeFile(imageFile);

        // 2. Save Surplus Item
        Item item = Item.builder()
                .donor(donor)
                .name(name)
                .description(description)
                .category(category)
                .quantity(quantity)
                .location(location)
                .imagePath(imagePath)
                .build();

        Item savedItem = itemRepository.save(item);

        // 3. Trigger AI Service Analysis
        AIAnalysisDTO aiDTO = aiServiceClient.callAIAnalysis(name, description, category, quantity, location, imageFile);

        // 4. Save Analysis Result into Database
        AnalysisResult analysisResult = AnalysisResult.builder()
                .item(savedItem)
                .predictedCategory(aiDTO.getPredictedCategory())
                .itemCondition(aiDTO.getItemCondition())
                .priority(aiDTO.getPriority())
                .confidence(aiDTO.getConfidence())
                .estimatedShelfLife(aiDTO.getEstimatedShelfLife())
                .build();

        AnalysisResult savedAnalysis = analysisResultRepository.save(analysisResult);
        savedItem.setAnalysisResult(savedAnalysis);

        return ItemResponse.builder()
                .item(savedItem)
                .analysisResult(savedAnalysis)
                .build();
    }

    public List<Item> getItemsByDonor(Long donorId) {
        return itemRepository.findByDonorIdOrderByCreatedAtDesc(donorId);
    }

    public ItemResponse getItemDetails(Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found with ID: " + itemId));
        AnalysisResult analysis = analysisResultRepository.findByItemId(itemId).orElse(null);

        return ItemResponse.builder()
                .item(item)
                .analysisResult(analysis)
                .build();
    }
}
