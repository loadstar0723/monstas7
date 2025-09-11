#!/bin/bash

# 프로덕션 서버 캐시 정리 스크립트
# AWS EC2 서버 (13.209.84.93)에서 실행

echo "🧹 MONSTA 프로덕션 서버 캐시 정리 시작..."

# 1. PM2 프로세스 중지
echo "📋 PM2 프로세스 상태 확인..."
pm2 status

echo "🛑 PM2 프로세스 중지..."
pm2 stop all

# 2. Next.js 캐시 삭제
echo "🗑️ Next.js 캐시 삭제..."
cd /home/ubuntu/monstas7/frontend

# .next 폴더 완전 삭제
if [ -d ".next" ]; then
    echo "📁 .next 폴더 삭제 중..."
    rm -rf .next
    echo "✅ .next 폴더 삭제 완료"
fi

# node_modules/.cache 삭제
if [ -d "node_modules/.cache" ]; then
    echo "📁 node_modules/.cache 삭제 중..."
    rm -rf node_modules/.cache
    echo "✅ node_modules/.cache 삭제 완료"
fi

# 3. 의존성 재설치
echo "📦 의존성 재설치..."
npm ci --production

# 4. 프로덕션 빌드
echo "🔨 프로덕션 빌드 시작..."
npm run build

# 5. PM2 프로세스 재시작
echo "🚀 PM2 프로세스 재시작..."
cd /home/ubuntu/monstas7
pm2 start ecosystem.config.js

# 6. PM2 로그 확인
echo "📋 PM2 상태 확인..."
pm2 status
pm2 logs --lines 10

# 7. 브라우저 캐시 무효화를 위한 버전 업데이트
echo "📝 버전 정보 업데이트..."
cd /home/ubuntu/monstas7/frontend
echo "CACHE_VERSION=$(date +%s)" >> .env.production

echo "✅ 캐시 정리 완료!"
echo "🌐 브라우저에서 다음을 수행하세요:"
echo "   - Ctrl+Shift+R (강제 새로고침)"
echo "   - 또는 시크릿/프라이빗 모드로 접속"
echo "   - 또는 브라우저 캐시 완전 삭제"