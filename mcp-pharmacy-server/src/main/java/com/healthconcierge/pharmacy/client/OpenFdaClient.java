package com.healthconcierge.pharmacy.client;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.Map;
@Component
public class OpenFdaClient {
    private final WebClient webClient;
    public OpenFdaClient(WebClient.Builder webClientBuilder, @Value("${openfda.api.url}") String apiUrl) {
        this.webClient = webClientBuilder.baseUrl(apiUrl).build();
    }
    public String checkDrugInteractions(String drugName) {
        try {
            Map response = webClient.get()
                .uri("?search=drug_interactions:\"{drugName}\"&limit=3", drugName)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
            return response != null ? response.toString() : "No interaction data found";
        } catch (Exception e) {
            return "No interaction data found";
        }
    }
    public String getDrugInfo(String drugName) {
        try {
            Map response = webClient.get()
                .uri("?search=openfda.brand_name:\"{drugName}\"&limit=1", drugName)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
            return response != null ? response.toString() : "No drug info found";
        } catch (Exception e) {
            return "No drug info found";
        }
    }
}
