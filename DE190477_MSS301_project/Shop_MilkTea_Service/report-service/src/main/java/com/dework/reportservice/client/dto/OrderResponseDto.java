package com.dework.reportservice.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDto {
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
    private String paymentMethod;
    private String paymentStatus;
    private String status;
    private String sagaStatus;
    private String cancelReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemResponseDto> items;
}

