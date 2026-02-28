package com.example.cardealership.web;

import com.example.cardealership.domain.Inquiry;
import com.example.cardealership.domain.Listing;
import com.example.cardealership.repository.InquiryRepository;
import com.example.cardealership.repository.ListingRepository;
import com.example.cardealership.service.EmailService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/inquiries")
@RequiredArgsConstructor
public class InquiryController {
    private final InquiryRepository inquiryRepo;
    private final ListingRepository listingRepo;
    private final EmailService emailService;

    @Getter @Setter
    public static class InquiryRequest {
        @NotNull private Long listingId;
        @NotBlank private String name;
        @Email @NotBlank private String email;
        @Pattern(regexp="^[+0-9\\- ]{6,20}$") @NotBlank private String phone;
        @Size(max=2000) private String message;
    }
    @PostMapping("/{listingId}")
    public ResponseEntity<Inquiry> create(
            @PathVariable Long listingId,
            @Valid @RequestBody InquiryRequest req
    ) {

        Listing l = listingRepo.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));

        if (l.getStatus() != Listing.Status.ACTIVE) {
            throw new IllegalStateException("Cannot send inquiry for inactive listing");
        }

        Inquiry inquiry = Inquiry.builder()
                .listing(l)
                .name(req.getName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .message(req.getMessage())
                .build();

        Inquiry saved = inquiryRepo.save(inquiry);

        String sellerEmail = l.getSeller().getEmail();

        emailService.sendInquiry(
                sellerEmail,
                "New inquiry for your listing",
                "You have a new inquiry from " + req.getName() +
                        " (" + req.getEmail() + ", " + req.getPhone() + ")\n\n" +
                        req.getMessage()
        );

        return ResponseEntity.ok(saved);
    }
}
