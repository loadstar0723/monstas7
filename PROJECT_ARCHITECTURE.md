# MONSTA 프로젝트 아키텍처 가이드

> **중요**: 이 문서는 MONSTA 프로젝트의 핵심 아키텍처를 정의합니다. 모든 개발은 이 구조를 따라야 합니다.

## 🏗️ 하이브리드 아키텍처 (필수 유지)

```
Frontend (Next.js 15.5.2 + TypeScript)
    ├── Supabase (인증, 실시간 DB, 사용자 데이터)
    └── Go Backend (AI 예측, 기술지표, 트레이딩 로직)
            └── PostgreSQL + Redis (시장 데이터, AI 모델)
```

## 📊 기술 스택별 역할 분담

### 1. **Supabase 담당 영역**
- ✅ 사용자 인증 및 회원가입
- ✅ 사용자 프로필 및 설정 관리
- ✅ 구독 등급 관리 (Free ~ Black)
- ✅ 트레이딩 시그널 저장 및 조회
- ✅ 포트폴리오 데이터 관리
- ✅ 거래 이력 저장
- ✅ 알림 설정 관리
- ✅ 백테스팅 결과 저장
- ✅ 실시간 데이터 구독 (Realtime)
- ✅ Row Level Security (RLS)
- ✅ 파일 스토리지
- ✅ 소셜 로그인 (OAuth)

### 2. **Go Backend 담당 영역 (포트 8092)**
- ✅ 10개 AI 모델 운영
  - Pattern Recognition (패턴 인식)
  - Neural Network (신경망)
  - LSTM (장단기 메모리)
  - GRU (게이트 순환 유닛)
  - XGBoost (그래디언트 부스팅)
  - ARIMA (시계열 분석)
  - LightGBM (빠른 부스팅)
  - Random Forest (랜덤 포레스트)
  - Ensemble (앙상블)
  - Technical Analysis (기술적 분석)
- ✅ 기술적 지표 계산 (RSI, MACD, Bollinger Bands 등)
- ✅ Binance WebSocket 실시간 연동
- ✅ 고성능 예측 엔진
- ✅ Redis 캐싱 레이어
- ✅ PostgreSQL 데이터베이스 연동

### 3. **Frontend (Next.js) 담당 영역**
- ✅ UI/UX 렌더링
- ✅ 클라이언트 상태 관리
- ✅ API 프록시 라우트
- ✅ WebSocket 연결 관리
- ✅ 모바일 반응형 디자인

## 🔄 데이터 흐름

```
사용자 요청
    ↓
Next.js Frontend
    ├→ Supabase (사용자 데이터)
    │    └→ PostgreSQL (Supabase 관리)
    └→ Go Backend API
         ├→ AI 모델 예측
         ├→ 기술 지표 계산
         ├→ Binance WebSocket
         └→ PostgreSQL + Redis
```

## 📁 프로젝트 구조

```
monstas7/
├── frontend/                    # Next.js 프론트엔드
│   ├── app/                    # App Router 페이지
│   ├── components/             # React 컴포넌트
│   ├── lib/                    # 유틸리티 및 서비스
│   │   ├── supabase.ts        # Supabase 클라이언트
│   │   └── services/
│   │       └── goBackendService.ts  # Go API 서비스
│   └── public/                 # 정적 파일
│
├── backend-go/                 # Go 백엔드
│   ├── cmd/server/main.go     # 서버 엔트리포인트
│   ├── internal/
│   │   ├── ai/                # AI 모델 로직
│   │   ├── indicators/        # 기술 지표
│   │   ├── market/            # 시장 데이터
│   │   └── database/          # DB 연동
│   └── go.mod                 # Go 의존성
│
└── supabase/                   # Supabase 설정
    ├── migrations/             # DB 마이그레이션
    └── config.toml            # Supabase 설정

```

## 🚀 개발 환경 실행

```bash
# 1. Go Backend 실행 (포트 8092)
cd backend-go
go build -o monstas7-server cmd/server/main.go
PORT=8092 ./monstas7-server

# 2. Frontend 실행
cd frontend
npm run dev  # 또는 npx next dev -p [포트번호]

# 3. Supabase (클라우드 서비스 사용)
# 별도 실행 불필요 - 환경변수만 설정
```

## 🔐 환경변수 설정

```bash
# frontend/.env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Go Backend
GO_BACKEND_URL=http://localhost:8092
NEXT_PUBLIC_GO_BACKEND_URL=http://localhost:8092

# PostgreSQL (Go Backend용)
DATABASE_URL=postgresql://user:password@localhost:5432/monstas7

# Redis
REDIS_URL=redis://localhost:6379
```

## ⚠️ 중요 원칙

1. **역할 분리 엄수**: 각 서비스는 정해진 역할만 수행
2. **중복 방지**: 같은 기능을 여러 곳에서 구현하지 않음
3. **API 통신**: Frontend는 항상 API를 통해서만 백엔드와 통신
4. **실시간 데이터**:
   - 사용자 데이터 변경: Supabase Realtime
   - 시장 데이터: Binance WebSocket (Go Backend 경유)
5. **인증 플로우**: 모든 인증은 Supabase Auth 사용

## 📈 성능 최적화

- **Go Backend**: 초당 10,000+ 요청 처리
- **Redis 캐싱**: 응답시간 < 5ms
- **Supabase**: Row Level Security로 보안 강화
- **Next.js**: ISR/SSG로 초기 로딩 최적화

## 🔧 확장 계획

1. **단기 (현재 구현됨)**
   - ✅ 10개 AI 모델 통합
   - ✅ Binance 실시간 데이터
   - ✅ 기술적 지표 계산
   - ✅ Supabase 인증

2. **중기 (계획)**
   - Kubernetes 배포
   - 멀티 거래소 지원
   - 고급 백테스팅 엔진
   - 소셜 트레이딩 기능

3. **장기 (로드맵)**
   - 자체 거래소 연동
   - DeFi 통합
   - 모바일 앱 (React Native)
   - AI 모델 자동 학습

## 📝 개발 규칙

1. **Mock 데이터 절대 금지** - 모든 데이터는 실제 소스에서
2. **하이브리드 구조 유지** - 전면 교체 아님
3. **각 서비스 독립성** - 서비스 간 강한 결합 방지
4. **문서화 필수** - 모든 API 엔드포인트 문서화

---

**마지막 업데이트**: 2024-12-18
**작성자**: Claude & MONSTA Team
**버전**: 1.0.0

> 이 문서는 MONSTA 프로젝트의 영구 참조 문서입니다. 모든 개발자는 이 아키텍처를 준수해야 합니다.