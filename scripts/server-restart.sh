#!/bin/bash

# 서버 재시작 스크립트
echo "🔄 서버 재시작 시작..."

# 1. 기존 프로세스 정리
echo "1. 기존 프로세스 정리 중..."
pm2 kill
pkill -f node
pkill -f npm
sleep 2

# 2. 프로젝트 디렉토리로 이동
cd ~/monstas7 || exit 1

# 3. 최신 코드 가져오기
echo "2. 최신 코드 가져오기..."
git pull origin master

# 4. Frontend 디렉토리로 이동
cd frontend || exit 1

# 5. 환경 변수 설정
echo "3. 환경 변수 설정..."
cat > .env.local << 'EOF'
NEXTAUTH_SECRET=monstas7-secret-key-2024-production-secure
NEXTAUTH_URL=http://13.209.84.93:3000
DATABASE_URL="file:./dev.db"
NODE_ENV=production
EOF

# 6. node_modules 정리 및 재설치
echo "4. 의존성 재설치..."
rm -rf node_modules package-lock.json
npm install

# 7. Prisma 클라이언트 생성
echo "5. Prisma 클라이언트 생성..."
npx prisma generate

# 8. 프로덕션 빌드
echo "6. 프로덕션 빌드..."
npm run build

# 9. PM2로 시작
echo "7. PM2로 서버 시작..."
cd ..
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 10. 상태 확인
echo "8. 서버 상태 확인..."
sleep 10
pm2 status
pm2 logs --lines 20

echo "✅ 서버 재시작 완료!"
echo "🌐 접속 주소: http://13.209.84.93:3000"