-- Migration V3: Them mon thu nghiem phuc vu kiem thu tinh nang Payment Service (VNPay Sandbox)
-- Gia: 10.000 VND (phu hop voi han muc toi thieu khi test VNPay va trong khoang 5.000 - 10.000 VND)

INSERT INTO milk_tea (name, description, price, image, is_available, category_id, created_by, updated_by)
SELECT 'Trà sữa Test Payment', 
       'Món thử nghiệm giá 10.000đ dùng để kiểm thử luồng đặt hàng và thanh toán trực tuyến qua Payment Service (VNPay Sandbox)', 
       10000, 
       'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=600&auto=format&fit=crop&q=80', 
       TRUE, 
       1, 
       'SYSTEM', 
       'SYSTEM'
WHERE NOT EXISTS (
    SELECT 1 FROM milk_tea WHERE name = 'Trà sữa Test Payment'
);
