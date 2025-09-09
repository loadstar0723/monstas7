# AWS 서버 자동 복구 스크립트
$keyPath = ".\monsta-key.pem"
$server = "ubuntu@13.209.84.93"

Write-Host "🔧 AWS 서버 복구 시작..." -ForegroundColor Yellow

# SSH 명령어 실행
$commands = @'
#!/bin/bash
echo "🚀 MONSTA 서버 복구 중..."

# 프로세스 정리
pm2 stop all
pm2 delete all
pkill -f uvicorn
pkill -f node

# 프로젝트 디렉토리로 이동
cd ~/monstas7 || cd ~/monsta-v7/monstas7

# 최신 코드 가져오기
git pull origin master

# Frontend 재시작
cd frontend
npm install
npm run build
pm2 start npm --name "monsta-nextjs" -- start

# Backend 재시작
cd ../backend
source ../venv/bin/activate || python3 -m venv ../venv && source ../venv/bin/activate
pip install -r requirements.txt
nohup uvicorn main:app --host 0.0.0.0 --port 8000 --reload > backend.log 2>&1 &

# 상태 확인
sleep 10
pm2 status
sudo netstat -tlnp | grep -E "3000|8000"

echo "✅ 복구 완료!"
'@

# SSH로 명령 실행
ssh -i $keyPath -o StrictHostKeyChecking=no $server $commands

Write-Host "✅ 서버 복구 완료!" -ForegroundColor Green
Write-Host "Frontend: http://13.209.84.93:3000" -ForegroundColor Cyan
Write-Host "Backend: http://13.209.84.93:8000" -ForegroundColor Cyan