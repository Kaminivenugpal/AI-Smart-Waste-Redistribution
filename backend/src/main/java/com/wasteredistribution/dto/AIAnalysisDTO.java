package com.wasteredistribution.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AIAnalysisDTO {

    @JsonProperty("predicted_category")
    private String predictedCategory;

    @JsonProperty("item_condition")
    private String itemCondition;

    private String priority;
    
    private Double confidence;

    @JsonProperty("estimated_shelf_life")
    private String estimatedShelfLife;
}
