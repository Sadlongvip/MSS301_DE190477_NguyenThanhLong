package com.dework.paymentservice.model;

public enum PaymentStatus {
    PENDING,     // Đang chờ thanh toán
    SUCCESS,     // Thanh toán thành công
    FAILED,      // Thanh toán thất bại
    CANCELLED,   // Đã huỷ giao dịch
    REFUNDED     // Đã hoàn tiền
}
