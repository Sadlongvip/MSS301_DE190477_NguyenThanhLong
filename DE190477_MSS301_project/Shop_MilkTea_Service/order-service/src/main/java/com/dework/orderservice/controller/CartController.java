package com.dework.orderservice.controller;

import com.dework.orderservice.context.AuditContext;
import com.dework.orderservice.dto.cart.AddToCartRequest;
import com.dework.orderservice.dto.cart.CartResponse;
import com.dework.orderservice.dto.cart.UpdateCartItemRequest;
import com.dework.orderservice.exception.ApiException;
import com.dework.orderservice.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/carts")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public CartResponse getCart(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestParam(required = false) String sessionId
    ) {
        Long userId = (headerUserId != null) ? headerUserId : AuditContext.getCurrentUserId();
        return cartService.getCart(userId, sessionId);
    }

    @PostMapping("/items")
    @ResponseStatus(HttpStatus.CREATED)
    public CartResponse addToCart(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @Valid @RequestBody AddToCartRequest request
    ) {
        Long userId = (headerUserId != null) ? headerUserId : AuditContext.getCurrentUserId();
        return cartService.addToCart(request, userId);
    }

    @PutMapping("/items/{index}")
    public CartResponse updateCartItemQuantity(
            @PathVariable int index,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestParam(required = false) String sessionId,
            @RequestParam(required = false) Integer quantity,
            @RequestBody(required = false) UpdateCartItemRequest body
    ) {
        Long userId = (headerUserId != null) ? headerUserId : AuditContext.getCurrentUserId();
        int finalQuantity;
        if (body != null) {
            finalQuantity = body.getQuantity();
        } else if (quantity != null) {
            finalQuantity = quantity;
        } else {
            throw ApiException.badRequest("Cần truyền thông tin số lượng (quantity)");
        }
        return cartService.updateCartItemQuantity(userId, sessionId, index, finalQuantity);
    }

    @DeleteMapping("/items/{index}")
    public CartResponse removeCartItem(
            @PathVariable int index,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestParam(required = false) String sessionId
    ) {
        Long userId = (headerUserId != null) ? headerUserId : AuditContext.getCurrentUserId();
        return cartService.removeCartItem(userId, sessionId, index);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clearCart(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestParam(required = false) String sessionId
    ) {
        Long userId = (headerUserId != null) ? headerUserId : AuditContext.getCurrentUserId();
        cartService.clearCart(userId, sessionId);
    }
}
