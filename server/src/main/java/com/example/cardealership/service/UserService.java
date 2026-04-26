package com.example.cardealership.service;

import com.example.cardealership.domain.AuthProvider;
import com.example.cardealership.domain.Role;
import com.example.cardealership.domain.User;
import com.example.cardealership.repository.UserRepository;
import com.example.cardealership.web.error.EmailAlreadyExistsException;
import com.example.cardealership.web.error.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repo;
    private final PasswordEncoder encoder;

    public User createUser(String email, String rawPassword) {
        String normalizedEmail = normalizeEmail(email);

        if (repo.findByEmail(normalizedEmail).isPresent()) {
            throw new EmailAlreadyExistsException(normalizedEmail);
        }

        User user = User.builder()
                .email(normalizedEmail)
                .passwordHash(encoder.encode(rawPassword))
                .role(Role.USER)
                .authProvider(AuthProvider.LOCAL)
                .build();

        return repo.save(user);
    }

    public User findByEmail(String email) {
        String normalizedEmail = normalizeEmail(email);

        return repo.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", normalizedEmail));
    }

    public User findOrCreateGoogleUser(String email) {
        String normalizedEmail = normalizeEmail(email);

        return repo.findByEmail(normalizedEmail)
                .orElseGet(() -> repo.save(
                        User.builder()
                                .email(normalizedEmail)
                                .passwordHash(null)
                                .role(Role.USER)
                                .authProvider(AuthProvider.GOOGLE)
                                .build()
                ));
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }
}