package com.healthconcierge.records.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
@Data
@Entity
@Table(name = "vitals")
public class Vital {
    @Id
    private String id;
    private String userId;
    private String type;
    private Double value;
    private String unit;
    private LocalDateTime recordedAt;
}
