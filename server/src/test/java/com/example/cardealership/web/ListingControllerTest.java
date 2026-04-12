package com.example.cardealership.web;

import com.example.cardealership.config.CorsProperties;
import com.example.cardealership.config.SecurityConfig;
import com.example.cardealership.dto.CarDtos;
import com.example.cardealership.dto.ListingDtos;
import com.example.cardealership.security.GoogleSuccessHandler;
import com.example.cardealership.security.JwtAuthFilter;
import com.example.cardealership.service.ListingService;
import com.example.cardealership.web.error.GlobalExceptionHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
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
import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ListingController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class ListingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ListingService listingService;

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
    void setUp() throws Exception {
        when(corsProperties.getAllowedOrigins()).thenReturn(List.of("http://localhost:5173"));
        when(userDetailsService.loadUserByUsername(any())).thenReturn(
                User.withUsername("admin@test.com").password("password").roles("ADMIN").build()
        );

        doAnswer(invocation -> {
            FilterChain chain = invocation.getArgument(2);
            chain.doFilter(
                    (ServletRequest) invocation.getArgument(0),
                    (ServletResponse) invocation.getArgument(1)
            );
            return null;
        }).when(jwtAuthFilter).doFilter(any(), any(), any());
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void adminShouldCreateListingUsingAuthenticatedEmail() throws Exception {
        ListingDtos.ListingResponse response = ListingDtos.ListingResponse.builder()
                .id(12L)
                .description("Perfect family car")
                .status("ACTIVE")
                .createdAt(Instant.parse("2026-01-01T10:15:30Z"))
                .car(CarDtos.CarResponse.builder()
                        .id(3L)
                        .make("Audi")
                        .model("A4")
                        .year(2019)
                        .price(new BigDecimal("21999"))
                        .build())
                .seller(ListingDtos.SellerSummary.builder()
                        .id(7L)
                        .email("admin@test.com")
                        .build())
                .build();

        when(listingService.createByEmail(eq("admin@test.com"), any(ListingDtos.CreateListingRequest.class)))
                .thenReturn(response);

        ListingDtos.CreateListingRequest request = new ListingDtos.CreateListingRequest();
        request.setCarId(3L);
        request.setDescription("Perfect family car");

        mockMvc.perform(post("/api/v1/listings")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(APPLICATION_JSON))
                .andExpect(jsonPath("$.seller.email").value("admin@test.com"))
                .andExpect(jsonPath("$.car.make").value("Audi"));
    }

    @Test
    @WithMockUser(username = "user@test.com", roles = "USER")
    void nonAdminShouldNotCreateListing() throws Exception {
        String payload = """
                {
                  "carId": 3,
                  "description": "Perfect family car"
                }
                """;

        mockMvc.perform(post("/api/v1/listings")
                        .contentType(APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void adminShouldUpdateListingStatus() throws Exception {
        ListingDtos.ListingResponse response = ListingDtos.ListingResponse.builder()
                .id(12L)
                .description("Perfect family car")
                .status("SOLD")
                .car(CarDtos.CarResponse.builder()
                        .id(3L)
                        .make("Audi")
                        .model("A4")
                        .year(2019)
                        .price(new BigDecimal("21999"))
                        .build())
                .seller(ListingDtos.SellerSummary.builder()
                        .id(7L)
                        .email("admin@test.com")
                        .build())
                .build();

        when(listingService.updateStatus(eq(12L), any(ListingDtos.UpdateListingStatusRequest.class)))
                .thenReturn(response);

        mockMvc.perform(patch("/api/v1/listings/12/status")
                        .contentType(APPLICATION_JSON)
                        .content("{\"status\":\"sold\"}"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value("SOLD"));
    }
}