package com.healthconcierge.orchestrator.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:3000")
public class DashboardController {

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        Map<String, Object> summary = Map.of(
            "vitals", Map.of("bloodPressure", "120/80", "status", "Stable"),
            "nextAppointment", Map.of("title", "Cardiology Checkup", "date", "July 15th, 3:00 PM"),
            "medications", List.of(
                Map.of("name", "Lisinopril", "dosage", "10mg", "time", "Morning"),
                Map.of("name", "Atorvastatin", "dosage", "20mg", "time", "Evening")
            )
        );
        return ResponseEntity.ok(summary);
    }
}
