#!/usr/bin/env bash
# Render.com build script

set -o errexit

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Initialize database
python scripts/init_database.py

echo "Build completed successfully!"