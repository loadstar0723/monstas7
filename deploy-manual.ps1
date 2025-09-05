# MONSTA 수동 배포 스크립트 (Windows PowerShell)
# AWS 서버에 직접 배포할 때 사용

Write-Host "🚀 MONSTA 수동 배포 시작..." -ForegroundColor Cyan

# 서버 정보
$SERVER_IP = "13.209.84.93"
$SERVER_USER = "ubuntu"
$KEY_PATH = "$env:USERPROFILE\.ssh\your-key.pem"  # SSH 키 경로 수정 필요

# 1. 로컬 빌드
Write-Host "`n📦 프론트엔드 빌드 중..." -ForegroundColor Yellow
Set-Location frontend
npm install
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 빌드 실패!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 빌드 성공!" -ForegroundColor Green

# 2. 빌드 파일 압축
Write-Host "`n📤 배포 파일 준비 중..." -ForegroundColor Yellow
Compress-Archive -Path .next, package.json, package-lock.json -DestinationPath deploy.zip -Force

# 3. SSH 키 확인
if (-not (Test-Path $KEY_PATH)) {
    Write-Host "`n❌ SSH 키를 찾을 수 없습니다!" -ForegroundColor Red
    Write-Host "다음 단계를 수행하세요:" -ForegroundColor Yellow
    Write-Host "1. AWS EC2 콘솔에서 키페어(.pem) 파일 다운로드"
    Write-Host "2. $env:USERPROFILE\.ssh\ 폴더에 저장"
    Write-Host "3. 이 스크립트의 KEY_PATH 변수 수정"
    exit 1
}

# 4. SCP로 파일 전송
Write-Host "`n📤 서버로 파일 전송 중..." -ForegroundColor Yellow
scp -i $KEY_PATH -o StrictHostKeyChecking=no deploy.zip "${SERVER_USER}@${SERVER_IP}:~/monstas7/frontend/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 파일 전송 실패!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 파일 전송 성공!" -ForegroundColor Green

# 5. SSH로 서버에서 배포 실행
Write-Host "`n🔧 서버에서 배포 진행 중..." -ForegroundColor Yellow

$sshCommands = @"
cd ~/monstas7
echo '📥 최신 코드 가져오기...'
git pull origin master

cd frontend
echo '📦 배포 파일 압축 해제...'
unzip -o deploy.zip
rm deploy.zip

echo '🔧 환경 변수 설정...'
cat > .env.local << 'EOF'
NEXTAUTH_SECRET=monstas7-secret-key-2024-production-secure
NEXTAUTH_URL=http://13.209.84.93:3000
DATABASE_URL="file:./dev.db"
EOF

echo '📦 Prisma 클라이언트 생성...'
npx prisma generate

echo '🔄 PM2 프로세스 재시작...'
pm2 restart monsta-nextjs || pm2 start npm --name 'monsta-nextjs' -- start
pm2 save

echo '✅ 배포 완료!'
"@

ssh -i $KEY_PATH -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}" $sshCommands

# 6. 정리
Remove-Item deploy.zip -Force -ErrorAction SilentlyContinue
Set-Location ..

Write-Host "`n🎉 배포가 성공적으로 완료되었습니다!" -ForegroundColor Green
Write-Host "🌐 사이트: http://$SERVER_IP`:3000" -ForegroundColor Cyan
Write-Host "⏱️  1-2분 후 사이트를 새로고침하세요." -ForegroundColor Yellow