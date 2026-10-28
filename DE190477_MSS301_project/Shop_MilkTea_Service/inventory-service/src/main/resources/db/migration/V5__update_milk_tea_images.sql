-- Migration V5: Cập nhật hình ảnh chất lượng cao, đúng nội dung cho từng món trà sữa
UPDATE milk_tea SET image = 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=600&auto=format&fit=crop&q=80' 
WHERE name = 'Trà sữa trân châu hoàng gia';

UPDATE milk_tea SET image = 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80' 
WHERE name = 'Lục trà sữa lài';

UPDATE milk_tea SET image = 'https://images.unsplash.com/photo-1558857563-b37cf5a86d26?w=600&auto=format&fit=crop&q=80' 
WHERE name = 'Trà sữa Oolong nướng';

UPDATE milk_tea SET image = 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80' 
WHERE name = 'Trà đào cam sả';

UPDATE milk_tea SET image = 'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80' 
WHERE name = 'Trà xoài chanh leo';

UPDATE milk_tea SET image = 'https://images.unsplash.com/photo-1613279060105-b851f33ca66b?w=600&auto=format&fit=crop&q=80' 
WHERE name = 'Trà dâu tây ổi hồng';

UPDATE milk_tea SET image = 'https://images.unsplash.com/photo-1571328003758-4a3921661729?w=600&auto=format&fit=crop&q=80' 
WHERE name = 'Trà Oolong kem cheese Macchiato';

UPDATE milk_tea SET image = 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80' 
WHERE name = 'Hồng trà Macchiato';

UPDATE milk_tea SET image = 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80' 
WHERE name = 'Sữa tươi trân châu đường đen';

UPDATE milk_tea SET image = 'https://images.unsplash.com/photo-1560148196-df61132466ce?w=600&auto=format&fit=crop&q=80' 
WHERE name = 'Sữa tươi matcha kem trứng';
