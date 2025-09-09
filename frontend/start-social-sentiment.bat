@echo off
echo.
echo ===========================================
echo MONSTA Social Sentiment - Real-time Server
echo ===========================================
echo.
echo Starting development server...
echo.
echo WebSocket connections: 
echo - Binance real-time prices
echo - Social media APIs (Twitter, Reddit) - TODO
echo - On-chain data (Etherscan) - TODO
echo.
echo Visit: http://localhost:3000/signals/social-sentiment
echo.

cd /d %~dp0
npx next dev -p 3000

pause