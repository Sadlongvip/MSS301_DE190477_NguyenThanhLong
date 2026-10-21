-- Migration V1: Tạo các bảng cho order-service (t_carts, t_cart_items, t_orders, t_order_items)
-- Ánh xạ quan hệ User 1-1 Cart và User 1-N Order
-- Chuẩn utf8mb4 và đầy đủ các cột audit

-- Đảm bảo bảng t_accounts sẵn sàng nếu order-service chạy khởi tạo trước
CREATE TABLE IF NOT EXISTS t_accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    phone_number VARCHAR(20),
    address VARCHAR(255),
    birthday DATE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'SYSTEM'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng giỏ hàng: Quan hệ 1-1 với User (user_id UNIQUE)
CREATE TABLE IF NOT EXISTS t_carts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE,
    session_id VARCHAR(255),
    total_quantity INT NOT NULL DEFAULT 0,
    total_price DOUBLE NOT NULL DEFAULT 0.0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'SYSTEM'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng chi tiết giỏ hàng
CREATE TABLE IF NOT EXISTS t_cart_items (
    cart_id BIGINT NOT NULL,
    milk_tea_id BIGINT NOT NULL,
    milk_tea_name VARCHAR(255) NOT NULL,
    size VARCHAR(50),
    sugar VARCHAR(50),
    ice VARCHAR(50),
    toppings VARCHAR(500),
    quantity INT NOT NULL DEFAULT 1,
    unit_price DOUBLE NOT NULL,
    total_price DOUBLE NOT NULL,
    image VARCHAR(500),
    note VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES t_carts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng đơn hàng: Quan hệ 1-N với User (user_id cho phép trùng nhiều đơn hàng)
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
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    INDEX idx_orders_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng chi tiết đơn hàng
CREATE TABLE IF NOT EXISTS t_order_items (
    order_id BIGINT NOT NULL,
    milk_tea_id BIGINT NOT NULL,
    milk_tea_name VARCHAR(255) NOT NULL,
    size VARCHAR(50),
    sugar VARCHAR(50),
    ice VARCHAR(50),
    toppings VARCHAR(500),
    quantity INT NOT NULL DEFAULT 1,
    unit_price DOUBLE NOT NULL,
    total_price DOUBLE NOT NULL,
    image VARCHAR(500),
    note VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES t_orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
