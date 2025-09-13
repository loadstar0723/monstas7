@echo off
echo ========================================
echo MONSTA 클린 시작 - 포트 3002
echo ========================================
echo.

REM 프로세스 정리
echo 기존 프로세스 정리 중...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

REM 캐시 완전 삭제
echo 캐시 삭제 중...
if exist .next rd /s /q .next
if exist node_modules\.cache rd /s /q node_modules\.cache

REM 환경변수 설정
set NODE_ENV=development
set NODE_OPTIONS=--max-old-space-size=8192
set NEXT_TELEMETRY_DISABLED=1

echo.
echo 서버를 시작합니다...
echo URL: http://localhost:3002
echo.

npx next dev -p 3002