package com.example.cardealership.web;

import com.example.cardealership.config.CorsProperties;
import com.example.cardealership.config.SecurityConfig;
import com.example.cardealership.dto.CarDtos;
import com.example.cardealership.security.GoogleSuccessHandler;
import com.example.cardealership.security.JwtAuthFilter;
import com.example.cardealership.service.CarService;
import com.example.cardealership.web.error.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CarController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class CarControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CarService carService;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private GoogleSuccessHandler googleSuccessHandler;

    @MockBean
    private CorsProperties corsProperties;

    @MockBean
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @BeforeEach
    void setUp() {
        when(corsProperties.getAllowedOrigins()).thenReturn(List.of("http://localhost:5173"));
        when(userDetailsService.loadUserByUsername(any())).thenReturn(
                User.withUsername("admin@test.com").password("password").roles("ADMIN").build()
        );
    }

    @Test
    void unauthenticatedRequestShouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/cars"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "user@test.com", roles = "USER")
    void authenticatedUserShouldAccessCars() throws Exception {
        CarDtos.CarPageResponse response = CarDtos.CarPageResponse.builder()
                .content(List.of(CarDtos.CarResponse.builder()
                        .id(1L)
                        .make("BMW")
                        .model("320d")
                        .year(2020)
                        .price(new BigDecimal("24500"))
                        .build()))
                .page(0)
                .size(9)
                .totalElements(1)
                .totalPages(1)
                .first(true)
                .last(true)
                .sortBy("id")
                .sortDir("desc")
                .build();

        when(carService.findAll(any(CarDtos.CarSearchRequest.class))).thenReturn(response);

        mockMvc.perform(get("/api/v1/cars"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].make").value("BMW"));
    }

    @Test
    @WithMockUser(username = "user@test.com", roles = "USER")
    void nonAdminShouldNotCreateCars() throws Exception {
        String payload = """
                {
                  "make": "BMW",
                  "model": "320d",
                  "year": 2020,
                  "mileage": 120000,
                  "vin": "WBA12345678901234",
                  "price": 24500
                }
                """;

        mockMvc.perform(post("/api/v1/cars")
                        .contentType(APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void adminShouldCreateCars() throws Exception {
        CarDtos.CarResponse response = CarDtos.CarResponse.builder()
                .id(1L)
                .make("BMW")
                .model("320d")
                .year(2020)
                .price(new BigDecimal("24500"))
                .build();

        when(carService.create(any(CarDtos.CreateCarRequest.class))).thenReturn(response);

        String payload = """
                {
                  "make": "BMW",
                  "model": "320d",
                  "year": 2020,
                  "mileage": 120000,
                  "vin": "WBA12345678901234",
                  "price": 24500
                }
                """;

        mockMvc.perform(post("/api/v1/cars")
                        .contentType(APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.make").value("BMW"));
    }
}