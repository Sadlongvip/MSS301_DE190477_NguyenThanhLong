package com.dework.orderservice.model;

public enum PaymentStatus {
    UNPAID,      // Chưa thanh toán
    PAID,        // Đã thanh toán
    FAILED,      // Thanh toán thất bại
    REFUNDED     // Đã hoàn tiền
}
