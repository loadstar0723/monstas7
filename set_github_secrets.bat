@echo off
echo ============================================
echo GitHub Secrets 설정 도우미
echo ============================================
echo.
echo 이제 브라우저에서 GitHub Secrets 페이지를 열겠습니다.
echo.
echo 다음 정보를 복사해서 사용하세요:
echo.
echo [Secret 1]
echo Name: DEPLOY_TELEGRAM_BOT_TOKEN
echo Value: 8398982269:AAELZBJUntjPPo-SV80eLxdLp37K79aR9Qc
echo.
echo [Secret 2]
echo Name: DEPLOY_TELEGRAM_CHAT_ID
echo Value: 6437449819
echo.
echo ============================================
echo.
pause
echo 브라우저를 여는 중...
start https://github.com/loadstar0723/monstas7/settings/secrets/actions/new
timeout /t 3 >nul
start https://github.com/loadstar0723/monstas7/settings/secrets/actions/new
echo.
echo 위 페이지에서:
echo 1. 첫 번째 페이지에 DEPLOY_TELEGRAM_BOT_TOKEN 입력
echo 2. 두 번째 페이지에 DEPLOY_TELEGRAM_CHAT_ID 입력
echo.
pause