package com.example.cardealership.service;

import com.example.cardealership.domain.Car;
import com.example.cardealership.domain.Listing;
import com.example.cardealership.domain.User;
import com.example.cardealership.dto.ListingDtos;
import com.example.cardealership.repository.CarRepository;
import com.example.cardealership.repository.ListingRepository;
import com.example.cardealership.repository.UserRepository;
import com.example.cardealership.web.error.BusinessValidationException;
import com.example.cardealership.web.error.InvalidListingStatusException;
import com.example.cardealership.web.error.ResourceNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ListingService {

    private final ListingRepository listingRepo;
    private final CarRepository carRepo;
    private final UserRepository userRepo;

    @Transactional
    public ListingDtos.ListingResponse createByEmail(String email, ListingDtos.CreateListingRequest req) {
        User seller = userRepo.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", normalizeEmail(email)));

        Car car = carRepo.findByIdAndDeletedFalse(req.getCarId())
                .orElseThrow(() -> new ResourceNotFoundException("Car", "id", req.getCarId()));

        if (listingRepo.existsByCar_IdAndStatus(car.getId(), Listing.Status.ACTIVE)) {
            throw new BusinessValidationException("This car already has an active listing.");
        }

        Listing listing = Listing.builder()
                .car(car)
                .seller(seller)
                .description(normalizeOptional(req.getDescription()))
                .status(Listing.Status.ACTIVE)
                .build();

        return ListingDtos.ListingResponse.from(listingRepo.save(listing));
    }

    public List<ListingDtos.ListingResponse> all() {
        return ListingDtos.ListingResponse.fromList(
                listingRepo.findAllByStatus(Listing.Status.ACTIVE)
        );
    }

    public ListingDtos.ListingResponse get(Long id) {
        Listing listing = listingRepo.findByIdAndStatus(id, Listing.Status.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Listing", "id", id));

        return ListingDtos.ListingResponse.from(listing);
    }

    public ListingDtos.ListingResponse getActiveByCarId(Long carId) {
        Listing listing = listingRepo.findFirstByCar_IdAndStatus(carId, Listing.Status.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Listing", "carId", carId));

        if (listing.getCar().isDeleted()) {
            throw new ResourceNotFoundException("Listing", "carId", carId);
        }

        return ListingDtos.ListingResponse.from(listing);
    }

    @Transactional
    public ListingDtos.ListingResponse updateStatus(Long id, ListingDtos.UpdateListingStatusRequest req) {
        Listing listing = listingRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Listing", "id", id));

        Listing.Status newStatus = parseStatus(req.getStatus());

        if (listing.getCar().isDeleted() && newStatus == Listing.Status.ACTIVE) {
            throw new BusinessValidationException("Cannot activate a listing for a deleted car.");
        }

        if (newStatus == Listing.Status.ACTIVE) {
            validateNoOtherActiveListingForCar(listing);
        }

        listing.setStatus(newStatus);

        return ListingDtos.ListingResponse.from(listingRepo.save(listing));
    }

    private void validateNoOtherActiveListingForCar(Listing listing) {
        boolean otherActiveListingExists = listingRepo.existsByCar_IdAndStatusAndIdNot(
                listing.getCar().getId(),
                Listing.Status.ACTIVE,
                listing.getId()
        );

        if (otherActiveListingExists) {
            throw new BusinessValidationException("This car already has an active listing.");
        }
    }

    private Listing.Status parseStatus(String rawStatus) {
        if (rawStatus == null || rawStatus.isBlank()) {
            throw new InvalidListingStatusException("blank");
        }

        try {
            return Listing.Status.valueOf(rawStatus.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new InvalidListingStatusException(rawStatus);
        }
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
}