package com.example.cardealership.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Listing {
    public enum Status { ACTIVE, SOLD, HIDDEN }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false) private Car car;

    @ManyToOne(optional=false) private User seller;

    @Column(length=2000) private String description;

    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE;

    private Instant createdAt = Instant.now();
}
