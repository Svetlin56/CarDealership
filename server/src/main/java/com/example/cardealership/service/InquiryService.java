package com.example.cardealership.service;

import com.example.cardealership.domain.Inquiry;
import com.example.cardealership.domain.Listing;
import com.example.cardealership.dto.InquiryDtos;
import com.example.cardealership.repository.InquiryRepository;
import com.example.cardealership.repository.ListingRepository;
import com.example.cardealership.web.error.BusinessValidationException;
import com.example.cardealership.web.error.ResourceNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class InquiryService {

    private final InquiryRepository inquiryRepo;
    private final ListingRepository listingRepo;
    private final EmailService emailService;

    @Transactional
    public InquiryDtos.InquiryResponse create(Long listingId, InquiryDtos.InquiryRequest req) {
        Listing listing = listingRepo.findByIdAndStatus(listingId, Listing.Status.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Listing", "id", listingId));

        if (listing.getCar().isDeleted()) {
            throw new BusinessValidationException("Cannot send inquiry for a deleted car.");
        }

        Inquiry inquiry = Inquiry.builder()
                .listing(listing)
                .name(normalizeRequired(req.getName()))
                .email(normalizeEmail(req.getEmail()))
                .phone(normalizeRequired(req.getPhone()))
                .message(normalizeOptional(req.getMessage()))
                .build();

        Inquiry saved = inquiryRepo.save(inquiry);

        emailService.sendInquiry(
                listing.getSeller().getEmail(),
                "New inquiry for your listing",
                "You have a new inquiry from " + saved.getName() +
                        " (" + saved.getEmail() + ", " + saved.getPhone() + ")\n\n" +
                        (saved.getMessage() == null ? "" : saved.getMessage())
        );

        return new InquiryDtos.InquiryResponse(
                saved.getId(),
                saved.getListing().getId(),
                saved.getName(),
                saved.getEmail(),
                saved.getPhone(),
                saved.getMessage()
        );
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeRequired(String value) {
        return value == null ? null : value.trim();
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}