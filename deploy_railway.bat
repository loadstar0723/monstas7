@echo off
echo ========================================
echo   MONSTA Platform - Railway Deployment
echo ========================================
echo.

REM Check Railway CLI
railway --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Railway CLI...
    npm install -g @railway/cli
)

REM Login to Railway
echo Please login to Railway:
railway login

REM Create new project
echo Creating Railway project...
railway init

REM Link to existing project (if needed)
REM railway link

REM Set environment variables
echo Setting environment variables...
railway variables set PORT=8501
railway variables set DATABASE_URL=postgresql://monsta_user:your_password@postgres:5432/monsta_db
railway variables set REDIS_URL=redis://redis:6379
railway variables set BINANCE_API_KEY=%BINANCE_API_KEY%
railway variables set BINANCE_API_SECRET=%BINANCE_API_SECRET%

REM Deploy
echo Deploying to Railway...
railway up

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Your app is being deployed to Railway.
echo Check the deployment status at: https://railway.app/dashboard
echo.
pause