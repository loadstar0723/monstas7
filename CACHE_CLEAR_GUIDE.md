# 🧹 MONSTA 프로덕션 서버 캐시 정리 가이드

## 🚨 문제 상황
프로덕션 서버(13.209.84.93)에서 toFixed 에러가 지속적으로 발생하고 있습니다. 
코드는 수정되었지만 캐시로 인해 이전 버전이 계속 제공되고 있습니다.

## 🔧 해결 방법

### 1. SSH로 서버 접속
```bash
ssh ubuntu@13.209.84.93
```

### 2. 캐시 정리 스크립트 실행
```bash
cd /home/ubuntu/monstas7
chmod +x clear-server-cache.sh
./clear-server-cache.sh
```

### 3. 수동으로 캐시 정리 (스크립트가 없을 경우)

#### PM2 프로세스 중지
```bash
pm2 stop all
pm2 status
```

#### Next.js 캐시 삭제
```bash
cd /home/ubuntu/monstas7/frontend
rm -rf .next
rm -rf node_modules/.cache
```

#### 의존성 재설치 및 빌드
```bash
npm ci --production
npm run build
```

#### PM2 재시작
```bash
cd /home/ubuntu/monstas7
pm2 start ecosystem.config.js
pm2 logs --lines 20
```

### 4. 브라우저 캐시 정리 (클라이언트 측)

#### Chrome/Edge
- `Ctrl + Shift + R` (Windows/Linux)
- `Cmd + Shift + R` (Mac)
- 또는 개발자 도구 (F12) → Network 탭 → "Disable cache" 체크

#### 완전한 캐시 삭제
1. 브라우저 설정 → 개인정보 및 보안
2. 인터넷 사용 기록 삭제
3. "캐시된 이미지 및 파일" 선택
4. 삭제

### 5. CloudFlare/CDN 캐시 정리 (해당하는 경우)
- CloudFlare 대시보드 → Caching → Configuration
- "Purge Everything" 클릭

## 🔍 캐시 정리 확인

### 1. 버전 확인
브라우저 개발자 도구에서:
```javascript
console.log(window.CACHE_VERSION)
```

### 2. 네트워크 탭 확인
- 개발자 도구 → Network 탭
- JS 파일들이 200 OK (not 304 Not Modified)로 로드되는지 확인

### 3. toFixed 에러 해결 확인
- 콘솔에 toFixed 에러가 없어야 함
- 모든 숫자값이 정상적으로 표시되어야 함

## ⚡ 빠른 해결법

### Windows에서 실행
```cmd
clear-cache-windows.bat
```

### 한 줄 명령어 (원격 실행)
```bash
ssh ubuntu@13.209.84.93 "cd /home/ubuntu/monstas7 && pm2 stop all && cd frontend && rm -rf .next && npm run build && cd .. && pm2 start ecosystem.config.js"
```

## 🛡️ 향후 예방책

1. **버전 관리**: 빌드 시 자동으로 버전 번호 업데이트
2. **캐시 헤더 설정**: Next.js에서 적절한 캐시 정책 설정
3. **자동 캐시 무효화**: 배포 시 자동으로 캐시 정리

## 📞 문제 지속 시

1. PM2 로그 확인: `pm2 logs --lines 100`
2. 서버 재부팅: `sudo reboot`
3. Docker 재시작 (사용 중인 경우): `docker-compose restart`