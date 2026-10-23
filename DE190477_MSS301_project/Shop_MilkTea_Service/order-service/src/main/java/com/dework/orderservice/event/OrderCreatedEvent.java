package com.dework.orderservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderCreatedEvent {
    private String orderCode;
    private Long userId;
    private String customerName;
    private String phoneNumber;
    private String shippingAddress;
    private String paymentMethod;
    private Double totalAmount;
    private List<OrderItemPayload> items;
}
