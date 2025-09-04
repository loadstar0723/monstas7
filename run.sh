#!/bin/bash

echo "Starting MONSTA Trading Platform..."
echo "====================================="
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "Virtual environment created."
    echo ""
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt --quiet
echo "Dependencies installed."
echo ""

# Run streamlit app
echo "Starting Streamlit application..."
echo "====================================="
echo "Access the application at: http://localhost:8501"
echo "Press Ctrl+C to stop the server"
echo ""
streamlit run app.py