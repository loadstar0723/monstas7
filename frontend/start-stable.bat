@echo off
echo ========================================
echo MONSTA 안정적인 개발 서버 시작 (포트 3002)
echo ========================================
echo.

REM 메모리 최적화 설정
set NODE_OPTIONS=--max-old-space-size=8192

REM 기존 Node 프로세스 정리
echo 기존 프로세스 정리 중...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

REM PM2가 설치되어 있는지 확인
npx pm2 -v >nul 2>&1
if %errorlevel% neq 0 (
    echo PM2 설치 중...
    npm install -g pm2
)

REM 기존 PM2 프로세스 정리
echo PM2 프로세스 정리 중...
npx pm2 kill >nul 2>&1
timeout /t 2 >nul

REM 로그 디렉토리 생성
if not exist logs mkdir logs

REM PM2로 서버 시작
echo 개발 서버 시작 중 (포트 3002)...
npx pm2 start ecosystem.config.js --no-daemon

REM PM2 상태 확인
timeout /t 3 >nul
npx pm2 status

echo.
echo ========================================
echo 서버가 안정적으로 시작되었습니다!
echo URL: http://localhost:3002
echo ========================================
echo.
echo 서버 관리 명령어:
echo - 로그 보기: pm2 logs monsta-dev
echo - 상태 확인: pm2 status
echo - 서버 재시작: pm2 restart monsta-dev
echo - 서버 중지: pm2 stop monsta-dev
echo - 모니터링: pm2 monit
echo ========================================
echo.
echo 안정성 개선 사항:
echo - 메모리 8GB로 증가
echo - 자동 재시작 설정
echo - 크래시 복구 개선
echo - 포트 3002로 변경 (충돌 방지)
echo ========================================
echo.

REM 브라우저 열기
timeout /t 3 >nul
start http://localhost:3002/technical/indicators

REM 로그 모니터링
npx pm2 logs monsta-dev --lines 20