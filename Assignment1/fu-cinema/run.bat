@echo off
chcp 65001 >nul
echo ===================================================
echo   FUCinemaBookingSystem - Khoi dong he thong
echo ===================================================

echo [1/5] Khoi dong Docker Compose (SQL Server, MongoDB, MySQL)...
docker compose up -d

echo.
echo Dang doi co so du lieu khoi dong (khoang 15 giay)...
timeout /t 15 /nobreak >nul

echo.
echo [2/5] Khoi dong Customer Service (Port 8081)...
start "customer-service :8081" cmd /k "cd customer-service && mvnw.cmd spring-boot:run"
timeout /t 10 /nobreak >nul

echo [3/5] Khoi dong Movie Service (Port 8082)...
start "movie-service :8082" cmd /k "cd movie-service && mvnw.cmd spring-boot:run"
timeout /t 10 /nobreak >nul

echo [4/5] Khoi dong Booking Service (Port 8083)...
start "booking-service :8083" cmd /k "cd booking-service && mvnw.cmd spring-boot:run"
timeout /t 10 /nobreak >nul

echo [5/5] Khoi dong API Gateway (Port 9000)...
start "api-gateway :9000" cmd /k "cd api-gateway && mvnw.cmd spring-boot:run"

echo.
echo ===================================================
echo   Toan bo he thong dang duoc khoi dong!
echo   Gateway: http://localhost:9000
echo   De dung he thong, chay file stop.bat
echo ===================================================
pause
