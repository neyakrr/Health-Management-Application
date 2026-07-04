package com.healthconcierge.records.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
@Data
@Entity
@Table(name = "symptoms")
public class Symptom {
    @Id
    private String id;
    private String userId;
    private String symptom;
    private Integer severity;
    private String notes;
    private LocalDateTime recordedAt;
}
