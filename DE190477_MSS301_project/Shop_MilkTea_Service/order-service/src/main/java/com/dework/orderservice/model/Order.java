package com.dework.orderservice.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.ConstraintMode;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "t_orders")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_code", nullable = false, unique = true)
    private String orderCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
    private User user;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(name = "shipping_address", nullable = false)
    private String shippingAddress;

    @Column(name = "note")
    private String note;

    @Column(name = "subtotal", nullable = false)
    @Builder.Default
    private double subtotal = 0.0;

    @Column(name = "shipping_fee", nullable = false)
    @Builder.Default
    private double shippingFee = 0.0;

    @Column(name = "discount_amount", nullable = false)
    @Builder.Default
    private double discountAmount = 0.0;

    @Column(name = "total_amount", nullable = false)
    @Builder.Default
    private double totalAmount = 0.0;

    @Column(name = "voucher_code")
    private String voucherCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    @Builder.Default
    private PaymentMethod paymentMethod = PaymentMethod.COD;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @Column(name = "cancel_reason")
    private String cancelReason;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "t_order_items", joinColumns = @JoinColumn(name = "order_id"))
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        super.onBaseCreate();
        recalculateTotals();
    }

    @PreUpdate
    protected void onUpdate() {
        super.onBaseUpdate();
        recalculateTotals();
    }

    public void recalculateTotals() {
        if (this.items == null) {
            this.items = new ArrayList<>();
        }
        this.subtotal = this.items.stream()
                .mapToDouble(OrderItem::getTotalPrice)
                .sum();
        this.totalAmount = Math.max(0.0, this.subtotal + this.shippingFee - this.discountAmount);
    }

    public Long getUserId() {
        return this.user != null ? this.user.getId() : null;
    }

    public void setUserId(Long userId) {
        if (userId != null) {
            this.user = User.builder().id(userId).build();
        } else {
            this.user = null;
        }
    }

    public static class OrderBuilder {
        public OrderBuilder userId(Long userId) {
            if (userId != null) {
                this.user = User.builder().id(userId).build();
            } else {
                this.user = null;
            }
            return this;
        }
    }
}
