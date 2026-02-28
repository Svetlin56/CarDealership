package com.example.cardealership.service;

import com.example.cardealership.domain.*;
import com.example.cardealership.dto.ListingDtos;
import com.example.cardealership.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service @RequiredArgsConstructor
public class ListingService {
    private final ListingRepository listingRepo;
    private final CarRepository carRepo;
    private final UserRepository userRepo;

    public Listing createByEmail(String email, ListingDtos.CreateListingRequest req) {

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

        return listingRepo.save(listing);
    }

    public List<Listing> all(){ return listingRepo.findAll(); }
    public Listing get(Long id){ return listingRepo.findById(id).orElseThrow(); }

    public Listing updateStatus(Long id, ListingDtos.UpdateListingStatusRequest req) {
        Listing l = get(id);

        try {
            l.setStatus(Listing.Status.valueOf(req.getStatus().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status value");
        }

        return listingRepo.save(l);
    }
}
