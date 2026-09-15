package com.wasteredistribution.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "analysis_results")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalysisResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "item_id", nullable = false, unique = true)
    @JsonIgnore
    private Item item;

    @Column(name = "predicted_category", nullable = false, length = 50)
    private String predictedCategory;

    @Column(name = "item_condition", nullable = false, length = 50)
    private String itemCondition;

    @Column(nullable = false, length = 20)
    private String priority;

    @Column(nullable = false)
    private Double confidence;

    @Column(name = "estimated_shelf_life", length = 100)
    private String estimatedShelfLife;

    @Column(name = "analyzed_at", updatable = false)
    private LocalDateTime analyzedAt;

    @PrePersist
    protected void onCreate() {
        this.analyzedAt = LocalDateTime.now();
    }
}
