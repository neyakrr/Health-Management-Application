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

    // ── Safe type-coercion helpers ────────────────────────────────────────────
    // Jackson may deserialise JSON numbers as Integer, Long, or Double.
    // Direct casts blow up with ClassCastException when the type doesn't match.
    private Integer toInt(Object o) {
        if (o == null) return null;
        if (o instanceof Number) return ((Number) o).intValue();
        return Integer.parseInt(o.toString());
    }
    private Double toDouble(Object o) {
        if (o == null) return null;
        if (o instanceof Number) return ((Number) o).doubleValue();
        return Double.parseDouble(o.toString());
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
                case "log_vitals":
                    result = recordsService.logVital(
                        userId,
                        toStr(params.get("type")),
                        toDouble(params.get("value")),
                        toStr(params.get("unit")),
                        toStr(params.get("recorded_at"))
                    );
                    break;
                case "log_symptom":
                    result = recordsService.logSymptom(
                        userId,
                        toStr(params.get("symptom")),
                        toInt(params.get("severity")),
                        toStr(params.get("notes"))
                    );
                    break;
                case "get_health_history":
                    result = recordsService.getHealthHistory(userId, toInt(params.get("days")));
                    break;
                case "get_trend_analysis":
                    result = recordsService.getTrendAnalysis(userId, toStr(params.get("vital_type")));
                    break;
                default:
                    throw new IllegalArgumentException("Unknown tool: " + toolName);
            }
            response.put("success", true);
            response.put("result", result);
        } catch (Exception e) {
            System.err.println("[Records] Tool error for " + toolName + ": " + e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return response;
    }
}

