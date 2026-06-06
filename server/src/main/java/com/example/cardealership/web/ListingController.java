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
    public List<ListingDtos.ListingResponse> all(Authentication authentication) {
        return service.all(authentication);
    }

    @GetMapping("/by-car/{carId}")
    public ListingDtos.ListingResponse getByCarId(
            @PathVariable("carId") Long carId,
            Authentication authentication
    ) {
        return service.getActiveByCarId(carId, authentication);
    }

    @GetMapping("/{id}")
    public ListingDtos.ListingResponse get(
            @PathVariable("id") Long id,
            Authentication authentication
    ) {
        return service.get(id, authentication);
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