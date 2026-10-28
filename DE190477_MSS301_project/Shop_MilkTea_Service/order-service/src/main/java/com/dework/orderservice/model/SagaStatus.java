package com.dework.orderservice.model;

public enum SagaStatus {
    PENDING,        // Khởi tạo, chờ Saga bắt đầu
    EXECUTING,      // Đang thực thi các bước của Saga
    COMPLETED,      // Hoàn tất chuỗi Saga thành công
    FAILED,         // Thất bại bước nghiệp vụ
    COMPENSATING,   // Đang thực hiện bồi hoàn bù trừ (KB8 - có thể bị treo nếu service lỗi)
    COMPENSATED     // Đã hoàn tất bồi hoàn bù trừ
}
