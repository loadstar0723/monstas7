# MONSTA 완전 배포 해결 스크립트
Write-Host "🚀 MONSTA 완전 배포 해결 시작..." -ForegroundColor Cyan

# 서버 정보
$SERVER_IP = "13.209.84.93"
$SERVER_USER = "ubuntu"
$KEY_PATH = "C:\monsta\monstas7\monsta-key.pem"

# SSH 명령
$sshCommands = @'
#!/bin/bash
set -x  # 모든 명령 출력

echo "🔧 시스템 업데이트 및 필수 패키지 설치..."
sudo apt update -y
sudo apt install -y net-tools curl git build-essential

echo -e "\n🔍 Node.js 버전 확인 및 설치..."
if ! command -v node &> /dev/null; then
    echo "Node.js 설치 필요..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

node -v
npm -v

echo -e "\n🧹 기존 프로세스 정리..."
sudo killall -9 node npm npx 2>/dev/null || true
for port in 3000 80; do
    sudo fuser -k $port/tcp 2>/dev/null || true
done
sleep 2

echo -e "\n📂 프로젝트 디렉토리로 이동..."
cd /home/ubuntu
if [ ! -d "monstas7" ]; then
    echo "프로젝트 클론..."
    git clone https://github.com/loadstar0723/monstas7.git
fi

cd monstas7
git pull origin master

echo -e "\n🏗️ Frontend 설정..."
cd frontend

# 기존 빌드 및 모듈 삭제
rm -rf .next node_modules package-lock.json

# 환경 변수 설정
echo -e "\n🔐 환경 변수 설정..."
cat > .env.local << 'EOF'
NEXTAUTH_SECRET=monstas7-secret-key-2024-production-secure
NEXTAUTH_URL=http://13.209.84.93:3000
DATABASE_URL="file:./dev.db"
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
EOF

# 패키지 설치
echo -e "\n📦 패키지 설치..."
npm install --legacy-peer-deps

# Prisma 설정
echo -e "\n🗄️ Prisma 설정..."
npx prisma generate

# 빌드
echo -e "\n🏗️ 프로덕션 빌드..."
npm run build

# PM2 설치 및 설정
echo -e "\n⚙️ PM2 설정..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

# 기존 PM2 프로세스 정리
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# ecosystem.config.js 생성
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'monstas7',
    script: 'npm',
    args: 'start',
    cwd: '/home/ubuntu/monstas7/frontend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '0.0.0.0'
    }
  }]
}
EOF

# PM2로 시작
echo -e "\n🚀 애플리케이션 시작..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu

# 최종 확인
echo -e "\n✅ 상태 확인..."
pm2 status

echo -e "\n🔍 포트 확인..."
sudo netstat -tlnp | grep 3000 || echo "포트 3000 사용 안함"

echo -e "\n🌐 연결 테스트..."
sleep 5
curl -I http://localhost:3000 || echo "아직 시작 중..."

# PM2 로그 확인
echo -e "\n📋 애플리케이션 로그..."
pm2 logs --lines 20

echo -e "\n✅ 배포 완료!"
echo "=========================================="
echo "접속 주소: http://13.209.84.93:3000"
echo "=========================================="
echo ""
echo "⚠️  접속이 안 되면 AWS 콘솔에서 확인:"
echo "1. EC2 > 인스턴스 > 보안 그룹"
echo "2. 인바운드 규칙 편집"
echo "3. 다음 규칙 추가:"
echo "   - 유형: 사용자 지정 TCP"
echo "   - 포트: 3000"
echo "   - 소스: 0.0.0.0/0"
echo ""
echo "PM2 명령어:"
echo "- pm2 logs : 로그 보기"
echo "- pm2 restart all : 재시작"
echo "- pm2 status : 상태 확인"
'@

# SSH 실행
Write-Host "`n🔧 서버에 접속하여 완전 배포 중..." -ForegroundColor Yellow

try {
    ssh -i $KEY_PATH -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}" $sshCommands
    
    Write-Host "`n🎉 배포 스크립트 실행 완료!" -ForegroundColor Green
    Write-Host "`n다음 단계:" -ForegroundColor Yellow
    Write-Host "1. 브라우저에서 http://13.209.84.93:3000 접속 시도" -ForegroundColor White
    Write-Host "2. 접속이 안 되면 AWS 보안 그룹에서 포트 3000 열기" -ForegroundColor White
    Write-Host "3. PM2 로그 확인: ssh로 접속 후 'pm2 logs' 실행" -ForegroundColor White
} catch {
    Write-Host "`n❌ SSH 연결 오류" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
}