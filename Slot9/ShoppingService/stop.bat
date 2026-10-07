@echo off
chcp 65001 >nul
title ShoppingService Stopper

echo ========================================================
echo   SHOPPING SERVICE - DUNG CAC SERVICES
echo ========================================================

echo Dang dung cac process dang dung port 8080, 8081, 8082, 9000...
for %%p in (8080 8081 8082 9000) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%%p" ^| findstr "LISTENING"') do (
        echo Dang tat process PID %%a tren port %%p...
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo.
set /p STOP_DOCKER="Ban co muon dung ca Docker container (MySQL, Mongo, Keycloak) khong? (y/n): "
if /i "%STOP_DOCKER%"=="y" (
    docker compose down
    pushd "%~dp0api-gateway"
    docker compose down
    popd
)

echo Hoan tat!
pause
