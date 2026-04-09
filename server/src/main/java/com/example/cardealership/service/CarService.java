package com.example.cardealership.service;

import com.example.cardealership.domain.Car;
import com.example.cardealership.dto.CarDtos;
import com.example.cardealership.repository.CarRepository;
import com.example.cardealership.repository.ListingRepository;
import com.example.cardealership.web.error.DuplicateVinException;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

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

    public CarDtos.CarResponse create(CarDtos.CreateCarRequest req) {
        if (req.getVin() != null && !req.getVin().isBlank() && carRepository.existsByVin(req.getVin())) {
            throw new DuplicateVinException(req.getVin());
        }

        Car car = Car.builder()
                .make(req.getMake())
                .model(req.getModel())
                .prodYear(req.getYear())
                .mileage(req.getMileage())
                .vin(req.getVin())
                .price(req.getPrice())
                .imageUrl(req.getImageUrl())
                .engineSize(req.getEngineSize())
                .fuelType(req.getFuelType())
                .transmission(req.getTransmission())
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

        Pageable pageable = PageRequest.of(
                normalizedPage,
                normalizedSize,
                Sort.by(direction, normalizedSortBy)
        );

        Specification<Car> specification = buildSpecification(request);

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
        Car car = carRepository.findById(id).orElseThrow();
        return CarDtos.CarResponse.from(car);
    }

    @Transactional
    public void delete(Long id) {
        listingRepository.deleteByCar_Id(id);
        carRepository.deleteById(id);
    }

    private Specification<Car> buildSpecification(CarDtos.CarSearchRequest request) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            String normalizedSearch = normalize(request.getSearch());
            String normalizedMake = normalize(request.getMake());
            String normalizedModel = normalize(request.getModel());
            String normalizedFuelType = normalize(request.getFuelType());
            String normalizedTransmission = normalize(request.getTransmission());

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

            if (request.getYearFrom() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("prodYear"), request.getYearFrom()));
            }

            if (request.getYearTo() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("prodYear"), request.getYearTo()));
            }

            if (request.getPriceFrom() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), request.getPriceFrom()));
            }

            if (request.getPriceTo() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), request.getPriceTo()));
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
}