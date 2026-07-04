package com.healthconcierge.orchestrator.service;
import org.springframework.stereotype.Service;
import java.util.Map;
@Service
public class AnonymizationService {
    public String anonymize(String text, Map<String, String> context) {
        // Simplified anonymization for demo purposes
        // In reality, this would use NER or dictionary to replace names with [USER], [MED_1], etc.
        String anonymized = text;
        if (context.containsKey("user_name")) {
            anonymized = anonymized.replaceAll("(?i)" + context.get("user_name"), "[USER]");
            context.put("[USER]", context.get("user_name"));
        }
        return anonymized;
    }
    public String deanonymize(String text, Map<String, String> reverseMap) {
        String deanonymized = text;
        for (Map.Entry<String, String> entry : reverseMap.entrySet()) {
            deanonymized = deanonymized.replace(entry.getKey(), entry.getValue());
        }
        return deanonymized;
    }
}
