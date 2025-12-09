package com.example.cardealership.web;

import com.example.cardealership.domain.Inquiry;
import com.example.cardealership.domain.Listing;
import com.example.cardealership.repo.InquiryRepository;
import com.example.cardealership.repo.ListingRepository;
import com.example.cardealership.service.EmailService;
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

    @PostMapping
    public ResponseEntity<Inquiry> create(@RequestBody @jakarta.validation.Valid InquiryRequest req){
        Listing l = listingRepo.findById(req.getListingId()).orElseThrow();
        Inquiry inq = Inquiry.builder()
                .listing(l)
                .name(req.getName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .message(req.getMessage())
                .build();
        Inquiry saved = inquiryRepo.save(inq);

        emailService.sendInquiry(
                "seller@example.com",
                "New list request #" + l.getId(),
                "from: " + req.getName() + "\nEmail: " + req.getEmail() + "\nTelephone: " + req.getPhone() +
                        "\n\nMessage:\n" + (req.getMessage()==null?"(empty)":req.getMessage()));

        return ResponseEntity.ok(saved);
    }
}
