# AI Analysis Service (Go)

MONSTA 프로젝트의 고성능 AI 분석 서비스입니다.

## 주요 기능

- 🤖 실시간 시장 분석 (센티먼트, 트렌드, 리스크)
- 📈 AI 가격 예측 (1시간, 4시간, 1일)
- 🎯 거래 기회 자동 탐지
- 📊 기술적 지표 실시간 계산 (RSI, MACD, 볼린저 밴드)
- 🔄 WebSocket을 통한 실시간 데이터 스트리밍
- 💾 Redis를 통한 고속 데이터 캐싱

## API 엔드포인트

### WebSocket
- `ws://localhost:8083/ws/analysis` - 실시간 분석 데이터 스트림

### REST API
- `GET /api/analysis/current` - 현재 분석 데이터
- `GET /api/analysis/predictions` - AI 가격 예측
- `GET /api/analysis/opportunities` - 거래 기회
- `GET /api/analysis/indicators` - 기술적 지표
- `GET /api/analysis/patterns/{symbol}` - 차트 패턴 인식

## 실행 방법

### 로컬 실행
```bash
# 의존성 설치
go mod download

# 실행
go run main.go
```

### Docker 실행
```bash
# 빌드
docker build -t monsta-ai-analysis .

# 실행
docker run -p 8083:8083 monsta-ai-analysis
```

## 환경 설정

- Redis 서버: `localhost:6379` (선택사항, 없어도 실행 가능)
- 서비스 포트: `8083`

## 데이터 구조

### MarketAnalysis
```json
{
  "timestamp": "2024-01-01T00:00:00Z",
  "market_sentiment": "중립",
  "trend_direction": "상승",
  "strength": 65.5,
  "predictions": [...],
  "indicators": {...},
  "opportunities": [...],
  "risk_level": "MEDIUM",
  "ai_confidence": 85.0
}
```

## 연동 방법

React 컴포넌트에서 WebSocket 연결:
```typescript
const ws = new WebSocket('ws://localhost:8083/ws/analysis')

ws.onmessage = (event) => {
  const analysis = JSON.parse(event.data)
  // 분석 데이터 처리
}
```