#!/bin/bash
# monsta.im HTTPS 설정 스크립트
# AWS EC2 Ubuntu 서버에서 실행
# 서버 IP: 15.165.105.250

echo "=================================="
echo "monsta.im HTTPS 설정 시작"
echo "서버 IP: 15.165.105.250"
echo "=================================="

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 도메인 설정
DOMAIN="monsta.im"
WWW_DOMAIN="www.monsta.im"
EMAIL="admin@monsta.im"  # Let's Encrypt 인증서용 이메일

# 1. 시스템 업데이트
echo -e "${YELLOW}1. 시스템 업데이트 중...${NC}"
sudo apt update
sudo apt upgrade -y

# 2. Nginx 설치
echo -e "${YELLOW}2. Nginx 설치 중...${NC}"
sudo apt install nginx -y

# Nginx 상태 확인
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ Nginx가 정상적으로 실행 중입니다.${NC}"
else
    echo -e "${RED}✗ Nginx 실행 실패${NC}"
    sudo systemctl start nginx
fi

# 3. Certbot 설치
echo -e "${YELLOW}3. Certbot (Let's Encrypt) 설치 중...${NC}"
sudo apt install certbot python3-certbot-nginx -y

# 4. 방화벽 설정
echo -e "${YELLOW}4. 방화벽 설정 중...${NC}"
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable
sudo ufw status

# 5. Nginx 설정 파일 생성
echo -e "${YELLOW}5. Nginx 설정 파일 생성 중...${NC}"
sudo tee /etc/nginx/sites-available/monsta-im > /dev/null << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name monsta.im www.monsta.im;

    # Let's Encrypt 인증용
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # 프론트엔드 (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 백엔드 API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# 6. Nginx 설정 활성화
echo -e "${YELLOW}6. Nginx 설정 활성화 중...${NC}"
sudo ln -sf /etc/nginx/sites-available/monsta-im /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Nginx 설정 테스트
if sudo nginx -t; then
    echo -e "${GREEN}✓ Nginx 설정이 올바릅니다.${NC}"
    sudo systemctl reload nginx
else
    echo -e "${RED}✗ Nginx 설정 오류${NC}"
    exit 1
fi

# 7. DNS 확인
echo -e "${YELLOW}7. DNS 설정 확인 중...${NC}"
echo "monsta.im이 이 서버 IP를 가리키는지 확인합니다..."
CURRENT_IP=$(curl -s http://checkip.amazonaws.com)
DOMAIN_IP=$(dig +short $DOMAIN)

echo "현재 서버 IP: $CURRENT_IP"
echo "도메인 IP: $DOMAIN_IP"

if [ "$CURRENT_IP" = "$DOMAIN_IP" ]; then
    echo -e "${GREEN}✓ DNS가 올바르게 설정되었습니다.${NC}"
else
    echo -e "${RED}✗ DNS 설정을 확인하세요. 도메인이 이 서버를 가리키지 않습니다.${NC}"
    echo "Route 53이나 도메인 등록업체에서 A 레코드를 확인하세요."
    read -p "계속 진행하시겠습니까? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 8. SSL 인증서 발급
echo -e "${YELLOW}8. SSL 인증서 발급 중...${NC}"
echo "Let's Encrypt SSL 인증서를 발급합니다."
echo "이메일: $EMAIL"

# 인증서 발급 (대화형 모드)
sudo certbot --nginx -d $DOMAIN -d $WWW_DOMAIN --email $EMAIL --agree-tos --no-eff-email

# 9. 자동 갱신 설정
echo -e "${YELLOW}9. SSL 자동 갱신 설정 중...${NC}"
# 자동 갱신 테스트
sudo certbot renew --dry-run

# Crontab에 자동 갱신 추가
(crontab -l 2>/dev/null; echo "0 3 * * * /usr/bin/certbot renew --quiet") | crontab -

# 10. 환경 변수 업데이트
echo -e "${YELLOW}10. 환경 변수 업데이트 중...${NC}"
if [ -f "/home/ubuntu/monstas7/frontend/.env.production" ]; then
    # 백업 생성
    cp /home/ubuntu/monstas7/frontend/.env.production /home/ubuntu/monstas7/frontend/.env.production.backup
    
    # HTTPS URL로 업데이트
    cat > /home/ubuntu/monstas7/frontend/.env.production << EOF
NEXT_PUBLIC_API_URL=https://monsta.im
NEXT_PUBLIC_WS_URL=wss://monsta.im/ws
NODE_ENV=production
EOF
    echo -e "${GREEN}✓ 환경 변수가 업데이트되었습니다.${NC}"
fi

# 11. 서비스 재시작
echo -e "${YELLOW}11. 서비스 재시작 중...${NC}"
sudo systemctl restart nginx

# PM2가 설치되어 있으면 재시작
if command -v pm2 &> /dev/null; then
    pm2 restart all
    echo -e "${GREEN}✓ PM2 프로세스가 재시작되었습니다.${NC}"
fi

# 12. 최종 확인
echo -e "${YELLOW}12. 설정 완료 확인 중...${NC}"
echo ""
echo -e "${GREEN}=================================="
echo "✓ HTTPS 설정이 완료되었습니다!"
echo "=================================="
echo ""
echo "접속 URL:"
echo "- https://monsta.im"
echo "- https://www.monsta.im"
echo ""
echo "SSL 인증서 확인:"
sudo certbot certificates
echo ""
echo "Nginx 상태:"
sudo systemctl status nginx --no-pager
echo ""
echo -e "${YELLOW}테스트 명령어:${NC}"
echo "curl -I https://monsta.im"
echo ""