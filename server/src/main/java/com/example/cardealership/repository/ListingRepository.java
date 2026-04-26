package com.example.cardealership.repository;

import com.example.cardealership.domain.Listing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long>, JpaSpecificationExecutor<Listing> {
    List<Listing> findAllByCar_Id(Long carId);

    List<Listing> findAllByStatus(Listing.Status status);

    Optional<Listing> findByIdAndStatus(Long id, Listing.Status status);

    Optional<Listing> findFirstByCar_IdAndStatus(Long carId, Listing.Status status);

    boolean existsByCar_IdAndStatus(Long carId, Listing.Status status);
}