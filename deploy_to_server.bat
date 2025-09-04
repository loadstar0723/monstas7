@echo off
echo ========================================
echo   MONSTA Trading V7 - Server Deployment
echo ========================================
echo.

REM 서버 정보 설정
set SERVER_IP=your-server-ip-here
set SERVER_USER=ubuntu
set KEY_FILE=monsta-key.pem
set PROJECT_NAME=monstas7

echo [Step 1] Checking key file...
if not exist "%KEY_FILE%" (
    echo Error: Key file %KEY_FILE% not found!
    if exist "monsta-aws.ppk" (
        echo Found monsta-aws.ppk - Using PuTTY...
        goto :putty_deploy
    )
    pause
    exit /b 1
)

echo [Step 2] Testing server connection...
ssh -o StrictHostKeyChecking=no -i %KEY_FILE% %SERVER_USER%@%SERVER_IP% "echo Connection successful!"
if %errorlevel% neq 0 (
    echo Error: Cannot connect to server!
    pause
    exit /b 1
)

echo [Step 3] Creating deployment directory...
ssh -i %KEY_FILE% %SERVER_USER%@%SERVER_IP% "mkdir -p ~/monsta-v7"

echo [Step 4] Installing server dependencies...
ssh -i %KEY_FILE% %SERVER_USER%@%SERVER_IP% "sudo apt-get update && sudo apt-get install -y docker.io docker-compose git python3 python3-pip nginx"

echo [Step 5] Cloning repository...
ssh -i %KEY_FILE% %SERVER_USER%@%SERVER_IP% "cd ~/monsta-v7 && rm -rf monstas7 && git clone https://github.com/loadstar0723/monstas7.git"

echo [Step 6] Setting up environment...
ssh -i %KEY_FILE% %SERVER_USER%@%SERVER_IP% "cd ~/monsta-v7/monstas7 && echo 'PORT=8507' > .env"

echo [Step 7] Starting Docker containers...
ssh -i %KEY_FILE% %SERVER_USER%@%SERVER_IP% "cd ~/monsta-v7/monstas7 && sudo docker-compose up -d"

echo [Step 8] Checking deployment status...
ssh -i %KEY_FILE% %SERVER_USER%@%SERVER_IP% "sudo docker ps && curl -I http://localhost:8507"

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Access URLs:
echo   - Direct: http://%SERVER_IP%:8507
echo   - SSH: ssh -i %KEY_FILE% %SERVER_USER%@%SERVER_IP%
echo.
pause
exit /b 0

:putty_deploy
echo.
echo Using PuTTY for deployment...
echo Please use PuTTY with the following settings:
echo   Host: %SERVER_IP%
echo   Port: 22
echo   Auth: monsta-aws.ppk
echo.
echo Then run these commands manually:
echo   1. mkdir -p ~/monsta-v7
echo   2. cd ~/monsta-v7
echo   3. git clone https://github.com/loadstar0723/monstas7.git
echo   4. cd monstas7
echo   5. sudo docker-compose up -d
echo.
pause