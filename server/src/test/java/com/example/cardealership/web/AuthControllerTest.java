package com.example.cardealership.web;

import com.example.cardealership.config.CorsProperties;
import com.example.cardealership.config.SecurityConfig;
import com.example.cardealership.domain.Role;
import com.example.cardealership.domain.User;
import com.example.cardealership.security.GoogleSuccessHandler;
import com.example.cardealership.security.JwtAuthFilter;
import com.example.cardealership.security.JwtService;
import com.example.cardealership.service.EmailService;
import com.example.cardealership.service.UserService;
import com.example.cardealership.web.error.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthenticationManager authManager;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserService userService;

    @MockBean
    private EmailService emailService;

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
    }

    @Test
    void registerShouldCreateUserAndReturnJwt() throws Exception {
        User user = User.builder()
                .id(1L)
                .email("user@test.com")
                .role(Role.USER)
                .passwordHash("encoded")
                .build();

        when(userService.createUser("user@test.com", "secret123")).thenReturn(user);
        when(jwtService.generateToken("user@test.com", "USER")).thenReturn("jwt-token");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(APPLICATION_JSON)
                        .content("{\"email\":\"user@test.com\",\"password\":\"secret123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.email").value("user@test.com"))
                .andExpect(jsonPath("$.role").value("USER"));

        verify(emailService).sendRegistrationEmail("user@test.com");
    }

    @Test
    void loginShouldAuthenticateAndReturnJwt() throws Exception {
        User user = User.builder()
                .id(1L)
                .email("admin@test.com")
                .role(Role.ADMIN)
                .passwordHash("encoded")
                .build();

        when(userService.findByEmail("admin@test.com")).thenReturn(user);
        when(jwtService.generateToken("admin@test.com", "ADMIN")).thenReturn("admin-token");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content("{\"email\":\"admin@test.com\",\"password\":\"secret123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("admin-token"))
                .andExpect(jsonPath("$.role").value("ADMIN"));

        verify(authManager).authenticate(any());
    }

    @Test
    void loginShouldReturnUnauthorizedWhenCredentialsInvalid() throws Exception {
        doThrow(new BadCredentialsException("Bad credentials"))
                .when(authManager).authenticate(any());

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content("{\"email\":\"admin@test.com\",\"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void registerShouldReturnValidationErrorsForInvalidPayload() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(APPLICATION_JSON)
                        .content("{\"email\":\"\",\"password\":\"123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors.email").exists())
                .andExpect(jsonPath("$.fieldErrors.password").exists());
    }
}