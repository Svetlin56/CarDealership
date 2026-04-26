package com.example.cardealership.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String make;

    @Column(nullable = false)
    private String model;

    private Integer prodYear;

    private Long mileage;

    @Column(nullable = false, unique = true, length = 17)
    private String vin;

    @Column(nullable = false)
    private BigDecimal price;

    private String imageUrl;

    @Column(name = "engine_size", precision = 4, scale = 1)
    private BigDecimal engineSize;

    @Column(name = "fuel_type", length = 50)
    private String fuelType;

    @Column(name = "transmission", length = 50)
    private String transmission;

    private Integer doors;

    @Column(name = "owner_count")
    private Integer ownerCount;

    @Column(nullable = false)
    @Builder.Default
    private boolean deleted = false;
}