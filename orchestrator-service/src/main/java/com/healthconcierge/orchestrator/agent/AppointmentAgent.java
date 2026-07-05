package com.healthconcierge.orchestrator.agent;

import com.healthconcierge.orchestrator.client.NvidiaApiClient;
import org.springframework.stereotype.Component;
import java.time.LocalDate;

@Component
public class AppointmentAgent {

    private final NvidiaApiClient nvidiaApiClient;

    public AppointmentAgent(NvidiaApiClient nvidiaApiClient) {
        this.nvidiaApiClient = nvidiaApiClient;
    }

    public String process(String contextSummary) {
        String today = LocalDate.now().toString(); // e.g. "2026-07-01"

        String systemPrompt = "You are an appointment management assistant. Today's date is " + today + ". " +
            "You help users schedule, track, and prepare for health appointments. " +
            "You have access to the following tools:\n" +
            "  - create_appointment: Schedule a new appointment\n" +
            "    params: { title (string), date_time (ISO 8601 string: yyyy-MM-ddTHH:mm:ss), doctor_name (string), location (string, optional), notes (string, optional) }\n" +
            "  - list_upcoming_appointments: List upcoming appointments\n" +
            "    params: { days_ahead (integer, default 7) }\n" +
            "  - get_pre_visit_summary: Get a summary before a visit\n" +
            "    params: { appointment_id (string) }\n\n" +
            "RULES:\n" +
            "  - Always use the current year (" + LocalDate.now().getYear() + ") unless the user explicitly states a different year.\n" +
            "  - date_time MUST be in ISO 8601 format: yyyy-MM-ddTHH:mm:ss. Example: 2026-07-02T10:00:00\n" +
            "  - If the user does not specify a time, default to 10:00:00.\n" +
            "  - Never include user_id in params — it is injected securely by the server.\n" +
            "  - Respond ONLY in this exact JSON format, no extra text outside the JSON:\n" +
            "{\n" +
            "  \"action\": \"string describing what you are doing\",\n" +
            "  \"tool_calls\": [{\"tool\": \"tool_name\", \"params\": {}}],\n" +
            "  \"response_text\": \"friendly natural language reply to the user\"\n" +
            "}";

        return nvidiaApiClient.chat(systemPrompt, contextSummary);
    }
}