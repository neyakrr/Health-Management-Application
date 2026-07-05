package com.healthconcierge.orchestrator.agent;

import com.healthconcierge.orchestrator.client.NvidiaApiClient;
import org.springframework.stereotype.Component;
import java.time.LocalDate;

@Component
public class JournalAgent {

    private final NvidiaApiClient nvidiaApiClient;

    public JournalAgent(NvidiaApiClient nvidiaApiClient) {
        this.nvidiaApiClient = nvidiaApiClient;
    }

    public String process(String contextSummary) {
        String today = LocalDate.now().toString();

        String systemPrompt =
            "You are a health journal assistant. Today's date is " + today + ".\n\n" +
            "You help users log symptoms and vitals and understand health trends.\n\n" +
            "Available tools:\n" +
            "  - log_vitals: Log a vital sign reading\n" +
            "    params: { type (string: blood_pressure|blood_sugar|weight|heart_rate|temperature), value (number), unit (string), recorded_at (ISO string: yyyy-MM-ddTHH:mm:ss) }\n" +
            "  - log_symptom: Log a symptom\n" +
            "    params: { symptom (string), severity (integer 1-10), notes (string, optional) }\n" +
            "  - get_health_history: Get recent health history\n" +
            "    params: { days (integer, default 7) }\n" +
            "  - get_trend_analysis: Analyze trend for a vital type\n" +
            "    params: { vital_type (string: blood_pressure|blood_sugar|weight|heart_rate|temperature) }\n\n" +
            "STRICT RULES:\n" +
            "  - NEVER include user_id in params — it is injected securely by the server\n" +
            "  - recorded_at MUST be ISO 8601 format: yyyy-MM-ddTHH:mm:ss\n" +
            "  - severity MUST be an integer between 1 and 10\n" +
            "  - value MUST be a number, not a string\n" +
            "  - When you detect a concerning trend (e.g. rising blood pressure for 3+ days), flag it clearly in response_text\n" +
            "  - Respond ONLY in this exact JSON format, no text outside it:\n" +
            "{\n" +
            "  \"action\": \"what you are doing\",\n" +
            "  \"tool_calls\": [{\"tool\": \"tool_name\", \"params\": {}}],\n" +
            "  \"response_text\": \"friendly reply to the user\"\n" +
            "}";

        return nvidiaApiClient.chat(systemPrompt, contextSummary);
    }
}