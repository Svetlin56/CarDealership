package com.example.cardealership.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.Instant;

public class InquiryDtos {

    @Getter
    @Setter
    public static class InquiryRequest {

        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 80, message = "Name must be between 2 and 80 characters")
        @Pattern(
                regexp = "^\\s*[\\p{L}]+(?:[ '\\-][\\p{L}]+)*\\s*$",
                message = "Name must contain only letters, spaces, - or '"
        )
        private String name;

        @Email(message = "Email must be valid")
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "Phone is required")
        @Size(max = 64, message = "Phone must contain between 7 and 15 digits and may include spaces, + or -")
        @Pattern(
                regexp = "^\\s*(?=(?:\\D*\\d){7,15}\\D*$)\\+?[0-9][0-9\\- ]*\\s*$",
                message = "Phone must contain between 7 and 15 digits and may include spaces, + or -"
        )
        private String phone;

        @Size(max = 2000, message = "Message must be up to 2000 characters")
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

    @Getter
    @AllArgsConstructor
    public static class AdminInquiryResponse {

        private Long id;
        private Long listingId;
        private String carTitle;
        private String name;
        private String email;
        private String phone;
        private String message;
        private Instant createdAt;
    }
}