package com.example.cardealership.service;

import com.example.cardealership.domain.Role;
import com.example.cardealership.domain.User;
import com.example.cardealership.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.NoSuchElementException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository repo;

    @Mock
    private PasswordEncoder encoder;

    @InjectMocks
    private UserService userService;

    private User regularUser;

    @BeforeEach
    void setUp() {
        regularUser = User.builder()
                .id(1L)
                .email("user@test.com")
                .passwordHash("encoded-password")
                .role(Role.USER)
                .build();
    }

    @Test
    void createUserShouldThrowWhenEmailAlreadyExists() {
        when(repo.findByEmail("user@test.com")).thenReturn(Optional.of(regularUser));

        assertThatThrownBy(() -> userService.createUser("user@test.com", "secret123"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Email already exists");

        verify(repo, never()).save(any(User.class));
    }

    @Test
    void createUserShouldEncodePasswordAndSave() {
        when(repo.findByEmail("new@test.com")).thenReturn(Optional.empty());
        when(encoder.encode("secret123")).thenReturn("encoded-secret");
        when(repo.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User saved = userService.createUser("new@test.com", "secret123");

        assertThat(saved.getEmail()).isEqualTo("new@test.com");
        assertThat(saved.getPasswordHash()).isEqualTo("encoded-secret");
        assertThat(saved.getRole()).isEqualTo(Role.USER);
    }

    @Test
    void findByEmailShouldReturnUserWhenPresent() {
        when(repo.findByEmail("user@test.com")).thenReturn(Optional.of(regularUser));

        User found = userService.findByEmail("user@test.com");

        assertThat(found).isSameAs(regularUser);
    }

    @Test
    void findByEmailShouldThrowWhenMissing() {
        when(repo.findByEmail("missing@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.findByEmail("missing@test.com"))
                .isInstanceOf(NoSuchElementException.class);
    }

    @Test
    void findOrCreateGoogleUserShouldPromoteExistingUserToUserRoleWhenNeeded() {
        User adminUser = User.builder()
                .id(2L)
                .email("admin@test.com")
                .passwordHash("hash")
                .role(Role.ADMIN)
                .build();

        when(repo.findByEmail("admin@test.com")).thenReturn(Optional.of(adminUser));
        when(repo.save(adminUser)).thenReturn(adminUser);

        User result = userService.findOrCreateGoogleUser("admin@test.com");

        assertThat(result.getRole()).isEqualTo(Role.USER);
        verify(repo).save(adminUser);
    }

    @Test
    void findOrCreateGoogleUserShouldCreateNewUserWhenMissing() {
        when(repo.findByEmail("google@test.com")).thenReturn(Optional.empty());
        when(repo.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User result = userService.findOrCreateGoogleUser("google@test.com");

        assertThat(result.getEmail()).isEqualTo("google@test.com");
        assertThat(result.getRole()).isEqualTo(Role.USER);
        assertThat(result.getPasswordHash()).isEqualTo("GOOGLE_AUTHORISATION");
    }
}