package com.example.cardealership.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:}")
    private String fromEmail;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage msg = new SimpleMailMessage();

        String sender = resolveSenderEmail();
        if (!sender.isBlank()) {
            msg.setFrom(sender);
        }

        msg.setTo(to);
        msg.setSubject(subject);
        msg.setText(body);

        mailSender.send(msg);
    }

    public void sendRegistrationEmail(String to) {
        sendEmail(
                to,
                "Welcome to Car Dealership",
                """
                Your account has been created successfully.
                You can now browse available cars, view recommendations and send inquiries.
                Thank you for joining Car Dealership!
                """.formatted(frontendUrl)
        );
    }

    public void sendInquiry(String to, String subject, String body) {
        sendEmail(to, subject, body);
    }

    private String resolveSenderEmail() {
        if (fromEmail != null && !fromEmail.isBlank()) {
            return fromEmail.trim();
        }

        if (mailUsername != null && !mailUsername.isBlank()) {
            return mailUsername.trim();
        }

        return "";
    }
}