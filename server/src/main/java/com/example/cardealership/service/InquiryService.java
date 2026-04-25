package com.example.cardealership.service;

import com.example.cardealership.domain.Inquiry;
import com.example.cardealership.domain.Listing;
import com.example.cardealership.dto.InquiryDtos;
import com.example.cardealership.repository.InquiryRepository;
import com.example.cardealership.repository.ListingRepository;
import com.example.cardealership.web.error.BusinessValidationException;
import com.example.cardealership.web.error.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InquiryService {

    private final InquiryRepository inquiryRepo;
    private final ListingRepository listingRepo;
    private final EmailService emailService;

    public InquiryDtos.InquiryResponse create(Long listingId, InquiryDtos.InquiryRequest req) {

        Listing listing = listingRepo.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing", "id", listingId));

        if (listing.getStatus() != Listing.Status.ACTIVE) {
            throw new BusinessValidationException("Cannot send inquiry for inactive listing.");
        }

        Inquiry inquiry = Inquiry.builder()
                .listing(listing)
                .name(req.getName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .message(req.getMessage())
                .build();

        Inquiry saved = inquiryRepo.save(inquiry);

        emailService.sendInquiry(
                listing.getSeller().getEmail(),
                "New inquiry for your listing",
                "You have a new inquiry from " + req.getName() +
                        " (" + req.getEmail() + ", " + req.getPhone() + ")\n\n" +
                        req.getMessage()
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
}