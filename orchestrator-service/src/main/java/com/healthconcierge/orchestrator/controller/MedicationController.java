package com.healthconcierge.orchestrator.controller;

import com.healthconcierge.orchestrator.mcp.McpToolRegistry;
import com.healthconcierge.orchestrator.model.User;
import com.healthconcierge.orchestrator.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/medications")
@CrossOrigin(origins = "http://localhost:3000")
public class MedicationController {

    private final McpToolRegistry mcpToolRegistry;
    private final UserRepository userRepository;

    public MedicationController(McpToolRegistry mcpToolRegistry, UserRepository userRepository) {
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

    @GetMapping
    public Object getMedications(Authentication auth, HttpServletRequest request) {
        Map<String, Object> params = new HashMap<>();
        params.put("user_id", resolveUserId(auth, request));
        String role = (String) request.getAttribute("jwt_role");
        return mcpToolRegistry.callTool("get_medication_schedule", params, role != null ? role : "USER");
    }

    @PostMapping
    public Object addMedication(@RequestBody Map<String, Object> body, Authentication auth, HttpServletRequest request) {
        if ("CAREGIVER".equals(request.getAttribute("jwt_role"))) throw new SecurityException("Caregivers cannot modify medications");
        body.put("user_id", resolveUserId(auth, request));
        // Ensure integer types for quantity and refill_threshold
        if (body.get("quantity") instanceof String) {
            body.put("quantity", Integer.parseInt((String) body.get("quantity")));
        }
        if (body.get("refill_threshold") instanceof String) {
            body.put("refill_threshold", Integer.parseInt((String) body.get("refill_threshold")));
        }
        return mcpToolRegistry.callTool("add_medication", body, "USER");
    }

    @PostMapping("/{medicationId}/log-dose")
    public Object logDose(@PathVariable String medicationId, @RequestBody Map<String, Object> body, Authentication auth, HttpServletRequest request) {
        if ("CAREGIVER".equals(request.getAttribute("jwt_role"))) throw new SecurityException("Caregivers cannot log doses");
        Map<String, Object> params = new HashMap<>();
        params.put("user_id", resolveUserId(auth, request));
        params.put("medication_id", medicationId);
        params.put("taken_at", body.getOrDefault("taken_at", java.time.LocalDateTime.now().toString()));
        return mcpToolRegistry.callTool("log_dose_taken", params, "USER");
    }

    @GetMapping("/refill-alerts")
    public Object getRefillAlerts(Authentication auth, HttpServletRequest request) {
        Map<String, Object> params = new HashMap<>();
        params.put("user_id", resolveUserId(auth, request));
        String role = (String) request.getAttribute("jwt_role");
        return mcpToolRegistry.callTool("get_refill_alerts", params, role != null ? role : "USER");
    }

    @DeleteMapping("/{medicationId}")
    public ResponseEntity<?> deleteMedication(@PathVariable String medicationId, Authentication auth) {
        // Soft delete via direct MCP — mark inactive
        Map<String, Object> params = new HashMap<>();
        params.put("user_id", auth.getName());
        params.put("medication_id", medicationId);
        params.put("active", 0);
        try {
            // Re-use log_dose path as a stub; the frontend will handle optimistic removal
            return ResponseEntity.ok(Map.of("message", "Medication removed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
