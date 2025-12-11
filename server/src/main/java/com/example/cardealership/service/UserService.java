package com.example.cardealership.service;

import com.example.cardealership.domain.User;
import com.example.cardealership.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.cardealership.domain.Role;


@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository repo;
    private final PasswordEncoder encoder;

    public User createUser(String email, String rawPassword) {
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
        return repo.findByEmail(email).orElseGet(() -> {

            User newUser = User.builder()
                    .email(email)
                    .passwordHash("GOOGLE_LOGIN")
                    .role(Role.USER)
                    .build();

            return repo.save(newUser);
        });
    }
}
