@echo off
chcp 65001 >nul
echo ===================================================
echo   FUCinemaBookingSystem - Dung toan bo he thong
echo ===================================================

echo [1/2] Dung 4 Microservices (Ports 8081, 8082, 8083, 9000)...
for %%p in (8081 8082 8083 9000) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p ^| findstr LISTENING') do (
        echo Dang tat process tren port %%p (PID: %%a)...
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo.
echo [2/2] Dung Docker Compose containers...
docker compose down

echo.
echo ===================================================
echo   He thong da duoc dung hoan toan!
echo ===================================================
pause
