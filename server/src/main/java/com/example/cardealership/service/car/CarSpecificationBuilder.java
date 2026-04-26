package com.example.cardealership.service.car;

import com.example.cardealership.domain.Car;
import com.example.cardealership.dto.CarDtos;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
public class CarSpecificationBuilder {

    public Specification<Car> build(CarDtos.CarSearchRequest request) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.isFalse(root.get("deleted")));

            String normalizedSearch = normalize(request.getSearch());
            String normalizedMake = normalize(request.getMake());
            String normalizedModel = normalize(request.getModel());
            String normalizedFuelType = normalize(request.getFuelType());
            String normalizedTransmission = normalize(request.getTransmission());
            Integer normalizedYearFrom = normalizeNonNegative(request.getYearFrom());
            Integer normalizedYearTo = normalizeNonNegative(request.getYearTo());
            BigDecimal normalizedPriceFrom = normalizeNonNegative(request.getPriceFrom());
            BigDecimal normalizedPriceTo = normalizeNonNegative(request.getPriceTo());

            if (normalizedSearch != null) {
                String pattern = "%" + normalizedSearch.toLowerCase() + "%";

                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("make")), pattern),
                        cb.like(cb.lower(root.get("model")), pattern),
                        cb.like(cb.lower(root.get("vin")), pattern)
                ));
            }

            if (normalizedMake != null) {
                predicates.add(cb.equal(cb.lower(root.get("make")), normalizedMake.toLowerCase()));
            }

            if (normalizedModel != null) {
                predicates.add(cb.equal(cb.lower(root.get("model")), normalizedModel.toLowerCase()));
            }

            if (normalizedYearFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("prodYear"), normalizedYearFrom));
            }

            if (normalizedYearTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("prodYear"), normalizedYearTo));
            }

            if (normalizedPriceFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), normalizedPriceFrom));
            }

            if (normalizedPriceTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), normalizedPriceTo));
            }

            if (normalizedFuelType != null) {
                predicates.add(cb.equal(cb.lower(root.get("fuelType")), normalizedFuelType.toLowerCase()));
            }

            if (normalizedTransmission != null) {
                predicates.add(cb.equal(cb.lower(root.get("transmission")), normalizedTransmission.toLowerCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private Integer normalizeNonNegative(Integer value) {
        if (value == null) {
            return null;
        }
        return Math.max(value, 0);
    }

    private BigDecimal normalizeNonNegative(BigDecimal value) {
        if (value == null) {
            return null;
        }
        return value.signum() < 0 ? BigDecimal.ZERO : value;
    }
}