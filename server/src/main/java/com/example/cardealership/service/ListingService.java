package com.example.cardealership.service;

import com.example.cardealership.domain.Car;
import com.example.cardealership.domain.Listing;
import com.example.cardealership.domain.User;
import com.example.cardealership.dto.ListingDtos;
import com.example.cardealership.repository.CarRepository;
import com.example.cardealership.repository.ListingRepository;
import com.example.cardealership.repository.UserRepository;
import com.example.cardealership.web.error.InvalidListingStatusException;
import com.example.cardealership.web.error.ResourceNotFoundException;
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

    public ListingDtos.ListingResponse createByEmail(String email, ListingDtos.CreateListingRequest req) {
        User seller = userRepo.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        Car car = carRepo.findById(req.getCarId())
                .orElseThrow(() -> new ResourceNotFoundException("Car", "id", req.getCarId()));

        Listing listing = Listing.builder()
                .car(car)
                .seller(seller)
                .description(req.getDescription())
                .status(Listing.Status.ACTIVE)
                .build();

        return ListingDtos.ListingResponse.from(listingRepo.save(listing));
    }

    public List<ListingDtos.ListingResponse> all() {
        return ListingDtos.ListingResponse.fromList(listingRepo.findAll());
    }

    public ListingDtos.ListingResponse get(Long id) {
        Listing listing = listingRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Listing", "id", id));

        return ListingDtos.ListingResponse.from(listing);
    }

    public ListingDtos.ListingResponse updateStatus(Long id, ListingDtos.UpdateListingStatusRequest req) {
        Listing listing = listingRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Listing", "id", id));

        listing.setStatus(parseStatus(req.getStatus()));

        return ListingDtos.ListingResponse.from(listingRepo.save(listing));
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
}