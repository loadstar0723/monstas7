# 🚨 서버 긴급 복구 가이드

## 현재 상황
- **문제**: ERR_CONNECTION_REFUSED - 서버가 연결을 거부함
- **서버 IP**: 13.209.84.93
- **예상 원인**: 
  1. EC2 인스턴스가 중지되었거나
  2. 보안 그룹에서 포트 3000이 차단되었거나
  3. 메모리 부족으로 서버가 크래시

## 즉시 확인 사항

### 1. AWS EC2 콘솔 확인
1. AWS 콘솔 로그인: https://console.aws.amazon.com/ec2
2. 인스턴스 상태 확인 (running인지)
3. 보안 그룹에서 포트 3000 인바운드 규칙 확인

### 2. SSH 직접 접속 (Windows PowerShell)
```powershell
# AWS 키 파일 경로 (실제 경로로 변경)
ssh -i "your-key.pem" ubuntu@13.209.84.93
```

### 3. 서버 접속 후 실행 명령
```bash
# 1. 프로세스 확인
ps aux | grep node
pm2 status

# 2. 포트 확인
sudo netstat -tlnp | grep 3000

# 3. 메모리 확인
free -h

# 4. 디스크 확인  
df -h

# 5. 간단 재시작
cd ~/monstas7/frontend
pm2 kill
killall -9 node 2>/dev/null
PORT=3000 npm run dev &
```

## GitHub Actions 워크플로우

현재 생성된 워크플로우들:
1. **simple-deploy.yml** - 일반 배포
2. **server-restart.yml** - 서버 재시작
3. **emergency-fix.yml** - 긴급 복구
4. **direct-ssh-fix.yml** - SSH 직접 복구
5. **simple-restart.yml** - 단순 재시작

## 수동 실행 방법

### GitHub Actions에서 수동 실행
1. https://github.com/loadstar0723/monstas7/actions
2. 왼쪽에서 워크플로우 선택
3. "Run workflow" 버튼 클릭
4. "Run workflow" 확인

### 로컬에서 직접 SSH 명령 실행
```bash
# 서버 재시작 스크립트
ssh -i ~/.ssh/aws-key.pem ubuntu@13.209.84.93 << 'EOF'
cd ~/monstas7/frontend
pm2 kill
npm install
PORT=3000 nohup npm run dev > server.log 2>&1 &
EOF
```

## 문제별 해결 방법

### 1. 메모리 부족
```bash
# 스왑 파일 생성 (2GB)
sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 2. 디스크 공간 부족
```bash
# 불필요한 파일 정리
cd ~/monstas7/frontend
rm -rf node_modules .next
npm cache clean --force
npm install
```

### 3. PM2 문제
```bash
# PM2 완전 재설치
npm uninstall -g pm2
npm install -g pm2
pm2 update
```

### 4. 포트 문제
```bash
# 포트 3000 강제 해제
sudo fuser -k 3000/tcp
sudo lsof -ti:3000 | xargs kill -9
```

## 최후의 수단

### EC2 인스턴스 재부팅
1. AWS 콘솔에서 인스턴스 선택
2. Actions → Instance State → Reboot
3. 5분 대기 후 SSH 접속

### 새 인스턴스 생성
1. 현재 인스턴스 AMI 생성
2. 새 EC2 인스턴스 시작
3. 탄력적 IP 재할당

## 연락처
- GitHub Actions: https://github.com/loadstar0723/monstas7/actions
- 서버 URL: http://13.209.84.93:3000

## 현재 진행 상황
- ✅ 여러 워크플로우 생성 및 실행
- ✅ 의존성 문제 해결 시도
- ⏳ 서버 응답 대기 중
- ❌ 아직 연결 거부 상태

## 다음 단계
1. AWS EC2 콘솔에서 인스턴스 상태 확인
2. SSH로 직접 접속하여 수동 복구
3. 필요시 인스턴스 재부팅