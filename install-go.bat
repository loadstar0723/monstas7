@echo off
echo ====================================
echo Go 설치 프로그램
echo ====================================
echo.
echo PowerShell 스크립트를 실행합니다...
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0install-go.ps1"

echo.
pause