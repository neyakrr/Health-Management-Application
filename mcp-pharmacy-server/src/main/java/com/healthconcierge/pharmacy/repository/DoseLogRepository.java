package com.healthconcierge.pharmacy.repository;
import com.healthconcierge.pharmacy.model.DoseLog;
import org.springframework.data.jpa.repository.JpaRepository;
public interface DoseLogRepository extends JpaRepository<DoseLog, String> {
}
