package com.example.cardealership.security;

import com.example.cardealership.service.EmailService;
import com.example.cardealership.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger log = LoggerFactory.getLogger(GoogleSuccessHandler.class);

    @Value("${app.frontend-url}")
    private String frontendUrl;

    private final JwtService jwtService;
    private final UserService userService;
    private final EmailService emailService;
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

        var googleUserResult = userService.findOrCreateGoogleUserWithResult(email);
        var user = googleUserResult.user();

        if (googleUserResult.created()) {
            sendRegistrationEmail(user.getEmail());
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        authCookieService.writeAuthCookie(response, token);

        String redirectUrl = frontendUrl + "/oauth-success"
                + "#email=" + encode(user.getEmail())
                + "&role=" + encode(user.getRole().name())
                + "&picture=" + encode(picture == null ? "" : picture);

        response.sendRedirect(redirectUrl);
    }

    private void sendRegistrationEmail(String email) {
        try {
            emailService.sendRegistrationEmail(email);
            log.info("Google registration email sent to {}", email);
        } catch (Exception e) {
            log.warn("Could not send Google registration email to {}", email, e);
        }
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}