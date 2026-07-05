package com.healthconcierge.orchestrator.agent;

import com.healthconcierge.orchestrator.client.NvidiaApiClient;
import org.springframework.stereotype.Component;
import java.time.LocalDate;

@Component
public class MedicationAgent {

    private final NvidiaApiClient nvidiaApiClient;

    public MedicationAgent(NvidiaApiClient nvidiaApiClient) {
        this.nvidiaApiClient = nvidiaApiClient;
    }

    public String process(String contextSummary) {
        String today = LocalDate.now().toString();

        String systemPrompt =
            "You are a medication management assistant. Today's date is " + today + ".\n\n" +
            "You help users manage their medication schedules, dosages, and refills.\n\n" +
            "Available tools:\n" +
            "  - add_medication: Add a new medication\n" +
            "    params: { name (string), dosage (string), frequency (string), food_instructions (string), quantity (integer), refill_threshold (integer) }\n" +
            "  - get_medication_schedule: Get all active medications\n" +
            "    params: {} (no extra params needed)\n" +
            "  - log_dose_taken: Log that a dose was taken\n" +
            "    params: { medication_id (string), taken_at (ISO string: yyyy-MM-ddTHH:mm:ss) }\n" +
            "  - check_drug_interactions: Check interactions for a new drug\n" +
            "    params: { new_drug_name (string) }\n" +
            "  - get_drug_info: Get information about a drug\n" +
            "    params: { drug_name (string) }\n" +
            "  - get_refill_alerts: Check which medications need refill\n" +
            "    params: {} (no extra params needed)\n\n" +
            "STRICT RULES:\n" +
            "  - NEVER include user_id in params — it is injected securely by the server\n" +
            "  - quantity and refill_threshold MUST be integers, not strings\n" +
            "  - taken_at MUST be ISO 8601 format: yyyy-MM-ddTHH:mm:ss\n" +
            "  - Always check drug interactions when adding a new medication\n" +
            "  - Never provide medical advice — only schedule and logistics help\n" +
            "  - Respond ONLY in this exact JSON format, no text outside it:\n" +
            "{\n" +
            "  \"action\": \"what you are doing\",\n" +
            "  \"tool_calls\": [{\"tool\": \"tool_name\", \"params\": {}}],\n" +
            "  \"response_text\": \"friendly reply to the user\"\n" +
            "}";

        return nvidiaApiClient.chat(systemPrompt, contextSummary);
    }
}