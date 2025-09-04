#!/bin/bash

# MONSTA Trading Platform Server Startup Script

echo "========================================"
echo "   MONSTA Trading Platform Server"
echo "========================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Functions
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed"
    exit 1
fi

# Check PostgreSQL
if ! pg_isready -h localhost -p 5432 &> /dev/null; then
    print_warning "PostgreSQL is not running. Starting Docker services..."
    docker-compose up -d postgres redis
    sleep 10
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install/Update dependencies
echo "Installing dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt

# Initialize database if needed
echo "Checking database..."
python3 -c "from scripts.init_database import main; main()" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Initializing database..."
    python3 scripts/init_database.py
fi

# Export environment variables
export STREAMLIT_SERVER_PORT=8501
export STREAMLIT_SERVER_ADDRESS=0.0.0.0
export STREAMLIT_SERVER_HEADLESS=true
export STREAMLIT_BROWSER_GATHER_USAGE_STATS=false

echo ""
echo "========================================"
echo "   Starting MONSTA Platform..."
echo "========================================"
echo ""
echo "Server will be available at:"
echo "  - Local: http://localhost:8501"
echo "  - Network: http://$(hostname -I | awk '{print $1}'):8501"
echo ""
echo "Press Ctrl+C to stop the server"
echo "========================================"
echo ""

# Start Streamlit
streamlit run app.py \
    --server.port=8501 \
    --server.address=0.0.0.0 \
    --server.headless=true