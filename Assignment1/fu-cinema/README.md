# FUCinemaBookingSystem — Cinema Ticket Booking System

Hệ thống quản lý đặt vé xem phim theo kiến trúc **Microservices** với **Spring Cloud API Gateway Server MVC**, **Java 21**, **Spring Boot 4**, kết hợp đa cơ sở dữ liệu (**Polyglot Persistence**: SQL Server, MongoDB, MySQL) chạy trên **Docker Compose**.

> **⚡ Quick Start (Khởi động 1-Click trên Windows):**
> - **Chạy toàn bộ:** Nhấp đúp file [`run.bat`](run.bat) (tự động bật Docker và mở 4 service theo đúng thứ tự).
> - **Dừng toàn bộ:** Nhấp đúp file [`stop.bat`](stop.bat) (tự động tắt các service và dừng Docker container).
> - Chi tiết xem tại [Mục 7. Hướng dẫn sử dụng run.bat và stop.bat](#7-hướng-dẫn-sử-dụng-runbat-và-stopbat).

---

## 1. Kiến trúc hệ thống & Danh sách Service

Hệ thống gồm 4 services độc lập và 3 hệ quản trị cơ sở dữ liệu riêng biệt:

| Service | Port | Công nghệ / Database | Vai trò |
|---|---|---|---|
| **api-gateway** | `9000` | Spring Cloud Gateway Server MVC, Spring Security OAuth2 Resource Server (JWT) | Điểm truy cập duy nhất (Single Entry Point), xác thực JWT, phân quyền theo vai trò (RBAC), chuyển tiếp thông tin user (`X-User-Id`, `X-User-Email`, `X-User-Role`) tới các service nội bộ. |
| **customer-service** | `8081` | Spring Boot, Spring Data JPA, Flyway, **SQL Server 2022** (port `1434`) | Quản lý thông tin khách hàng, đăng ký, đăng nhập JWT, quản lý tài khoản (Admin/Customer). |
| **movie-service** | `8082` | Spring Boot, Spring Data MongoDB, **MongoDB 7.0.5** (port `27018`) | Quản lý thể loại phim (Genre), phòng chiếu (Room), phim (Movie), suất chiếu (Showtime). Tự động nạp dữ liệu mẫu ban đầu qua `DataSeeder`. |
| **booking-service** | `8083` | Spring Boot, Spring Data JPA, Flyway, OpenFeign, **MySQL 8.3.0** (port `3306`) | Quản lý đặt vé, kiểm tra tình trạng ghế, lịch sử đặt vé, hủy vé và báo cáo doanh thu theo khoảng thời gian. Tích hợp OpenFeign gọi sang `movie-service`. |

---

## 2. Hướng dẫn khởi động hệ thống (Run Guide)

Để các service hoạt động ổn định và liên kết thông suốt, vui lòng khởi động theo đúng thứ tự sau:

### Bước 2.1: Khởi động hệ thống cơ sở dữ liệu (Docker Compose)
Mở Terminal tại thư mục `fu-cinema`:
```bash
docker compose up -d
```
> **Lưu ý:** Đợi khoảng 15–20 giây để container `cinema-sqlserver` đạt trạng thái `healthy` trước khi khởi động các service Java. Kiểm tra bằng lệnh:
> ```bash
> docker compose ps
> ```

---

### Bước 2.2: Khởi động các Microservices (Mỗi service 1 terminal)
Khởi động lần lượt 4 service theo đúng thứ tự phụ thuộc sau:

1. **customer-service** (Cổng `8081`):
   ```bash
   cd customer-service
   ./mvnw spring-boot:run
   ```
2. **movie-service** (Cổng `8082`):
   ```bash
   cd movie-service
   ./mvnw spring-boot:run
   ```
   *(Lần đầu khởi động sẽ tự động seed dữ liệu vào MongoDB)*.

3. **booking-service** (Cổng `8083`):
   ```bash
   cd booking-service
   ./mvnw spring-boot:run
   ```
   *(Cần `movie-service` để lấy thông tin phim khi đặt vé qua OpenFeign)*.

4. **api-gateway** (Cổng `9000`):
   ```bash
   cd api-gateway
   ./mvnw spring-boot:run
   ```

---

### Bước 2.3: Kiểm tra nhanh toàn tuyến
Mở terminal mới và kiểm tra nhanh hoạt động qua Gateway:
```bash
# Kiểm tra lấy danh sách phim (Public):
curl http://localhost:9000/api/movies

# Kiểm tra đăng nhập tài khoản Admin:
curl -X POST http://localhost:9000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@fucinema.com","password":"@@abc123@@"}'
```

---

## 3. Danh sách tài khoản thử nghiệm (Test Accounts)

| Vai trò | Email | Mật khẩu | Trạng thái | Ghi chú & Quyền hạn |
|---|---|---|---|---|
| **ADMIN** | `admin@fucinema.com` | `@@abc123@@` | `ACTIVE` | Cấu hình cố định trong cấu hình hệ thống. Có quyền quản lý Customer, Genre, Room, Movie, Showtime, xem toàn bộ Booking và xem Báo cáo doanh thu (`/api/bookings/report`). |
| **CUSTOMER (1)** | `an@gmail.com` | `123456` | `ACTIVE` | Khách hàng có sẵn (Seed qua `V2__seed.sql`). ID: `1`. Dùng để test xem/sửa profile (`/api/customers/me`), đặt vé và xem lịch sử đặt vé (`/api/bookings/my`). |
| **CUSTOMER (Khóa)** | `chi@gmail.com` | `123456` | `INACTIVE` | Khách hàng bị khóa (Seed qua `V2__seed.sql`). Dùng để kiểm thử quy tắc nghiệp vụ **BR02** (Đăng nhập trả về HTTP `403 Forbidden`). |
| **CUSTOMER (2 - Động)** | Sinh ngẫu nhiên trong Postman | `123456` *(sau đổi thành `654321`)* | `ACTIVE` | Khách hàng được tạo tự động khi chạy Postman Test 2.1 (`/api/customers/register`) để test đổi mật khẩu, xung đột vé, hủy vé. |

---

## 4. Hướng dẫn kiểm thử tự động với Postman (F11 - Postman Collection Runner)

Toàn bộ kịch bản kiểm thử API đã được tự động hóa bằng Postman Collection v2.1 đặt trong thư mục `postman/`:

- **Environment File:** `postman/FUCinema-Local.postman_environment.json`
- **Collection File:** `postman/FUCinemaBookingSystem.postman_collection.json`
- **Báo cáo kết quả kiểm thử:** `postman/DE190477_Postman_doc_Assignment.docx`

### Các bước chạy kiểm thử tự động:
1. Mở phần mềm **Postman Desktop**.
2. Nhấn nút **Import** ở góc trên bên trái, chọn 2 file `.json` trên trong thư mục `postman/`.
3. Tại góc trên bên phải, chọn môi trường: **`FUCinema-Local`**.
4. Nhấp chuột phải vào Collection **`FUCinemaBookingSystem`** $\rightarrow$ chọn **Run collection**.
5. Giữ nguyên thứ tự các thư mục từ `01-Auth` đến `08-Report` $\rightarrow$ Nhấn **Run FUCinemaBookingSystem**.
6. **Kết quả mong đợi:** Toàn bộ **45 test case Passed** (0 Failed).

---

## 5. Hướng dẫn kiểm tra trực tiếp dữ liệu trong Database

Sau khi chạy kiểm thử Postman, có thể kiểm tra dữ liệu được lưu đúng kiểu và đúng nơi:

```bash
# 1. SQL Server - Kiểm tra tiếng Việt Unicode (NVARCHAR) & Customer mới:
docker exec -it cinema-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "Fucinema@2026" -C \
        -d cinema_customer -Q "SELECT TOP 5 customer_id, customer_name, email, customer_status FROM customer ORDER BY customer_id DESC"

# 2. MongoDB - Kiểm tra Showtime mới tạo (ticketPrice là Decimal128, ObjectId):
docker exec -it cinema-mongo mongosh -u root -p password --authenticationDatabase admin cinema_movie \
        --eval "db.showtimes.find().sort({_id:-1}).limit(2)"

# 3. MySQL - Kiểm tra Booking Details (showtime_id là chuỗi 24 hex, snapshot movie_title):
docker exec -it cinema-mysql mysql -uroot -pmysql cinema_booking \
        -e "SELECT b.booking_id, b.booking_status, d.showtime_id, d.seat_code, d.movie_title FROM booking b JOIN booking_detail d ON d.booking_id = b.booking_id ORDER BY d.booking_detail_id DESC LIMIT 5;"
```

---

## 6. Hướng dẫn Reset Database về trạng thái ban đầu

Nếu muốn xóa toàn bộ dữ liệu kiểm thử và đưa cả 3 database về trạng thái sạch:

```bash
cd fu-cinema
docker compose down -v
Remove-Item -Recurse -Force .\docker\mysql\data
docker compose up -d
```
Sau đó khởi động lại các Spring Boot service để tự động nạp lại dữ liệu seed ban đầu.
---

## 7. Hướng dẫn sử dụng run.bat và stop.bat

Dự án cung cấp sẵn 2 script tự động hóa trên môi trường Windows để đơn giản hóa việc vận hành:

### 7.1 Khởi động toàn bộ hệ thống (`run.bat`)
Nhấp đúp chuột vào file [`run.bat`](run.bat) (hoặc chạy `.\run.bat` trong Terminal). Script sẽ tự động:
1. Chạy `docker compose up -d` để khởi động SQL Server, MongoDB và MySQL.
2. Đợi 15 giây để hệ thống cơ sở dữ liệu khởi động hoàn tất (`healthy`).
3. Tự động mở 4 cửa sổ terminal riêng biệt để chạy 4 Microservices theo đúng thứ tự phụ thuộc:
   - `customer-service` (cổng `8081`)
   - `movie-service` (cổng `8082`)
   - `booking-service` (cổng `8083`)
   - `api-gateway` (cổng `9000`)
4. Cho phép theo dõi log hoạt động của từng service trực tiếp trên từng cửa sổ độc lập.

### 7.2 Dừng toàn bộ hệ thống (`stop.bat`)
Nhấp đúp chuột vào file [`stop.bat`](stop.bat) (hoặc chạy `.\stop.bat` trong Terminal). Script sẽ tự động:
1. Dò tìm và tắt (kill) các process Java đang lắng nghe trên 4 cổng `8081`, `8082`, `8083`, `9000`.
2. Thực hiện `docker compose down` để dừng và gỡ các container Docker an toàn.