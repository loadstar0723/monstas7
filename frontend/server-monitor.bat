@echo off
echo ========================================
echo MONSTA 서버 모니터링 도구
echo ========================================
echo.

:menu
echo 1. PM2 상태 확인
echo 2. PM2 로그 보기
echo 3. 서버 재시작
echo 4. 서버 중지
echo 5. 서버 다시 시작
echo 6. 메모리 사용량 확인
echo 7. 실시간 모니터링
echo 8. 종료
echo.
set /p choice="선택하세요 (1-8): "

if "%choice%"=="1" goto status
if "%choice%"=="2" goto logs
if "%choice%"=="3" goto restart
if "%choice%"=="4" goto stop
if "%choice%"=="5" goto reload
if "%choice%"=="6" goto memory
if "%choice%"=="7" goto monitor
if "%choice%"=="8" goto exit

:status
echo.
echo === PM2 상태 ===
npx pm2 status
echo.
pause
goto menu

:logs
echo.
echo === 최근 로그 (50줄) ===
npx pm2 logs monsta-dev --lines 50
echo.
pause
goto menu

:restart
echo.
echo 서버를 재시작합니다...
npx pm2 restart monsta-dev
echo.
pause
goto menu

:stop
echo.
echo 서버를 중지합니다...
npx pm2 stop monsta-dev
echo.
pause
goto menu

:reload
echo.
echo 서버를 다시 시작합니다...
npx pm2 reload monsta-dev
echo.
pause
goto menu

:memory
echo.
echo === 메모리 사용량 ===
npx pm2 info monsta-dev
echo.
pause
goto menu

:monitor
echo.
echo === 실시간 모니터링 (Ctrl+C로 종료) ===
npx pm2 monit
goto menu

:exit
echo.
echo 모니터링을 종료합니다.
exit