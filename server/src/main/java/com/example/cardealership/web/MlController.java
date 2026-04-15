package com.example.cardealership.web;

import com.example.cardealership.domain.Car;
import com.example.cardealership.dto.MlPredictionResponse;
import com.example.cardealership.dto.MlRecommendationResponse;
import com.example.cardealership.repository.CarRepository;
import com.example.cardealership.service.MlRecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/v1/ml")
@RequiredArgsConstructor
public class MlController {

    private final MlRecommendationService mlRecommendationService;
    private final CarRepository carRepository;

    @GetMapping("/recommendations")
    public List<MlRecommendationResponse> getRecommendations() {
        List<Car> cars = carRepository.findAll();

        return mlRecommendationService.recommend(cars);
    }

    @GetMapping("/predict/{id}")
    public MlPredictionResponse predictPrice(@PathVariable Long id) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Car not found"));

        Double predictedPrice = mlRecommendationService.predict(car);

        return MlPredictionResponse.builder()
                .predictedPrice(predictedPrice)
                .build();
    }
}