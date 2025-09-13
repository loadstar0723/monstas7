@echo off
echo Starting MONSTA Go Services...

echo.
echo [1/4] Starting Redis...
start cmd /k "redis-server"

timeout /t 2 /nobreak > nul

echo.
echo [2/4] Starting AI Analysis Service...
cd ai-analysis
start cmd /k "go run main.go"
cd ..

timeout /t 1 /nobreak > nul

echo.
echo [3/4] Starting AI Trading Engine...
cd ai-trading
start cmd /k "go run main.go"
cd ..

timeout /t 1 /nobreak > nul

echo.
echo [4/4] Starting WebSocket Server...
cd websocket-server
start cmd /k "go run main.go"
cd ..

echo.
echo ============================================
echo All Go services are starting...
echo.
echo Services:
echo - AI Analysis:    http://localhost:8083
echo - AI Trading:     http://localhost:8082
echo - WebSocket:      http://localhost:8080
echo - Redis:          localhost:6379
echo.
echo WebSocket endpoints:
echo - ws://localhost:8083/ws/analysis  (AI Analysis)
echo - ws://localhost:8082/ws/status    (Trading Status)
echo - ws://localhost:8080/ws           (Price Stream)
echo ============================================
echo.
pause