#!/bin/bash

# MONSTA 수동 배포 스크립트 - 서버 강제 시작
# AWS 서버: 13.209.84.93

echo "🚀 MONSTA 서버 수동 시작 스크립트"
echo "=========================================="
echo "시간: $(date)"
echo ""

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. 프로젝트 디렉토리 확인
echo -e "${BLUE}1️⃣ 프로젝트 디렉토리 확인...${NC}"
if [ -d "$HOME/monstas7" ]; then
    PROJECT_DIR="$HOME/monstas7"
elif [ -d "$HOME/monsta-v7/monstas7" ]; then
    PROJECT_DIR="$HOME/monsta-v7/monstas7"
else
    echo -e "${RED}❌ 프로젝트 디렉토리를 찾을 수 없습니다!${NC}"
    echo "Git 클론을 먼저 실행합니다..."
    cd $HOME
    git clone https://github.com/loadstar0723/monstas7.git
    PROJECT_DIR="$HOME/monstas7"
fi

echo -e "${GREEN}✅ 프로젝트 경로: $PROJECT_DIR${NC}"
cd $PROJECT_DIR

# 2. Git 최신 코드 가져오기
echo -e "\n${BLUE}2️⃣ 최신 코드 가져오기...${NC}"
git fetch origin master
git reset --hard origin/master
git pull origin master
echo -e "${GREEN}✅ 최신 코드 업데이트 완료${NC}"

# 3. 기존 프로세스 정리
echo -e "\n${BLUE}3️⃣ 기존 프로세스 정리...${NC}"
# PM2 프로세스 종료
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
# Node 프로세스 강제 종료
pkill -f "node" 2>/dev/null || true
pkill -f "npm" 2>/dev/null || true
# Python 프로세스 종료
pkill -f "uvicorn" 2>/dev/null || true
pkill -f "streamlit" 2>/dev/null || true
sleep 2
echo -e "${GREEN}✅ 기존 프로세스 정리 완료${NC}"

# 4. Frontend 설정
echo -e "\n${BLUE}4️⃣ Frontend 설정 중...${NC}"
cd $PROJECT_DIR/frontend

# 환경 변수 설정
cat > .env.local << 'EOF'
NEXTAUTH_SECRET=monstas7-secret-key-2024-production-secure
NEXTAUTH_URL=http://13.209.84.93:3000
NODE_ENV=production
DATABASE_URL="file:./prisma/dev.db"
NEXT_PUBLIC_API_URL=http://13.209.84.93:3000/api
GENERATE_SOURCEMAP=false
NEXT_PUBLIC_ENV=production
EOF

cp .env.local .env.production

# Node 모듈 설치
echo "Node 모듈 설치 중..."
npm install --production

# Prisma 클라이언트 생성
echo "Prisma 클라이언트 생성 중..."
npx prisma generate

# 빌드 캐시 삭제
rm -rf .next
rm -rf node_modules/.cache

# 프로덕션 빌드
echo -e "${YELLOW}⏳ 프로덕션 빌드 중... (2-3분 소요)${NC}"
npm run build

# 5. PM2로 서버 시작
echo -e "\n${BLUE}5️⃣ PM2로 서버 시작...${NC}"

# PM2 설치 확인
if ! command -v pm2 &> /dev/null; then
    echo "PM2 설치 중..."
    sudo npm install -g pm2
fi

# ecosystem.config.js 복사
if [ -f "$PROJECT_DIR/ecosystem.config.js" ]; then
    cp $PROJECT_DIR/ecosystem.config.js ./
fi

# PM2로 시작 (여러 방법 시도)
echo "PM2 시작 시도 중..."

# 방법 1: ecosystem.config.js 사용
if [ -f "ecosystem.config.js" ]; then
    pm2 start ecosystem.config.js
else
    # 방법 2: 직접 명령어 사용
    pm2 start npm --name "monsta-prod" -- start
fi

# PM2 자동 시작 설정
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu 2>/dev/null || true

# 6. Backend 시작 (FastAPI)
echo -e "\n${BLUE}6️⃣ Backend 시작...${NC}"
cd $PROJECT_DIR/backend

# Python 가상환경 확인
if [ ! -d "../venv" ]; then
    python3 -m venv ../venv
fi

source ../venv/bin/activate
pip install -r requirements.txt --quiet

# FastAPI 시작
nohup uvicorn main:app --host 0.0.0.0 --port 8000 --reload > backend.log 2>&1 &
echo -e "${GREEN}✅ Backend 시작 완료 (포트 8000)${NC}"

# 7. 헬스체크 (30초 대기)
echo -e "\n${BLUE}7️⃣ 서버 시작 대기 중...${NC}"
for i in {1..30}; do
    echo -n "."
    sleep 1
done
echo ""

# 8. 상태 확인
echo -e "\n${BLUE}8️⃣ 서버 상태 확인...${NC}"

# PM2 상태
echo -e "\n${YELLOW}PM2 프로세스 상태:${NC}"
pm2 list

# 포트 확인
echo -e "\n${YELLOW}포트 사용 현황:${NC}"
netstat -tlnp 2>/dev/null | grep -E "3000|8000" || lsof -i :3000,8000 2>/dev/null || ss -tlnp | grep -E "3000|8000"

# Frontend 헬스체크
echo -e "\n${YELLOW}Frontend 헬스체크:${NC}"
if curl -f -m 5 http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend 정상 작동 중${NC}"
else
    echo -e "${RED}❌ Frontend 응답 없음${NC}"
    echo "PM2 로그 확인:"
    pm2 logs monsta-prod --lines 20 --nostream
fi

# Backend 헬스체크
echo -e "\n${YELLOW}Backend 헬스체크:${NC}"
if curl -f -m 5 http://localhost:8000/api/v1/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend 정상 작동 중${NC}"
else
    echo -e "${YELLOW}⚠️ Backend 응답 없음 (선택사항)${NC}"
fi

# 9. 최종 결과
echo -e "\n=========================================="
echo -e "${GREEN}🎉 배포 완료!${NC}"
echo -e "\n접속 주소:"
echo -e "  🌐 Frontend: ${BLUE}http://13.209.84.93:3000${NC}"
echo -e "  🔧 Backend: ${BLUE}http://13.209.84.93:8000${NC}"
echo -e "\n유용한 명령어:"
echo -e "  📋 PM2 로그: ${YELLOW}pm2 logs monsta-prod${NC}"
echo -e "  🔄 PM2 재시작: ${YELLOW}pm2 restart monsta-prod${NC}"
echo -e "  📊 PM2 모니터: ${YELLOW}pm2 monit${NC}"
echo -e "  ❌ PM2 중지: ${YELLOW}pm2 stop monsta-prod${NC}"
echo -e "\n${YELLOW}⚠️ 주의: AWS 보안 그룹에서 포트 3000, 8000이 열려있는지 확인하세요!${NC}"