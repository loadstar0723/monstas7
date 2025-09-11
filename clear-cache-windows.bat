@echo off
REM Windows에서 SSH로 서버 캐시 정리 실행

echo 🧹 MONSTA 프로덕션 서버 캐시 정리...
echo.
echo AWS EC2 서버 (13.209.84.93)에 SSH로 접속하여 캐시를 정리합니다.
echo.
echo 다음 명령어를 복사하여 수동으로 실행하세요:
echo.
echo 1. SSH 접속:
echo    ssh ubuntu@13.209.84.93
echo.
echo 2. 캐시 정리 스크립트 실행:
echo    cd /home/ubuntu/monstas7
echo    chmod +x clear-server-cache.sh
echo    ./clear-server-cache.sh
echo.
echo 또는 한 줄로:
echo    ssh ubuntu@13.209.84.93 "cd /home/ubuntu/monstas7 && chmod +x clear-server-cache.sh && ./clear-server-cache.sh"
echo.
pause