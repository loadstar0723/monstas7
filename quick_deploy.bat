@echo off
echo ========================================
echo   MONSTA V7 - Quick Server Deployment
echo ========================================
echo.

set /p SERVER_IP=Enter your server IP address: 

echo.
echo Connecting to %SERVER_IP%...
echo.

REM SSH 접속 및 배포
ssh -i monsta-key.pem ubuntu@%SERVER_IP% "bash -s" < deploy_commands.txt

echo.
echo ========================================
echo Deployment command sent to server!
echo Server URL: http://%SERVER_IP%:8507
echo ========================================
pause