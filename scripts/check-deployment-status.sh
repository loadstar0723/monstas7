#!/bin/bash

# AWS 서버 배포 상태 확인 스크립트

echo "================================================"
echo "🔍 AWS 서버 배포 상태 확인"
echo "================================================"
echo ""

# 서버 정보
SERVER_IP="15.165.105.250"
SERVER_PORT="3000"
SERVER_URL="http://$SERVER_IP:$SERVER_PORT"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🌐 서버: $SERVER_URL"
echo ""

# 1. 서버 연결 테스트
echo "1️⃣ 서버 연결 테스트..."
if ping -c 1 $SERVER_IP > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 서버에 ping 가능${NC}"
else
    echo -e "${RED}❌ 서버에 ping 불가능${NC}"
    echo "   서버가 꺼져있거나 네트워크 문제가 있습니다."
fi
echo ""

# 2. HTTP 응답 테스트
echo "2️⃣ HTTP 응답 테스트..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $SERVER_URL 2>/dev/null)

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ 서버 정상 작동 중 (HTTP $HTTP_STATUS)${NC}"
elif [ "$HTTP_STATUS" = "000" ]; then
    echo -e "${RED}❌ 서버 응답 없음${NC}"
    echo "   서버가 실행 중이지 않거나 포트가 막혀있습니다."
else
    echo -e "${YELLOW}⚠️  비정상 응답 (HTTP $HTTP_STATUS)${NC}"
    echo "   서버는 실행 중이지만 에러가 있습니다."
fi
echo ""

# 3. 응답 시간 테스트
echo "3️⃣ 응답 시간 테스트..."
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" $SERVER_URL 2>/dev/null)

if [ "$RESPONSE_TIME" != "0.000000" ]; then
    echo -e "⏱️  응답 시간: ${RESPONSE_TIME}초"

    # bash는 부동소수점 비교를 직접 지원하지 않으므로 awk 사용
    if awk "BEGIN {exit !($RESPONSE_TIME > 10)}"; then
        echo -e "${YELLOW}⚠️  경고: 응답 시간이 너무 느립니다!${NC}"
    elif awk "BEGIN {exit !($RESPONSE_TIME > 5)}"; then
        echo -e "${YELLOW}⚠️  주의: 응답 시간이 느립니다${NC}"
    else
        echo -e "${GREEN}✅ 응답 시간 양호${NC}"
    fi
else
    echo -e "${RED}❌ 응답 시간 측정 불가${NC}"
fi
echo ""

# 4. 최근 GitHub Actions 상태 (로컬에서 확인)
echo "4️⃣ GitHub Actions 워크플로우 상태..."
echo "   (GitHub에서 직접 확인 필요)"
echo "   📍 Simple Deploy: https://github.com/loadstar0723/monstas7/actions/workflows/simple-deploy.yml"
echo "   📍 Deploy to AWS: https://github.com/loadstar0723/monstas7/actions/workflows/deploy.yml"
echo "   📍 Health Check: https://github.com/loadstar0723/monstas7/actions/workflows/health-check.yml"
echo "   📍 Emergency Fix: https://github.com/loadstar0723/monstas7/actions/workflows/emergency-fix.yml"
echo ""

# 5. SSH 연결 테스트 (키가 있는 경우)
echo "5️⃣ SSH 연결 테스트..."
SSH_KEY_PATH="/c/monsta/monstas7/monsta-key.pem"

if [ -f "$SSH_KEY_PATH" ]; then
    echo "🔑 SSH 키 발견: $SSH_KEY_PATH"
    echo "   SSH 연결 명령어:"
    echo "   ssh -i \"$SSH_KEY_PATH\" ubuntu@$SERVER_IP"

    # SSH 연결 테스트 (타임아웃 5초)
    if timeout 5 ssh -i "$SSH_KEY_PATH" -o ConnectTimeout=5 -o StrictHostKeyChecking=no ubuntu@$SERVER_IP "echo 'SSH OK'" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ SSH 연결 가능${NC}"

        # PM2 상태 확인
        echo ""
        echo "6️⃣ PM2 프로세스 상태..."
        ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no ubuntu@$SERVER_IP "pm2 status" 2>/dev/null || echo "PM2 상태 확인 실패"
    else
        echo -e "${YELLOW}⚠️  SSH 연결 실패 (키 권한 또는 네트워크 문제)${NC}"
    fi
else
    echo "⚠️  SSH 키를 찾을 수 없습니다"
    echo "   예상 경로: $SSH_KEY_PATH"
fi
echo ""

# 결과 요약
echo "================================================"
echo "📊 배포 상태 요약"
echo "================================================"

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ 서버 정상 작동 중${NC}"
    echo "   URL: $SERVER_URL"
    echo "   응답 시간: ${RESPONSE_TIME}초"
    echo ""
    echo "💡 다음 단계:"
    echo "   - 브라우저에서 $SERVER_URL 접속하여 확인"
    echo "   - GitHub Actions에서 최근 배포 로그 확인"
else
    echo -e "${RED}❌ 서버에 문제가 있습니다${NC}"
    echo ""
    echo "🔧 해결 방법:"
    echo "   1. GitHub에서 Emergency Fix 워크플로우 실행"
    echo "   2. SSH로 직접 접속하여 수동 재시작:"
    echo "      ssh -i \"$SSH_KEY_PATH\" ubuntu@$SERVER_IP"
    echo "      cd ~/monstas7/frontend"
    echo "      pm2 restart all"
    echo "   3. 로그 확인:"
    echo "      pm2 logs --lines 50"
fi