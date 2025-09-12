#!/bin/bash

# 수동 배포 스크립트
echo "🚀 수동 배포 시작..."

# 서버 정보
SERVER="13.209.84.93"
USER="ubuntu"

# SSH 명령어로 직접 배포
ssh -o StrictHostKeyChecking=no $USER@$SERVER << 'ENDSSH'
  echo "📦 서버에서 배포 시작..."
  
  # 프로젝트 디렉토리
  cd ~/monstas7 || exit 1
  
  # 최신 코드 가져오기
  echo "📥 최신 코드 가져오는 중..."
  git fetch origin master
  git reset --hard origin/master
  
  # Frontend로 이동
  cd frontend
  
  # 패키지 설치
  echo "📦 패키지 설치 중..."
  npm install
  
  # Prisma 생성
  echo "🔧 Prisma 생성 중..."
  npx prisma generate
  
  # 빌드
  echo "🔨 빌드 중..."
  npm run build
  
  # PM2 재시작
  echo "🔄 PM2 재시작 중..."
  pm2 restart monsta-prod || pm2 start npm --name "monsta-prod" -- start
  
  # 상태 확인
  pm2 status
  
  echo "✅ 배포 완료!"
ENDSSH

echo "🌐 배포 완료: http://13.209.84.93:3000"
