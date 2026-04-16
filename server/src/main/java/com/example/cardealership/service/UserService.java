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

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repo;
    private final PasswordEncoder encoder;

    public User createUser(String email, String rawPassword) {
        if (repo.findByEmail(email).isPresent()) {
            throw new EmailAlreadyExistsException(email);
        }

        User user = User.builder()
                .email(email.trim().toLowerCase())
                .passwordHash(encoder.encode(rawPassword))
                .role(Role.USER)
                .authProvider(AuthProvider.LOCAL)
                .build();

        return repo.save(user);
    }

    public User findByEmail(String email) {
        return repo.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    public User findOrCreateGoogleUser(String email) {
        String normalizedEmail = email.trim().toLowerCase();

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
}