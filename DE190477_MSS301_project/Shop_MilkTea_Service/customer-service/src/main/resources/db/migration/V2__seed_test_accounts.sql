-- Migration V2: Seed test accounts
-- All accounts have password: password123 (hashed with BCrypt)

INSERT IGNORE INTO t_accounts (username, password, role, email, status, phone_number, address, birthday)
VALUES
    ('customer1', '$2a$10$ffaMSkg9ujNQ.09tTRvnkOo2o7qy1mJDxetbzCkKdPEjtfypHLuZ2', 'CUSTOMER', 'customer1@example.com', 'ACTIVE', '0901234567', '123 Nguyen Trai, Q1, TP.HCM', '2000-01-15'),
    ('customer2', '$2a$10$ffaMSkg9ujNQ.09tTRvnkOo2o7qy1mJDxetbzCkKdPEjtfypHLuZ2', 'CUSTOMER', 'customer2@example.com', 'ACTIVE', '0907654321', '456 Le Loi, Q1, TP.HCM', '1998-05-20'),
    ('staff1', '$2a$10$ffaMSkg9ujNQ.09tTRvnkOo2o7qy1mJDxetbzCkKdPEjtfypHLuZ2', 'STAFF', 'staff1@example.com', 'ACTIVE', '0912345678', '789 Tran Hung Dao, Q5, TP.HCM', '1995-10-10'),
    ('admin_db', '$2a$10$ffaMSkg9ujNQ.09tTRvnkOo2o7qy1mJDxetbzCkKdPEjtfypHLuZ2', 'ADMIN', 'admindb@example.com', 'ACTIVE', '0988888888', '1 Hai Ba Trung, Q1, TP.HCM', '1990-01-01'),
    ('inactive_user', '$2a$10$ffaMSkg9ujNQ.09tTRvnkOo2o7qy1mJDxetbzCkKdPEjtfypHLuZ2', 'CUSTOMER', 'inactive@example.com', 'INACTIVE', '0933333333', '99 Cong Hoa, Tan Binh, TP.HCM', '2001-12-12');
