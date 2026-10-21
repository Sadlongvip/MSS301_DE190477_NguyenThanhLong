package com.dework.orderservice.model;

public enum OrderStatus {
    PENDING,     // Chờ xác nhận
    CONFIRMED,   // Đã xác nhận
    PREPARING,   // Đang pha chế
    DELIVERING,  // Đang giao hàng
    COMPLETED,   // Đã hoàn thành
    CANCELLED    // Đã hủy
}
