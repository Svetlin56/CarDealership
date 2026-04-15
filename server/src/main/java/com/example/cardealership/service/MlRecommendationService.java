package com.example.cardealership.service;

import com.example.cardealership.domain.Car;
import com.example.cardealership.dto.MlPredictionResponse;
import com.example.cardealership.dto.MlRecommendationRequest;
import com.example.cardealership.dto.MlRecommendationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MlRecommendationService {

    private final RestTemplate restTemplate;

    @Value("${ml.service.base-url:http://localhost:5000}")
    private String mlServiceBaseUrl;

    public List<MlRecommendationResponse> recommend(List<Car> cars) {
        try {
            if (cars == null || cars.isEmpty()) {
                return Collections.emptyList();
            }

            List<MlRecommendationRequest> payload = cars.stream()
                    .map(this::mapCar)
                    .toList();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<List<MlRecommendationRequest>> requestEntity =
                    new HttpEntity<>(payload, headers);

            ResponseEntity<List<MlRecommendationResponse>> response = restTemplate.exchange(
                    mlServiceBaseUrl + "/recommend",
                    HttpMethod.POST,
                    requestEntity,
                    new ParameterizedTypeReference<>() {
                    }
            );

            List<MlRecommendationResponse> body = response.getBody();
            if (body == null) {
                return Collections.emptyList();
            }

            body.sort(Comparator.comparing(
                    MlRecommendationResponse::getValueScore,
                    Comparator.nullsLast(Double::compareTo)
            ).reversed());

            return body;
        } catch (Exception e) {
            throw new RuntimeException("ML recommendation service failed", e);
        }
    }

    public Double predict(Car car) {
        try {
            MlRecommendationRequest payload = mapCar(car);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<MlRecommendationRequest> request = new HttpEntity<>(payload, headers);

            ResponseEntity<MlPredictionResponse> response = restTemplate.exchange(
                    mlServiceBaseUrl + "/predict",
                    HttpMethod.POST,
                    request,
                    MlPredictionResponse.class
            );

            MlPredictionResponse body = response.getBody();
            if (body == null) {
                return null;
            }

            return body.getPredictedPrice();
        } catch (Exception e) {
            throw new RuntimeException("ML price prediction failed", e);
        }
    }

    private MlRecommendationRequest mapCar(Car car) {
        return MlRecommendationRequest.builder()
                .brand(normalize(car.getMake()))
                .model(normalize(car.getModel()))
                .year(safeInt(car.getProdYear(), 2018))
                .engineSize(safeDecimal(car.getEngineSize(), BigDecimal.valueOf(2.0)))
                .fuelType(normalizeCategory(car.getFuelType(), "Petrol"))
                .transmission(normalizeCategory(car.getTransmission(), "Automatic"))
                .mileage(safeLong(car.getMileage(), 100_000L))
                .doors(safeInt(car.getDoors(), 4))
                .ownerCount(safeInt(car.getOwnerCount(), 1))
                .price(car.getPrice() != null ? car.getPrice() : BigDecimal.ZERO)
                .build();
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
}