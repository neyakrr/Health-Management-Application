package com.healthconcierge.pharmacy.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
@Data
@Entity
@Table(name = "medications")
public class Medication {
    @Id
    private String id;
    private String userId;
    private String name;
    private String dosage;
    private String frequency;
    private String foodInstructions;
    private Integer quantity = 0;
    private Integer refillThreshold = 7;
    private Integer active = 1;
    private LocalDateTime createdAt = LocalDateTime.now();
}
