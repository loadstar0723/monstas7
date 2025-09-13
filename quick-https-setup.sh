#!/bin/bash
# monsta.im 빠른 HTTPS 설정 스크립트
# 서버 IP: 15.165.105.250

echo "==================================="
echo "monsta.im 빠른 HTTPS 설정"
echo "서버 IP: 15.165.105.250"
echo "==================================="

# 1. 필수 패키지 설치
echo "1. 필수 패키지 설치 중..."
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx

# 2. Nginx 설정
echo "2. Nginx 설정 중..."
sudo tee /etc/nginx/sites-available/monsta-im > /dev/null << 'EOF'
server {
    listen 80;
    server_name monsta.im www.monsta.im;

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

# 3. Nginx 활성화
echo "3. Nginx 활성화 중..."
sudo ln -sf /etc/nginx/sites-available/monsta-im /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# 4. 방화벽 설정
echo "4. 방화벽 설정 중..."
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

# 5. SSL 인증서 발급
echo "5. SSL 인증서 발급..."
echo "이메일 주소를 입력하고 약관에 동의해주세요."
sudo certbot --nginx -d monsta.im -d www.monsta.im

# 6. 자동 갱신 설정
echo "6. 자동 갱신 설정 중..."
(crontab -l 2>/dev/null; echo "0 3 * * * /usr/bin/certbot renew --quiet") | crontab -

# 7. 완료
echo ""
echo "==================================="
echo "✅ HTTPS 설정 완료!"
echo "==================================="
echo "접속 URL:"
echo "- https://monsta.im"
echo "- https://www.monsta.im"
echo ""
echo "테스트: curl -I https://monsta.im"