@echo off
echo Starting MONSTA Trading Platform...
echo =====================================
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    echo Virtual environment created.
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt --quiet
echo Dependencies installed.
echo.

REM Run streamlit app
echo Starting Streamlit application...
echo =====================================
echo Access the application at: http://localhost:8501
echo Press Ctrl+C to stop the server
echo.
streamlit run app.py