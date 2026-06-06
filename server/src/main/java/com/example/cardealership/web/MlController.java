package com.example.cardealership.web;

import com.example.cardealership.domain.Car;
import com.example.cardealership.domain.Listing;
import com.example.cardealership.dto.MlPredictionResponse;
import com.example.cardealership.dto.MlRecommendationResponse;
import com.example.cardealership.repository.CarRepository;
import com.example.cardealership.repository.ListingRepository;
import com.example.cardealership.service.MlRecommendationService;
import com.example.cardealership.web.error.MlServiceException;
import com.example.cardealership.web.error.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/ml")
@RequiredArgsConstructor
public class MlController {

    private final MlRecommendationService mlRecommendationService;
    private final CarRepository carRepository;
    private final ListingRepository listingRepository;

    @GetMapping("/recommendations")
    public List<MlRecommendationResponse> getRecommendations(Authentication authentication) {
        List<Listing> activeListings = listingRepository.findAllByStatus(Listing.Status.ACTIVE)
                .stream()
                .filter(listing -> listing.getCar() != null && !listing.getCar().isDeleted())
                .toList();

        try {
            List<MlRecommendationResponse> recommendations = mlRecommendationService.recommend(activeListings);

            if (isAdmin(authentication)) {
                return recommendations;
            }

            return recommendations.stream()
                    .filter(recommendation -> !mlRecommendationService.isAboveMarketRecommendation(recommendation))
                    .toList();
        } catch (MlServiceException ex) {
            log.warn("ML recommendations unavailable. Returning fallback recommendations: {}", ex.getMessage());
            return mlRecommendationService.fallbackRecommendations(activeListings);
        }
    }

    @GetMapping("/predict/{id}")
    public MlPredictionResponse predictPrice(@PathVariable Long id) {
        Car car = carRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Car", "id", id));

        Double predictedPrice = mlRecommendationService.predict(car);

        return MlPredictionResponse.builder()
                .predictedPrice(predictedPrice)
                .build();
    }


    private boolean isAdmin(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        return authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
    }
}