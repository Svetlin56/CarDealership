package com.example.cardealership.dto;

import com.example.cardealership.domain.Listing;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.Instant;
import java.util.List;

public class ListingDtos {

    @Getter
    @Setter
    public static class CreateListingRequest {

        @NotNull
        private Long carId;

        @Size(max = 2000)
        private String description;
    }

    @Getter
    @Setter
    public static class UpdateListingStatusRequest {

        @NotBlank
        private String status;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ListingResponse {

        private Long id;
        private String description;
        private String status;
        private Instant createdAt;
        private CarDtos.CarResponse car;
        private SellerSummary seller;

        public static ListingResponse from(Listing listing) {
            return ListingResponse.builder()
                    .id(listing.getId())
                    .description(listing.getDescription())
                    .status(listing.getStatus().name())
                    .createdAt(listing.getCreatedAt())
                    .car(CarDtos.CarResponse.from(listing.getCar()))
                    .seller(SellerSummary.from(listing))
                    .build();
        }

        public static List<ListingResponse> fromList(List<Listing> listings) {
            return listings.stream()
                    .map(ListingResponse::from)
                    .toList();
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SellerSummary {

        private Long id;
        private String email;

        public static SellerSummary from(Listing listing) {
            return SellerSummary.builder()
                    .id(listing.getSeller().getId())
                    .email(listing.getSeller().getEmail())
                    .build();
        }
    }
}