package com.example.cardealership.web;

import com.example.cardealership.config.CorsProperties;
import com.example.cardealership.config.SecurityConfig;
import com.example.cardealership.dto.AuthDtos.AuthResponse;
import com.example.cardealership.dto.AuthDtos.LoginRequest;
import com.example.cardealership.dto.AuthDtos.RegisterRequest;
import com.example.cardealership.security.GoogleSuccessHandler;
import com.example.cardealership.security.JwtAuthFilter;
import com.example.cardealership.service.AuthService;
import com.example.cardealership.web.error.ApiErrorFactory;
import com.example.cardealership.web.error.GlobalExceptionHandler;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class, ApiErrorFactory.class})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

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
    void registerShouldCreateUserAndReturnJwt() throws Exception {
        when(authService.register(any(RegisterRequest.class), any(HttpServletResponse.class)))
                .thenReturn(new AuthResponse("jwt-token", "user@test.com", "USER", null));

        mockMvc.perform(post("/api/v1/auth/register")
                        .with(csrf())
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "email":"user@test.com",
                                  "password":"secret123"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(APPLICATION_JSON))
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.email").value("user@test.com"))
                .andExpect(jsonPath("$.role").value("USER"));

        verify(authService).register(any(RegisterRequest.class), any(HttpServletResponse.class));
    }

    @Test
    void loginShouldAuthenticateAndReturnJwt() throws Exception {
        when(authService.login(any(LoginRequest.class), any(HttpServletResponse.class)))
                .thenReturn(new AuthResponse("admin-token", "admin@test.com", "ADMIN", null));

        mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "email":"admin@test.com",
                                  "password":"secret123"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(APPLICATION_JSON))
                .andExpect(jsonPath("$.token").value("admin-token"))
                .andExpect(jsonPath("$.email").value("admin@test.com"))
                .andExpect(jsonPath("$.role").value("ADMIN"));

        verify(authService).login(any(LoginRequest.class), any(HttpServletResponse.class));
    }

    @Test
    void loginShouldReturnUnauthorizedWhenCredentialsInvalid() throws Exception {
        when(authService.login(any(LoginRequest.class), any(HttpServletResponse.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "email":"admin@test.com",
                                  "password":"wrong"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentTypeCompatibleWith(APPLICATION_JSON))
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void registerShouldReturnValidationErrorsForInvalidPayload() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .with(csrf())
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "email":"",
                                  "password":"123"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(APPLICATION_JSON))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors.email").exists())
                .andExpect(jsonPath("$.fieldErrors.password").exists());
    }

    @Test
    void meShouldReturnCurrentAuthenticatedUser() throws Exception {
        when(authService.getCurrentUser(any(Authentication.class)))
                .thenReturn(new AuthResponse(null, "user@test.com", "USER", null));

        mockMvc.perform(get("/api/v1/auth/me")
                        .with(user("user@test.com").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(APPLICATION_JSON))
                .andExpect(jsonPath("$.token").doesNotExist())
                .andExpect(jsonPath("$.email").value("user@test.com"))
                .andExpect(jsonPath("$.role").value("USER"));

        verify(authService).getCurrentUser(any(Authentication.class));
    }
}