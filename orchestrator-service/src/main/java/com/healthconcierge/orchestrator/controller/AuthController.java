package com.healthconcierge.orchestrator.controller;

import com.healthconcierge.orchestrator.model.Caregiver;
import com.healthconcierge.orchestrator.model.LoginRequest;
import com.healthconcierge.orchestrator.model.RegisterRequest;
import com.healthconcierge.orchestrator.model.User;
import com.healthconcierge.orchestrator.repository.CaregiverRepository;
import com.healthconcierge.orchestrator.repository.UserRepository;
import com.healthconcierge.orchestrator.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final UserRepository userRepository;
    private final CaregiverRepository caregiverRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, CaregiverRepository caregiverRepository, JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.caregiverRepository = caregiverRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Email already registered"));
        }

        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setEmail(request.getEmail());
        user.setName(request.getName());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        
        userRepository.save(user);
        
        String token = jwtUtil.generateToken(user.getEmail(), "USER", user.getId());
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("role", "USER");
        response.put("user", Map.of("id", user.getId(), "name", user.getName(), "email", user.getEmail()));
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        
        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password"));
        }
        
        User user = userOpt.get();
        String token = jwtUtil.generateToken(user.getEmail(), "USER", user.getId());
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("role", "USER");
        response.put("user", Map.of("id", user.getId(), "name", user.getName(), "email", user.getEmail()));
        
        return ResponseEntity.ok(response);
    }

    /** Caregiver login — separate endpoint so the JWT carries role=CAREGIVER and patient_id */
    @PostMapping("/caregiver-login")
    public ResponseEntity<?> caregiverLogin(@RequestBody LoginRequest request) {
        Optional<Caregiver> caregiverOpt = caregiverRepository.findByEmail(request.getEmail());

        if (caregiverOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), caregiverOpt.get().getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid caregiver credentials"));
        }

        Caregiver caregiver = caregiverOpt.get();
        // JWT subject = caregiver email, role = CAREGIVER, patient_id = the patient they can view
        String token = jwtUtil.generateToken(caregiver.getEmail(), "CAREGIVER", caregiver.getPatientUserId());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("role", "CAREGIVER");
        response.put("patientUserId", caregiver.getPatientUserId());
        response.put("user", Map.of(
                "id", caregiver.getId(),
                "name", caregiver.getName(),
                "email", caregiver.getEmail()
        ));

        return ResponseEntity.ok(response);
    }
}
