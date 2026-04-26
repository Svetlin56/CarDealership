package com.example.cardealership.web;

import com.example.cardealership.dto.ListingDtos;
import com.example.cardealership.service.ListingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/listings")
@RequiredArgsConstructor
public class ListingController {

    private final ListingService service;

    @GetMapping
    public List<ListingDtos.ListingResponse> all() {
        return service.all();
    }

    @GetMapping("/by-car/{carId}")
    public ListingDtos.ListingResponse getByCarId(@PathVariable("carId") Long carId) {
        return service.getActiveByCarId(carId);
    }

    @GetMapping("/{id}")
    public ListingDtos.ListingResponse get(@PathVariable("id") Long id) {
        return service.get(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ListingDtos.ListingResponse> create(
            @Valid @RequestBody ListingDtos.CreateListingRequest req,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(service.createByEmail(email, req));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ListingDtos.ListingResponse> updateStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody ListingDtos.UpdateListingStatusRequest req
    ) {
        return ResponseEntity.ok(service.updateStatus(id, req));
    }
}