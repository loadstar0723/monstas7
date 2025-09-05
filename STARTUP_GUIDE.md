# 🚀 MONSTA AI Trading Platform - 시작 가이드

## ✅ 서버 시작 방법 (항상 접속 가능하게)

### 방법 1: 자동 시작 스크립트 (추천)
```bash
cd C:\monsta\monstas7\frontend
start-server.bat
```
- 자동으로 캐시 정리 후 서버 시작

### 방법 2: npm 명령어
```bash
cd C:\monsta\monstas7\frontend

# 캐시 정리 후 시작 (문제 발생 시)
npm run dev:clean

# 일반 시작
npm run dev
```

## 🌐 접속 주소
- **로컬**: http://localhost:3000
- **네트워크**: http://172.30.1.24:3000

## 📱 페이지 구조
- **메인 대시보드**: http://172.30.1.24:3000
- **트레이딩**: http://172.30.1.24:3000/trading
- **포트폴리오**: http://172.30.1.24:3000/portfolio
- **AI 분석**: http://172.30.1.24:3000/analytics

## 🔧 문제 해결

### Internal Server Error 발생 시
1. 서버 종료 (Ctrl + C)
2. 캐시 정리: `npm run clean`
3. 서버 재시작: `npm run dev`

### 포트 충돌 시
```bash
# Windows에서 포트 3000 사용 프로세스 확인
netstat -ano | findstr :3000

# 프로세스 종료
taskkill //F //PID [프로세스ID]
```

### Cross-Origin 오류 시
- next.config.ts에 이미 설정되어 있음
- 캐시 정리 후 재시작

## 💾 백업 및 Git

### 백업 생성
```bash
git add -A
git commit -m "백업 메시지"
```

### 변경사항 확인
```bash
git status
git log --oneline
```

## 🔥 성능 최적화

### 개발 서버 최적화
- .next 폴더 정기적 정리
- 불필요한 console.log 제거
- WebSocket 연결 최적화

### 프로덕션 빌드
```bash
npm run build
npm run start
```

## 📊 모니터링

### 서버 상태 확인
- 터미널에서 실시간 로그 확인
- 브라우저 개발자 도구 (F12) 네트워크 탭

### WebSocket 연결 상태
- 브라우저 개발자 도구 > Network > WS 탭

## 🛡️ 보안 설정

### 환경 변수 (.env.local)
```env
# API 키는 여기에 저장
BINANCE_API_KEY=your_key
BINANCE_SECRET_KEY=your_secret
```

## 📝 참고사항
- 모든 데이터는 실시간 API 연동
- 가짜 데이터 사용 금지
- 페이지별 독립 모듈화로 에러 격리
- Cross-origin 요청 자동 허용

## 🆘 긴급 복구
```bash
# 모든 프로세스 종료
taskkill //F //IM node.exe

# 캐시 완전 삭제
cd C:\monsta\monstas7\frontend
rmdir /s /q .next
rmdir /s /q node_modules/.cache

# 재시작
npm run dev
```

---
최종 업데이트: 2025-09-05
by MONSTA Team with Claude AI