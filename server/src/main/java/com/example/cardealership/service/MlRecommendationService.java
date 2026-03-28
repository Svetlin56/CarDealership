package com.example.cardealership.service;

import com.example.cardealership.domain.Car;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MlRecommendationService {

    private final RestTemplate restTemplate;

    @Value("${ml.service.base-url:http://localhost:5000}")
    private String mlServiceBaseUrl;

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

            ResponseEntity<Object[]> response = restTemplate.exchange(
                    mlServiceBaseUrl + "/recommend",
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
                    @SuppressWarnings("unchecked")
                    Map<String, Object> casted = (Map<String, Object>) map;
                    result.add(casted);
                }
            }

            result.sort((a, b) ->
                    Double.compare(getDouble(b.get("value_score")), getDouble(a.get("value_score")))
            );

            return result;

        } catch (Exception e) {
            throw new RuntimeException("ML recommendation service failed", e);
        }
    }

    public Double predict(Car car) {
        try {
            Map<String, Object> payload = mapCar(car);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request =
                    new HttpEntity<>(payload, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    mlServiceBaseUrl + "/predict",
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
            throw new RuntimeException("ML price prediction failed", e);
        }
    }

    private Map<String, Object> mapCar(Car car) {
        Map<String, Object> m = new HashMap<>();

        m.put("Brand", normalize(car.getMake()));
        m.put("Model", normalize(car.getModel()));
        m.put("Year", safeInt(car.getProdYear(), 2018));
        m.put("Engine_Size", safeDecimal(car.getEngineSize(), BigDecimal.valueOf(2.0)));
        m.put("Fuel_Type", normalizeCategory(car.getFuelType(), "Petrol"));
        m.put("Transmission", normalizeCategory(car.getTransmission(), "Automatic"));
        m.put("Mileage", safeLong(car.getMileage(), 100_000L));
        m.put("Doors", safeInt(car.getDoors(), 4));
        m.put("Owner_Count", safeInt(car.getOwnerCount(), 1));
        m.put("price", car.getPrice() != null ? car.getPrice().doubleValue() : 0.0);

        return m;
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return "UNKNOWN";
        }
        return value.trim();
    }

    private String normalizeCategory(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value.trim();
    }

    private Integer safeInt(Integer value, int fallback) {
        return value != null ? value : fallback;
    }

    private Long safeLong(Long value, long fallback) {
        return value != null ? value : fallback;
    }

    private Double safeDecimal(BigDecimal value, BigDecimal fallback) {
        return value != null ? value.doubleValue() : fallback.doubleValue();
    }

    private double getDouble(Object value) {
        if (value == null) {
            return 0.0;
        }
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        return Double.parseDouble(value.toString());
    }
}