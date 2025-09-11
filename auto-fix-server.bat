@echo off
echo 🚨 MONSTA 서버 자동 수정 시작...
echo.

REM GitHub에 최신 코드 푸시
echo 📤 GitHub에 최신 코드 푸시...
git add -A
git commit -m "🔥 긴급: toFixed 에러 최종 해결 - beforeInteractive 전략 적용"
git push origin master

echo.
echo ⏳ GitHub Actions 자동 배포 대기 중... (약 2-3분)
echo.

REM 서버 SSH 명령어 준비
echo 📋 서버 캐시 정리 명령어:
echo.
echo ssh ubuntu@13.209.84.93 "cd /home/ubuntu/monstas7 && pm2 kill && cd frontend && rm -rf .next node_modules/.cache && cd .. && pm2 start ecosystem.config.js && pm2 logs --lines 30"
echo.
echo 위 명령어를 복사하여 실행하거나,
echo 아래 PowerShell 명령어로 자동 실행:
echo.
echo powershell -Command "ssh ubuntu@13.209.84.93 'cd /home/ubuntu/monstas7 && pm2 kill && cd frontend && rm -rf .next node_modules/.cache && cd .. && pm2 start ecosystem.config.js'"
echo.

pause