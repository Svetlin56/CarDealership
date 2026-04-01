package com.example.cardealership.service;

import com.example.cardealership.domain.Car;
import com.example.cardealership.domain.Listing;
import com.example.cardealership.domain.User;
import com.example.cardealership.dto.ListingDtos;
import com.example.cardealership.repository.CarRepository;
import com.example.cardealership.repository.ListingRepository;
import com.example.cardealership.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ListingService {

    private final ListingRepository listingRepo;
    private final CarRepository carRepo;
    private final UserRepository userRepo;

    public ListingDtos.ListingResponse createByEmail(String email, ListingDtos.CreateListingRequest req) {
        User seller = userRepo.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Car car = carRepo.findById(req.getCarId())
                .orElseThrow(() -> new IllegalArgumentException("Car not found"));

        Listing listing = Listing.builder()
                .car(car)
                .seller(seller)
                .description(req.getDescription())
                .status(Listing.Status.ACTIVE)
                .build();

        Listing savedListing = listingRepo.save(listing);

        return ListingDtos.ListingResponse.from(savedListing);
    }

    public List<ListingDtos.ListingResponse> all() {
        return ListingDtos.ListingResponse.fromList(listingRepo.findAll());
    }

    public ListingDtos.ListingResponse get(Long id) {
        Listing listing = listingRepo.findById(id).orElseThrow();
        return ListingDtos.ListingResponse.from(listing);
    }

    public ListingDtos.ListingResponse updateStatus(Long id, ListingDtos.UpdateListingStatusRequest req) {
        Listing listing = listingRepo.findById(id).orElseThrow();

        try {
            listing.setStatus(Listing.Status.valueOf(req.getStatus().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status value");
        }

        Listing updatedListing = listingRepo.save(listing);

        return ListingDtos.ListingResponse.from(updatedListing);
    }
}