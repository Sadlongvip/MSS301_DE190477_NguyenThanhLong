-- Migration V1: Tạo các bảng dữ liệu thống kê báo cáo (Read-Model) cho report-service
-- Schema thuộc sở hữu độc lập của report_db, tuân thủ nguyên tắc Database-per-service

CREATE TABLE IF NOT EXISTS t_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_code VARCHAR(100) NOT NULL UNIQUE,
    user_id BIGINT,
    customer_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    shipping_address VARCHAR(500) NOT NULL,
    note TEXT,
    subtotal DOUBLE NOT NULL DEFAULT 0.0,
    shipping_fee DOUBLE NOT NULL DEFAULT 0.0,
    discount_amount DOUBLE NOT NULL DEFAULT 0.0,
    total_amount DOUBLE NOT NULL DEFAULT 0.0,
    voucher_code VARCHAR(100),
    payment_method VARCHAR(50) NOT NULL DEFAULT 'COD',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'UNPAID',
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    cancel_reason VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_report_orders_created_at (created_at),
    INDEX idx_report_orders_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS t_order_items (
    order_id BIGINT NOT NULL,
    milk_tea_id BIGINT NOT NULL,
    milk_tea_name VARCHAR(255) NOT NULL,
    size VARCHAR(50),
    sugar VARCHAR(50),
    ice VARCHAR(50),
    toppings VARCHAR(500),
    quantity INT NOT NULL DEFAULT 1,
    unit_price DOUBLE NOT NULL DEFAULT 0.0,
    total_price DOUBLE NOT NULL DEFAULT 0.0,
    image VARCHAR(500),
    note VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_report_items_order_id (order_id),
    INDEX idx_report_items_milk_tea_id (milk_tea_id),
    CONSTRAINT fk_report_order_items FOREIGN KEY (order_id) REFERENCES t_orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

