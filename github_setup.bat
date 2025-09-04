@echo off
echo ========================================
echo   MONSTA - GitHub Setup Helper
echo ========================================
echo.
echo GitHub Device 인증 코드: A4BC-3749
echo.
echo 1단계: 브라우저에서 다음 URL 접속:
echo https://github.com/login/device
echo.
echo 2단계: 코드 입력: A4BC-3749
echo.
echo 3단계: 인증 완료 후 아래 명령 실행:
echo.
echo gh repo create monstas7 --public --push
echo.
echo 또는 수동으로 푸시:
echo.
echo git remote add origin https://github.com/YOUR_USERNAME/monstas7.git
echo git push -u origin master
echo.
echo ========================================
echo.
echo 현재 앱 상태:
echo - Streamlit: http://localhost:8501 (실행중)
echo - PostgreSQL: localhost:5432 (실행중)
echo - Redis: localhost:6379 (실행중)
echo.
pause