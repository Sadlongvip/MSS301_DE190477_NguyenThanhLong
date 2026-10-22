package com.mss301.order.dto;

public record CreateShipmentRequest(Long orderId, String customerId, int quantity, String address) {}
