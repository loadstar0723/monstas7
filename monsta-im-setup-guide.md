# monsta.im HTTPS 설정 가이드

## 📋 사전 준비사항

1. **도메인 DNS 설정** (Route 53 또는 도메인 등록업체)
   - A 레코드: `monsta.im` → `15.165.105.250`
   - A 레코드: `www.monsta.im` → `15.165.105.250`
   - TTL: 300초

2. **AWS 보안 그룹 확인**
   - HTTP (80) - 0.0.0.0/0 ✅
   - HTTPS (443) - 0.0.0.0/0 ✅
   - SSH (22) - 내 IP ✅

## 🚀 빠른 설정 (자동 스크립트)

```bash
# 1. SSH로 서버 접속
ssh -i your-key.pem ubuntu@15.165.105.250

# 2. 스크립트 다운로드 및 실행
wget https://raw.githubusercontent.com/loadstar0723/monstas7/master/setup-https-monsta-im.sh
chmod +x setup-https-monsta-im.sh
./setup-https-monsta-im.sh
```

## 📝 수동 설정 (단계별)

### 1. Nginx 설치
```bash
sudo apt update
sudo apt install nginx -y
```

### 2. Certbot 설치
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 3. Nginx 설정 파일 생성
```bash
sudo nano /etc/nginx/sites-available/monsta-im
```

다음 내용 붙여넣기:
```nginx
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
```

### 4. Nginx 활성화
```bash
sudo ln -s /etc/nginx/sites-available/monsta-im /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 5. SSL 인증서 발급
```bash
sudo certbot --nginx -d monsta.im -d www.monsta.im
```

### 6. 자동 갱신 설정
```bash
sudo certbot renew --dry-run
```

### 7. 환경 변수 업데이트
```bash
cd /home/ubuntu/monstas7/frontend
nano .env.production
```

다음 내용으로 수정:
```
NEXT_PUBLIC_API_URL=https://monsta.im
NEXT_PUBLIC_WS_URL=wss://monsta.im/ws
```

### 8. 서비스 재시작
```bash
sudo systemctl restart nginx
pm2 restart all
```

## ✅ 설정 확인

```bash
# HTTPS 연결 테스트
curl -I https://monsta.im

# SSL 인증서 확인
sudo certbot certificates

# Nginx 상태
sudo systemctl status nginx
```

## 🔧 문제 해결

### DNS 전파 대기
```bash
# DNS 확인
dig monsta.im
nslookup monsta.im
```

### Nginx 에러 로그
```bash
sudo tail -f /var/log/nginx/error.log
```

### Let's Encrypt 로그
```bash
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

## 📱 접속 URL

설정 완료 후:
- https://monsta.im
- https://www.monsta.im
- API: https://monsta.im/api/v1/health

## 🔐 보안 강화 (선택사항)

### SSL 보안 헤더 추가
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

### SSL 등급 A+ 설정
```bash
# Mozilla SSL Configuration Generator 참고
# https://ssl-config.mozilla.org/
```