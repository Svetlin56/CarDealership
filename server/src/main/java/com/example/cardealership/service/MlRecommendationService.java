package com.example.cardealership.service;

import com.example.cardealership.domain.Car;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
public class MlRecommendationService {

    private final RestTemplate restTemplate;

    private static final String ML_RECOMMEND_URL = "http://localhost:5000/recommend";

    public List<Map<String, Object>> recommend(List<Car> cars) {
        try {
            if (cars == null || cars.isEmpty()) {
                return Collections.emptyList();
            }

            List<Map<String, Object>> payload = cars.stream()
                    .map(this::mapCar)
                    .toList();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<List<Map<String, Object>>> requestEntity =
                    new HttpEntity<>(payload, headers);

            ResponseEntity<Object[]> response =
                    restTemplate.exchange(
                            ML_RECOMMEND_URL,
                            HttpMethod.POST,
                            requestEntity,
                            Object[].class
                    );

            Object[] body = response.getBody();

            if (body == null) {
                return Collections.emptyList();
            }

            List<Map<String, Object>> result = new ArrayList<>();

            for (Object obj : body) {
                if (obj instanceof Map<?, ?> map) {
                    result.add((Map<String, Object>) map);
                }
            }

            result.sort((a, b) ->
                    Double.compare(getDouble(b.get("value_score")), getDouble(a.get("value_score")))
            );

            return result;

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("ML service failed", e);
        }
    }

    private Map<String, Object> mapCar(Car car) {
        Map<String, Object> m = new HashMap<>();

        m.put("Year", safeInt(car.getProdYear(), 2015));
        m.put("Mileage", safeLong(car.getMileage(), 100000L));

        m.put("price", car.getPrice() != null ? car.getPrice().doubleValue() : 10000.0);

        m.put("Engine_Size", 2.0);

        m.put("Fuel_Type", normalize(car.getMake())); // ако нямаш fuelType поле
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
        if (value == null || value.isBlank()) return "UNKNOWN";
        return value.trim();
    }

    private Integer safeInt(Integer value, int fallback) {
        return value != null ? value : fallback;
    }

    private Long safeLong(Long value, long fallback) {
        return value != null ? value : fallback;
    }

    public Double predict(Car car) {
        try {
            Map<String, Object> payload = mapCar(car);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request =
                    new HttpEntity<>(payload, headers);

            ResponseEntity<Map> response =
                    restTemplate.exchange(
                            "http://localhost:5000/predict",
                            HttpMethod.POST,
                            request,
                            Map.class
                    );

            Map<String, Object> body = response.getBody();

            if (body == null || body.get("predicted_price") == null) {
                return null;
            }

            return Double.parseDouble(body.get("predicted_price").toString());

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}