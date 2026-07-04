package com.healthconcierge.orchestrator.mcp;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class McpToolRegistry {

    private final RestTemplate restTemplate;
    private final Map<String, String> toolToServer      = new HashMap<>();
    private final Map<String, String> toolPermissions   = new HashMap<>();

    @Value("${mcp.calendar.url}") private String calendarUrl;
    @Value("${mcp.pharmacy.url}") private String pharmacyUrl;
    @Value("${mcp.notify.url}")   private String notifyUrl;
    @Value("${mcp.records.url}")  private String recordsUrl;

    public McpToolRegistry(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @PostConstruct
    public void discoverTools() {
        registerTools(calendarUrl);
        registerTools(pharmacyUrl);
        registerTools(notifyUrl);
        registerTools(recordsUrl);
    }

    private void registerTools(String serverUrl) {
        try {
            Map response = restTemplate.getForObject(serverUrl + "/mcp/manifest", Map.class);
            if (response != null && response.containsKey("tools")) {
                List<Map<String, Object>> tools = (List<Map<String, Object>>) response.get("tools");
                for (Map<String, Object> tool : tools) {
                    String name = (String) tool.get("name");
                    String perm = (String) tool.get("permission");
                    toolToServer.put(name, serverUrl);
                    toolPermissions.put(name, perm);
                    System.out.println("[MCP] Registered tool: " + name + " (permission=" + perm + ") from " + serverUrl);
                }
            }
        } catch (Exception e) {
            System.err.println("[MCP] Failed to connect to MCP server: " + serverUrl + " — " + e.getMessage());
        }
    }

    public Object callTool(String toolName, Map<String, Object> params, String userRole) {
        // Permission check
        String perm = toolPermissions.get(toolName);
        if (perm == null) {
            System.err.println("[MCP] Unknown tool requested: " + toolName);
            System.err.println("[MCP] Registered tools: " + toolToServer.keySet());
            throw new IllegalArgumentException("Unknown tool: " + toolName);
        }
        if ("CAREGIVER".equals(userRole) && !"READ".equals(perm)) {
            throw new SecurityException("Caregivers can only execute READ tools");
        }

        String serverUrl = toolToServer.get(toolName);
        System.out.println("[MCP] Calling tool: " + toolName + " on " + serverUrl + " with params: " + params);

        try {
            Map response = restTemplate.postForObject(
                    serverUrl + "/mcp/tools/" + toolName, params, Map.class);

            System.out.println("[MCP] Tool response for " + toolName + ": " + response);

            if (response != null && Boolean.TRUE.equals(response.get("success"))) {
                return response.get("result");
            }

            String errorMsg = response != null ? String.valueOf(response.get("error")) : "null response";
            throw new RuntimeException("Tool execution failed: " + errorMsg);

        } catch (HttpClientErrorException e) {
            System.err.println("[MCP] HTTP error calling " + toolName + ": "
                    + e.getStatusCode() + " " + e.getResponseBodyAsString());
            throw new RuntimeException("HTTP error calling tool " + toolName
                    + ": " + e.getStatusCode() + " — " + e.getResponseBodyAsString());
        } catch (RuntimeException e) {
            throw e; // re-throw as-is
        } catch (Exception e) {
            System.err.println("[MCP] Unexpected error calling " + toolName + ": " + e.getMessage());
            throw new RuntimeException("Error calling tool " + toolName + ": " + e.getMessage());
        }
    }

    // Utility: check if a tool is registered (useful for debugging)
    public boolean isToolRegistered(String toolName) {
        return toolToServer.containsKey(toolName);
    }

    public Map<String, String> getRegisteredTools() {
        return new HashMap<>(toolToServer);
    }
}