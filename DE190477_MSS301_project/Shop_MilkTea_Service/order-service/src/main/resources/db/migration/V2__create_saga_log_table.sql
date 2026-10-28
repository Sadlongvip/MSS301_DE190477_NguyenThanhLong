-- Migration V2: Tạo bảng t_saga_logs ghi nhận lịch sử các bước thực thi Saga giống Slot 13
CREATE TABLE IF NOT EXISTS t_saga_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_code VARCHAR(100) NOT NULL,
    step VARCHAR(100) NOT NULL,
    result VARCHAR(50) NOT NULL,
    message VARCHAR(1000),
    time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_saga_logs_order_code (order_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
