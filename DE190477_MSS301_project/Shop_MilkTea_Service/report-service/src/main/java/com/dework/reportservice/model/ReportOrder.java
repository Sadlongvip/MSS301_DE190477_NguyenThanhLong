package com.dework.reportservice.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "t_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_code", nullable = false, unique = true)
    private String orderCode;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(name = "shipping_address", nullable = false)
    private String shippingAddress;

    @Column(name = "note")
    private String note;

    @Column(name = "subtotal", nullable = false)
    private double subtotal;

    @Column(name = "shipping_fee", nullable = false)
    private double shippingFee;

    @Column(name = "discount_amount", nullable = false)
    private double discountAmount;

    @Column(name = "total_amount", nullable = false)
    private double totalAmount;

    @Column(name = "voucher_code")
    private String voucherCode;

    @Column(name = "payment_method", nullable = false)
    private String paymentMethod;

    @Column(name = "payment_status", nullable = false)
    private String paymentStatus;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "cancel_reason")
    private String cancelReason;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "t_order_items", joinColumns = @JoinColumn(name = "order_id"))
    @Builder.Default
    private List<ReportOrderItem> items = new ArrayList<>();
}
