package com.healthconcierge.pharmacy.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
@Data
@Entity
@Table(name = "dose_logs")
public class DoseLog {
    @Id
    private String id;
    private String userId;
    private String medicationId;
    private LocalDateTime takenAt;
    private String status = "TAKEN";
}
