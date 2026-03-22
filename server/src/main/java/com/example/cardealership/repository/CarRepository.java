package com.example.cardealership.repository;

import com.example.cardealership.domain.Car;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CarRepository extends JpaRepository<Car, Long> {
    boolean existsByVin(String vin);
}