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

    private static final int MAX_RECOMMENDATIONS = 5;

    public List<Map<String, Object>> recommend(List<Car> cars) {
        try {
            if (cars == null || cars.isEmpty()) {
                return Collections.emptyList();
            }

            List<Car> shuffled = new ArrayList<>(cars);
            Collections.shuffle(shuffled);

            List<Car> selected = shuffled.stream()
                    .limit(MAX_RECOMMENDATIONS)
                    .toList();

            List<Map<String, Object>> payload = selected.stream()
                    .map(this::mapCar)
                    .toList();

            System.out.println("=== SENDING TO ML ===");
            payload.forEach(System.out::println);

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

            List<Map<String, Object>> result =
                    response.getBody() != null ? response.getBody() : Collections.emptyList();

            if (result.isEmpty()) {
                return result;
            }

            List<Map<String, Object>> filtered = result.stream()
                    .filter(car -> {
                        Object label = car.get("anomaly_label");
                        return label != null &&
                                (label.equals("UNDERVALUED") || label.equals("FAIR"));
                    })
                    .toList();

            List<Map<String, Object>> finalList =
                    filtered.isEmpty() ? result : filtered;

            finalList.sort((a, b) -> {
                double v1 = getDouble(a.get("value_score"));
                double v2 = getDouble(b.get("value_score"));
                return Double.compare(v2, v1);
            });

            return finalList;

        } catch (Exception e) {
            System.err.println("ML ERROR: " + e.getMessage());
            throw new RuntimeException("ML service failed: " + e.getMessage());
        }
    }

    public Double predict(Car car) {
        try {
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

            Map<String, Object> body = response.getBody();

            if (body == null || body.get("predicted_price") == null) {
                return null;
            }

            return Double.parseDouble(body.get("predicted_price").toString());

        } catch (Exception e) {
            System.err.println("PREDICT ERROR: " + e.getMessage());
            return null;
        }
    }

    private Map<String, Object> mapCar(Car car) {
        Map<String, Object> m = new HashMap<>();

        m.put("Year", safeInt(car.getProdYear(), 2015));
        m.put("Mileage", safeLong(car.getMileage(), 100000L));

        m.put("price", car.getPrice() != null ? car.getPrice().doubleValue() : 10000.0);

        m.put("Engine_Size", 2.0);
        m.put("Fuel_Type", "Petrol");
        m.put("Transmission", "Manual");
        m.put("Doors", 4);
        m.put("Owner_Count", 1);

        m.put("Brand", normalize(car.getMake()));
        m.put("Model", normalize(car.getModel()));

        return m;
    }

    private double getDouble(Object value) {
        if (value == null) return 0.0;
        return ((Number) value).doubleValue();
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return "Unknown";
        }
        return value.trim();
    }

    private Integer safeInt(Integer value, int fallback) {
        return value != null ? value : fallback;
    }

    private Long safeLong(Long value, long fallback) {
        return value != null ? value : fallback;
    }
}