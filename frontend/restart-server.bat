@echo off
echo Killing all Node processes...
powershell -Command "Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force"
timeout /t 2 /nobreak > nul

echo Starting development server...
cd /d "%~dp0"
npx next dev -H 0.0.0.0 -p 3000