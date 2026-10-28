-- Migration V3: Bổ sung cột saga_status cho bảng t_orders để hỗ trợ theo dõi vòng đời Saga và kịch bản số 8 (KB8 - COMPENSATING)
ALTER TABLE t_orders
ADD COLUMN saga_status VARCHAR(50) NOT NULL DEFAULT 'PENDING' AFTER status;
