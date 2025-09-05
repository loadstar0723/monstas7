@echo off
echo ===================================
echo MONSTA Server Status Check
echo ===================================
echo.

:loop
echo Checking server status...
curl -I -m 3 http://13.209.84.93:3000 2>nul | findstr "HTTP"

if %errorlevel% equ 0 (
    echo.
    echo ✅ Server is UP and running!
    echo.
    echo Now checking if latest code is deployed...
    curl -s http://13.209.84.93:3000 | findstr "FaBars" >nul
    if %errorlevel% equ 0 (
        echo ✅ Latest code is deployed!
    ) else (
        echo ⚠️ Old version is running. Need to redeploy.
    )
    goto end
) else (
    echo ❌ Server is DOWN. Waiting 10 seconds...
    timeout /t 10 >nul
    goto loop
)

:end
echo.
echo ===================================
pause