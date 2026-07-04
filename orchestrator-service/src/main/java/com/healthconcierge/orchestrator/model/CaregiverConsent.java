package com.healthconcierge.orchestrator.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
@Data
@Entity
@Table(name = "caregiver_consents")
public class CaregiverConsent {
    @Id
    private String id;
    private String patientUserId;
    private String caregiverEmail;
    private String consentToken;
    private LocalDateTime grantedAt = LocalDateTime.now();
    private LocalDateTime revokedAt;
    private String scope = "READ_ONLY";
}
