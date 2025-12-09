package com.example.cardealership.dto;

import jakarta.validation.constraints.*;
import lombok.*;

public class AuthDtos {

    @Getter
    @Setter
    public static class RegisterRequest {
        @Email @NotBlank private String email;
        @Size(min=6, max=100) @NotBlank private String password;
    }

    @Getter
    @Setter
    public static class LoginRequest {
        @Email @NotBlank private String email;
        @NotBlank private String password;
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
