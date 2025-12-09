package com.example.cardealership.security;

import com.example.cardealership.service.UserService;
import com.example.cardealership.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class GoogleSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserService userService;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication

    ) throws IOException {

        DefaultOAuth2User oauth = (DefaultOAuth2User) authentication.getPrincipal();

        String email = oauth.getAttribute("email");
        String picture = oauth.getAttribute("picture");

        if (email == null) {
            response.sendRedirect("http://localhost:5173/login?error=no_email");
            return;
        }

        var user = userService.findOrCreateGoogleUser(email);

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());

        String redirectUrl = "http://localhost:5173/oauth-success"
                + "?token=" + token
                + "&email=" + user.getEmail()
                + "&picture=" + picture;

        response.sendRedirect(redirectUrl);
    }
}
