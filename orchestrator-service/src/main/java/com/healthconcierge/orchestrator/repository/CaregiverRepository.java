package com.healthconcierge.orchestrator.repository;

import com.healthconcierge.orchestrator.model.Caregiver;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CaregiverRepository extends JpaRepository<Caregiver, String> {
    Optional<Caregiver> findByEmail(String email);
    List<Caregiver> findByPatientUserId(String patientUserId);
}
