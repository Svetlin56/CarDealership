package com.example.cardealership.dto;

import jakarta.validation.constraints.*;
import lombok.*;

public class ListingDtos {
    @Getter @Setter
    public static class CreateListingRequest {
        @NotNull private Long carId;
        @Size(max=2000) private String description;
    }

    @Getter @Setter
    public static class UpdateListingStatusRequest {
        @NotBlank private String status; // ACTIVE/SOLD/HIDDEN
    }
}
