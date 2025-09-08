#!/bin/bash

# 프로덕션 서버 시작 스크립트
echo "🚀 프로덕션 서버 시작..."

# 환경 변수 설정
export NODE_ENV=production
export PORT=3000
export HOST=0.0.0.0

# Frontend 디렉토리로 이동
cd /home/ubuntu/monstas7/frontend || {
    echo "❌ Frontend 디렉토리를 찾을 수 없습니다!"
    exit 1
}

# node_modules 확인
if [ ! -d "node_modules" ]; then
    echo "📦 의존성 설치 중..."
    npm install
fi

# .next 빌드 확인
if [ ! -d ".next" ]; then
    echo "🔨 프로덕션 빌드 중..."
    npm run build
fi

# 환경 파일 확인
if [ ! -f ".env.local" ]; then
    echo "⚙️ 환경 변수 파일 생성 중..."
    cat > .env.local << EOF
NEXTAUTH_SECRET=monstas7-secret-key-2024-production-secure
NEXTAUTH_URL=http://13.209.84.93:3000
DATABASE_URL="file:./dev.db"
EOF
fi

# 서버 시작
echo "✅ 서버 시작..."
npm start