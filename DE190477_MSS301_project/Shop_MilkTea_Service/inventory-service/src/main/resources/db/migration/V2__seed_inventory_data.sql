-- Migration V2: Nạp dữ liệu mẫu (DataSeed) tiếng Việt cho inventory-service
-- Bao gồm category_tea, tea_size, milk_tea, topping

-- 1. Nạp danh mục (category_tea)
INSERT IGNORE INTO category_tea (id, name) VALUES
    (1, 'Trà sữa truyền thống'),
    (2, 'Trà trái cây tươi'),
    (3, 'Trà ô long & Macchiato'),
    (4, 'Sữa tươi trân châu');

-- 2. Nạp kích cỡ ly (tea_size)
INSERT IGNORE INTO tea_size (id, name, code, extra_price, is_default, is_available) VALUES
    (1, 'Size M (Tiêu chuẩn)', 'M', 0, TRUE, TRUE),
    (2, 'Size L (Cỡ lớn)', 'L', 6000, FALSE, TRUE),
    (3, 'Size XL (Khổng lồ 1L)', 'XL', 12000, FALSE, TRUE);

-- 3. Nạp sản phẩm trà sữa (milk_tea)
INSERT IGNORE INTO milk_tea (name, description, price, image, is_available, category_id) VALUES
    ('Trà sữa trân châu hoàng gia', 'Hương vị trà đen đậm đà kết hợp sữa thơm béo và trân châu dẻo ngon', 35000, 'https://example.com/images/milktea-royal.jpg', TRUE, 1),
    ('Lục trà sữa lài', 'Hương hoa nhài thoang thoảng dịu nhẹ, vị chát nhẹ ngọt thanh', 32000, 'https://example.com/images/green-milktea.jpg', TRUE, 1),
    ('Trà sữa Oolong nướng', 'Lá trà Oolong được sấy nướng nhiệt độ cao tạo hương caramel đặc trưng', 38000, 'https://example.com/images/roasted-oolong.jpg', TRUE, 1),
    ('Trà đào cam sả', 'Sự kết hợp hoàn hảo giữa vị chua ngọt của cam đào và mùi thơm thanh mát của sả', 42000, 'https://example.com/images/peach-orange-tea.jpg', TRUE, 2),
    ('Trà xoài chanh leo', 'Xoài tươi nhiệt đới hòa quyện cùng cốt chanh leo tươi mát', 40000, 'https://example.com/images/mango-passion-tea.jpg', TRUE, 2),
    ('Trà dâu tây ổi hồng', 'Vị dâu tây chín mọng kết hợp cùng ổi hồng giòn tan ngọt ngào', 45000, 'https://example.com/images/strawberry-guava.jpg', TRUE, 2),
    ('Trà Oolong kem cheese Macchiato', 'Trà Oolong hảo hạng phủ lớp foam kem phô mai béo ngậy thơm ngon', 46000, 'https://example.com/images/oolong-macchiato.jpg', TRUE, 3),
    ('Hồng trà Macchiato', 'Hồng trà Ceylon đậm vị phủ lớp kem béo mặn đặc trưng', 42000, 'https://example.com/images/black-tea-macchiato.jpg', TRUE, 3),
    ('Sữa tươi trân châu đường đen', 'Sữa tươi thanh trùng hòa quyện cùng sốt đường đen đậm vị', 45000, 'https://example.com/images/brown-sugar-boba.jpg', TRUE, 4),
    ('Sữa tươi matcha kem trứng', 'Matcha Nhật Bản kết hợp cùng lớp kem trứng nướng khò béo thơm', 48000, 'https://example.com/images/matcha-egg-cream.jpg', TRUE, 4);

-- 4. Nạp topping (topping)
INSERT IGNORE INTO topping (name, price, is_available) VALUES
    ('Trân châu đen', 5000, TRUE),
    ('Trân châu hoàng kim', 7000, TRUE),
    ('Trân châu trắng 3Q', 7000, TRUE),
    ('Thạch nha đam', 6000, TRUE),
    ('Thạch củ năng ngũ sắc', 8000, TRUE),
    ('Pudding trứng', 8000, TRUE),
    ('Kem cheese Macchiato', 10000, TRUE),
    ('Sương sáo Đài Loan', 6000, TRUE);
