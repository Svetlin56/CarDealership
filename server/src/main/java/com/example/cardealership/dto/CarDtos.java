package com.example.cardealership.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

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

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.0", inclusive = true, message = "Price cannot be negative")
        private BigDecimal price;

        private String imageUrl;
        
        @DecimalMin(value = "0.1", inclusive = true, message = "Engine size must be positive")
        private BigDecimal engineSize;

        private String fuelType;

        private String transmission;

        @Min(value = 2, message = "Doors must be at least 2")
        @Max(value = 6, message = "Doors must be at most 6")
        private Integer doors;

        @Min(value = 0, message = "Owner count cannot be negative")
        private Integer ownerCount;
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

        private BigDecimal engineSize;
        private String fuelType;
        private String transmission;
        private Integer doors;
        private Integer ownerCount;
    }
}