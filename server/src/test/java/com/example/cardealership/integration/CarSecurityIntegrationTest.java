package com.example.cardealership.integration;

import com.example.cardealership.domain.AuthProvider;
import com.example.cardealership.domain.Role;
import com.example.cardealership.domain.User;
import com.example.cardealership.repository.UserRepository;
import com.example.cardealership.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.http.HttpHeaders.AUTHORIZATION;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CarSecurityIntegrationTest extends AbstractMySqlIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUpUsers() {
        createUserIfMissing("admin@test.com", Role.ADMIN);
        createUserIfMissing("user@test.com", Role.USER);
    }

    private void createUserIfMissing(String email, Role role) {
        if (userRepository.findByEmail(email).isPresent()) {
            return;
        }

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode("secret123"))
                .role(role)
                .authProvider(AuthProvider.LOCAL)
                .build();

        userRepository.save(user);
    }

    @Test
    void createCarShouldReturnUnauthorizedWithoutJwt() throws Exception {
        mockMvc.perform(post("/api/v1/cars")
                        .contentType(APPLICATION_JSON)
                        .content(validPayload()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createCarShouldReturnForbiddenForUserRole() throws Exception {
        String token = jwtService.generateToken("user@test.com", "USER");

        mockMvc.perform(post("/api/v1/cars")
                        .header(AUTHORIZATION, "Bearer " + token)
                        .contentType(APPLICATION_JSON)
                        .content(validPayload()))
                .andExpect(status().isForbidden());
    }

    @Test
    void createCarShouldReturnOkForAdminRole() throws Exception {
        String token = jwtService.generateToken("admin@test.com", "ADMIN");

        mockMvc.perform(post("/api/v1/cars")
                        .header(AUTHORIZATION, "Bearer " + token)
                        .contentType(APPLICATION_JSON)
                        .content(validPayload()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.make").value("BMW"))
                .andExpect(jsonPath("$.model").value("330d"));
    }

    @Test
    void createCarShouldReturnBadRequestForFutureYear() throws Exception {
        String token = jwtService.generateToken("admin@test.com", "ADMIN");

        mockMvc.perform(post("/api/v1/cars")
                        .header(AUTHORIZATION, "Bearer " + token)
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "make":"BMW",
                                  "model":"330d",
                                  "year":3000,
                                  "mileage":120000,
                                  "vin":"WBA8D3C54GK421564",
                                  "price":15000,
                                  "engineSize":3.0,
                                  "fuelType":"Diesel",
                                  "transmission":"Automatic",
                                  "doors":4,
                                  "ownerCount":2
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Production year cannot be in the future."));
    }

    private String validPayload() {
        return """
                {
                  "make":"BMW",
                  "model":"330d",
                  "year":2018,
                  "mileage":120000,
                  "vin":"WBA8D3C54GK421564",
                  "price":15000,
                  "engineSize":3.0,
                  "fuelType":"Diesel",
                  "transmission":"Automatic",
                  "doors":4,
                  "ownerCount":2
                }
                """;
    }
}