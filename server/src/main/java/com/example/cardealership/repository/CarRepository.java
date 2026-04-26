package com.example.cardealership.repository;

import com.example.cardealership.domain.Car;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface CarRepository extends JpaRepository<Car, Long>, JpaSpecificationExecutor<Car> {
    boolean existsByVin(String vin);

    boolean existsByVinAndIdNot(String vin, Long id);

    Optional<Car> findByIdAndDeletedFalse(Long id);

    List<Car> findAllByDeletedFalse();
}