package com.wasteredistribution.dto;

import com.wasteredistribution.entity.AnalysisResult;
import com.wasteredistribution.entity.Item;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ItemResponse {
    private Item item;
    private AnalysisResult analysisResult;
}
