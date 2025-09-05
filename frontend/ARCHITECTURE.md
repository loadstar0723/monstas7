# MONSTA 하이브리드 아키텍처 가이드

## 🎯 핵심 원칙
- **진짜 하이브리드**: Next.js(프론트엔드) + Python FastAPI(백엔드)
- **모든 데이터는 실제**: NO 가짜 데이터, NO mock, NO 하드코딩
- **모듈화**: 각 페이지별 독립적 모듈로 에러 격리
- **실시간 연동**: WebSocket, 실제 API, 실제 DB 사용

## 📁 디렉토리 구조
```
frontend/
├── app/                      # 페이지 라우트
│   ├── page.tsx             # 메인 대시보드
│   ├── trading/             # 트레이딩 모듈
│   │   ├── page.tsx
│   │   └── components/
│   ├── portfolio/           # 포트폴리오 모듈
│   │   ├── page.tsx
│   │   └── components/
│   └── analytics/           # 분석 모듈
│       ├── page.tsx
│       └── components/
├── components/              # 공통 컴포넌트
│   ├── shared/             # 재사용 컴포넌트
│   ├── charts/             # 차트 컴포넌트
│   └── widgets/            # 위젯 컴포넌트
└── lib/                    # 유틸리티
    ├── api/               # API 통신
    └── hooks/             # React hooks
```

## 🔧 페이지별 기능 매핑

### 메인 대시보드 (/)
- **현재 구현 완료**: 
  - TradingView 실시간 차트
  - 암호화폐 히트맵 (상위 30개)
  - 시즌별 분석 차트
  - AI 대시보드 통합

### Trading 페이지 (/trading)
- **계획**:
  - 실시간 주문 실행 (Binance API)
  - 오더북 실시간 업데이트
  - 포지션 관리
  - 자동매매 봇 제어

### Portfolio 페이지 (/portfolio)
- **계획**:
  - 실시간 자산 현황
  - 수익률 분석
  - 리스크 관리
  - 자산 배분 최적화

### Analytics 페이지 (/analytics)
- **계획**:
  - 딥러닝 가격 예측
  - 시장 분석 리포트
  - 백테스팅 결과
  - 성과 분석

## 🚀 구현 전략

### 1단계: 기본 라우팅 설정
```typescript
// app/trading/page.tsx
export default function TradingPage() {
  // 실제 거래 데이터만 사용
  // Binance WebSocket 실시간 연동
}
```

### 2단계: API 통합
```typescript
// lib/api/binance.ts
export const binanceAPI = {
  // 실제 API 엔드포인트만 사용
  // NO mock data
}
```

### 3단계: 컴포넌트 모듈화
```typescript
// components/trading/OrderBook.tsx
export default function OrderBook() {
  // WebSocket 실시간 데이터
  // 독립적 에러 핸들링
}
```

## 🔐 데이터 소스
- **실시간 가격**: Binance WebSocket
- **거래 데이터**: Binance REST API
- **AI 분석**: Python FastAPI Backend
- **포트폴리오**: PostgreSQL DB
- **사용자 설정**: Redis Cache

## ⚡ 성능 최적화
- 각 페이지 독립 로딩
- 컴포넌트 레이지 로딩
- WebSocket 연결 풀링
- API 요청 캐싱
- 이미지 최적화

## 🛡️ 에러 처리
- 페이지별 에러 바운더리
- 컴포넌트 격리
- 자동 재시도 로직
- 사용자 친화적 에러 메시지

## 📈 모니터링
- 실시간 성능 모니터링
- 에러 추적
- API 사용량 추적
- 사용자 행동 분석