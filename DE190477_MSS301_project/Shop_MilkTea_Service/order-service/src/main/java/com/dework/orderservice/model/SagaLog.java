package com.dework.orderservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "t_saga_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SagaLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_code", nullable = false)
    private String orderCode;

    @Column(name = "step", nullable = false)
    private String step;      // ORDER_CREATED, RESERVE_INVENTORY, PROCESS_PAYMENT, COMPENSATION, CONFIRM_ORDER,...

    @Column(name = "result", nullable = false)
    private String result;    // SUCCESS, FAILED, CANCELLED, PENDING

    @Column(name = "message", length = 1000)
    private String message;

    @Column(name = "time", nullable = false)
    private LocalDateTime time;

    public SagaLog(String orderCode, String step, String result, String message) {
        this.orderCode = orderCode;
        this.step = step;
        this.result = result;
        this.message = message;
        this.time = LocalDateTime.now();
    }
}
