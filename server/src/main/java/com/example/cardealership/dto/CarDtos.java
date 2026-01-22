package com.example.cardealership.dto;
import java.math.BigDecimal;

import jakarta.validation.constraints.*;
import lombok.*;

public class CarDtos {
    @Getter @Setter
    public static class CreateCarRequest {
        @NotBlank private String make;
        @NotBlank private String model;
        @NotNull
        @Min(value = 1886, message = "Year must be valid")
        private Integer year;
        @NotNull
        @Min(value = 0, message = "Mileage cannot be negative")
        private Long mileage;
        private String vin;
        @Min(value = 0, message = "Price cannot be negative")
        private BigDecimal price;
        private String imageUrl;
    }

    @Getter @Setter @AllArgsConstructor
    public static class CarResponse {
        private Long id;
        private String make;
        private String model;
        private Integer year;
        private Long mileage;
        private String vin;
        private Double price;
        private String imageUrl;
    }
}
