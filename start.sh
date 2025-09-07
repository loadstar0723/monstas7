#!/bin/bash

# 프로젝트 디렉토리로 이동
cd /home/ubuntu/monstas7/frontend

# 기존 프로세스 종료
pkill -f "next start" || true

# 환경변수 설정
export NODE_ENV=production
export PORT=3000

# Next.js 프로덕션 서버 시작 (백그라운드)
nohup npm start > /home/ubuntu/monstas7/app.log 2>&1 &

echo "✅ Server started on port 3000"
echo "📋 Check logs: tail -f /home/ubuntu/monstas7/app.log"