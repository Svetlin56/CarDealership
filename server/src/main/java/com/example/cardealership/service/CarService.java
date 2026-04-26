package com.example.cardealership.service;

import com.example.cardealership.domain.Car;
import com.example.cardealership.domain.Listing;
import com.example.cardealership.dto.CarDtos;
import com.example.cardealership.repository.CarRepository;
import com.example.cardealership.repository.ListingRepository;
import com.example.cardealership.service.car.CarMapper;
import com.example.cardealership.service.car.CarSpecificationBuilder;
import com.example.cardealership.service.car.CarValidator;
import com.example.cardealership.web.error.ResourceNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

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
    private final CarValidator carValidator;
    private final CarMapper carMapper;
    private final CarSpecificationBuilder carSpecificationBuilder;

    @Transactional
    public CarDtos.CarResponse create(CarDtos.CreateCarRequest request) {
        carValidator.validateForCreate(request);

        Car car = carMapper.toEntity(request);
        Car savedCar = carRepository.save(car);

        return carMapper.toResponse(savedCar);
    }

    @Transactional
    public CarDtos.CarResponse update(Long id, CarDtos.UpdateCarRequest request) {
        Car car = findActiveCarEntity(id);

        carValidator.validateForUpdate(id, request);

        String oldImageUrl = car.getImageUrl();
        String newImageUrl = carMapper.normalizeImageUrl(request.getImageUrl());

        carMapper.applyUpdates(car, request);
        Car savedCar = carRepository.save(car);

        if (oldImageUrl != null && !oldImageUrl.equals(newImageUrl)) {
            fileStorageService.deleteCarImage(oldImageUrl);
        }

        return carMapper.toResponse(savedCar);
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

        Specification<Car> specification = carSpecificationBuilder.build(request);
        Page<Car> carPage = carRepository.findAll(specification, pageable);

        return carMapper.toPageResponse(
                carPage,
                normalizedSortBy,
                direction.name().toLowerCase()
        );
    }

    public CarDtos.CarResponse findById(Long id) {
        return carMapper.toResponse(findActiveCarEntity(id));
    }

    @Transactional
    public void delete(Long id) {
        Car car = findActiveCarEntity(id);

        List<Listing> listings = listingRepository.findAllByCar_Id(id);
        listings.forEach(listing -> listing.setStatus(Listing.Status.HIDDEN));
        listingRepository.saveAll(listings);

        car.setDeleted(true);
        carRepository.save(car);
    }

    private Car findActiveCarEntity(Long id) {
        return carRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Car", "id", id));
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