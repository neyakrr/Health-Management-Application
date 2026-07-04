package com.healthconcierge.orchestrator.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    private String id;
    private String email;
    private String passwordHash;
    private String name;
    private LocalDateTime createdAt = LocalDateTime.now();
}
