package com.example.cardealership.service;

import com.example.cardealership.domain.Car;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
public class MlRecommendationService {

    private final RestTemplate restTemplate;

    private static final String ML_RECOMMEND_URL = "http://localhost:5000/recommend";
    private static final String ML_PREDICT_URL = "http://localhost:5000/predict";

    public List<Map<String, Object>> recommend(List<Car> cars) {
        try {
            List<Map<String, Object>> payload = cars.stream()
                    .map(this::mapCar)
                    .toList();

            System.out.println("=== SENDING TO ML ===");
            System.out.println(payload);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<List<Map<String, Object>>> requestEntity =
                    new HttpEntity<>(payload, headers);

            ResponseEntity<List<Map<String, Object>>> response =
                    restTemplate.exchange(
                            ML_RECOMMEND_URL,
                            HttpMethod.POST,
                            requestEntity,
                            new ParameterizedTypeReference<>() {}
                    );

            return response.getBody();

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("ML service failed: " + e.getMessage());
        }
    }

    public Double predict(Car car) {
        Map<String, Object> payload = mapCar(car);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> requestEntity =
                new HttpEntity<>(payload, headers);

        var response = restTemplate.exchange(
                ML_PREDICT_URL,
                HttpMethod.POST,
                requestEntity,
                Map.class
        );

        Object value = response.getBody().get("predicted_price");
        return value == null ? null : Double.parseDouble(value.toString());
    }

    private Map<String, Object> mapCar(Car car) {
        Map<String, Object> m = new HashMap<>();

        m.put("Year", car.getProdYear() != null ? car.getProdYear() : 2000);
        m.put("Engine_Size", 2.0);
        m.put("Fuel_Type", "Petrol");
        m.put("Transmission", "Manual");
        m.put("Mileage", car.getMileage() != null ? car.getMileage() : 0L);
        m.put("Doors", 4);
        m.put("Owner_Count", 1);
        m.put("price", car.getPrice() != null ? car.getPrice() : 0);

        m.put("Brand", "Generic");
        m.put("Model", "Generic");

        return m;
    }
}