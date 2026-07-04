package com.healthconcierge.records.service;
import com.healthconcierge.records.model.Symptom;
import com.healthconcierge.records.model.Vital;
import com.healthconcierge.records.repository.SymptomRepository;
import com.healthconcierge.records.repository.VitalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
@Service
public class RecordsService {
    private final VitalRepository vitalRepository;
    private final SymptomRepository symptomRepository;
    public RecordsService(VitalRepository vitalRepository, SymptomRepository symptomRepository) {
        this.vitalRepository = vitalRepository;
        this.symptomRepository = symptomRepository;
    }
    @Transactional
    public Vital logVital(String userId, String type, Double value, String unit, String recordedAtStr) {
        Vital v = new Vital();
        v.setId(UUID.randomUUID().toString());
        v.setUserId(userId);
        v.setType(type);
        v.setValue(value);
        v.setUnit(unit);
        v.setRecordedAt(LocalDateTime.parse(recordedAtStr));
        return vitalRepository.save(v);
    }
    @Transactional
    public Symptom logSymptom(String userId, String symptom, Integer severity, String notes) {
        Symptom s = new Symptom();
        s.setId(UUID.randomUUID().toString());
        s.setUserId(userId);
        s.setSymptom(symptom);
        s.setSeverity(severity);
        s.setNotes(notes);
        s.setRecordedAt(LocalDateTime.now());
        return symptomRepository.save(s);
    }
    public Map<String, Object> getHealthHistory(String userId, Integer days) {
        LocalDateTime date = LocalDateTime.now().minusDays(days);
        Map<String, Object> history = new HashMap<>();
        history.put("vitals", vitalRepository.findByUserIdAndRecordedAtAfter(userId, date));
        history.put("symptoms", symptomRepository.findByUserIdAndRecordedAtAfter(userId, date));
        return history;
    }
    public Map<String, Object> getTrendAnalysis(String userId, String vitalType) {
        LocalDateTime date = LocalDateTime.now().minusDays(30); // look back 30 days for trend
        List<Vital> vitals = vitalRepository.findByUserIdAndTypeAndRecordedAtAfter(userId, vitalType, date);
        Map<String, Object> trend = new HashMap<>();
        if (vitals.isEmpty()) {
            trend.put("status", "No data");
            return trend;
        }
        double sum = 0;
        double min = vitals.get(0).getValue();
        double max = vitals.get(0).getValue();
        for (Vital v : vitals) {
            double val = v.getValue();
            sum += val;
            if (val < min) min = val;
            if (val > max) max = val;
        }
        double avg = sum / vitals.size();
        trend.put("min", min);
        trend.put("max", max);
        trend.put("average", avg);
        
        // Simple trend analysis
        if (vitals.size() >= 3) {
            double last = vitals.get(vitals.size()-1).getValue();
            double first = vitals.get(0).getValue();
            if (last > first * 1.05) trend.put("trend", "rising");
            else if (last < first * 0.95) trend.put("trend", "falling");
            else trend.put("trend", "stable");
        } else {
            trend.put("trend", "stable");
        }
        return trend;
    }
}
