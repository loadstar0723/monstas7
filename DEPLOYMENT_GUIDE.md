# MONSTA Platform 배포 가이드

## 📋 배포 체크리스트

### ✅ 완료된 작업
- [x] 전체 코드 구현 (23개 페이지)
- [x] PostgreSQL 데이터베이스 스키마
- [x] Binance API 실시간 연동
- [x] Docker 컨테이너화
- [x] 로컬 테스트 완료 (http://localhost:8501)
- [x] Git 저장소 초기화 및 커밋

### 🚀 배포 옵션

## 1. Render.com (추천 - 무료)
```bash
1. https://render.com 계정 생성
2. GitHub 저장소 연결
3. render.yaml 파일이 자동으로 서비스 구성
4. 환경변수 설정:
   - BINANCE_API_KEY
   - BINANCE_API_SECRET
5. Deploy 클릭
```

## 2. Railway.app
```bash
# Railway CLI 설치 및 배포
npm install -g @railway/cli
railway login
railway init
railway up
```

## 3. Heroku
```bash
# Heroku CLI로 배포
heroku create monstas7
heroku addons:create heroku-postgresql:mini
heroku addons:create heroku-redis:mini
git push heroku master
```

## 4. Docker 직접 배포 (VPS/EC2)
```bash
# 서버에서 실행
git clone https://github.com/YOUR_USERNAME/monstas7.git
cd monstas7
docker-compose -f docker-compose.production.yml up -d
```

## 5. Fly.io
```bash
# Fly.io CLI로 배포
flyctl launch
flyctl deploy
```

## 📝 환경변수 설정

모든 플랫폼에서 필요한 환경변수:
```env
BINANCE_API_KEY=your_api_key
BINANCE_API_SECRET=your_api_secret
DATABASE_URL=postgresql://user:password@host:5432/monsta_db
REDIS_URL=redis://host:6379
SECRET_KEY=your_secret_key
```

## 🔐 로그인 계정

### 테스트 계정 정보
- **본사**: admin@monsta.com / admin123
- **총판**: dist1@monsta.com / dist1123
- **대리점**: agency1_1@monsta.com / agency11123
- **구독자**: user1_1_1@example.com / user111123

## 🛠️ 문제 해결

### PostgreSQL 연결 오류
```bash
# Docker 컨테이너 확인
docker ps
docker-compose up -d postgres
```

### Binance API 오류
```bash
# API 키 확인
echo $BINANCE_API_KEY
# .env 파일 확인
cat .env
```

## 📊 모니터링

### 로그 확인
```bash
# Docker 로그
docker-compose logs -f

# Heroku 로그
heroku logs --tail

# Railway 로그
railway logs
```

## 🌐 프로덕션 URL

배포 후 접속 URL:
- Render: https://monstas7.onrender.com
- Railway: https://monstas7.up.railway.app
- Heroku: https://monstas7.herokuapp.com
- Fly.io: https://monstas7.fly.dev

## 💡 추가 정보

- 모든 데이터는 실시간 Binance API에서 가져옴
- PostgreSQL에 모든 거래 및 사용자 데이터 저장
- WebSocket으로 실시간 가격 스트리밍
- 11개 AI 모델 통합 완료
- 6개 구독 등급 시스템 구현