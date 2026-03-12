package com.example.cardealership.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.*;
import lombok.*;

public class CarDtos {

    @Getter
    @Setter
    public static class CreateCarRequest {

        @NotBlank(message = "Make is required")
        private String make;

        @NotBlank(message = "Model is required")
        private String model;

        @NotNull(message = "Year is required")
        @Min(value = 1945, message = "Year must be valid")
        private Integer year;

        @NotNull(message = "Mileage is required")
        @Min(value = 0, message = "Mileage cannot be negative")
        private Long mileage;

        @NotBlank(message = "VIN is required")
        @Size(min = 17, max = 17, message = "VIN must be exactly 17 characters")
        @Pattern(
                regexp = "^[A-HJ-NPR-Z0-9]{17}$",
                message = "VIN must contain only capital letters and numbers (excluding I, O, Q)"
        )
        private String vin;

        @Min(value = 0, message = "Price cannot be negative")
        private BigDecimal price;

        private String imageUrl;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class CarResponse {

        private Long id;
        private String make;
        private String model;
        private Integer year;
        private Long mileage;
        private String vin;
        private BigDecimal price;
        private String imageUrl;
    }
}