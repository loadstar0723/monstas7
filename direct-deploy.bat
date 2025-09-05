@echo off
echo ===================================
echo MONSTA Direct Deploy (Windows)
echo ===================================
echo.

echo [1] Building frontend...
cd frontend
call npm run build

if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo.
echo [2] Build successful!
echo.
echo ===================================
echo Manual deployment steps:
echo ===================================
echo.
echo 1. Open your FTP client (like FileZilla)
echo 2. Connect to: 13.209.84.93
echo 3. Upload these folders to /home/ubuntu/monstas7/frontend/:
echo    - .next (entire folder)
echo    - public (if changed)
echo    - package.json (if changed)
echo.
echo 4. After upload, SSH to server and run:
echo    ssh ubuntu@13.209.84.93
echo    cd ~/monstas7/frontend
echo    pm2 restart monsta-nextjs
echo.
echo ===================================
pause