#!/bin/bash

# MONSTA 서버 크론탭 설정 스크립트
# 5분마다 헬스체크를 실행하여 서버 상태 모니터링

echo "🔧 MONSTA 크론탭 설정 시작..."

# 헬스체크 스크립트 경로
HEALTH_CHECK_SCRIPT="$HOME/monstas7/scripts/health-check.sh"
LOG_DIR="$HOME/monstas7/logs"

# 로그 디렉토리 생성
mkdir -p "$LOG_DIR"

# 헬스체크 스크립트 실행 권한 부여
chmod +x "$HEALTH_CHECK_SCRIPT"

# 크론탭 항목 추가
CRON_JOB="*/5 * * * * /bin/bash $HEALTH_CHECK_SCRIPT >> $LOG_DIR/health-check.log 2>&1"

# 기존 크론탭 백업
crontab -l > /tmp/crontab.backup 2>/dev/null || true

# 중복 체크 후 추가
if crontab -l 2>/dev/null | grep -q "health-check.sh"; then
    echo "⚠️ 헬스체크 크론탭이 이미 설정되어 있습니다."
else
    # 크론탭에 추가
    (crontab -l 2>/dev/null || true; echo "$CRON_JOB") | crontab -
    echo "✅ 헬스체크 크론탭 설정 완료 (5분마다 실행)"
fi

# PM2 자동 시작 설정
echo "🚀 PM2 자동 시작 설정..."
pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save

# 현재 크론탭 확인
echo ""
echo "📋 현재 설정된 크론탭:"
crontab -l | grep -E "monsta|health-check" || echo "관련 크론탭 없음"

echo ""
echo "✅ 설정 완료!"
echo "📊 로그 확인: tail -f $LOG_DIR/health-check.log"
echo "🔄 크론탭 편집: crontab -e"
echo "❌ 크론탭 제거: crontab -l | grep -v 'health-check.sh' | crontab -"