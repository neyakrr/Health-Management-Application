package com.healthconcierge.pharmacy.repository;
import com.healthconcierge.pharmacy.model.Medication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface MedicationRepository extends JpaRepository<Medication, String> {
    List<Medication> findByUserIdAndActive(String userId, Integer active);
}
