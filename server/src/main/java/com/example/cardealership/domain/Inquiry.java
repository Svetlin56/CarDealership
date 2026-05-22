package com.example.cardealership.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Listing listing;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String phone;

    @Column(length = 2000)
    private String message;

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "admin_reply_message", length = 2000)
    private String adminReplyMessage;

    @Column(name = "admin_replied_at")
    private Instant adminRepliedAt;

    @Builder.Default
    @Column(name = "admin_reply_read_by_user", nullable = false)
    private boolean adminReplyReadByUser = false;
}