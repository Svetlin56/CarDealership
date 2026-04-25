package com.example.cardealership.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Arrays;
import java.util.Optional;

@Service
public class AuthCookieService {

    public static final String AUTH_COOKIE_NAME = "cd_auth_token";

    private static final int COOKIE_MAX_AGE_SECONDS = (int) Duration.ofDays(1).toSeconds();

    public void writeAuthCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie(AUTH_COOKIE_NAME, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(COOKIE_MAX_AGE_SECONDS);

        response.addCookie(cookie);

        response.addHeader(
                "Set-Cookie",
                AUTH_COOKIE_NAME + "=" + token +
                        "; Path=/; Max-Age=" + COOKIE_MAX_AGE_SECONDS +
                        "; HttpOnly; SameSite=Lax"
        );
    }

    public void clearAuthCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(AUTH_COOKIE_NAME, "");
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);

        response.addCookie(cookie);

        response.addHeader(
                "Set-Cookie",
                AUTH_COOKIE_NAME + "=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax"
        );
    }

    public Optional<String> extractToken(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return Optional.empty();
        }

        return Arrays.stream(request.getCookies())
                .filter(cookie -> AUTH_COOKIE_NAME.equals(cookie.getName()))
                .map(Cookie::getValue)
                .filter(value -> value != null && !value.isBlank())
                .findFirst();
    }
}