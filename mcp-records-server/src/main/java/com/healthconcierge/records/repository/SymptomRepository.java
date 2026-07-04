package com.healthconcierge.records.repository;
import com.healthconcierge.records.model.Symptom;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;
public interface SymptomRepository extends JpaRepository<Symptom, String> {
    List<Symptom> findByUserIdAndRecordedAtAfter(String userId, LocalDateTime date);
}
