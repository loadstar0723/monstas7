#!/bin/bash

# MONSTA 수동 배포 스크립트
# AWS 서버에 직접 배포할 때 사용

echo "🚀 MONSTA 수동 배포 시작..."

# 서버 정보
SERVER_IP="13.209.84.93"
SERVER_USER="ubuntu"
PROJECT_DIR="~/monstas7"

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 로컬에서 프로젝트 빌드 중...${NC}"

# Frontend 빌드
cd frontend
npm install
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 빌드 성공!${NC}"
else
    echo -e "${RED}❌ 빌드 실패! 에러를 확인하세요.${NC}"
    exit 1
fi

echo -e "${YELLOW}📤 서버로 파일 전송 중...${NC}"

# .next 폴더를 tar로 압축
tar -czf next-build.tar.gz .next package.json package-lock.json

# SCP로 서버에 전송 (SSH 키가 필요함)
scp -o StrictHostKeyChecking=no next-build.tar.gz ${SERVER_USER}@${SERVER_IP}:${PROJECT_DIR}/frontend/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 파일 전송 성공!${NC}"
else
    echo -e "${RED}❌ 파일 전송 실패! SSH 키를 확인하세요.${NC}"
    echo "SSH 키 설정 방법:"
    echo "1. AWS EC2 콘솔에서 키페어(.pem) 파일 다운로드"
    echo "2. ~/.ssh/ 폴더에 저장"
    echo "3. chmod 600 ~/.ssh/your-key.pem"
    echo "4. ssh-add ~/.ssh/your-key.pem"
    exit 1
fi

echo -e "${YELLOW}🔧 서버에서 배포 진행 중...${NC}"

# SSH로 서버에 접속해서 배포
ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
cd ~/monstas7

# Git pull
echo "📥 최신 코드 가져오기..."
git pull origin master

# Frontend 배포
cd frontend
echo "📦 빌드 파일 압축 해제..."
tar -xzf next-build.tar.gz
rm next-build.tar.gz

# 환경 변수 설정
echo "🔧 환경 변수 설정..."
cat > .env.local << 'EOF'
NEXTAUTH_SECRET=monstas7-secret-key-2024-production-secure
NEXTAUTH_URL=http://13.209.84.93:3000
DATABASE_URL="file:./dev.db"
EOF

# PM2 재시작
echo "🔄 PM2 프로세스 재시작..."
pm2 restart monsta-nextjs || pm2 start npm --name "monsta-nextjs" -- start
pm2 save

echo "✅ 배포 완료!"
ENDSSH

# 로컬 임시 파일 삭제
rm -f next-build.tar.gz

echo -e "${GREEN}🎉 배포가 성공적으로 완료되었습니다!${NC}"
echo -e "🌐 사이트: http://${SERVER_IP}:3000"
echo -e "⏱️  1-2분 후 사이트를 새로고침하세요."