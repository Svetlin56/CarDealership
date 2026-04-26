package com.example.cardealership.service.car;

import com.example.cardealership.dto.CarDtos;
import com.example.cardealership.repository.CarRepository;
import com.example.cardealership.web.error.BusinessValidationException;
import com.example.cardealership.web.error.DuplicateVinException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Year;

@Component
@RequiredArgsConstructor
public class CarValidator {

    private final CarRepository carRepository;
    private final CarMapper carMapper;

    public void validateForCreate(CarDtos.CreateCarRequest request) {
        validateBusinessRules(
                request.getYear(),
                request.getMileage(),
                request.getPrice(),
                request.getOwnerCount(),
                request.getEngineSize()
        );

        String normalizedVin = carMapper.normalizeVin(request.getVin());
        if (carRepository.existsByVin(normalizedVin)) {
            throw new DuplicateVinException(normalizedVin);
        }
    }

    public void validateForUpdate(Long id, CarDtos.UpdateCarRequest request) {
        validateBusinessRules(
                request.getYear(),
                request.getMileage(),
                request.getPrice(),
                request.getOwnerCount(),
                request.getEngineSize()
        );

        String normalizedVin = carMapper.normalizeVin(request.getVin());
        if (carRepository.existsByVinAndIdNot(normalizedVin, id)) {
            throw new DuplicateVinException(normalizedVin);
        }
    }

    private void validateBusinessRules(
            Integer year,
            Long mileage,
            BigDecimal price,
            Integer ownerCount,
            BigDecimal engineSize
    ) {
        int currentYear = Year.now().getValue();

        if (year != null && year > currentYear) {
            throw new BusinessValidationException("Production year cannot be in the future.");
        }

        if (price != null && price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessValidationException("Price must be greater than zero.");
        }

        if (mileage != null && mileage > 2_000_000L) {
            throw new BusinessValidationException("Mileage is unrealistically high.");
        }

        if (ownerCount != null && ownerCount > 20) {
            throw new BusinessValidationException("Owner count is unrealistically high.");
        }

        if (engineSize != null && engineSize.compareTo(BigDecimal.valueOf(10.0)) > 0) {
            throw new BusinessValidationException("Engine size is unrealistically high.");
        }

        if (year != null && mileage != null && year >= currentYear - 1 && mileage > 300_000L) {
            throw new BusinessValidationException("Mileage is too high for such a recent vehicle.");
        }
    }
}