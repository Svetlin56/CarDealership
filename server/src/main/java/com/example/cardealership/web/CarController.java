package com.example.cardealership.web;

import com.example.cardealership.dto.CarDtos;
import com.example.cardealership.service.CarService;
import com.example.cardealership.service.FileStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/cars")
@RequiredArgsConstructor
public class CarController {

    private final CarService service;
    private final FileStorageService fileStorageService;

    @GetMapping
    public CarDtos.CarPageResponse all(CarDtos.CarSearchRequest request) {
        return service.findAll(request);
    }

    @GetMapping("/{id}")
    public CarDtos.CarResponse get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CarDtos.CarResponse> create(
            @Valid @RequestBody CarDtos.CreateCarRequest request
    ) {
        return ResponseEntity.ok(service.create(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadImage(@RequestPart("file") MultipartFile file) {
        String imageUrl = fileStorageService.storeCarImage(file);
        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}