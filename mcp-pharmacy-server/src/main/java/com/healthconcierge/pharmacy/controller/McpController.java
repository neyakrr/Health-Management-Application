package com.healthconcierge.pharmacy.controller;
import com.healthconcierge.pharmacy.service.PharmacyService;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController
@RequestMapping("/mcp")
public class McpController {
    private final PharmacyService pharmacyService;
    public McpController(PharmacyService pharmacyService) {
        this.pharmacyService = pharmacyService;
    }
    @GetMapping("/manifest")
    public Map<String, Object> getManifest() {
        Map<String, Object> manifest = new HashMap<>();
        manifest.put("server_name", "pharmacy-mcp");
        manifest.put("version", "1.0");
        List<Map<String, Object>> tools = new ArrayList<>();
        tools.add(Map.of("name", "check_drug_interactions", "permission", "READ"));
        tools.add(Map.of("name", "get_drug_info", "permission", "READ"));
        tools.add(Map.of("name", "get_medication_schedule", "permission", "READ"));
        tools.add(Map.of("name", "add_medication", "permission", "WRITE"));
        tools.add(Map.of("name", "log_dose_taken", "permission", "WRITE"));
        tools.add(Map.of("name", "get_refill_alerts", "permission", "READ"));
        manifest.put("tools", tools);
        return manifest;
    }
    @PostMapping("/tools/{toolName}")
    public Map<String, Object> executeTool(@PathVariable String toolName, @RequestBody Map<String, Object> params) {
        Map<String, Object> response = new HashMap<>();
        try {
            Object result = null;
            String userId = (String) params.get("user_id");
            switch (toolName) {
                case "check_drug_interactions":
                    result = pharmacyService.checkDrugInteractions(userId, (String) params.get("new_drug_name"));
                    break;
                case "get_drug_info":
                    result = pharmacyService.getDrugInfo((String) params.get("drug_name"));
                    break;
                case "get_medication_schedule":
                    result = pharmacyService.getMedicationSchedule(userId);
                    break;
                case "add_medication":
                    result = pharmacyService.addMedication(userId, (String) params.get("name"), (String) params.get("dosage"), (String) params.get("frequency"), (String) params.get("food_instructions"), (Integer) params.get("quantity"), (Integer) params.get("refill_threshold"));
                    break;
                case "log_dose_taken":
                    result = pharmacyService.logDoseTaken(userId, (String) params.get("medication_id"), (String) params.get("taken_at"));
                    break;
                case "get_refill_alerts":
                    result = pharmacyService.getRefillAlerts(userId);
                    break;
                default:
                    throw new IllegalArgumentException("Unknown tool: " + toolName);
            }
            response.put("success", true);
            response.put("result", result);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return response;
    }
}
