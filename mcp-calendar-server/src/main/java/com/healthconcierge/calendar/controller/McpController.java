package com.healthconcierge.calendar.controller;
import com.healthconcierge.calendar.service.CalendarService;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController
@RequestMapping("/mcp")
public class McpController {
    private final CalendarService calendarService;
    public McpController(CalendarService calendarService) {
        this.calendarService = calendarService;
    }
    @GetMapping("/manifest")
    public Map<String, Object> getManifest() {
        Map<String, Object> manifest = new HashMap<>();
        manifest.put("server_name", "calendar-mcp");
        manifest.put("version", "1.0");
        List<Map<String, Object>> tools = new ArrayList<>();
        tools.add(Map.of("name", "create_appointment", "permission", "WRITE"));
        tools.add(Map.of("name", "list_upcoming_appointments", "permission", "READ"));
        tools.add(Map.of("name", "get_pre_visit_summary", "permission", "READ"));
        manifest.put("tools", tools);
        return manifest;
    }
    @PostMapping("/tools/{toolName}")
    public Map<String, Object> executeTool(@PathVariable String toolName, @RequestBody Map<String, Object> params) {
        Map<String, Object> response = new HashMap<>();
        try {
            Object result = null;
            String userId = (String) params.get("user_id");
            switch (toolName) {
                case "create_appointment":
                    result = calendarService.createAppointment(userId, (String) params.get("title"), (String) params.get("date_time"), (String) params.get("doctor_name"), (String) params.get("notes"));
                    break;
                case "list_upcoming_appointments":
                    Integer daysAhead = params.containsKey("days_ahead") ? (Integer) params.get("days_ahead") : 7;
                    result = calendarService.listUpcomingAppointments(userId, daysAhead);
                    break;
                case "get_pre_visit_summary":
                    result = calendarService.getPreVisitSummary(userId, (String) params.get("appointment_id"));
                    break;
                default:
                    throw new IllegalArgumentException("Unknown tool: " + toolName);
            }
            response.put("success", true);
            response.put("result", result);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return response;
    }
}
