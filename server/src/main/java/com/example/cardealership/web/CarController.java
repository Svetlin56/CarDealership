package com.example.cardealership.web;

import com.example.cardealership.dto.CarDtos;
import com.example.cardealership.service.CarService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cars")
@RequiredArgsConstructor
public class CarController {

    private final CarService service;

    @GetMapping
    public CarDtos.CarPageResponse all(CarDtos.CarSearchRequest request) {
        return service.findAll(request);
    }

    @GetMapping("/{id}")
    public CarDtos.CarResponse get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<CarDtos.CarResponse> create(
            @Valid @RequestBody CarDtos.CreateCarRequest request
    ) {
        return ResponseEntity.ok(service.create(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}