package com.dework.reportservice.model;

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
public class ReportOrderItem {

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

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
