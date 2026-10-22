package com.mss301.shipping.dto;

public record CreateShipmentRequest(Long orderId, String customerId, int quantity, String address) {}
