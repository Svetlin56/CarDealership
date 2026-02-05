package com.example.cardealership.dto;

import jakarta.validation.constraints.*;
import lombok.*;

public class AuthDtos {

    @Getter
    @Setter
    public static class RegisterRequest {
        @NotBlank(message = "Email field can't be empty!")
        @Email(message = "Must be a well-formed email address!")
        private String email;

        @NotBlank(message = "Password field can't be empty!")
        @Size(min = 6, message = "Password must be at least 6 symbols!")
        private String password;
    }

    @Getter
    @Setter
    public static class LoginRequest {
        @NotBlank(message = "Email field can't be empty!")
        @Email(message = "Must be a well-formed email address!")
        private String email;

        @NotBlank(message = "Password field can't be empty!")
        private String password;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class AuthResponse {
        private String token;
        private String email;
        private String role;
        private String picture;
    }
}
