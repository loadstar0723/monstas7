#!/bin/bash

# MONSTA 서버 헬스체크 스크립트
# 서버가 정상 작동하는지 확인하고 문제가 있으면 자동 복구

echo "🔍 MONSTA 서버 헬스체크 시작..."
echo "시간: $(date)"
echo "============================================"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 헬스체크 함수
check_service() {
    local service_name=$1
    local port=$2
    local url=$3
    
    echo -e "\n📌 $service_name 체크 중..."
    
    if curl -f -m 5 "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $service_name is healthy${NC}"
        return 0
    else
        echo -e "${RED}❌ $service_name is not responding${NC}"
        return 1
    fi
}

# PM2 프로세스 체크
check_pm2() {
    echo -e "\n🔧 PM2 프로세스 상태 확인..."
    
    if pm2 describe monsta-prod > /dev/null 2>&1; then
        local status=$(pm2 describe monsta-prod | grep status | awk '{print $4}')
        local restarts=$(pm2 describe monsta-prod | grep restarts | awk '{print $4}')
        
        if [ "$status" = "online" ]; then
            echo -e "${GREEN}✅ PM2 프로세스 정상 작동 중 (재시작 횟수: $restarts)${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️ PM2 프로세스 상태: $status${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ PM2 프로세스를 찾을 수 없음${NC}"
        return 1
    fi
}

# 자동 복구 함수
auto_recovery() {
    echo -e "\n${YELLOW}🔄 자동 복구 시작...${NC}"
    
    # PM2 reload 시도 (무중단 재시작)
    if pm2 describe monsta-prod > /dev/null 2>&1; then
        echo "PM2 reload 시도 중..."
        pm2 reload monsta-prod
        sleep 10
    else
        echo "PM2 프로세스 시작 중..."
        cd ~/monstas7/frontend || cd ~/monsta-v7/monstas7/frontend
        pm2 start ecosystem.config.js
        sleep 10
    fi
    
    # 복구 후 재확인
    if check_service "Frontend" 3000 "http://localhost:3000"; then
        echo -e "${GREEN}✅ 자동 복구 성공!${NC}"
        return 0
    else
        echo -e "${RED}❌ 자동 복구 실패. 수동 개입 필요${NC}"
        return 1
    fi
}

# 메인 헬스체크 로직
main() {
    local frontend_healthy=false
    local backend_healthy=false
    local need_recovery=false
    
    # Frontend 체크
    if check_service "Frontend (Next.js)" 3000 "http://localhost:3000"; then
        frontend_healthy=true
    else
        need_recovery=true
    fi
    
    # Backend 체크
    if check_service "Backend (FastAPI)" 8000 "http://localhost:8000/api/v1/health"; then
        backend_healthy=true
    fi
    
    # PM2 상태 체크
    if ! check_pm2; then
        need_recovery=true
    fi
    
    # 포트 사용 현황
    echo -e "\n📊 포트 사용 현황:"
    netstat -tlnp 2>/dev/null | grep -E "3000|8000" || lsof -i :3000,8000 2>/dev/null || echo "포트 정보를 가져올 수 없음"
    
    # 메모리 사용량 체크
    echo -e "\n💾 메모리 사용량:"
    free -h | grep -E "Mem|Swap"
    
    # PM2 상태 요약
    echo -e "\n📋 PM2 상태:"
    pm2 list
    
    # 복구가 필요한 경우
    if [ "$need_recovery" = true ]; then
        auto_recovery
    fi
    
    # 최종 상태 보고
    echo -e "\n============================================"
    echo "📊 최종 헬스체크 결과:"
    
    if [ "$frontend_healthy" = true ] && [ "$backend_healthy" = true ]; then
        echo -e "${GREEN}✅ 모든 서비스 정상 작동 중${NC}"
        echo "🌐 Frontend: http://13.209.84.93:3000"
        echo "🔧 Backend: http://13.209.84.93:8000"
        exit 0
    else
        if [ "$frontend_healthy" = false ]; then
            echo -e "${RED}❌ Frontend 서비스 문제 발생${NC}"
        fi
        if [ "$backend_healthy" = false ]; then
            echo -e "${YELLOW}⚠️ Backend 서비스 확인 필요${NC}"
        fi
        exit 1
    fi
}

# 스크립트 실행
main