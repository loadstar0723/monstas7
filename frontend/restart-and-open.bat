@echo off
echo.
echo ========================================
echo Restarting Social Sentiment Page...
echo ========================================
echo.

:: Kill all Node processes
echo Killing all Node processes...
taskkill /F /IM node.exe /T 2>nul

:: Wait a moment
timeout /t 2 /nobreak >nul

:: Start the development server
echo Starting development server...
cd /d %~dp0
start cmd /k "npx next dev -p 3000"

:: Wait for server to start
echo Waiting for server to start...
timeout /t 5 /nobreak >nul

:: Open the browser
echo Opening browser...
start http://localhost:3000/signals/social-sentiment

echo.
echo Done! Browser should open automatically.
echo.
pause