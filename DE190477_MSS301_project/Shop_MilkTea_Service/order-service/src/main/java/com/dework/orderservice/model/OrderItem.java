package com.dework.orderservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Column(name = "milk_tea_id", nullable = false)
    private Long milkTeaId;

    @Column(name = "milk_tea_name", nullable = false)
    private String milkTeaName;

    @Column(name = "size")
    private String size;

    @Column(name = "sugar")
    private String sugar;

    @Column(name = "ice")
    private String ice;

    @Column(name = "toppings", length = 500)
    private String toppings;

    @Column(name = "quantity", nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    @Column(name = "unit_price", nullable = false)
    @Builder.Default
    private Double unitPrice = 0.0;

    @Column(name = "total_price", nullable = false)
    @Builder.Default
    private Double totalPrice = 0.0;

    @Column(name = "image")
    private String image;

    @Column(name = "note")
    private String note;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "created_by")
    @Builder.Default
    private String createdBy = "SYSTEM";

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "updated_by")
    @Builder.Default
    private String updatedBy = "SYSTEM";

    public Integer getQuantity() {
        return quantity != null ? quantity : 1;
    }

    public Double getUnitPrice() {
        return unitPrice != null ? unitPrice : 0.0;
    }

    public Double getTotalPrice() {
        return totalPrice != null ? totalPrice : 0.0;
    }
}
