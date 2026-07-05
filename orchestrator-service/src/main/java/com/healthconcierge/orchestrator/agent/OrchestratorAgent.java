package com.healthconcierge.orchestrator.agent;

import com.healthconcierge.orchestrator.client.NvidiaApiClient;
import org.springframework.stereotype.Component;

@Component
public class OrchestratorAgent {

    private final NvidiaApiClient nvidiaApiClient;

    public OrchestratorAgent(NvidiaApiClient nvidiaApiClient) {
        this.nvidiaApiClient = nvidiaApiClient;
    }

    public String process(String userMessage) {
        String systemPrompt =
            "You are a health concierge orchestrator. Classify the user's intent into one or more of: " +
            "MEDICATION, APPOINTMENT, JOURNAL, CAREGIVER, GENERAL.\n\n" +
            "RULES:\n" +
            "  - For GENERAL queries (greetings, questions not related to health management), answer directly in context_summary\n" +
            "  - For all others, return the matching intents\n" +
            "  - You may return multiple intents if the message covers multiple topics\n" +
            "  - Respond ONLY in this exact JSON format, no text outside it:\n" +
            "{\n" +
            "  \"intents\": [\"MEDICATION\"],\n" +
            "  \"context_summary\": \"brief summary of what the user wants\"\n" +
            "}";

        return nvidiaApiClient.chat(systemPrompt, userMessage);
    }

    public String mergeResponses(String userMessage, String specialistResponses) {
        String systemPrompt =
            "You are a health concierge. Merge the following specialist agent responses into a " +
            "single, cohesive, friendly, natural language reply to the user. " +
            "Do not use JSON — respond in plain conversational English only. " +
            "Keep it concise and reassuring.";

        return nvidiaApiClient.chat(systemPrompt,
            "User message: " + userMessage + "\nSpecialist responses: " + specialistResponses);
    }
}