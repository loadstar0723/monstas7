# MONSTA 배포 문제 해결 스크립트
# AWS 서버에 직접 접속하여 문제 해결

Write-Host "🚀 MONSTA 배포 문제 해결 시작..." -ForegroundColor Cyan

# 서버 정보
$SERVER_IP = "13.209.84.93"
$SERVER_USER = "ubuntu"
$KEY_PATH = "C:\monsta\monstas7\monsta-key.pem"

# SSH 키 권한 확인
if (Test-Path $KEY_PATH) {
    Write-Host "✅ SSH 키 파일 발견" -ForegroundColor Green
} else {
    Write-Host "❌ SSH 키 파일을 찾을 수 없습니다!" -ForegroundColor Red
    exit 1
}

# 서버에서 실행할 명령
$sshCommands = @'
set -e
echo "🔍 현재 상태 확인..."
echo "=== 프로세스 확인 ==="
ps aux | grep -E "node|npm|next" | grep -v grep || echo "Node 프로세스 없음"

echo -e "\n=== 포트 확인 ==="
sudo netstat -tlnp | grep -E "3000|80" || echo "포트 사용 없음"

echo -e "\n=== 기존 프로세스 정리 ==="
sudo killall -9 node npm npx 2>/dev/null || true
sudo pkill -9 -f "node|npm|next" 2>/dev/null || true
sleep 2

echo -e "\n=== 프로젝트 디렉토리 확인 ==="
cd /home/ubuntu/monstas7
pwd
git status

echo -e "\n=== 최신 코드 가져오기 ==="
git pull origin master

echo -e "\n=== Frontend 빌드 ==="
cd frontend
rm -rf .next node_modules package-lock.json

echo -e "\n=== 환경 변수 설정 ==="
cat > .env.local << 'ENVEOF'
NEXTAUTH_SECRET=monstas7-secret-key-2024-production-secure
NEXTAUTH_URL=http://13.209.84.93:3000
DATABASE_URL="file:./dev.db"
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
ENVEOF

echo -e "\n=== 의존성 설치 ==="
npm install

echo -e "\n=== Prisma 클라이언트 생성 ==="
npx prisma generate

echo -e "\n=== 프로덕션 빌드 ==="
npm run build

echo -e "\n=== PM2로 앱 시작 ==="
# PM2 설치 확인
if ! command -v pm2 &> /dev/null; then
    echo "PM2 설치..."
    sudo npm install -g pm2
fi

# 기존 PM2 프로세스 중지
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# 새로운 PM2 프로세스 시작
pm2 start npm --name "monstas7" -- start
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu

echo -e "\n=== 최종 확인 ==="
echo "프로세스 상태:"
pm2 status

echo -e "\n포트 상태:"
sudo netstat -tlnp | grep 3000

echo -e "\n연결 테스트:"
curl -I http://localhost:3000 || echo "로컬 연결 실패"

echo -e "\n=== AWS 보안 그룹 확인 필요 ==="
echo "AWS 콘솔에서 다음을 확인하세요:"
echo "1. EC2 > 보안 그룹 > 인바운드 규칙"
echo "2. 포트 3000에 대해 0.0.0.0/0 허용 확인"
echo "3. 포트 80에 대해 0.0.0.0/0 허용 확인"

echo -e "\n✅ 배포 스크립트 완료!"
echo "접속 주소: http://13.209.84.93:3000"
'@

# SSH 명령 실행
Write-Host "`n🔧 서버에 접속하여 배포 문제 해결 중..." -ForegroundColor Yellow

# PowerShell에서 SSH 실행 (Windows 10 이상에서는 내장 SSH 사용 가능)
try {
    ssh -i $KEY_PATH -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}" $sshCommands
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n🎉 배포가 성공적으로 완료되었습니다!" -ForegroundColor Green
        Write-Host "🌐 사이트: http://$SERVER_IP`:3000" -ForegroundColor Cyan
        Write-Host "⏱️  1-2분 후 사이트를 새로고침하세요." -ForegroundColor Yellow
        Write-Host "`n⚠️  만약 여전히 접속이 안 되면:" -ForegroundColor Yellow
        Write-Host "1. AWS 콘솔에서 보안 그룹 확인" -ForegroundColor White
        Write-Host "2. 인바운드 규칙에 포트 3000 추가 (소스: 0.0.0.0/0)" -ForegroundColor White
        Write-Host "3. 인스턴스 재부팅 고려" -ForegroundColor White
    } else {
        Write-Host "`n❌ 배포 중 오류가 발생했습니다." -ForegroundColor Red
        Write-Host "위의 로그를 확인하세요." -ForegroundColor Yellow
    }
} catch {
    Write-Host "`n❌ SSH 연결 실패" -ForegroundColor Red
    Write-Host "다음을 확인하세요:" -ForegroundColor Yellow
    Write-Host "1. SSH 클라이언트가 설치되어 있는지 확인" -ForegroundColor White
    Write-Host "2. SSH 키 파일 권한 확인" -ForegroundColor White
    Write-Host "3. 서버 IP와 보안 그룹 설정 확인" -ForegroundColor White
}