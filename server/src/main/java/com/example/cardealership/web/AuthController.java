package com.example.cardealership.web;

import com.example.cardealership.domain.User;
import com.example.cardealership.dto.AuthDtos.*;
import com.example.cardealership.security.AuthCookieService;
import com.example.cardealership.security.JwtService;
import com.example.cardealership.service.EmailService;
import com.example.cardealership.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final UserService userService;
    private final EmailService emailService;
    private final AuthCookieService authCookieService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest req,
            HttpServletResponse response
    ) {
        User u = userService.createUser(req.getEmail(), req.getPassword());

        try {
            emailService.sendRegistrationEmail(u.getEmail());
        } catch (Exception e) {
            log.warn("Could not send registration email to {}", u.getEmail(), e);
        }

        String token = jwtService.generateToken(u.getEmail(), u.getRole().name());
        authCookieService.writeAuthCookie(response, token);

        return ResponseEntity.ok(new AuthResponse(token, u.getEmail(), u.getRole().name(), null));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest req,
            HttpServletResponse response
    ) {
        Authentication auth = new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword());
        authManager.authenticate(auth);

        User u = userService.findByEmail(req.getEmail());
        String token = jwtService.generateToken(u.getEmail(), u.getRole().name());
        authCookieService.writeAuthCookie(response, token);

        return ResponseEntity.ok(new AuthResponse(token, u.getEmail(), u.getRole().name(), null));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        authCookieService.clearAuthCookie(response);
        return ResponseEntity.ok().build();
    }
}