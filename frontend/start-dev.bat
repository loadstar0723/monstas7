@echo off
echo Starting development server...
cd /d "%~dp0"
echo Current directory: %CD%
echo.
echo Cleaning cache...
if exist .next (
    echo Removing .next directory...
    rmdir /s /q .next 2>nul
)
echo.
echo Starting Next.js dev server...
call npx next dev -H 0.0.0.0 -p 3000
pause