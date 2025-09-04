@echo off
echo ========================================
echo   MONSTA Trading Platform Server
echo ========================================
echo.

REM Check Python installation
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check PostgreSQL
pg_isready -h localhost -p 5432 >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] PostgreSQL is not running. Starting Docker services...
    docker-compose up -d postgres redis
    timeout /t 10 /nobreak >nul
)

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install/Update dependencies
echo Installing dependencies...
pip install -q --upgrade pip
pip install -q -r requirements.txt

REM Initialize database if needed
echo Checking database...
python -c "from scripts.init_database import main; main()" 2>nul
if %errorlevel% neq 0 (
    echo Initializing database...
    python scripts/init_database.py
)

REM Set environment variables
set STREAMLIT_SERVER_PORT=8501
set STREAMLIT_SERVER_ADDRESS=0.0.0.0
set STREAMLIT_SERVER_HEADLESS=true
set STREAMLIT_BROWSER_GATHER_USAGE_STATS=false

echo.
echo ========================================
echo   Starting MONSTA Platform...
echo ========================================
echo.
echo Server will be available at:
echo   - Local: http://localhost:8501
echo   - Network: http://%COMPUTERNAME%:8501
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start Streamlit
streamlit run app.py --server.port=8501 --server.address=0.0.0.0 --server.headless=true

pause