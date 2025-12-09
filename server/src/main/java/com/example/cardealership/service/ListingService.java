package com.example.cardealership.service;

import com.example.cardealership.domain.*;
import com.example.cardealership.dto.ListingDtos;
import com.example.cardealership.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service @RequiredArgsConstructor
public class ListingService {
    private final ListingRepository listingRepo;
    private final CarRepository carRepo;
    private final UserRepository userRepo;

    public Listing create(Long sellerId, ListingDtos.CreateListingRequest req) {
        Car car = carRepo.findById(req.getCarId()).orElseThrow();
        User seller = userRepo.findById(sellerId).orElseThrow();
        Listing listing = Listing.builder()
                .car(car).seller(seller)
                .description(req.getDescription())
                .status(Listing.Status.ACTIVE)
                .build();
        return listingRepo.save(listing);
    }

    public List<Listing> all(){ return listingRepo.findAll(); }
    public Listing get(Long id){ return listingRepo.findById(id).orElseThrow(); }

    public Listing updateStatus(Long id, ListingDtos.UpdateListingStatusRequest req) {
        Listing l = get(id);
        l.setStatus(Listing.Status.valueOf(req.getStatus()));
        return listingRepo.save(l);
    }
}
