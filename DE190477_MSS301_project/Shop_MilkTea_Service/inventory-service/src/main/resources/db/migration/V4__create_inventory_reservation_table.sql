-- Migration V4: Bổ sung cột số lượng tồn kho (stock_quantity) và tạo bảng quản lý giữ chỗ kho (t_inventory_reservations) cho Saga Choreography
ALTER TABLE milk_tea ADD COLUMN IF NOT EXISTS stock_quantity INT NOT NULL DEFAULT 100;

CREATE TABLE IF NOT EXISTS t_inventory_reservations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_code VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'RESERVED',
    items_json TEXT,
    reason VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    INDEX idx_reservation_order_code (order_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
