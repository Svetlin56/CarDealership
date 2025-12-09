package com.example.cardealership.web;

import com.example.cardealership.domain.Listing;
import com.example.cardealership.dto.ListingDtos;
import com.example.cardealership.service.ListingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/listings")
@RequiredArgsConstructor
public class ListingController {
    private final ListingService service;

    @GetMapping public List<Listing> all(){ return service.all(); }
    @GetMapping("/{id}") public Listing get(@PathVariable Long id){ return service.get(id); }

    @PostMapping
    public ResponseEntity<Listing> create(Authentication auth, @Valid @RequestBody ListingDtos.CreateListingRequest req){
        Long sellerId = 1L;
        return ResponseEntity.ok(service.create(sellerId, req));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Listing> updateStatus(@PathVariable Long id, @Valid @RequestBody ListingDtos.UpdateListingStatusRequest req){
        return ResponseEntity.ok(service.updateStatus(id, req));
    }
}
