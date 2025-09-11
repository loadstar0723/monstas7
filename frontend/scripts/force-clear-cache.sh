#!/bin/bash

# AWS EC2 서버 강제 캐시 정리 스크립트
# 13.209.84.93에서 실행

echo "🚨 MONSTA 프로덕션 서버 강제 캐시 정리 시작..."

# 1. 모든 Node 프로세스 종료
echo "🛑 모든 Node 프로세스 강제 종료..."
sudo pkill -f node
sudo pkill -f next
pm2 kill

# 2. 캐시 디렉토리 완전 삭제
echo "🗑️ 모든 캐시 디렉토리 삭제..."
cd /home/ubuntu/monstas7/frontend

# Next.js 관련 캐시 모두 삭제
rm -rf .next
rm -rf node_modules/.cache
rm -rf .npm
rm -rf .yarn/cache
rm -rf .pnpm-store

# 시스템 임시 파일 정리
sudo rm -rf /tmp/next-*
sudo rm -rf /tmp/npm-*

# 3. 패키지 재설치
echo "📦 패키지 완전 재설치..."
rm -rf node_modules
rm -f package-lock.json
npm cache clean --force
npm install

# 4. 환경변수 갱신
echo "🔧 환경변수 업데이트..."
echo "NEXT_BUILD_ID=$(date +%s)" >> .env.production
echo "CACHE_BUSTER=$(date +%s)" >> .env.production

# 5. 프로덕션 빌드
echo "🔨 새로운 프로덕션 빌드..."
NODE_ENV=production npm run build

# 6. PM2 재시작
echo "🚀 PM2로 앱 재시작..."
cd /home/ubuntu/monstas7
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 7. Nginx 캐시 정리 (있는 경우)
if [ -d "/var/cache/nginx" ]; then
    echo "🌐 Nginx 캐시 정리..."
    sudo rm -rf /var/cache/nginx/*
    sudo nginx -s reload
fi

# 8. CloudFlare 캐시 정리 요청 (API 키가 있는 경우)
# curl -X POST "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/purge_cache" \
#      -H "X-Auth-Email: YOUR_EMAIL" \
#      -H "X-Auth-Key: YOUR_API_KEY" \
#      -H "Content-Type: application/json" \
#      --data '{"purge_everything":true}'

echo "✅ 강제 캐시 정리 완료!"
echo ""
echo "🌐 클라이언트 측 조치:"
echo "1. 브라우저 캐시 완전 삭제 (Ctrl+Shift+Delete)"
echo "2. DNS 캐시 플러시: ipconfig /flushdns (Windows)"
echo "3. 시크릿/프라이빗 모드로 테스트"
echo ""
pm2 logs --lines 20