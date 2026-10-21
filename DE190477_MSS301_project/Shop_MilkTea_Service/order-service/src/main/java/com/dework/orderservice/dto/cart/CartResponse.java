package com.dework.orderservice.dto.cart;

import com.dework.orderservice.model.Cart;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {

    private Long id;
    private Long userId;
    private String sessionId;
    private Integer totalQuantity;
    private double totalPrice;
    private List<CartItemResponse> items;

    public static CartResponse from(Cart cart) {
        if (cart == null) {
            return null;
        }

        List<CartItemResponse> itemResponses = cart.getItems() != null
                ? cart.getItems().stream().map(CartItemResponse::from).toList()
                : Collections.emptyList();

        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUserId())
                .sessionId(cart.getSessionId())
                .totalQuantity(cart.getTotalQuantity())
                .totalPrice(cart.getTotalPrice())
                .items(itemResponses)
                .build();
    }
}
