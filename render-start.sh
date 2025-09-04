#!/usr/bin/env bash
# Render.com start script

# Start Streamlit app
streamlit run app.py \
  --server.port=$PORT \
  --server.address=0.0.0.0 \
  --server.headless=true \
  --browser.serverAddress=0.0.0.0 \
  --browser.gatherUsageStats=false