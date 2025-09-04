# 🚀 MONSTA Trading V7 - 서버 직접 배포 가이드

## 📌 서버 정보 및 키파일

### 사용 가능한 키파일
- `monsta-key.pem` - SSH 접속용 (Linux/Mac)
- `monsta-key.ppk` - PuTTY 접속용 (Windows)
- `monsta-aws.ppk` - AWS EC2 접속용

### 서버 요구사항
- OS: Ubuntu 20.04 LTS 이상
- RAM: 최소 2GB (권장 4GB)
- 스토리지: 최소 20GB
- 포트: 22(SSH), 80(HTTP), 443(HTTPS), 8507(앱)

## 🔧 신규 배포 (기존 프로젝트와 충돌 없음)

### 사용 포트 (충돌 방지)
- **앱**: 8507 (기본 8501 대신)
- **PostgreSQL**: 5437 (기본 5432 대신)
- **Redis**: 6387 (기본 6379 대신)
- **Nginx**: 8080 (선택사항)

### 디렉토리 구조
```
/home/ubuntu/
├── monsta-v7/          # 신규 프로젝트 (충돌 없음)
│   └── monstas7/       # Git 저장소
│       ├── app.py
│       ├── docker-compose.server.yml
│       └── ...
└── existing-projects/  # 기존 프로젝트들
```

## 📋 배포 단계

### 1. 서버 정보 설정
`deploy_to_server.bat` 또는 `deploy_to_server.sh` 파일 수정:
```bash
SERVER_IP="your-actual-server-ip"
SERVER_USER="ubuntu"  # 또는 ec2-user
KEY_FILE="monsta-key.pem"
```

### 2. Windows에서 배포
```cmd
# 방법 1: 배치 파일 실행
deploy_to_server.bat

# 방법 2: PuTTY 사용
1. PuTTY 실행
2. Host: your-server-ip
3. Auth > Browse > monsta-key.ppk 선택
4. Open
```

### 3. Linux/Mac에서 배포
```bash
# 권한 설정
chmod 600 monsta-key.pem
chmod +x deploy_to_server.sh

# 배포 실행
./deploy_to_server.sh
```

### 4. 수동 배포 (서버에 직접 접속)
```bash
# 1. SSH 접속
ssh -i monsta-key.pem ubuntu@your-server-ip

# 2. 프로젝트 클론
mkdir -p ~/monsta-v7
cd ~/monsta-v7
git clone https://github.com/loadstar0723/monstas7.git
cd monstas7

# 3. Docker 설치 (없는 경우)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 4. Docker Compose 설치
sudo apt-get install docker-compose -y

# 5. 환경변수 설정
cat > .env << EOF
BINANCE_API_KEY=your_api_key
BINANCE_API_SECRET=your_api_secret
PORT=8507
EOF

# 6. 서버용 Docker Compose 실행
sudo docker-compose -f docker-compose.server.yml up -d

# 7. 상태 확인
sudo docker ps
curl http://localhost:8507
```

## 🔐 Binance API 설정

1. https://www.binance.com 로그인
2. API Management 접속
3. API Key 생성
4. IP 제한 설정 (서버 IP 추가)
5. .env 파일에 키 추가

## 🌐 도메인 연결 (선택사항)

### Nginx 설정
```nginx
server {
    listen 80;
    server_name monsta-v7.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:8507;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL 인증서 (Let's Encrypt)
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d monsta-v7.yourdomain.com
```

## 📊 모니터링

### 로그 확인
```bash
# Docker 로그
sudo docker-compose -f docker-compose.server.yml logs -f

# 특정 서비스 로그
sudo docker logs monsta-v7-app -f
sudo docker logs monsta-v7-postgres -f
sudo docker logs monsta-v7-redis -f
```

### 시스템 상태
```bash
# 컨테이너 상태
sudo docker ps

# 리소스 사용량
sudo docker stats

# 포트 확인
sudo netstat -tlnp | grep -E ":(8507|5437|6387)"
```

## 🔧 관리 명령어

### 서비스 제어
```bash
# 시작
sudo docker-compose -f docker-compose.server.yml up -d

# 중지
sudo docker-compose -f docker-compose.server.yml down

# 재시작
sudo docker-compose -f docker-compose.server.yml restart

# 업데이트
git pull origin master
sudo docker-compose -f docker-compose.server.yml build
sudo docker-compose -f docker-compose.server.yml up -d
```

### 데이터베이스 백업
```bash
# 백업
sudo docker exec monsta-v7-postgres pg_dump -U monsta_v7 monsta_db_v7 > backup.sql

# 복원
sudo docker exec -i monsta-v7-postgres psql -U monsta_v7 monsta_db_v7 < backup.sql
```

## ⚠️ 문제 해결

### 포트 충돌
```bash
# 사용 중인 포트 확인
sudo lsof -i :8507
sudo lsof -i :5437

# 프로세스 종료
sudo kill -9 [PID]
```

### 권한 문제
```bash
# Docker 권한
sudo usermod -aG docker $USER
newgrp docker

# 파일 권한
chmod 755 deploy_to_server.sh
chmod 600 monsta-key.pem
```

### 메모리 부족
```bash
# 스왑 메모리 추가
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## 🎯 접속 정보

배포 완료 후:
- **SSH**: `ssh -i monsta-key.pem ubuntu@your-server-ip`
- **웹 앱**: `http://your-server-ip:8507`
- **관리자**: admin@monsta.com / admin123

## 📱 모바일 접속

모바일에서도 접속 가능:
- 브라우저에서 `http://서버IP:8507` 접속
- 반응형 디자인으로 모바일 최적화

## 💡 보안 권장사항

1. **방화벽 설정**
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 8507/tcp
   sudo ufw enable
   ```

2. **SSH 키 인증만 허용**
   ```bash
   sudo nano /etc/ssh/sshd_config
   # PasswordAuthentication no
   sudo systemctl restart sshd
   ```

3. **정기 업데이트**
   ```bash
   sudo apt-get update && sudo apt-get upgrade -y
   ```

---
**작성일**: 2025-09-05
**프로젝트**: MONSTA Trading Platform V7
**상태**: 서버 배포 준비 완료