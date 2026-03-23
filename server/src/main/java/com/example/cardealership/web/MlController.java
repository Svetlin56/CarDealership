package com.example.cardealership.web;

import com.example.cardealership.domain.Car;
import com.example.cardealership.repository.CarRepository;
import com.example.cardealership.service.MlRecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ml")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class MlController {

    private final MlRecommendationService mlRecommendationService;
    private final CarRepository carRepository;

    @GetMapping("/recommendations")
    public List<Map<String, Object>> getRecommendations() {
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