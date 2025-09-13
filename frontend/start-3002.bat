@echo off
echo ========================================
echo MONSTA 서버 시작 - 포트 3002 (안정화 버전)
echo ========================================
echo.

REM 환경변수 설정
set NODE_ENV=development
set NODE_OPTIONS=--max-old-space-size=8192
set NEXT_TELEMETRY_DISABLED=1

REM 기존 프로세스 정리
echo 기존 프로세스 정리 중...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 >nul

REM 포트 확인
netstat -ano | findstr :3002 >nul 2>&1
if %errorlevel%==0 (
    echo 포트 3002가 사용 중입니다. 정리 중...
    for /f "tokens=5" %%i in ('netstat -ano ^| findstr :3002') do (
        taskkill /F /PID %%i >nul 2>&1
    )
    timeout /t 2 >nul
)

REM 캐시 정리
echo 캐시 정리 중...
if exist .next\cache rd /s /q .next\cache >nul 2>&1
if exist logs mkdir logs

REM 개발 서버 시작
echo.
echo 개발 서버를 시작합니다...
echo URL: http://localhost:3002
echo.
echo 서버 로그:
echo ========================================
npx next dev -p 3002 -H 0.0.0.0

echo.
echo ========================================
echo 서버가 종료되었습니다.
echo ========================================
pause