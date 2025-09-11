# PowerShell 스크립트: MONSTA 서버 긴급 수정
Write-Host "🚨 MONSTA 서버 긴급 수정 시작..." -ForegroundColor Red
Write-Host ""

# GitHub Actions 배포 완료 대기
Write-Host "⏳ GitHub Actions 배포 대기 중... (120초)" -ForegroundColor Yellow
Write-Host "   https://github.com/loadstar0723/monstas7/actions" -ForegroundColor Cyan
Start-Sleep -Seconds 120

# 서버 상태 확인
Write-Host ""
Write-Host "📊 서버 상태 확인..." -ForegroundColor Green
$response = Invoke-WebRequest -Uri "http://13.209.84.93:3000" -TimeoutSec 10 -ErrorAction SilentlyContinue
if ($response.StatusCode -eq 200) {
    Write-Host "✅ 서버 응답 정상" -ForegroundColor Green
} else {
    Write-Host "❌ 서버 응답 없음" -ForegroundColor Red
}

# SSH 명령어 표시
Write-Host ""
Write-Host "🔧 서버 캐시 정리 명령어:" -ForegroundColor Yellow
Write-Host ""

$sshCommand = @"
ssh ubuntu@13.209.84.93 "
echo '🧹 캐시 정리 시작...' &&
cd /home/ubuntu/monstas7 &&
echo '1. PM2 중지...' &&
pm2 kill &&
echo '2. 캐시 삭제...' &&
cd frontend &&
rm -rf .next &&
rm -rf node_modules/.cache &&
rm -rf .npm &&
echo '3. PM2 재시작...' &&
cd .. &&
pm2 start ecosystem.config.js &&
echo '✅ 완료! 로그 확인:' &&
pm2 logs --lines 30
"
"@

Write-Host $sshCommand -ForegroundColor Cyan
Write-Host ""

# 클립보드에 복사
$sshCommand | Set-Clipboard
Write-Host "📋 명령어가 클립보드에 복사되었습니다!" -ForegroundColor Green
Write-Host ""

# 브라우저 캐시 정리 안내
Write-Host "🌐 브라우저 캐시 정리:" -ForegroundColor Yellow
Write-Host "1. Chrome/Edge: Ctrl + Shift + Delete" -ForegroundColor White
Write-Host "2. '캐시된 이미지 및 파일' 선택" -ForegroundColor White
Write-Host "3. '전체 기간' 선택 후 삭제" -ForegroundColor White
Write-Host "4. 브라우저 재시작" -ForegroundColor White
Write-Host ""

# 테스트 URL 열기 제안
Write-Host "🧪 테스트:" -ForegroundColor Yellow
Write-Host "시크릿 모드로 접속: http://13.209.84.93:3000" -ForegroundColor Cyan
Write-Host ""

Read-Host "엔터를 눌러 종료..."