package com.dework.orderservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderStatusUpdatedEvent {
    private String orderCode;
    private String status;
    private String paymentStatus;
    private String cancelReason;
}

