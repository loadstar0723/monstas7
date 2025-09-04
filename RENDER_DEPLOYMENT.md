# 🚀 MONSTA Trading V7 - Render.com 배포 가이드

## 📌 서버 배포 단계별 가이드

### Step 1: Render.com 계정 생성
1. https://render.com 접속
2. "Get Started for Free" 클릭
3. GitHub 계정으로 가입 (권장)

### Step 2: GitHub 저장소 연결
1. Render 대시보드에서 "New +" 클릭
2. "Web Service" 선택
3. GitHub 연결:
   - "Connect GitHub" 클릭
   - `loadstar0723/monstas7` 저장소 선택
   - "Connect" 클릭

### Step 3: 서비스 설정
```
Name: monsta-trading-v7
Region: Singapore (Asia) 또는 Oregon (US West)
Branch: master
Runtime: Python 3
Build Command: chmod +x render-build.sh && ./render-build.sh
Start Command: chmod +x render-start.sh && ./render-start.sh
```

### Step 4: 환경변수 설정
"Environment" 탭에서 다음 변수 추가:

```env
# Binance API (필수)
BINANCE_API_KEY=your_binance_api_key
BINANCE_API_SECRET=your_binance_api_secret

# Database (자동 생성됨)
DATABASE_URL=[Render가 자동 제공]

# Redis (선택사항)
REDIS_URL=redis://red-xxxxx.render.com:6379

# App Settings
PORT=8501
STREAMLIT_SERVER_PORT=8501
STREAMLIT_SERVER_HEADLESS=true
```

### Step 5: PostgreSQL 데이터베이스 생성
1. "New +" → "PostgreSQL" 클릭
2. 설정:
   ```
   Name: monsta-db-v7
   Database: monsta_db
   User: monsta_user
   Region: 서비스와 동일한 지역
   PostgreSQL Version: 15
   Plan: Free
   ```
3. "Create Database" 클릭
4. Connection String 복사 → Web Service 환경변수에 추가

### Step 6: Redis 캐시 생성 (선택)
1. "New +" → "Redis" 클릭
2. 설정:
   ```
   Name: monsta-redis-v7
   Region: 서비스와 동일한 지역
   Maxmemory Policy: allkeys-lru
   Plan: Free
   ```
3. "Create Redis" 클릭
4. Internal Redis URL 복사 → 환경변수에 추가

### Step 7: 배포 시작
1. 모든 설정 확인
2. "Create Web Service" 클릭
3. 자동 빌드 및 배포 시작 (약 5-10분 소요)

## ⚙️ 빌드 프로세스

자동으로 실행되는 작업:
1. Python 환경 설정
2. requirements.txt 패키지 설치
3. PostgreSQL 데이터베이스 초기화
4. 테이블 생성 및 초기 데이터 삽입
5. Streamlit 앱 시작

## 🔗 배포 후 URL

배포 완료 후 접속 URL:
```
https://monsta-trading-v7.onrender.com
```

## 🔑 테스트 계정

```
본사: admin@monsta.com / admin123
총판: dist1@monsta.com / dist1123
대리점: agency1_1@monsta.com / agency11123
구독자: user1_1_1@example.com / user111123
```

## ⚠️ 주의사항

1. **Free Plan 제한사항**:
   - 15분 동안 활동이 없으면 자동 슬립
   - 월 750시간 무료 사용
   - 재시작 시 30초 정도 소요

2. **Binance API**:
   - 실제 API 키 필요 (테스트넷 가능)
   - IP 화이트리스트 설정 권장

3. **데이터베이스**:
   - Free tier: 1GB 스토리지
   - 90일 데이터 보관

## 🔧 문제 해결

### "Build failed" 오류
```bash
# render-build.sh 권한 문제
chmod +x render-build.sh
chmod +x render-start.sh
git add .
git commit -m "Fix script permissions"
git push
```

### "Port binding" 오류
환경변수에서 PORT 확인:
```
PORT=8501
STREAMLIT_SERVER_PORT=8501
```

### 데이터베이스 연결 실패
1. DATABASE_URL 형식 확인
2. PostgreSQL 서비스 상태 확인
3. Internal Database URL 사용

## 📊 모니터링

1. **로그 확인**:
   - Render 대시보드 → Services → Logs

2. **메트릭**:
   - CPU, Memory, Network 사용량 확인

3. **알림 설정**:
   - Settings → Notifications

## 🔄 업데이트 방법

코드 수정 후:
```bash
git add .
git commit -m "Update message"
git push origin master
```
→ Render가 자동으로 재배포

## 💡 성능 최적화

1. **캐싱 활용**: Redis 설정
2. **이미지 최적화**: Docker 이미지 크기 줄이기
3. **데이터베이스 인덱싱**: 자주 조회하는 컬럼
4. **비동기 처리**: WebSocket 연결 관리

## 🆘 지원

- Render 문서: https://render.com/docs
- 프로젝트 이슈: https://github.com/loadstar0723/monstas7/issues
- Render 지원: support@render.com

---
**작성일**: 2025-09-05
**프로젝트**: MONSTA Trading Platform V7
**상태**: 배포 준비 완료