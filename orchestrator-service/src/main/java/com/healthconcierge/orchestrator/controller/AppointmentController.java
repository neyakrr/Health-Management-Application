package com.healthconcierge.orchestrator.controller;

import com.healthconcierge.orchestrator.mcp.McpToolRegistry;
import com.healthconcierge.orchestrator.model.User;
import com.healthconcierge.orchestrator.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:3000")
public class AppointmentController {

    private final McpToolRegistry mcpToolRegistry;
    private final UserRepository userRepository;

    public AppointmentController(McpToolRegistry mcpToolRegistry, UserRepository userRepository) {
        this.mcpToolRegistry = mcpToolRegistry;
        this.userRepository = userRepository;
    }

    private String resolveUserId(Authentication auth, HttpServletRequest request) {
        String role = (String) request.getAttribute("jwt_role");
        if ("CAREGIVER".equals(role)) {
            return (String) request.getAttribute("jwt_patient_id");
        }
        // Resolve email → UUID via DB
        Optional<User> user = userRepository.findByEmail(auth.getName());
        return user.map(User::getId).orElse(auth.getName());
    }

    @GetMapping
    public Object getAppointments(Authentication auth, HttpServletRequest request) {
        String userId = resolveUserId(auth, request);
        System.out.println("[Appointments] Fetching for userId: " + userId);

        Map<String, Object> params = new HashMap<>();
        params.put("user_id", userId);
        params.put("days_ahead", 60);

        String role = (String) request.getAttribute("jwt_role");
        return mcpToolRegistry.callTool("list_upcoming_appointments", params, role != null ? role : "USER");
    }

    @PostMapping
    public Object createAppointment(@RequestBody Map<String, Object> body,
                                     Authentication auth, HttpServletRequest request) {
        String role = (String) request.getAttribute("jwt_role");
        if ("CAREGIVER".equals(role)) {
            throw new SecurityException("Caregivers cannot create appointments");
        }
        String userId = resolveUserId(auth, request);
        System.out.println("[Appointments] Creating for userId: " + userId);
        body.put("user_id", userId);
        return mcpToolRegistry.callTool("create_appointment", body, "USER");
    }
}