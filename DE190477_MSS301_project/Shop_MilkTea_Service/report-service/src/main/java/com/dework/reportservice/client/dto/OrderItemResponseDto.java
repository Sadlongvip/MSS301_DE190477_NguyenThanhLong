package com.dework.reportservice.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponseDto {
    private Long milkTeaId;
    private String milkTeaName;
    private String size;
    private String sugar;
    private String ice;
    private String toppings;
    private Integer quantity;
    private Double unitPrice;
    private Double totalPrice;
    private String image;
    private String note;
}

