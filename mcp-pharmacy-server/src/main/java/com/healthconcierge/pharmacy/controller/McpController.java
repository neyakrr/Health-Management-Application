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

    // ── Safe type-coercion helpers ────────────────────────────────────────────
    // Jackson deserialises JSON numbers as Integer, Long, or Double depending on
    // value magnitude. Direct casts like (Integer) obj blow up with ClassCastException
    // when the LLM sends a value that Jackson chose to represent as Long/Double.
    private Integer toInt(Object o) {
        if (o == null) return null;
        if (o instanceof Number) return ((Number) o).intValue();
        return Integer.parseInt(o.toString());
    }
    private String toStr(Object o) {
        return o == null ? null : o.toString();
    }
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping("/tools/{toolName}")
    public Map<String, Object> executeTool(@PathVariable String toolName, @RequestBody Map<String, Object> params) {
        Map<String, Object> response = new HashMap<>();
        try {
            Object result = null;
            String userId = toStr(params.get("user_id"));
            switch (toolName) {
                case "check_drug_interactions":
                    result = pharmacyService.checkDrugInteractions(userId, toStr(params.get("new_drug_name")));
                    break;
                case "get_drug_info":
                    result = pharmacyService.getDrugInfo(toStr(params.get("drug_name")));
                    break;
                case "get_medication_schedule":
                    result = pharmacyService.getMedicationSchedule(userId);
                    break;
                case "add_medication":
                    result = pharmacyService.addMedication(
                        userId,
                        toStr(params.get("name")),
                        toStr(params.get("dosage")),
                        toStr(params.get("frequency")),
                        toStr(params.get("food_instructions")),
                        toInt(params.get("quantity")),
                        toInt(params.get("refill_threshold"))
                    );
                    break;
                case "log_dose_taken":
                    result = pharmacyService.logDoseTaken(userId, toStr(params.get("medication_id")), toStr(params.get("taken_at")));
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
            System.err.println("[Pharmacy] Tool error for " + toolName + ": " + e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return response;
    }
}

