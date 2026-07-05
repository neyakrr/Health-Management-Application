package com.healthconcierge.orchestrator.controller;

import com.healthconcierge.orchestrator.mcp.McpToolRegistry;
import com.healthconcierge.orchestrator.model.User;
import com.healthconcierge.orchestrator.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/journal")
@CrossOrigin(origins = "http://localhost:3000")
public class JournalController {

    private final McpToolRegistry mcpToolRegistry;
    private final UserRepository userRepository;

    public JournalController(McpToolRegistry mcpToolRegistry, UserRepository userRepository) {
        this.mcpToolRegistry = mcpToolRegistry;
        this.userRepository = userRepository;
    }

    private String resolveUserId(Authentication auth, HttpServletRequest request) {
        String role = (String) request.getAttribute("jwt_role");
        if ("CAREGIVER".equals(role)) {
            return (String) request.getAttribute("jwt_patient_id");
        }
        Optional<User> user = userRepository.findByEmail(auth.getName());
        return user.map(User::getId).orElse(auth.getName());
    }

    private String resolveRole(HttpServletRequest request) {
        String role = (String) request.getAttribute("jwt_role");
        return role != null ? role : "USER";
    }

    // GET /api/journal?days=7 — fetch health history (vitals + symptoms)
    @GetMapping
    public Object getHistory(
            @RequestParam(defaultValue = "7") int days,
            Authentication auth,
            HttpServletRequest request) {
        Map<String, Object> params = new HashMap<>();
        params.put("user_id", resolveUserId(auth, request));
        params.put("days", days);
        return mcpToolRegistry.callTool("get_health_history", params, resolveRole(request));
    }

    // POST /api/journal/vitals — log a vital sign
    @PostMapping("/vitals")
    public ResponseEntity<?> logVitals(
            @RequestBody Map<String, Object> body,
            Authentication auth,
            HttpServletRequest request) {
        if ("CAREGIVER".equals(request.getAttribute("jwt_role"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Caregivers cannot log vitals"));
        }
        String userId = resolveUserId(auth, request);
        body.put("user_id", userId);
        // Default recorded_at to now if not provided
        body.putIfAbsent("recorded_at", LocalDateTime.now().toString());
        System.out.println("[Journal] Logging vitals for userId: " + userId);
        Object result = mcpToolRegistry.callTool("log_vitals", body, "USER");
        return ResponseEntity.ok(result);
    }

    // POST /api/journal/symptoms — log a symptom
    @PostMapping("/symptoms")
    public ResponseEntity<?> logSymptom(
            @RequestBody Map<String, Object> body,
            Authentication auth,
            HttpServletRequest request) {
        if ("CAREGIVER".equals(request.getAttribute("jwt_role"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Caregivers cannot log symptoms"));
        }
        String userId = resolveUserId(auth, request);
        body.put("user_id", userId);

        // Ensure severity is Integer not String
        Object sev = body.get("severity");
        if (sev instanceof String) {
            body.put("severity", Integer.parseInt((String) sev));
        } else if (sev instanceof Number) {
            body.put("severity", ((Number) sev).intValue());
        }

        System.out.println("[Journal] Logging symptom for userId: " + userId);
        Object result = mcpToolRegistry.callTool("log_symptom", body, "USER");
        return ResponseEntity.ok(result);
    }

    // GET /api/journal/trends/{vitalType} — get trend analysis
    @GetMapping("/trends/{vitalType}")
    public Object getTrends(
            @PathVariable String vitalType,
            Authentication auth,
            HttpServletRequest request) {
        Map<String, Object> params = new HashMap<>();
        params.put("user_id", resolveUserId(auth, request));
        params.put("vital_type", vitalType);
        return mcpToolRegistry.callTool("get_trend_analysis", params, resolveRole(request));
    }
}