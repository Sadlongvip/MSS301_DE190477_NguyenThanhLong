package com.dework.orderservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemPayload {
    private Long milkTeaId;
    private String milkTeaName;
    private Integer quantity;
    private Double unitPrice;
    private String size;
    private String toppings;
}
