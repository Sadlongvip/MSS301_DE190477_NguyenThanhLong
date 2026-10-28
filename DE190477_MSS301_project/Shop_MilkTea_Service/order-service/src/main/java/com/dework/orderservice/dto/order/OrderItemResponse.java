package com.dework.orderservice.dto.order;

import com.dework.orderservice.model.OrderItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {

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

    public static OrderItemResponse from(OrderItem item) {
        if (item == null) {
            return null;
        }
        return OrderItemResponse.builder()
                .milkTeaId(item.getMilkTeaId())
                .milkTeaName(item.getMilkTeaName())
                .size(item.getSize())
                .sugar(item.getSugar())
                .ice(item.getIce())
                .toppings(item.getToppings())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getTotalPrice())
                .image(item.getImage())
                .note(item.getNote())
                .build();
    }
}
