package com.healthconcierge.orchestrator.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
@Data
@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    private String id;
    private String userId;
    private String actionType;
    private String toolName;
    private String promptSummary;
    private String responseSummary;
    private LocalDateTime timestamp = LocalDateTime.now();
}
