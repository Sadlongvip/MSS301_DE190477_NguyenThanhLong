package com.mss301.order.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "outbox")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutboxMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String aggregateType; // "ORDER"

    @Column(nullable = false)
    private Long aggregateId; // orderId

    @Column(nullable = false)
    private String type; // "ORDER_CREATED"

    @Column(nullable = false, length = 2000)
    private String payload;

    @Column(nullable = false)
    private String status; // PENDING, PROCESSED, FAILED

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
