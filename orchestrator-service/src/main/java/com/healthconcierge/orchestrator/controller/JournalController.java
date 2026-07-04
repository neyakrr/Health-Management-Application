package com.healthconcierge.orchestrator.controller;

import com.healthconcierge.orchestrator.model.JournalEntry;
import com.healthconcierge.orchestrator.model.User;
import com.healthconcierge.orchestrator.repository.JournalEntryRepository;
import com.healthconcierge.orchestrator.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/journal")
@CrossOrigin(origins = "http://localhost:3000")
public class JournalController {

    private final JournalEntryRepository journalEntryRepository;
    private final UserRepository userRepository;

    public JournalController(JournalEntryRepository journalEntryRepository, UserRepository userRepository) {
        this.journalEntryRepository = journalEntryRepository;
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
    public List<JournalEntry> getEntries(Authentication auth, HttpServletRequest request) {
        return journalEntryRepository.findByUserIdOrderByCreatedAtDesc(resolveUserId(auth, request));
    }

    @PostMapping
    public ResponseEntity<?> createEntry(@RequestBody Map<String, String> body, Authentication auth, HttpServletRequest request) {
        if ("CAREGIVER".equals(request.getAttribute("jwt_role"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Caregivers cannot create journal entries"));
        }
        JournalEntry entry = new JournalEntry();
        entry.setId(UUID.randomUUID().toString());
        entry.setUserId(resolveUserId(auth, request));
        entry.setTitle(body.getOrDefault("title", ""));
        entry.setContent(body.getOrDefault("content", ""));
        entry.setMood(body.getOrDefault("mood", "okay"));
        entry.setCreatedAt(LocalDateTime.now());
        entry.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(journalEntryRepository.save(entry));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEntry(@PathVariable String id, @RequestBody Map<String, String> body, Authentication auth, HttpServletRequest request) {
        if ("CAREGIVER".equals(request.getAttribute("jwt_role"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Caregivers cannot edit journal entries"));
        }
        String userId = resolveUserId(auth, request);
        Optional<JournalEntry> opt = journalEntryRepository.findById(id);
        if (opt.isEmpty() || !opt.get().getUserId().equals(userId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Not found or unauthorized"));
        }
        JournalEntry entry = opt.get();
        if (body.containsKey("title")) entry.setTitle(body.get("title"));
        if (body.containsKey("content")) entry.setContent(body.get("content"));
        if (body.containsKey("mood")) entry.setMood(body.get("mood"));
        entry.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(journalEntryRepository.save(entry));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEntry(@PathVariable String id, Authentication auth, HttpServletRequest request) {
        if ("CAREGIVER".equals(request.getAttribute("jwt_role"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Caregivers cannot delete journal entries"));
        }
        String userId = resolveUserId(auth, request);
        Optional<JournalEntry> opt = journalEntryRepository.findById(id);
        if (opt.isEmpty() || !opt.get().getUserId().equals(userId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Not found or unauthorized"));
        }
        journalEntryRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }
}

