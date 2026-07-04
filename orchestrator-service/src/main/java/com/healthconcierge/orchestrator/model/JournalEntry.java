package com.healthconcierge.orchestrator.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "journal_entries")
public class JournalEntry {
    @Id
    private String id;
    private String userId;
    private String title;
    @Column(columnDefinition = "TEXT")
    private String content;
    private String mood; // e.g. "good", "okay", "poor"
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}
