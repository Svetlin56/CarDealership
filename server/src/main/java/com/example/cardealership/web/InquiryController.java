package com.example.cardealership.web;

import com.example.cardealership.dto.InquiryDtos;
import com.example.cardealership.service.InquiryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inquiries")
@RequiredArgsConstructor
public class InquiryController {

    private final InquiryService inquiryService;

    @PostMapping("/{listingId}")
    public ResponseEntity<InquiryDtos.InquiryResponse> create(
            @PathVariable Long listingId,
            @Valid @RequestBody InquiryDtos.InquiryRequest req) {

        return ResponseEntity.ok(
                inquiryService.create(listingId, req)
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<InquiryDtos.AdminInquiryResponse> all() {
        return inquiryService.findAllForAdmin();
    }
}