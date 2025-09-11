@echo off
chcp 65001 >nul
echo 🚨 MONSTA toFixed 에러 즉시 해결
echo.
echo 📋 아래 SSH 명령어를 복사해서 실행하세요:
echo.
echo ssh ubuntu@13.209.84.93 "cd /home/ubuntu/monstas7 && pm2 kill && cd frontend && rm -rf .next node_modules/.cache && cd .. && pm2 restart ecosystem.config.js"
echo.
echo ===============================================
echo.
echo 🌐 브라우저 캐시도 삭제하세요:
echo 1. Ctrl + Shift + Delete
echo 2. 모든 캐시 삭제
echo 3. 시크릿 모드로 테스트
echo.
echo 📍 테스트 URL: http://13.209.84.93:3000
echo.
pause