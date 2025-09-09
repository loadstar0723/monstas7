# 🚨 AWS 서버 연결 문제 해결 가이드

## 현재 상황
- **서버 IP**: 13.209.84.93
- **에러**: ERR_CONNECTION_REFUSED
- **Frontend**: http://13.209.84.93:3000 (접속 불가)
- **Backend**: http://13.209.84.93:8000 (접속 불가)

## 📋 즉시 확인 사항

### 1. AWS EC2 콘솔에서 확인
1. [AWS Console](https://console.aws.amazon.com/ec2) 로그인
2. EC2 인스턴스 상태 확인
   - 인스턴스가 "running" 상태인지 확인
   - 인스턴스 ID, 퍼블릭 IP 확인

### 2. 보안 그룹 설정 (가장 중요!)
EC2 → 보안 그룹 → 해당 인스턴스의 보안 그룹 선택 → 인바운드 규칙

필수 인바운드 규칙:
```
포트 22    - SSH         - 0.0.0.0/0
포트 3000  - Custom TCP  - 0.0.0.0/0  (Next.js)
포트 8000  - Custom TCP  - 0.0.0.0/0  (FastAPI)
```

### 3. SSH로 서버 상태 확인
```bash
# SSH 접속 (키 파일 경로는 실제 경로로 변경)
ssh -i ~/.ssh/your-key.pem ubuntu@13.209.84.93

# 접속 성공 후 실행할 명령어들
```

## 🔧 서버 내부 진단 명령어

SSH 접속 후 다음 명령어를 순서대로 실행:

### 1. 기본 상태 확인
```bash
# 현재 실행 중인 프로세스 확인
ps aux | grep -E "node|python|pm2|uvicorn"

# 포트 사용 상태 확인
sudo netstat -tlnp | grep -E "3000|8000"

# PM2 상태 확인
pm2 status
```

### 2. Frontend 상태 확인 및 재시작
```bash
# 프로젝트 디렉토리로 이동
cd ~/monstas7/frontend || cd ~/monsta-v7/monstas7/frontend

# PM2 로그 확인
pm2 logs monsta-nextjs --lines 50

# PM2 재시작
pm2 restart monsta-nextjs

# 재시작 실패 시 완전 재구동
pm2 stop all
pm2 delete all
npm run build
pm2 start npm --name "monsta-nextjs" -- start
```

### 3. Backend 상태 확인 및 재시작
```bash
# Backend 디렉토리로 이동
cd ~/monstas7/backend || cd ~/monsta-v7/monstas7/backend

# FastAPI 프로세스 확인
ps aux | grep uvicorn

# 로그 확인
tail -n 100 backend.log

# FastAPI 재시작
pkill -f uvicorn
source ../venv/bin/activate
nohup uvicorn main:app --host 0.0.0.0 --port 8000 --reload > backend.log 2>&1 &
```

### 4. 방화벽 확인
```bash
# Ubuntu 방화벽 상태
sudo ufw status

# 방화벽이 활성화되어 있다면
sudo ufw allow 3000
sudo ufw allow 8000
sudo ufw reload
```

## 🚀 빠른 복구 스크립트

다음 스크립트를 한 번에 실행:

```bash
#!/bin/bash
echo "🔧 MONSTA 서버 복구 시작..."

# 프로세스 정리
pm2 stop all
pm2 delete all
pkill -f uvicorn
pkill -f node

# Frontend 재시작
cd ~/monstas7/frontend || cd ~/monsta-v7/monstas7/frontend
npm install
npm run build
pm2 start npm --name "monsta-nextjs" -- start

# Backend 재시작
cd ~/monstas7/backend || cd ~/monsta-v7/monstas7/backend
source ../venv/bin/activate
pip install -r requirements.txt
nohup uvicorn main:app --host 0.0.0.0 --port 8000 --reload > backend.log 2>&1 &

# 상태 확인
sleep 10
echo "📊 서비스 상태:"
pm2 status
sudo netstat -tlnp | grep -E "3000|8000"

echo "✅ 복구 완료!"
echo "Frontend: http://13.209.84.93:3000"
echo "Backend: http://13.209.84.93:8000/api/v1/health"
```

## 💡 추가 확인 사항

1. **GitHub Actions 확인**
   - https://github.com/loadstar0723/monstas7/actions
   - 최근 배포가 성공했는지 확인

2. **도메인 설정**
   - 도메인이 있다면 DNS 설정 확인
   - CloudFlare 등 CDN 설정 확인

3. **서버 리소스**
   - 디스크 공간: `df -h`
   - 메모리: `free -m`
   - CPU: `top`

## 📞 긴급 연락처
- AWS Support
- GitHub Actions 로그 확인
- Telegram 알림 확인 (설정되어 있다면)

---

**참고**: 가장 흔한 원인은 AWS 보안 그룹에서 3000, 8000 포트가 막혀있는 경우입니다.