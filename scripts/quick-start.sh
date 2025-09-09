#!/bin/bash

# MONSTA 빠른 시작 스크립트 (최소 명령어)
# 서버에서 복사-붙여넣기로 바로 실행 가능

echo "🚀 MONSTA 서버 빠른 시작"
echo "========================"

# 프로젝트 경로 설정
cd ~/monstas7 || cd ~/monsta-v7/monstas7 || { echo "프로젝트 없음. 클론 중..."; cd ~; git clone https://github.com/loadstar0723/monstas7.git; cd monstas7; }

# 최신 코드 가져오기
git pull origin master

# 기존 프로세스 종료
pm2 delete all 2>/dev/null || true
pkill -f node 2>/dev/null || true

# Frontend 빌드 및 시작
cd frontend
npm install --production
npx prisma generate
npm run build

# PM2로 시작
pm2 start npm --name "monsta" -- start
pm2 save

# 상태 확인
sleep 10
echo ""
echo "✅ 서버 시작 완료!"
echo "🌐 접속: http://13.209.84.93:3000"
echo "📋 로그: pm2 logs monsta"
echo ""
pm2 list