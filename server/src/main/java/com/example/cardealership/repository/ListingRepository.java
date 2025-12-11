package com.example.cardealership.repository;

import com.example.cardealership.domain.Listing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long> {
    void deleteByCar_Id(Long carId);
}
