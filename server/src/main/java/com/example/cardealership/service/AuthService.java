package com.example.cardealership.service;

import com.example.cardealership.domain.User;
import com.example.cardealership.dto.AuthDtos.AuthResponse;
import com.example.cardealership.dto.AuthDtos.LoginRequest;
import com.example.cardealership.dto.AuthDtos.RegisterRequest;
import com.example.cardealership.security.AuthCookieService;
import com.example.cardealership.security.JwtService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final UserService userService;
    private final EmailService emailService;
    private final AuthCookieService authCookieService;

    public AuthResponse register(RegisterRequest request, HttpServletResponse response) {
        User user = userService.createUser(request.getEmail(), request.getPassword());

        sendRegistrationEmail(user);

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        authCookieService.writeAuthCookie(response, token);

        return mapToAuthResponse(token, user);
    }

    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                request.getEmail(),
                request.getPassword()
        );

        authManager.authenticate(authentication);

        User user = userService.findByEmail(request.getEmail());
        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        authCookieService.writeAuthCookie(response, token);

        return mapToAuthResponse(token, user);
    }

    public void logout(HttpServletResponse response) {
        authCookieService.clearAuthCookie(response);
    }

    public AuthResponse getCurrentUser(Authentication authentication) {
        String email = resolveAuthenticatedEmail(authentication);
        User user = userService.findByEmail(email);

        return mapToAuthResponse(null, user);
    }

    private void sendRegistrationEmail(User user) {
        try {
            emailService.sendRegistrationEmail(user.getEmail());
            log.info("Registration email sent to {}", user.getEmail());
        } catch (Exception e) {
            log.warn("Could not send registration email to {}", user.getEmail(), e);
        }
    }

    private String resolveAuthenticatedEmail(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadCredentialsException("Unauthenticated user.");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }

        if (principal instanceof OAuth2User oauth2User) {
            String email = oauth2User.getAttribute("email");

            if (email != null && !email.isBlank()) {
                return email;
            }
        }

        String authenticationName = authentication.getName();

        if (authenticationName != null && authenticationName.contains("@")) {
            return authenticationName;
        }

        throw new BadCredentialsException("Authenticated user email could not be resolved.");
    }

    private AuthResponse mapToAuthResponse(String token, User user) {
        return new AuthResponse(
                token,
                user.getEmail(),
                user.getRole().name(),
                null
        );
    }
}