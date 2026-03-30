package com.example.cardealership.dto;

import jakarta.validation.constraints.*;
import lombok.*;

public class InquiryDtos {

    @Getter
    @Setter
    public static class InquiryRequest {

        @NotBlank(message = "Name is required")
        private String name;

        @Email(message = "Email must be valid")
        @NotBlank(message = "Email is required")
        private String email;

        @Pattern(
                regexp="^[+0-9\\- ]{6,20}$",
                message = "Phone must contain only digits, spaces, + or -"
        )
        @NotBlank(message = "Phone is required")
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
}