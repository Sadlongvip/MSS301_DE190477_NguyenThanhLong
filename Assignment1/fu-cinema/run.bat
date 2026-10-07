@echo off
chcp 65001 >nul
echo ===================================================
echo   FUCinemaBookingSystem - Khoi dong he thong
echo ===================================================

echo [1/3] Khoi dong Docker Compose (SQL Server, MongoDB, MySQL)...
docker compose up -d

echo.
echo Dang doi co so du lieu khoi dong (khoang 15 giay)...
timeout /t 15 /nobreak >nul

echo.
echo [2/3] Khoi dong dot 1: Customer Service (Port 8081) va Movie Service (Port 8082)...
start "customer-service :8081" cmd /k "cd customer-service && mvnw.cmd spring-boot:run"
start "movie-service :8082" cmd /k "cd movie-service && mvnw.cmd spring-boot:run"
timeout /t 5 /nobreak >nul

echo.
echo [3/3] Khoi dong dot 2: Booking Service (Port 8083) va API Gateway (Port 9000)...
start "booking-service :8083" cmd /k "cd booking-service && mvnw.cmd spring-boot:run"
start "api-gateway :9000" cmd /k "cd api-gateway && mvnw.cmd spring-boot:run"

echo.
echo ===================================================
echo   Toan bo he thong dang duoc khoi dong!
echo   Gateway: http://localhost:9000
echo   De dung he thong, chay file stop.bat
echo ===================================================
pause
