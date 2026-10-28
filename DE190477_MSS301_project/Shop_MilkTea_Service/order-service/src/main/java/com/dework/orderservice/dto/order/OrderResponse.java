package com.dework.orderservice.dto.order;

import com.dework.orderservice.model.Order;
import com.dework.orderservice.model.OrderStatus;
import com.dework.orderservice.model.PaymentMethod;
import com.dework.orderservice.model.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private Long id;
    private String orderCode;
    private Long userId;
    private String customerName;
    private String phoneNumber;
    private String shippingAddress;
    private String note;
    private Double subtotal;
    private Double shippingFee;
    private Double discountAmount;
    private Double totalAmount;
    private String voucherCode;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private OrderStatus status;
    private String cancelReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemResponse> items;

    public static OrderResponse from(Order order) {
        if (order == null) {
            return null;
        }

        List<OrderItemResponse> itemResponses = order.getItems() != null
                ? order.getItems().stream().map(OrderItemResponse::from).toList()
                : Collections.emptyList();

        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .userId(order.getUserId())
                .customerName(order.getCustomerName())
                .phoneNumber(order.getPhoneNumber())
                .shippingAddress(order.getShippingAddress())
                .note(order.getNote())
                .subtotal(order.getSubtotal())
                .shippingFee(order.getShippingFee())
                .discountAmount(order.getDiscountAmount())
                .totalAmount(order.getTotalAmount())
                .voucherCode(order.getVoucherCode())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .status(order.getStatus())
                .cancelReason(order.getCancelReason())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(itemResponses)
                .build();
    }
}
