package com.healthconcierge.orchestrator.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class NvidiaApiClient {

    private static final String API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
    private static final String MODEL   = "nvidia/nemotron-3-ultra-550b-a55b";

    private final RestTemplate restTemplate;

    @Value("${nvidia.api.key}")
    private String apiKey;

    public NvidiaApiClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String chat(String systemPrompt, String userMessage) {
        int maxRetries = 3;
        long delayMs = 1000;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return doChat(systemPrompt, userMessage);
            } catch (org.springframework.web.client.HttpServerErrorException e) {
                System.err.println("NVIDIA API server error (attempt " + attempt + "): "
                        + e.getStatusCode() + " " + e.getResponseBodyAsString());
                if (attempt == maxRetries) {
                    return "{\"error\": \"The AI service is busy. Please try again in a moment.\"}";
                }
                try { Thread.sleep(delayMs); } catch (InterruptedException ignored) {}
                delayMs *= 2;
            } catch (org.springframework.web.client.HttpClientErrorException e) {
                System.err.println("NVIDIA API client error: "
                        + e.getStatusCode() + " " + e.getResponseBodyAsString());
                return "{\"error\": \"API request error: " + e.getStatusCode() + "\"}";
            } catch (Exception e) {
                System.err.println("NVIDIA API call failed: " + e.getMessage());
                return "{\"error\": \"Failed to call NVIDIA API\", \"detail\": \""
                        + e.getMessage().replace("\"", "'") + "\"}";
            }
        }
        return "{\"error\": \"Failed to call NVIDIA API after retries\"}";
    }

    private String doChat(String systemPrompt, String userMessage) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);
        headers.set("Accept", "application/json");

        // Messages: system + user
        List<Map<String, String>> messages = List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user",   "content", userMessage)
        );

        // chat_template_kwargs maps to Python extra_body={"chat_template_kwargs":{"enable_thinking":True}}
        Map<String, Object> chatTemplateKwargs = new HashMap<>();
        chatTemplateKwargs.put("enable_thinking", true);

        Map<String, Object> body = new HashMap<>();
        body.put("model",                MODEL);
        body.put("messages",             messages);
        body.put("temperature",          1.0);    // matches Python: temperature=1
        body.put("top_p",                0.95);   // matches Python: top_p=0.95
        body.put("max_tokens",           16384);  // matches Python: max_tokens=16384
        body.put("stream",               false);  // non-streaming; we want the full response at once
        body.put("chat_template_kwargs", chatTemplateKwargs);
        body.put("reasoning_budget",     16384);  // matches Python: reasoning_budget=16384

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        Map response = restTemplate.postForObject(API_URL, request, Map.class);

        if (response != null && response.containsKey("choices")) {
            List<Map> choices = (List<Map>) response.get("choices");
            if (!choices.isEmpty()) {
                Map message = (Map) choices.get(0).get("message");

                // Thinking model returns two fields (mirrors Python chunk handling):
                // "reasoning_content" = internal chain-of-thought  (skip — internal only)
                // "content"           = final answer               (use this)
                String content = (String) message.get("content");
                if (content != null && !content.isBlank()) {
                    return content;
                }

                // Fallback: if content empty, surface reasoning_content
                String reasoning = (String) message.get("reasoning_content");
                if (reasoning != null && !reasoning.isBlank()) {
                    return reasoning;
                }
            }
        }
        return "{}";
    }
}
