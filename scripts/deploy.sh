#!/bin/bash

# MONSTA Platform 배포 스크립트
# 서버 및 로컬에서 사용 가능

echo "🚀 MONSTA Platform 배포 시작..."
echo "================================"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 프로젝트 디렉토리
PROJECT_DIR="$HOME/monsta-v7/monstas7"
VENV_PATH="$PROJECT_DIR/venv"
LOG_FILE="$PROJECT_DIR/app.log"
PORT=8508

# 함수: 에러 체크
check_error() {
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 오류 발생: $1${NC}"
        exit 1
    fi
}

# 함수: 성공 메시지
success_msg() {
    echo -e "${GREEN}✅ $1${NC}"
}

# 함수: 정보 메시지
info_msg() {
    echo -e "${YELLOW}📌 $1${NC}"
}

# 1. 프로젝트 디렉토리 확인
info_msg "프로젝트 디렉토리 확인 중..."
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}프로젝트 디렉토리가 없습니다: $PROJECT_DIR${NC}"
    exit 1
fi
cd "$PROJECT_DIR"
check_error "디렉토리 이동 실패"
success_msg "프로젝트 디렉토리 확인 완료"

# 2. Git 최신 코드 가져오기
info_msg "최신 코드 가져오는 중..."
git fetch origin
git pull origin master
check_error "Git pull 실패"
success_msg "최신 코드 업데이트 완료"

# 3. 가상환경 확인 및 생성
if [ ! -d "$VENV_PATH" ]; then
    info_msg "가상환경 생성 중..."
    python3 -m venv "$VENV_PATH"
    check_error "가상환경 생성 실패"
    success_msg "가상환경 생성 완료"
fi

# 4. 가상환경 활성화
info_msg "가상환경 활성화 중..."
source "$VENV_PATH/bin/activate"
check_error "가상환경 활성화 실패"
success_msg "가상환경 활성화 완료"

# 5. 패키지 업데이트
info_msg "Python 패키지 업데이트 중..."
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt --quiet
check_error "패키지 설치 실패"
success_msg "패키지 업데이트 완료"

# 6. 환경 변수 확인
if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo -e "${YELLOW}⚠️  .env 파일이 없습니다. 기본 설정을 사용합니다.${NC}"
fi

# 7. 기존 프로세스 종료
info_msg "기존 프로세스 종료 중..."
pkill -f "streamlit.*$PORT" || true
sleep 2
success_msg "기존 프로세스 종료 완료"

# 8. Docker 컨테이너 확인 (PostgreSQL, Redis)
info_msg "Docker 서비스 확인 중..."
if command -v docker &> /dev/null; then
    docker ps | grep -q "monsta-v7-postgres" || echo -e "${YELLOW}⚠️  PostgreSQL 컨테이너가 실행 중이지 않습니다${NC}"
    docker ps | grep -q "monsta-v7-redis" || echo -e "${YELLOW}⚠️  Redis 컨테이너가 실행 중이지 않습니다${NC}"
fi

# 9. Streamlit 앱 시작
info_msg "Streamlit 앱 시작 중..."
nohup streamlit run app.py \
    --server.port=$PORT \
    --server.address=0.0.0.0 \
    --server.headless=true \
    > "$LOG_FILE" 2>&1 &

APP_PID=$!
echo "PID: $APP_PID"

# 10. 앱 시작 확인 (10초 대기)
info_msg "앱 시작 확인 중..."
sleep 5

if ps -p $APP_PID > /dev/null; then
    success_msg "Streamlit 앱이 성공적으로 시작되었습니다!"
    
    # 접속 정보 출력
    echo ""
    echo "================================"
    echo -e "${GREEN}🎉 배포 완료!${NC}"
    echo "================================"
    echo ""
    echo "📍 접속 정보:"
    echo "   로컬: http://localhost:$PORT"
    echo "   서버: http://13.209.84.93:$PORT"
    echo ""
    echo "📄 로그 확인:"
    echo "   tail -f $LOG_FILE"
    echo ""
    echo "🔄 프로세스 확인:"
    echo "   ps aux | grep streamlit"
    echo ""
else
    echo -e "${RED}❌ 앱 시작 실패. 로그를 확인하세요:${NC}"
    tail -20 "$LOG_FILE"
    exit 1
fi

# 11. 헬스 체크
info_msg "헬스 체크 중..."
sleep 3
if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT | grep -q "200"; then
    success_msg "앱이 정상적으로 응답하고 있습니다!"
else
    echo -e "${YELLOW}⚠️  앱이 아직 시작 중입니다. 잠시 후 다시 확인하세요.${NC}"
fi

echo ""
echo "================================"
echo -e "${GREEN}✨ 모든 작업이 완료되었습니다!${NC}"
echo "================================"