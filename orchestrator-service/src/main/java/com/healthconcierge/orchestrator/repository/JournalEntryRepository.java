package com.healthconcierge.orchestrator.repository;

import com.healthconcierge.orchestrator.model.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JournalEntryRepository extends JpaRepository<JournalEntry, String> {
    List<JournalEntry> findByUserIdOrderByCreatedAtDesc(String userId);
}
