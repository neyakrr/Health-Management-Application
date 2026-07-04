package com.healthconcierge.orchestrator.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "caregivers")
public class Caregiver {
    @Id
    private String id;
    private String patientUserId;
    private String name;
    private String email;
    private String passwordHash;
    private LocalDateTime createdAt = LocalDateTime.now();
}
