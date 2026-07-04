package com.healthconcierge.pharmacy.service;
import com.healthconcierge.pharmacy.client.OpenFdaClient;
import com.healthconcierge.pharmacy.model.DoseLog;
import com.healthconcierge.pharmacy.model.Medication;
import com.healthconcierge.pharmacy.repository.DoseLogRepository;
import com.healthconcierge.pharmacy.repository.MedicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
@Service
public class PharmacyService {
    private final MedicationRepository medicationRepository;
    private final DoseLogRepository doseLogRepository;
    private final OpenFdaClient openFdaClient;
    public PharmacyService(MedicationRepository medicationRepository, DoseLogRepository doseLogRepository, OpenFdaClient openFdaClient) {
        this.medicationRepository = medicationRepository;
        this.doseLogRepository = doseLogRepository;
        this.openFdaClient = openFdaClient;
    }
    public String checkDrugInteractions(String userId, String newDrugName) {
        return openFdaClient.checkDrugInteractions(newDrugName);
    }
    public String getDrugInfo(String drugName) {
        return openFdaClient.getDrugInfo(drugName);
    }
    public List<Medication> getMedicationSchedule(String userId) {
        return medicationRepository.findByUserIdAndActive(userId, 1);
    }
    @Transactional
    public Medication addMedication(String userId, String name, String dosage, String frequency, String foodInstructions, Integer quantity, Integer refillThreshold) {
        Medication med = new Medication();
        med.setId(UUID.randomUUID().toString());
        med.setUserId(userId);
        med.setName(name);
        med.setDosage(dosage);
        med.setFrequency(frequency);
        med.setFoodInstructions(foodInstructions);
        med.setQuantity(quantity);
        med.setRefillThreshold(refillThreshold);
        return medicationRepository.save(med);
    }
    @Transactional
    public DoseLog logDoseTaken(String userId, String medicationId, String takenAt) {
        DoseLog log = new DoseLog();
        log.setId(UUID.randomUUID().toString());
        log.setUserId(userId);
        log.setMedicationId(medicationId);
        log.setTakenAt(LocalDateTime.parse(takenAt));
        return doseLogRepository.save(log);
    }
    public String getRefillAlerts(String userId) {
        List<Medication> meds = getMedicationSchedule(userId);
        StringBuilder alerts = new StringBuilder();
        for (Medication med : meds) {
            if (med.getQuantity() != null && med.getRefillThreshold() != null && med.getQuantity() <= med.getRefillThreshold()) {
                alerts.append(med.getName()).append(" is running low. ");
            }
        }
        return alerts.length() > 0 ? alerts.toString() : "No refills needed.";
    }
}
