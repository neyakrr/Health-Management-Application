package com.healthconcierge.records.controller;
import com.healthconcierge.records.service.RecordsService;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController
@RequestMapping("/mcp")
public class McpController {
    private final RecordsService recordsService;
    public McpController(RecordsService recordsService) {
        this.recordsService = recordsService;
    }
    @GetMapping("/manifest")
    public Map<String, Object> getManifest() {
        Map<String, Object> manifest = new HashMap<>();
        manifest.put("server_name", "records-mcp");
        manifest.put("version", "1.0");
        List<Map<String, Object>> tools = new ArrayList<>();
        tools.add(Map.of("name", "log_vitals", "permission", "WRITE"));
        tools.add(Map.of("name", "log_symptom", "permission", "WRITE"));
        tools.add(Map.of("name", "get_health_history", "permission", "READ"));
        tools.add(Map.of("name", "get_trend_analysis", "permission", "READ"));
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
                case "log_vitals":
                    // Parse double safely
                    Object valObj = params.get("value");
                    Double value = valObj instanceof Integer ? ((Integer) valObj).doubleValue() : (Double) valObj;
                    result = recordsService.logVital(userId, (String) params.get("type"), value, (String) params.get("unit"), (String) params.get("recorded_at"));
                    break;
                case "log_symptom":
                    result = recordsService.logSymptom(userId, (String) params.get("symptom"), (Integer) params.get("severity"), (String) params.get("notes"));
                    break;
                case "get_health_history":
                    result = recordsService.getHealthHistory(userId, (Integer) params.get("days"));
                    break;
                case "get_trend_analysis":
                    result = recordsService.getTrendAnalysis(userId, (String) params.get("vital_type"));
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
