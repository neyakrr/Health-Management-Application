package com.healthconcierge.orchestrator.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthconcierge.orchestrator.agent.*;
import com.healthconcierge.orchestrator.mcp.McpToolRegistry;
import com.healthconcierge.orchestrator.model.User;
import com.healthconcierge.orchestrator.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:3000")
public class ChatController {

    private final OrchestratorAgent orchestratorAgent;
    private final MedicationAgent medicationAgent;
    private final AppointmentAgent appointmentAgent;
    private final JournalAgent journalAgent;
    private final CaregiverAgent caregiverAgent;
    private final McpToolRegistry mcpToolRegistry;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ChatController(OrchestratorAgent orchestratorAgent, MedicationAgent medicationAgent,
                          AppointmentAgent appointmentAgent, JournalAgent journalAgent,
                          CaregiverAgent caregiverAgent, McpToolRegistry mcpToolRegistry,
                          UserRepository userRepository) {
        this.orchestratorAgent = orchestratorAgent;
        this.medicationAgent = medicationAgent;
        this.appointmentAgent = appointmentAgent;
        this.journalAgent = journalAgent;
        this.caregiverAgent = caregiverAgent;
        this.mcpToolRegistry = mcpToolRegistry;
        this.userRepository = userRepository;
    }

    @PostMapping
    public Map<String, Object> chat(@RequestBody Map<String, Object> request) {
        String message = (String) request.get("message");

        // Resolve UUID from email — same pattern as AppointmentController
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        String userId = userRepository.findByEmail(email)
                .map(User::getId)
                .orElse(email); // fallback to email if user not found

        String userRole = "USER";

        List<String> agentsUsed = new ArrayList<>();
        StringBuilder combinedForMerge = new StringBuilder();

        try {
            // 1. Classify intent via orchestrator
            String rawIntentJson = orchestratorAgent.process(message);
            JsonNode intentNode = parseJsonSafely(rawIntentJson);

            if (intentNode == null) {
                return errorResponse("Could not understand the request. Please try rephrasing.");
            }

            List<String> intents = new ArrayList<>();
            if (intentNode.has("intents")) {
                intentNode.get("intents").forEach(n -> intents.add(n.asText()));
            }
            String contextSummary = intentNode.has("context_summary")
                    ? intentNode.get("context_summary").asText()
                    : message;

            if (intents.isEmpty() || intents.contains("GENERAL")) {
                agentsUsed.add("OrchestratorAgent");
                Map<String, Object> response = new HashMap<>();
                response.put("response", contextSummary.equals(message) ? rawIntentJson : contextSummary);
                response.put("agents_used", agentsUsed);
                return response;
            }

            // 2. Route to specialist agents
            for (String intent : intents) {
                switch (intent) {
                    case "MEDICATION" -> {
                        String result = runSpecialist("MedicationAgent", medicationAgent.process(contextSummary), userId, userRole);
                        combinedForMerge.append("MedicationAgent: ").append(result).append("\n");
                        agentsUsed.add("MedicationAgent");
                    }
                    case "APPOINTMENT" -> {
                        String result = runSpecialist("AppointmentAgent", appointmentAgent.process(contextSummary), userId, userRole);
                        combinedForMerge.append("AppointmentAgent: ").append(result).append("\n");
                        agentsUsed.add("AppointmentAgent");
                    }
                    case "JOURNAL" -> {
                        String result = runSpecialist("JournalAgent", journalAgent.process(contextSummary), userId, userRole);
                        combinedForMerge.append("JournalAgent: ").append(result).append("\n");
                        agentsUsed.add("JournalAgent");
                    }
                    case "CAREGIVER" -> {
                        String result = runSpecialist("CaregiverAgent", caregiverAgent.process(contextSummary), userId, userRole);
                        combinedForMerge.append("CaregiverAgent: ").append(result).append("\n");
                        agentsUsed.add("CaregiverAgent");
                    }
                    default -> { /* unknown intent, skip */ }
                }
            }

            // 3. Merge all specialist outputs into one natural-language reply
            String finalResponse = orchestratorAgent.mergeResponses(message, combinedForMerge.toString());

            Map<String, Object> response = new HashMap<>();
            response.put("response", finalResponse);
            response.put("agents_used", agentsUsed);
            return response;

        } catch (Exception e) {
            return errorResponse("Something went wrong: " + e.getMessage());
        }
    }

    private String runSpecialist(String agentName, String rawAgentJson, String userId, String userRole) {
        JsonNode node = parseJsonSafely(rawAgentJson);
        if (node == null) {
            return rawAgentJson;
        }

        StringBuilder toolResultsSummary = new StringBuilder();

        if (node.has("tool_calls") && node.get("tool_calls").isArray()) {
            for (JsonNode toolCall : node.get("tool_calls")) {
                String toolName = toolCall.has("tool") ? toolCall.get("tool").asText() : null;
                if (toolName == null) continue;

                Map<String, Object> params = new HashMap<>();
                if (toolCall.has("params")) {
                    params = objectMapper.convertValue(toolCall.get("params"), Map.class);
                }

                // Always inject authenticated UUID — never trust LLM's user_id
                params.put("user_id", userId);

                System.out.println("[Agent] " + agentName + " calling tool: " + toolName + " params: " + params);

                try {
                    Object result = mcpToolRegistry.callTool(toolName, params, userRole);
                    toolResultsSummary.append(toolName).append(" result: ").append(result).append("; ");
                } catch (Exception e) {
                    System.err.println("[Agent] Tool failed: " + toolName + " — " + e.getMessage());
                    toolResultsSummary.append(toolName).append(" failed: ").append(e.getMessage()).append("; ");
                }
            }
        }

        String responseText = node.has("response_text") ? node.get("response_text").asText() : "";
        return responseText + (toolResultsSummary.length() > 0 ? " [" + toolResultsSummary + "]" : "");
    }

    private JsonNode parseJsonSafely(String text) {
        if (text == null) return null;
        try {
            String cleaned = text.trim();
            if (cleaned.startsWith("```")) {
                cleaned = cleaned.replaceAll("^```json", "").replaceAll("^```", "").replaceAll("```$", "").trim();
            }
            return objectMapper.readTree(cleaned);
        } catch (Exception e) {
            return null;
        }
    }

    private Map<String, Object> errorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("response", message);
        response.put("agents_used", List.of());
        return response;
    }
}