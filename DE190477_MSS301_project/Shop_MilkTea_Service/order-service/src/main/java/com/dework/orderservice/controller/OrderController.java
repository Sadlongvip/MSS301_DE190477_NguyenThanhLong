package com.dework.orderservice.controller;

import com.dework.orderservice.context.AuditContext;
import com.dework.orderservice.dto.order.CancelOrderRequest;
import com.dework.orderservice.dto.order.CreateOrderRequest;
import com.dework.orderservice.dto.order.OrderResponse;
import com.dework.orderservice.dto.order.UpdateOrderStatusRequest;
import com.dework.orderservice.exception.ApiException;
import com.dework.orderservice.model.OrderStatus;
import com.dework.orderservice.model.PaymentStatus;
import com.dework.orderservice.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
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

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse createOrder(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @Valid @RequestBody CreateOrderRequest request
    ) {
        Long userId = (headerUserId != null) ? headerUserId : AuditContext.getCurrentUserId();
        return orderService.createOrder(request, userId);
    }

    @GetMapping("/my")
    public List<OrderResponse> getMyOrders(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId
    ) {
        Long userId = (headerUserId != null) ? headerUserId : AuditContext.getCurrentUserId();
        return orderService.getMyOrders(userId);
    }

    @GetMapping("/{orderCode}")
    public OrderResponse getOrderByCode(@PathVariable String orderCode) {
        return orderService.getOrderByCode(orderCode);
    }

    @GetMapping
    public Page<OrderResponse> searchOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) PaymentStatus paymentStatus,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return orderService.searchOrders(status, paymentStatus, keyword, pageable);
    }

    @PutMapping("/{orderCode}/status")
    public OrderResponse updateOrderStatus(
            @PathVariable String orderCode,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        return orderService.updateOrderStatus(orderCode, request);
    }

    @PutMapping("/{orderCode}/payment-status")
    public OrderResponse updatePaymentStatus(
            @PathVariable String orderCode,
            @RequestBody Map<String, Object> payload
    ) {
        Object paymentStatusObj = payload.get("paymentStatus");
        if (paymentStatusObj == null || paymentStatusObj.toString().isBlank()) {
            throw ApiException.badRequest("Thông tin paymentStatus không được để trống");
        }
        return orderService.updatePaymentStatus(orderCode, paymentStatusObj.toString());
    }

    @PutMapping("/{orderCode}/cancel")
    public OrderResponse cancelOrder(
            @PathVariable String orderCode,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerRole,
            @Valid @RequestBody CancelOrderRequest request
    ) {
        Long userId = (headerUserId != null) ? headerUserId : AuditContext.getCurrentUserId();
        String role = (headerRole != null) ? headerRole : AuditContext.getCurrentUserRole();
        boolean isAdmin = "ADMIN".equalsIgnoreCase(role);
        return orderService.cancelOrder(orderCode, request.getReason(), userId, isAdmin);
    }
}
