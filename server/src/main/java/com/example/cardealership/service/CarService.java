package com.example.cardealership.service;

import com.example.cardealership.domain.Car;
import com.example.cardealership.dto.CarDtos;
import com.example.cardealership.repository.CarRepository;
import com.example.cardealership.repository.ListingRepository;
import com.example.cardealership.web.error.DuplicateVinException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CarService {

    private final CarRepository carRepository;
    private final ListingRepository listingRepository;

    public Car create(CarDtos.CreateCarRequest req) {

        if (req.getVin() != null && !req.getVin().isBlank()) {
            if (carRepository.existsByVin(req.getVin())) {
                throw new DuplicateVinException(req.getVin());
            }
        }

        Car car = Car.builder()
                .make(req.getMake())
                .model(req.getModel())
                .prodYear(req.getYear())
                .mileage(req.getMileage())
                .vin(req.getVin())
                .price(req.getPrice())
                .imageUrl(req.getImageUrl())
                .build();

        return carRepository.save(car);
    }

    public List<Car> findAll() {
        return carRepository.findAll();
    }

    public Car findById(Long id) {
        return carRepository.findById(id).orElseThrow();
    }

    @Transactional
    public void delete(Long id) {
        listingRepository.deleteByCar_Id(id);
        carRepository.deleteById(id);
    }
}
