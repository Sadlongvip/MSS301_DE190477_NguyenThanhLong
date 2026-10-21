package com.dework.orderservice.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import jakarta.persistence.OneToOne;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "t_carts")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cart extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(name = "session_id")
    private String sessionId;

    @Column(name = "total_quantity", nullable = false)
    @Builder.Default
    private Integer totalQuantity = 0;

    @Column(name = "total_price", nullable = false)
    @Builder.Default
    private double totalPrice = 0.0;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "t_cart_items", joinColumns = @JoinColumn(name = "cart_id"))
    @Builder.Default
    private List<CartItem> items = new ArrayList<>();

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
        this.totalQuantity = this.items.stream()
            .mapToInt(CartItem::getQuantity)
            .sum();
        this.totalPrice = this.items.stream()
            .mapToDouble(CartItem::getTotalPrice)
            .sum();
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

    public static class CartBuilder {
        public CartBuilder userId(Long userId) {
            if (userId != null) {
                this.user = User.builder().id(userId).build();
            } else {
                this.user = null;
            }
            return this;
        }
    }
}
