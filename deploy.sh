#!/bin/bash

echo "🚀 수동 배포 시작..."

# 서버 정보
SERVER_IP="15.165.105.250"
SERVER_USER="ubuntu"
PROJECT_PATH="~/monstas7"

echo "📦 서버에 연결 중..."

# SSH 명령어로 서버에 접속하여 배포
ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'EOF'
  echo "🔄 프로젝트 업데이트 중..."
  cd ~/monstas7
  
  # Git pull
  git pull origin master
  
  # Frontend 빌드
  echo "🏗️ Frontend 빌드 중..."
  cd frontend
  npm install
  npm run build
  
  # PM2로 재시작
  echo "♻️ 서버 재시작 중..."
  pm2 restart monsta-prod || pm2 start npm --name monsta-prod -- start
  
  echo "✅ 배포 완료!"
  pm2 status
EOF

echo "🎉 배포가 완료되었습니다!"