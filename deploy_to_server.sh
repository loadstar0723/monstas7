#!/bin/bash

# MONSTA Trading V7 - 서버 배포 스크립트
# 기존 프로젝트와 충돌 방지를 위한 신규 설치

echo "========================================="
echo "  MONSTA Trading V7 - Server Deployment"
echo "========================================="

# 서버 정보
SERVER_IP="your-server-ip"
SERVER_USER="ubuntu"  # or ec2-user for Amazon Linux
KEY_FILE="monsta-key.pem"
PROJECT_NAME="monstas7"
DEPLOY_DIR="/home/ubuntu/monsta-v7"  # 신규 디렉토리

# 색상 코드
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Step 1: 서버 접속 테스트${NC}"
ssh -i "$KEY_FILE" "$SERVER_USER@$SERVER_IP" "echo 'Connection successful!'"

echo -e "${YELLOW}Step 2: 서버 환경 준비${NC}"
ssh -i "$KEY_FILE" "$SERVER_USER@$SERVER_IP" << 'ENDSSH'
    # 신규 디렉토리 생성 (기존 프로젝트와 분리)
    mkdir -p ~/monsta-v7
    cd ~/monsta-v7
    
    # 시스템 업데이트
    sudo apt-get update -y
    
    # Docker 설치 (이미 있으면 스킵)
    if ! command -v docker &> /dev/null; then
        echo "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
    fi
    
    # Docker Compose 설치
    if ! command -v docker-compose &> /dev/null; then
        echo "Installing Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi
    
    # Git 설치
    sudo apt-get install -y git
    
    # Python 설치
    sudo apt-get install -y python3 python3-pip python3-venv
    
    # Nginx 설치 (리버스 프록시용)
    sudo apt-get install -y nginx
ENDSSH

echo -e "${YELLOW}Step 3: 프로젝트 클론${NC}"
ssh -i "$KEY_FILE" "$SERVER_USER@$SERVER_IP" << 'ENDSSH'
    cd ~/monsta-v7
    
    # 기존 디렉토리가 있으면 백업
    if [ -d "monstas7" ]; then
        mv monstas7 monstas7_backup_$(date +%Y%m%d_%H%M%S)
    fi
    
    # GitHub에서 클론
    git clone https://github.com/loadstar0723/monstas7.git
    cd monstas7
ENDSSH

echo -e "${YELLOW}Step 4: 환경 변수 설정${NC}"
ssh -i "$KEY_FILE" "$SERVER_USER@$SERVER_IP" << 'ENDSSH'
    cd ~/monsta-v7/monstas7
    
    # .env 파일 생성
    cat > .env << EOF
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=monsta_db_v7
DB_USER=monsta_user
DB_PASSWORD=monsta_secure_password_2024

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Binance API (실제 키로 교체 필요)
BINANCE_API_KEY=your_binance_api_key_here
BINANCE_API_SECRET=your_binance_api_secret_here
BINANCE_TESTNET=True

# App Settings
SECRET_KEY=monsta_v7_secret_key_$(date +%s)
DEBUG=False
PORT=8507  # 포트 변경 (충돌 방지)
EOF
    
    echo "Environment variables created"
ENDSSH

echo -e "${YELLOW}Step 5: Docker 컨테이너 시작${NC}"
ssh -i "$KEY_FILE" "$SERVER_USER@$SERVER_IP" << 'ENDSSH'
    cd ~/monsta-v7/monstas7
    
    # Docker Compose 파일 수정 (포트 변경)
    sed -i 's/8501:8501/8507:8501/g' docker-compose.yml
    
    # PostgreSQL과 Redis 시작
    sudo docker-compose up -d postgres redis
    
    # 10초 대기 (DB 초기화)
    sleep 10
    
    # 데이터베이스 초기화
    sudo docker-compose exec -T postgres psql -U monsta -c "CREATE DATABASE monsta_db_v7;"
    
    # 앱 컨테이너 빌드 및 시작
    sudo docker-compose build app
    sudo docker-compose up -d app
ENDSSH

echo -e "${YELLOW}Step 6: Nginx 리버스 프록시 설정${NC}"
ssh -i "$KEY_FILE" "$SERVER_USER@$SERVER_IP" << 'ENDSSH'
    # Nginx 설정 생성
    sudo tee /etc/nginx/sites-available/monsta-v7 > /dev/null << EOF
server {
    listen 80;
    server_name monsta-v7.yourdomain.com;  # 도메인 변경 필요
    
    location / {
        proxy_pass http://localhost:8507;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket 지원
        proxy_read_timeout 86400;
    }
}
EOF
    
    # 설정 활성화
    sudo ln -sf /etc/nginx/sites-available/monsta-v7 /etc/nginx/sites-enabled/
    
    # Nginx 재시작
    sudo nginx -t && sudo systemctl reload nginx
ENDSSH

echo -e "${YELLOW}Step 7: 시스템 서비스 등록${NC}"
ssh -i "$KEY_FILE" "$SERVER_USER@$SERVER_IP" << 'ENDSSH'
    # systemd 서비스 파일 생성
    sudo tee /etc/systemd/system/monsta-v7.service > /dev/null << EOF
[Unit]
Description=MONSTA Trading Platform V7
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=true
WorkingDirectory=/home/ubuntu/monsta-v7/monstas7
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF
    
    # 서비스 활성화
    sudo systemctl daemon-reload
    sudo systemctl enable monsta-v7
    sudo systemctl start monsta-v7
ENDSSH

echo -e "${YELLOW}Step 8: 방화벽 설정${NC}"
ssh -i "$KEY_FILE" "$SERVER_USER@$SERVER_IP" << 'ENDSSH'
    # UFW 방화벽 설정 (이미 활성화되어 있으면 스킵)
    sudo ufw allow 22/tcp   # SSH
    sudo ufw allow 80/tcp   # HTTP
    sudo ufw allow 443/tcp  # HTTPS
    sudo ufw allow 8507/tcp # App Port
    
    # 방화벽 상태 확인
    sudo ufw status
ENDSSH

echo -e "${YELLOW}Step 9: 헬스체크${NC}"
ssh -i "$KEY_FILE" "$SERVER_USER@$SERVER_IP" << 'ENDSSH'
    echo "Checking services..."
    
    # Docker 컨테이너 상태
    sudo docker-compose -f ~/monsta-v7/monstas7/docker-compose.yml ps
    
    # 포트 확인
    sudo netstat -tlnp | grep -E ":(80|8507|5432|6379)"
    
    # 앱 접속 테스트
    curl -I http://localhost:8507
ENDSSH

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  배포 완료!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "접속 정보:"
echo "  - SSH: ssh -i $KEY_FILE $SERVER_USER@$SERVER_IP"
echo "  - Web: http://$SERVER_IP:8507"
echo "  - Nginx: http://$SERVER_IP"
echo ""
echo "Docker 명령어:"
echo "  - 로그 확인: sudo docker-compose logs -f"
echo "  - 재시작: sudo docker-compose restart"
echo "  - 중지: sudo docker-compose down"
echo ""