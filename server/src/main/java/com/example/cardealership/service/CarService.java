package com.example.cardealership.service;

import com.example.cardealership.domain.Car;
import com.example.cardealership.dto.CarDtos;
import com.example.cardealership.repository.CarRepository;
import com.example.cardealership.repository.ListingRepository;
import com.example.cardealership.web.error.BusinessValidationException;
import com.example.cardealership.web.error.DuplicateVinException;
import com.example.cardealership.web.error.ResourceNotFoundException;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CarService {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id",
            "make",
            "model",
            "prodYear",
            "price",
            "mileage",
            "fuelType",
            "transmission"
    );

    private final CarRepository carRepository;
    private final ListingRepository listingRepository;
    private final FileStorageService fileStorageService;

    public CarDtos.CarResponse create(CarDtos.CreateCarRequest req) {
        validateBusinessRules(req);

        if (carRepository.existsByVin(req.getVin())) {
            throw new DuplicateVinException(req.getVin());
        }

        Car car = Car.builder()
                .make(req.getMake().trim())
                .model(req.getModel().trim())
                .prodYear(req.getYear())
                .mileage(req.getMileage())
                .vin(req.getVin().trim().toUpperCase())
                .price(req.getPrice())
                .imageUrl(normalizeImageUrl(req.getImageUrl()))
                .engineSize(req.getEngineSize())
                .fuelType(normalizeOptional(req.getFuelType()))
                .transmission(normalizeOptional(req.getTransmission()))
                .doors(req.getDoors())
                .ownerCount(req.getOwnerCount())
                .build();

        Car savedCar = carRepository.save(car);
        return CarDtos.CarResponse.from(savedCar);
    }

    public CarDtos.CarPageResponse findAll(CarDtos.CarSearchRequest request) {
        int normalizedPage = Math.max(defaultIfNull(request.getPage(), 0), 0);
        int normalizedSize = Math.min(Math.max(defaultIfNull(request.getSize(), 9), 1), 50);
        String normalizedSortBy = normalizeSortBy(request.getSortBy());
        Sort.Direction direction = "asc".equalsIgnoreCase(request.getSortDir())
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        Integer normalizedYearFrom = normalizeNonNegative(request.getYearFrom());
        Integer normalizedYearTo = normalizeNonNegative(request.getYearTo());
        BigDecimal normalizedPriceFrom = normalizeNonNegative(request.getPriceFrom());
        BigDecimal normalizedPriceTo = normalizeNonNegative(request.getPriceTo());

        Pageable pageable = PageRequest.of(
                normalizedPage,
                normalizedSize,
                Sort.by(direction, normalizedSortBy)
        );

        Specification<Car> specification = buildSpecification(
                request.getSearch(),
                request.getMake(),
                request.getModel(),
                normalizedYearFrom,
                normalizedYearTo,
                normalizedPriceFrom,
                normalizedPriceTo,
                request.getFuelType(),
                request.getTransmission()
        );

        Page<Car> carPage = carRepository.findAll(specification, pageable);

        return CarDtos.CarPageResponse.builder()
                .content(carPage.getContent().stream().map(CarDtos.CarResponse::from).toList())
                .page(carPage.getNumber())
                .size(carPage.getSize())
                .totalElements(carPage.getTotalElements())
                .totalPages(carPage.getTotalPages())
                .first(carPage.isFirst())
                .last(carPage.isLast())
                .sortBy(normalizedSortBy)
                .sortDir(direction.name().toLowerCase())
                .build();
    }

    public CarDtos.CarResponse findById(Long id) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Car", "id", id));

        return CarDtos.CarResponse.from(car);
    }

    @Transactional
    public void delete(Long id) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Car", "id", id));

        listingRepository.deleteByCar_Id(id);
        carRepository.deleteById(id);
        fileStorageService.deleteCarImage(car.getImageUrl());
    }

    private void validateBusinessRules(CarDtos.CreateCarRequest req) {
        int currentYear = Year.now().getValue();

        if (req.getYear() != null && req.getYear() > currentYear) {
            throw new BusinessValidationException("Production year cannot be in the future.");
        }

        if (req.getPrice() != null && req.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessValidationException("Price must be greater than zero.");
        }

        if (req.getMileage() != null && req.getMileage() > 2_000_000L) {
            throw new BusinessValidationException("Mileage is unrealistically high.");
        }

        if (req.getOwnerCount() != null && req.getOwnerCount() > 20) {
            throw new BusinessValidationException("Owner count is unrealistically high.");
        }

        if (req.getEngineSize() != null && req.getEngineSize().compareTo(BigDecimal.valueOf(10.0)) > 0) {
            throw new BusinessValidationException("Engine size is unrealistically high.");
        }

        if (req.getYear() != null && req.getMileage() != null && req.getYear() >= currentYear - 1 && req.getMileage() > 300_000L) {
            throw new BusinessValidationException("Mileage is too high for such a recent vehicle.");
        }
    }

    private Specification<Car> buildSpecification(
            String search,
            String make,
            String model,
            Integer yearFrom,
            Integer yearTo,
            BigDecimal priceFrom,
            BigDecimal priceTo,
            String fuelType,
            String transmission
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            String normalizedSearch = normalize(search);
            String normalizedMake = normalize(make);
            String normalizedModel = normalize(model);
            String normalizedFuelType = normalize(fuelType);
            String normalizedTransmission = normalize(transmission);

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

            if (yearFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("prodYear"), yearFrom));
            }

            if (yearTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("prodYear"), yearTo));
            }

            if (priceFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), priceFrom));
            }

            if (priceTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), priceTo));
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

    private String normalizeOptional(String value) {
        return normalize(value);
    }

    private String normalizeImageUrl(String imageUrl) {
        return normalize(imageUrl);
    }

    private String normalizeSortBy(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) {
            return "id";
        }

        String trimmed = sortBy.trim();
        return ALLOWED_SORT_FIELDS.contains(trimmed) ? trimmed : "id";
    }

    private int defaultIfNull(Integer value, int defaultValue) {
        return value != null ? value : defaultValue;
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