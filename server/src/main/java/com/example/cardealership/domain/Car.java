package com.example.cardealership.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Car {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false) private String make;
    @Column(nullable=false) private String model;
    private Integer prodYear;
    private Long mileage;
    private String vin;

    @Column(nullable=false) private Double price;
    private String imageUrl;
}
