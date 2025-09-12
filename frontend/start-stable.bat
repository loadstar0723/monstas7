@echo off
echo ========================================
echo MONSTA 안정적인 개발 서버 시작
echo ========================================
echo.

REM 메모리 최적화 설정
set NODE_OPTIONS=--max-old-space-size=4096

REM PM2가 설치되어 있는지 확인
npx pm2 -v >nul 2>&1
if %errorlevel% neq 0 (
    echo PM2 설치 중...
    npm install -g pm2
)

REM 기존 PM2 프로세스 정리
echo 기존 서버 정리 중...
npx pm2 delete monsta-dev >nul 2>&1

REM PM2로 서버 시작
echo 개발 서버 시작 중...
npx pm2 start ecosystem.config.js

REM PM2 로그 실시간 보기
echo.
echo ========================================
echo 서버가 시작되었습니다!
echo URL: http://localhost:3001
echo ========================================
echo 로그를 보려면: pm2 logs
echo 서버 상태 확인: pm2 status
echo 서버 중지: pm2 stop monsta-dev
echo 서버 재시작: pm2 restart monsta-dev
echo ========================================
echo.

REM 브라우저 열기
start http://localhost:3001/technical/indicators

REM 로그 모니터링
npx pm2 logs --lines 10