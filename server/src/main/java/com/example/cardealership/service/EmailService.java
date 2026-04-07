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

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(fromEmail);
        msg.setTo(to);
        msg.setSubject(subject);
        msg.setText(body);
        mailSender.send(msg);
    }

    public void sendRegistrationEmail(String to) {
        sendEmail(
                to,
                "Cars Buy!",
                "Your email is set successfully. Your account has been created. Enjoy our website!!!"
        );
    }

    public void sendInquiry(String to, String subject, String body) {
        sendEmail(to, subject, body);
    }
}