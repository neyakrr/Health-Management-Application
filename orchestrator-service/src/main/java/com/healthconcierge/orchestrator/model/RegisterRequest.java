package com.healthconcierge.orchestrator.model;
import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String name;
}
