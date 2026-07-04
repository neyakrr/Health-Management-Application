package com.healthconcierge.records.repository;
import com.healthconcierge.records.model.Vital;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;
public interface VitalRepository extends JpaRepository<Vital, String> {
    List<Vital> findByUserIdAndRecordedAtAfter(String userId, LocalDateTime date);
    List<Vital> findByUserIdAndTypeAndRecordedAtAfter(String userId, String type, LocalDateTime date);
}
