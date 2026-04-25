package com.example.cardealership.security;

import com.example.cardealership.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class GoogleSuccessHandler implements AuthenticationSuccessHandler {

    @Value("${app.frontend-url}")
    private String frontendUrl;

    private final JwtService jwtService;
    private final UserService userService;
    private final AuthCookieService authCookieService;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {

        DefaultOAuth2User oauth = (DefaultOAuth2User) authentication.getPrincipal();

        String email = oauth.getAttribute("email");
        String picture = oauth.getAttribute("picture");

        if (email == null || email.isBlank()) {
            response.sendRedirect(frontendUrl + "/login?error=no_email");
            return;
        }

        var user = userService.findOrCreateGoogleUser(email);
        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        authCookieService.writeAuthCookie(response, token);

        String redirectUrl = frontendUrl + "/oauth-success"
                + "#email=" + encode(user.getEmail())
                + "&role=" + encode(user.getRole().name())
                + "&picture=" + encode(picture == null ? "" : picture);

        response.sendRedirect(redirectUrl);
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}