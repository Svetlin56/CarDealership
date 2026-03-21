package com.example.cardealership.web;

import com.example.cardealership.dto.MlRecommendationResponse;
import com.example.cardealership.domain.Car;
import com.example.cardealership.repository.CarRepository;
import com.example.cardealership.service.MlRecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ml")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class MlController {

    private final MlRecommendationService mlRecommendationService;
    private final CarRepository carRepository;

    @GetMapping("/recommendations")
    public List<MlRecommendationResponse> getRecommendations() {
        List<Car> cars = carRepository.findAll();
        return mlRecommendationService.recommend(cars);
    }

    @GetMapping("/predict/{id}")
    public Double predictPrice(@PathVariable Long id) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Car not found"));

        return mlRecommendationService.predict(car);
    }
}