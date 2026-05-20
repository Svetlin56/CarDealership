package com.example.cardealership.service;

import com.example.cardealership.domain.Car;
import com.example.cardealership.domain.Listing;
import com.example.cardealership.dto.MlPredictionResponse;
import com.example.cardealership.dto.MlRecommendationRequest;
import com.example.cardealership.dto.MlRecommendationResponse;
import com.example.cardealership.web.error.MlPredictionException;
import com.example.cardealership.web.error.MlServiceUnavailableException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MlRecommendationService {

    private static final String SOURCE_ML = "ML";
    private static final String SOURCE_FALLBACK = "FALLBACK";

    private final RestTemplate restTemplate;

    @Value("${ml.service.base-url}")
    private String mlServiceBaseUrl;

    public List<MlRecommendationResponse> recommend(List<Listing> listings) {
        if (listings.isEmpty()) {
            return Collections.emptyList();
        }

        try {
            List<MlRecommendationRequest> payload = listings.stream()
                    .map(this::mapListing)
                    .toList();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<List<MlRecommendationRequest>> requestEntity = new HttpEntity<>(payload, headers);

            ResponseEntity<List<MlRecommendationResponse>> response = restTemplate.exchange(
                    mlServiceBaseUrl + "/recommend",
                    HttpMethod.POST,
                    requestEntity,
                    new ParameterizedTypeReference<>() {}
            );

            List<MlRecommendationResponse> body = response.getBody();
            if (body == null) {
                return Collections.emptyList();
            }

            body.forEach(this::normalizeMlRecommendation);
            body.sort(byValueScoreDescending());

            return body;
        } catch (ResourceAccessException ex) {
            throw new MlServiceUnavailableException("ML recommendation service is unavailable.", ex);
        } catch (RestClientException ex) {
            throw new MlPredictionException("ML recommendation service returned an invalid response.", ex);
        }
    }

    public List<MlRecommendationResponse> fallbackRecommendations(List<Listing> listings) {
        return listings.stream()
                .map(this::mapFallbackRecommendation)
                .sorted(byValueScoreDescending())
                .toList();
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
            if (body == null || body.getPredictedPrice() == null) {
                throw new MlPredictionException("ML price prediction response was empty.", null);
            }

            return body.getPredictedPrice();
        } catch (ResourceAccessException ex) {
            throw new MlServiceUnavailableException("ML price prediction service is unavailable.", ex);
        } catch (RestClientException ex) {
            throw new MlPredictionException("ML price prediction failed.", ex);
        }
    }

    private Comparator<MlRecommendationResponse> byValueScoreDescending() {
        return Comparator.comparing(
                MlRecommendationResponse::getValueScore,
                Comparator.nullsLast(Double::compareTo)
        ).reversed();
    }

    private MlRecommendationRequest mapListing(Listing listing) {
        MlRecommendationRequest request = mapCar(listing.getCar());
        request.setCarId(listing.getCar().getId());
        request.setListingId(listing.getId());
        request.setListingStatus(listing.getStatus().name());
        request.setListingDescription(listing.getDescription());
        request.setImageUrl(listing.getCar().getImageUrl());

        return request;
    }

    private MlRecommendationRequest mapCar(Car car) {
        return MlRecommendationRequest.builder()
                .carId(car.getId())
                .imageUrl(car.getImageUrl())
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

    private MlRecommendationResponse mapFallbackRecommendation(Listing listing) {
        Car car = listing.getCar();
        BigDecimal price = car.getPrice() != null ? car.getPrice() : BigDecimal.ZERO;
        Double score = calculateFallbackScore(car);

        return MlRecommendationResponse.builder()
                .carId(car.getId())
                .listingId(listing.getId())
                .listingStatus(listing.getStatus().name())
                .listingDescription(listing.getDescription())
                .imageUrl(car.getImageUrl())
                .recommendationSource(SOURCE_FALLBACK)
                .brand(normalize(car.getMake()))
                .model(normalize(car.getModel()))
                .year(safeInt(car.getProdYear(), 2018))
                .engineSize(safeDecimal(car.getEngineSize(), BigDecimal.valueOf(2.0)))
                .fuelType(normalizeCategory(car.getFuelType(), "Petrol"))
                .transmission(normalizeCategory(car.getTransmission(), "Automatic"))
                .mileage(safeLong(car.getMileage(), 100_000L))
                .doors(safeInt(car.getDoors(), 4))
                .ownerCount(safeInt(car.getOwnerCount(), 1))
                .price(price)
                .predictedPrice(price.doubleValue())
                .score(score)
                .valueScore(score)
                .goodDeal(false)
                .anomalyRatio(0.0)
                .anomalyLabel("UNKNOWN")
                .carType(classifyCar(car))
                .marketMatch(0.0)
                .explanation("Fallback recommendation based on active listing status, production year, mileage and owner count.")
                .build();
    }

    private void normalizeMlRecommendation(MlRecommendationResponse recommendation) {
        if (recommendation.getRecommendationSource() == null || recommendation.getRecommendationSource().isBlank()) {
            recommendation.setRecommendationSource(SOURCE_ML);
        }

        if (recommendation.getValueScore() == null && recommendation.getScore() != null) {
            recommendation.setValueScore(recommendation.getScore());
        }
    }

    private Double calculateFallbackScore(Car car) {
        int year = safeInt(car.getProdYear(), 2018);
        long mileage = safeLong(car.getMileage(), 100_000L);
        int ownerCount = safeInt(car.getOwnerCount(), 1);

        double yearScore = Math.max(0, year - 2000) * 0.8;
        double mileageScore = Math.max(0, 250_000 - mileage) / 10_000.0;
        double ownerScore = Math.max(0, 5 - ownerCount) * 1.5;

        return BigDecimal.valueOf(yearScore + mileageScore + ownerScore)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private String classifyCar(Car car) {
        String modelName = normalize(car.getModel()).toLowerCase();
        String brand = normalize(car.getMake()).toLowerCase();
        int year = safeInt(car.getProdYear(), 2018);
        int doors = safeInt(car.getDoors(), 4);

        if (modelName.contains("gtr") || modelName.contains("m3") || modelName.contains("m5")
                || modelName.contains("amg") || modelName.contains("rs") || modelName.contains("mustang")) {
            return "SPORT";
        }

        if ((brand.equals("bmw") || brand.equals("audi") || brand.equals("mercedes")) && year > 2016) {
            return "LUXURY";
        }

        if (doors >= 4) {
            return "FAMILY";
        }

        return "CITY";
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