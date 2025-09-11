@echo off
echo 🔍 MONSTA 배포 상태 확인...
echo.

echo 📊 GitHub Actions 상태 확인:
echo https://github.com/loadstar0723/monstas7/actions
echo.

echo 🌐 프로덕션 서버 확인:
echo http://13.209.84.93:3000
echo.

echo 🧪 테스트 방법:
echo 1. 브라우저 캐시 완전히 삭제 (Ctrl+Shift+Delete)
echo 2. 시크릿/프라이빗 모드로 접속
echo 3. 개발자 도구 (F12) 열고 Console 확인
echo 4. "[Emergency] Number safety patch applied" 메시지 확인
echo.

echo 💻 서버 로그 실시간 확인:
echo ssh ubuntu@13.209.84.93 "pm2 logs --lines 50"
echo.

pause