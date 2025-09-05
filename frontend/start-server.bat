@echo off
echo ========================================
echo MONSTA AI Trading Platform Server
echo ========================================
echo.
echo Cleaning cache...
rmdir /s /q .next 2>nul
echo.
echo Starting server on http://172.30.1.24:3000
echo.
npm run dev
pause