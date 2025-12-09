package com.example.cardealership.web;

import com.example.cardealership.domain.User;
import com.example.cardealership.dto.AuthDtos.*;
import com.example.cardealership.security.JwtService;
import com.example.cardealership.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req){
        User u = userService.createUser(req.getEmail(), req.getPassword());
        String token = jwtService.generateToken(u.getEmail(), u.getRole().name());
        return ResponseEntity.ok(new AuthResponse(token, u.getEmail(), u.getRole().name(), null));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req){
        Authentication auth = new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword());
        authManager.authenticate(auth);
        User u = userService.findByEmail(req.getEmail());
        String token = jwtService.generateToken(u.getEmail(), u.getRole().name());
        return ResponseEntity.ok(new AuthResponse(token, u.getEmail(), u.getRole().name(), null));
    }
}
