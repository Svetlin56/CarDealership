package com.example.cardealership.service;

import com.example.cardealership.dto.MlRecommendationRequest;
import com.example.cardealership.dto.MlRecommendationResponse;
import com.example.cardealership.domain.Car;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MlRecommendationService {

    private final RestTemplate restTemplate;

    private static final String ML_RECOMMEND_URL = "http://localhost:5000/recommend";
    private static final String ML_PREDICT_URL = "http://localhost:5000/predict";

    public List<MlRecommendationResponse> recommend(List<Car> cars) {
        List<MlRecommendationRequest> payload = cars.stream()
                .map(this::mapCarToRecommendationRequest)
                .toList();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<List<MlRecommendationRequest>> requestEntity = new HttpEntity<>(payload, headers);

        ResponseEntity<List<MlRecommendationResponse>> response = restTemplate.exchange(
                ML_RECOMMEND_URL,
                HttpMethod.POST,
                requestEntity,
                new ParameterizedTypeReference<>() {}
        );

        return response.getBody();
    }

    public Double predict(Car car) {
        MlRecommendationRequest payload = mapCarToRecommendationRequest(car);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<MlRecommendationRequest> requestEntity = new HttpEntity<>(payload, headers);

        var response = restTemplate.exchange(
                ML_PREDICT_URL,
                HttpMethod.POST,
                requestEntity,
                java.util.Map.class
        );

        assert response.getBody() != null;
        Object value = response.getBody().get("predicted_price");
        return value == null ? null : Double.parseDouble(value.toString());
    }

    private MlRecommendationRequest mapCarToRecommendationRequest(Car car) {
        MlRecommendationRequest dto = new MlRecommendationRequest();

        dto.setYear(car.getProdYear());
        dto.setEngine_Size(2.0);
        dto.setFuel_Type("Petrol");
        dto.setTransmission("Manual");
        dto.setDoors(4);
        dto.setOwner_Count(1);

        dto.setMileage(car.getMileage());
        dto.setPrice(car.getPrice());

        return dto;
    }
}