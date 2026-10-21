package com.dework.paymentservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "t_payment_transactions")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransaction extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_code", nullable = false, unique = true, length = 64)
    private String transactionCode;

    @Column(name = "order_code", nullable = false, length = 64)
    private String orderCode;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "amount", nullable = false)
    private double amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 32)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "bank_code", length = 32)
    private String bankCode;

    @Column(name = "vnp_transaction_no", length = 64)
    private String vnpTransactionNo;

    @Column(name = "response_code", length = 32)
    private String responseCode;

    @Column(name = "order_info", length = 255)
    private String orderInfo;

    @Column(name = "pay_url", columnDefinition = "TEXT")
    private String payUrl;

    @Column(name = "payment_time")
    private LocalDateTime paymentTime;
}
