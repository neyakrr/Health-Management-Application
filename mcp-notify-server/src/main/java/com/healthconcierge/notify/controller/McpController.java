package com.healthconcierge.notify.controller;
import com.healthconcierge.notify.service.NotifyService;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController
@RequestMapping("/mcp")
public class McpController {
    private final NotifyService notifyService;
    public McpController(NotifyService notifyService) {
        this.notifyService = notifyService;
    }
    @GetMapping("/manifest")
    public Map<String, Object> getManifest() {
        Map<String, Object> manifest = new HashMap<>();
        manifest.put("server_name", "notify-mcp");
        manifest.put("version", "1.0");
        List<Map<String, Object>> tools = new ArrayList<>();
        tools.add(Map.of("name", "send_reminder", "permission", "WRITE"));
        tools.add(Map.of("name", "alert_caregiver", "permission", "WRITE"));
        tools.add(Map.of("name", "schedule_reminder", "permission", "WRITE"));
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
                case "send_reminder":
                    result = notifyService.sendReminder(userId, (String) params.get("message"), (String) params.get("channel"));
                    break;
                case "alert_caregiver":
                    result = notifyService.alertCaregiver(userId, (String) params.get("caregiver_id"), (String) params.get("message"), (String) params.get("urgency"));
                    break;
                case "schedule_reminder":
                    result = notifyService.scheduleReminder(userId, (String) params.get("message"), (String) params.get("scheduled_at"), (String) params.get("recurrence"));
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
