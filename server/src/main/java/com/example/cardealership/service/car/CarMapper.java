package com.example.cardealership.service.car;

import com.example.cardealership.domain.Car;
import com.example.cardealership.dto.CarDtos;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

@Component
public class CarMapper {

    public Car toEntity(CarDtos.CreateCarRequest request) {
        return Car.builder()
                .make(normalizeRequired(request.getMake()))
                .model(normalizeRequired(request.getModel()))
                .prodYear(request.getYear())
                .mileage(request.getMileage())
                .vin(normalizeVin(request.getVin()))
                .price(request.getPrice())
                .imageUrl(normalizeOptional(request.getImageUrl()))
                .engineSize(request.getEngineSize())
                .fuelType(normalizeOptional(request.getFuelType()))
                .transmission(normalizeOptional(request.getTransmission()))
                .doors(request.getDoors())
                .ownerCount(request.getOwnerCount())
                .deleted(false)
                .build();
    }

    public void applyUpdates(Car car, CarDtos.UpdateCarRequest request) {
        car.setMake(normalizeRequired(request.getMake()));
        car.setModel(normalizeRequired(request.getModel()));
        car.setProdYear(request.getYear());
        car.setMileage(request.getMileage());
        car.setVin(normalizeVin(request.getVin()));
        car.setPrice(request.getPrice());
        car.setImageUrl(normalizeOptional(request.getImageUrl()));
        car.setEngineSize(request.getEngineSize());
        car.setFuelType(normalizeOptional(request.getFuelType()));
        car.setTransmission(normalizeOptional(request.getTransmission()));
        car.setDoors(request.getDoors());
        car.setOwnerCount(request.getOwnerCount());
    }

    public CarDtos.CarResponse toResponse(Car car) {
        return CarDtos.CarResponse.from(car);
    }

    public CarDtos.CarPageResponse toPageResponse(
            Page<Car> carPage,
            String sortBy,
            String sortDir
    ) {
        return CarDtos.CarPageResponse.builder()
                .content(carPage.getContent().stream().map(this::toResponse).toList())
                .page(carPage.getNumber())
                .size(carPage.getSize())
                .totalElements(carPage.getTotalElements())
                .totalPages(carPage.getTotalPages())
                .first(carPage.isFirst())
                .last(carPage.isLast())
                .sortBy(sortBy)
                .sortDir(sortDir)
                .build();
    }

    public String normalizeVin(String vin) {
        return vin == null ? null : vin.trim().toUpperCase();
    }

    public String normalizeImageUrl(String imageUrl) {
        return normalizeOptional(imageUrl);
    }

    private String normalizeRequired(String value) {
        return value == null ? null : value.trim();
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}