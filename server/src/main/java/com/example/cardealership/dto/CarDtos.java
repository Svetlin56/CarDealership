package com.example.cardealership.dto;

import jakarta.validation.constraints.*;
import lombok.*;

public class CarDtos {
    @Getter @Setter
    public static class CreateCarRequest {
        @NotBlank private String make;
        @NotBlank private String model;
        @Min(1900) @Max(2026) private Integer year;
        @Min(0) private Long mileage;
        private String vin;
        @NotNull @Positive private Double price;
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
