package com.healthconcierge.orchestrator.controller;

import com.healthconcierge.orchestrator.model.Caregiver;
import com.healthconcierge.orchestrator.model.User;
import com.healthconcierge.orchestrator.repository.CaregiverRepository;
import com.healthconcierge.orchestrator.repository.UserRepository;
import com.healthconcierge.orchestrator.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/caregivers")
@CrossOrigin(origins = "http://localhost:3000")
public class CaregiverController {

    private final CaregiverRepository caregiverRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public CaregiverController(CaregiverRepository caregiverRepository,
                                UserRepository userRepository,
                                PasswordEncoder passwordEncoder,
                                EmailService emailService) {
        this.caregiverRepository = caregiverRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    /** List all caregivers for the authenticated patient */
    @GetMapping
    public List<Caregiver> getCaregivers(Authentication auth) {
        // auth.getName() returns the patient's email
        Optional<User> patient = userRepository.findByEmail(auth.getName());
        if (patient.isEmpty()) return List.of();
        return caregiverRepository.findByPatientUserId(patient.get().getId());
    }

    /** Invite a new caregiver: creates account + sends email */
    @PostMapping("/invite")
    public ResponseEntity<?> inviteCaregiver(@RequestBody Map<String, String> body, Authentication auth) {
        String caregiverName = body.get("name");
        String caregiverEmail = body.get("email");

        if (caregiverName == null || caregiverEmail == null || caregiverEmail.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name and email are required"));
        }

        // Resolve patient details
        Optional<User> patientOpt = userRepository.findByEmail(auth.getName());
        if (patientOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Patient not found"));
        }
        User patient = patientOpt.get();

        // Check if caregiver already linked
        Optional<Caregiver> existing = caregiverRepository.findByEmail(caregiverEmail);
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "A caregiver with this email already exists"));
        }

        // Generate a secure random temporary password
        String tempPassword = generateTempPassword();

        // Create caregiver record
        Caregiver caregiver = new Caregiver();
        caregiver.setId(UUID.randomUUID().toString());
        caregiver.setPatientUserId(patient.getId());
        caregiver.setName(caregiverName);
        caregiver.setEmail(caregiverEmail);
        caregiver.setPasswordHash(passwordEncoder.encode(tempPassword));
        caregiverRepository.save(caregiver);

        // Send email with credentials (non-blocking failure)
        emailService.sendCaregiverInvite(caregiverEmail, caregiverName, patient.getName(), tempPassword);

        return ResponseEntity.ok(Map.of(
                "message", "Caregiver invited successfully. Credentials sent to " + caregiverEmail,
                "caregiver", Map.of("id", caregiver.getId(), "name", caregiverName, "email", caregiverEmail)
        ));
    }

    /** Revoke a caregiver's access */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> revokeCaregiver(@PathVariable String id, Authentication auth) {
        Optional<Caregiver> opt = caregiverRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Optional<User> patient = userRepository.findByEmail(auth.getName());
        if (patient.isEmpty() || !opt.get().getPatientUserId().equals(patient.get().getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Unauthorized"));
        }
        caregiverRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Caregiver access revoked"));
    }

    private String generateTempPassword() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[9];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
