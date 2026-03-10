package com.example.cardealership.dto;

import jakarta.validation.constraints.*;
import lombok.*;

public class InquiryDtos {

    @Getter
    @Setter
    public static class InquiryRequest {

        @NotNull
        private Long listingId;

        @NotBlank
        private String name;

        @Email
        @NotBlank
        private String email;

        @Pattern(regexp="^[+0-9\\- ]{6,20}$")
        @NotBlank
        private String phone;

        @Size(max = 2000)
        private String message;
    }

    @Getter
    @AllArgsConstructor
    public static class InquiryResponse {

        private Long id;
        private Long listingId;
        private String name;
        private String email;
        private String phone;
        private String message;
    }
}