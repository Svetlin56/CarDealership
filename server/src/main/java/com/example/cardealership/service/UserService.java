package com.example.cardealership.service;

import com.example.cardealership.domain.Role;
import com.example.cardealership.domain.User;
import com.example.cardealership.repository.UserRepository;
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
            throw new IllegalArgumentException("Email already exists");
        }

        User user = User.builder()
                .email(email)
                .passwordHash(encoder.encode(rawPassword))
                .role(Role.USER)
                .build();

        return repo.save(user);
    }

    public User findByEmail(String email) {
        return repo.findByEmail(email).orElseThrow();
    }

    public User findOrCreateGoogleUser(String email) {
        return repo.findByEmail(email)
                .map(existingUser -> {
                    if (existingUser.getRole() != Role.USER) {
                        existingUser.setRole(Role.USER);
                        return repo.save(existingUser);
                    }

                    return existingUser;
                })
                .orElseGet(() -> {

                    User user = User.builder()
                            .email(email)
                            .passwordHash("GOOGLE_AUTHORISATION")
                            .role(Role.USER)
                            .build();

                    return repo.save(user);
                });
    }
}