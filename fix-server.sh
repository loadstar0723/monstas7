#!/bin/bash

echo "🚨 서버 직접 접속 복구 스크립트"
echo "================================"

# SSH 키 파일 경로 (GitHub Secrets에 저장된 키)
SSH_KEY_PATH="~/.ssh/aws-key.pem"

# 서버 정보
SERVER_IP="13.209.84.93"
SERVER_USER="ubuntu"

# SSH 명령 실행 함수
execute_ssh() {
    ssh -o StrictHostKeyChecking=no -i "$SSH_KEY_PATH" "$SERVER_USER@$SERVER_IP" "$1"
}

echo "📡 서버 접속 중..."

# 1. 프로세스 정리
echo "1. 모든 Node 프로세스 종료..."
execute_ssh "pm2 kill; sudo killall -9 node npm 2>/dev/null || true"

# 2. 포트 해제
echo "2. 포트 3000 강제 해제..."
execute_ssh "sudo fuser -k 3000/tcp 2>/dev/null || true"

# 3. 프로젝트 디렉토리 이동
echo "3. 프로젝트 디렉토리로 이동..."
execute_ssh "cd ~/monstas7/frontend || cd ~/monsta-v7/monstas7/frontend || exit 1"

# 4. Git 최신 코드
echo "4. 최신 코드 가져오기..."
execute_ssh "cd ~/monstas7/frontend && git fetch && git reset --hard origin/master"

# 5. 의존성 재설치
echo "5. 의존성 재설치..."
execute_ssh "cd ~/monstas7/frontend && rm -rf node_modules package-lock.json && npm install"

# 6. 환경 변수 설정
echo "6. 환경 변수 설정..."
execute_ssh "cd ~/monstas7/frontend && cat > .env.local << 'EOF'
NEXTAUTH_SECRET=monstas7-secret-key-2024-production-secure
NEXTAUTH_URL=http://13.209.84.93:3000
NODE_ENV=production
DATABASE_URL=\"file:./prisma/dev.db\"
EOF"

# 7. Prisma 생성
echo "7. Prisma 생성..."
execute_ssh "cd ~/monstas7/frontend && npx prisma generate"

# 8. 서버 시작
echo "8. PM2로 서버 시작..."
execute_ssh "cd ~/monstas7/frontend && PORT=3000 HOST=0.0.0.0 pm2 start npm --name monsta-prod -- run dev"

# 9. PM2 저장
echo "9. PM2 설정 저장..."
execute_ssh "pm2 save && pm2 startup"

# 10. 상태 확인
echo "10. 서버 상태 확인..."
execute_ssh "pm2 status && netstat -tlnp | grep 3000"

echo "✅ 복구 완료!"
echo "🌐 접속 주소: http://13.209.84.93:3000"