package com.dework.orderservice.controller;

import com.dework.orderservice.dto.cart.AddToCartRequest;
import com.dework.orderservice.dto.cart.CartResponse;
import com.dework.orderservice.dto.cart.UpdateCartItemRequest;
import com.dework.orderservice.service.CartService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CartControllerTest {

    @Mock
    private CartService cartService;

    @InjectMocks
    private CartController cartController;

    @Test
    @DisplayName("getCart lấy thông tin giỏ hàng của user")
    void getCart_Success() {
        CartResponse mockCart = CartResponse.builder()
                .id(1L)
                .userId(10L)
                .totalQuantity(2)
                .totalPrice(60000.0)
                .items(Collections.emptyList())
                .build();

        when(cartService.getCart(10L, null)).thenReturn(mockCart);

        CartResponse result = cartController.getCart(10L, null);

        assertNotNull(result);
        assertEquals(10L, result.getUserId());
        assertEquals(2, result.getTotalQuantity());
        verify(cartService).getCart(10L, null);
    }

    @Test
    @DisplayName("addToCart thêm món vào giỏ hàng")
    void addToCart_Success() {
        AddToCartRequest req = AddToCartRequest.builder()
                .milkTeaId(1L)
                .milkTeaName("Trà Sữa Trân Châu")
                .quantity(1)
                .unitPrice(30000.0)
                .build();

        CartResponse mockCart = CartResponse.builder()
                .id(1L)
                .userId(10L)
                .totalQuantity(1)
                .totalPrice(30000.0)
                .build();

        when(cartService.addToCart(req, 10L)).thenReturn(mockCart);

        CartResponse result = cartController.addToCart(10L, req);

        assertNotNull(result);
        assertEquals(1, result.getTotalQuantity());
        verify(cartService).addToCart(req, 10L);
    }

    @Test
    @DisplayName("updateCartItemQuantity cập nhật số lượng món qua body hoặc query param")
    void updateCartItemQuantity_Success() {
        UpdateCartItemRequest body = UpdateCartItemRequest.builder().quantity(3).build();
        CartResponse mockCart = CartResponse.builder().id(1L).totalQuantity(3).build();

        when(cartService.updateCartItemQuantity(10L, null, 0, 3)).thenReturn(mockCart);

        CartResponse result = cartController.updateCartItemQuantity(0, 10L, null, null, body);

        assertNotNull(result);
        assertEquals(3, result.getTotalQuantity());
        verify(cartService).updateCartItemQuantity(10L, null, 0, 3);
    }

    @Test
    @DisplayName("removeCartItem xóa món khỏi giỏ hàng")
    void removeCartItem_Success() {
        CartResponse mockCart = CartResponse.builder().id(1L).totalQuantity(0).build();
        when(cartService.removeCartItem(10L, null, 0)).thenReturn(mockCart);

        CartResponse result = cartController.removeCartItem(0, 10L, null);

        assertNotNull(result);
        assertEquals(0, result.getTotalQuantity());
        verify(cartService).removeCartItem(10L, null, 0);
    }

    @Test
    @DisplayName("clearCart dọn sạch giỏ hàng")
    void clearCart_Success() {
        cartController.clearCart(10L, null);

        verify(cartService).clearCart(10L, null);
    }
}
