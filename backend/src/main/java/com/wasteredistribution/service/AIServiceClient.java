package com.wasteredistribution.service;

import com.wasteredistribution.dto.AIAnalysisDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
public class AIServiceClient {

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public AIAnalysisDTO callAIAnalysis(String name, String description, String category, String quantity, String location, MultipartFile file) {
        try {
            String url = aiServiceBaseUrl + "/analyze-json";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> requestBody = Map.of(
                "name", name != null ? name : "",
                "description", description != null ? description : "",
                "category", category != null ? category : "Food",
                "quantity", quantity != null ? quantity : "1",
                "location", location != null ? location : ""
            );

            HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                if ("SUCCESS".equals(body.get("status")) && body.containsKey("analysis")) {
                    Map<String, Object> analysisMap = (Map<String, Object>) body.get("analysis");
                    return AIAnalysisDTO.builder()
                            .predictedCategory((String) analysisMap.get("predicted_category"))
                            .itemCondition((String) analysisMap.get("item_condition"))
                            .priority((String) analysisMap.get("priority"))
                            .confidence(analysisMap.get("confidence") != null ? Double.parseDouble(analysisMap.get("confidence").toString()) : 90.0)
                            .estimatedShelfLife((String) analysisMap.get("estimated_shelf_life"))
                            .build();
                }
            }
        } catch (Exception ex) {
            System.err.println("[AI Service Client Warning] Python FastAPI AI service offline or unreachable: " + ex.getMessage());
            System.err.println("[AI Service Client] Using fallback local heuristic analysis algorithm.");
        }

        // Fallback local heuristic AI logic if Python FastAPI server is starting or offline
        return fallbackLocalAIAnalysis(name, description, category);
    }

    private AIAnalysisDTO fallbackLocalAIAnalysis(String name, String description, String category) {
        String text = (name + " " + description).toLowerCase();
        
        String predictedCategory = category != null && !category.isEmpty() ? category : "Food";
        if (text.contains("shirt") || text.contains("pant") || text.contains("cloth")) predictedCategory = "Clothes";
        else if (text.contains("book") || text.contains("read") || text.contains("novel")) predictedCategory = "Books";
        else if (text.contains("table") || text.contains("chair") || text.contains("desk")) predictedCategory = "Furniture";
        else if (text.contains("phone") || text.contains("laptop") || text.contains("tv")) predictedCategory = "Electronics";

        String condition = "Good";
        if (text.contains("new") || text.contains("fresh")) condition = "New";
        else if (text.contains("broken") || text.contains("damaged")) condition = "Needs Repair";
        else if (text.contains("used") || text.contains("opened")) condition = "Fair";

        String priority = "Food".equalsIgnoreCase(predictedCategory) ? "High" : "Medium";
        Double confidence = 92.5;
        
        String shelfLife = null;
        if ("Food".equalsIgnoreCase(predictedCategory)) {
            if (text.contains("cooked") || text.contains("rice") || text.contains("meal")) {
                shelfLife = "12 - 24 Hours (Immediate Redistribution Required)";
            } else if (text.contains("fruit") || text.contains("vegetable")) {
                shelfLife = "3 - 5 Days";
            } else {
                shelfLife = "24 - 48 Hours";
            }
        }

        return AIAnalysisDTO.builder()
                .predictedCategory(predictedCategory)
                .itemCondition(condition)
                .priority(priority)
                .confidence(confidence)
                .estimatedShelfLife(shelfLife)
                .build();
    }
}
