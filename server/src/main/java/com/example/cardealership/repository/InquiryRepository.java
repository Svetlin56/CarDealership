package com.example.cardealership.repository;

import com.example.cardealership.domain.Inquiry;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {

    @EntityGraph(attributePaths = {"listing", "listing.car"})
    List<Inquiry> findAllBy(Sort sort);

    @EntityGraph(attributePaths = {"listing", "listing.car"})
    List<Inquiry> findByEmailIgnoreCaseOrderByCreatedAtDesc(String email);

    @Override
    @EntityGraph(attributePaths = {"listing", "listing.car"})
    Optional<Inquiry> findById(Long id);
}