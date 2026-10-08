@echo off
chcp 65001 >nul
title ShoppingService Orchestrator

echo ========================================================
echo   SHOPPING SERVICE - KHOI DONG HE THONG MICROSERVICES
echo ========================================================

echo [1/4] Khoi dong Database goc (MySQL ^& MongoDB) qua Docker...
docker compose up -d

echo.
echo [2/4] Khoi dong Keycloak Auth Server trong api-gateway qua Docker...
pushd "%~dp0api-gateway"
docker compose up -d
popd

echo.
echo [3/4] Dang khoi dong 2 Backend Services dau tien (Product, Inventory)...
start "Product Service (Port 8080)" cmd /k "cd /d %~dp0product-service && mvnw.cmd spring-boot:run"
start "Inventory Service (Port 8082)" cmd /k "cd /d %~dp0inventory-service && mvnw.cmd spring-boot:run"

echo.
echo [!] Dang cho 20 giay de Product Service va Inventory Service khoi dong truoc khi bat cac service tiep theo...
timeout /t 20 /nobreak

echo.
echo [4/4] Dang khoi dong 2 Services con lai (Order, API Gateway)...
start "Order Service (Port 8081)" cmd /k "cd /d %~dp0order-service && mvnw.cmd spring-boot:run"
start "API Gateway (Port 9000)" cmd /k "cd /d %~dp0api-gateway && mvnw.cmd spring-boot:run"

echo.
echo ========================================================
echo   Tat ca cac service da duoc khoi dong trong cac cua so rieng!
echo   - Keycloak Auth:     http://localhost:8181
echo   - Product Service:   http://localhost:8080
echo   - Inventory Service: http://localhost:8082
echo   - Order Service:     http://localhost:8081
echo   - API Gateway:       http://localhost:9000
echo ========================================================
