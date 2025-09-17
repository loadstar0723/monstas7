# Go Trading Engine - MONSTA AI

## 🚀 고성능 트레이딩 엔진

Go로 구현된 초고속 AI 트레이딩 백엔드

### 📊 성능 목표
- 초당 100,000 틱 처리
- 1,000개 심볼 동시 모니터링
- 10ms 이하 레이턴시
- 메모리 사용량 50% 절감

### 🏗️ 아키텍처

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Binance   │────▶│  Go Engine  │────▶│  AI Models  │
│  WebSocket  │     │  (Gateway)  │     │  (Python)   │
└─────────────┘     └─────────────┘     └─────────────┘
       ↓                   ↓                    ↓
   실시간 가격         데이터 처리           예측/신호
```

### 📁 프로젝트 구조

```
go-trading-engine/
├── cmd/
│   └── server/         # 메인 서버
├── internal/
│   ├── gateway/        # API 게이트웨이
│   ├── websocket/      # WebSocket 핸들러
│   ├── pipeline/       # 데이터 파이프라인
│   ├── cache/          # Redis 캐싱
│   └── models/         # 데이터 모델
├── pkg/
│   ├── binance/        # Binance API 클라이언트
│   ├── indicators/     # 기술적 지표
│   └── backtest/       # 백테스팅 엔진
├── ai/
│   ├── lstm/           # LSTM 연동
│   ├── xgboost/        # XGBoost 연동
│   └── ensemble/       # 앙상블 모델
├── configs/            # 설정 파일
├── scripts/            # 유틸리티 스크립트
├── go.mod
└── go.sum
```

### 🚀 시작하기

```bash
# 프로젝트 초기화
go mod init github.com/loadstar0723/monstas7/go-trading-engine

# 의존성 설치
go get github.com/gorilla/websocket
go get github.com/go-redis/redis/v8
go get github.com/gin-gonic/gin

# 서버 실행
go run cmd/server/main.go
```

### 🔧 환경 설정

```yaml
# configs/config.yaml
server:
  port: 8080
  mode: release

binance:
  ws_endpoint: wss://stream.binance.com:9443/ws
  rest_endpoint: https://api.binance.com

redis:
  host: localhost:6379
  db: 0

ai:
  python_api: http://localhost:8000
  timeout: 5s
```

### 📈 성능 벤치마크

| 항목 | Node.js | Go | 개선율 |
|------|---------|-----|--------|
| 초당 처리량 | 10,000 | 100,000 | 10x |
| 메모리 사용 | 1GB | 200MB | 80% 감소 |
| 레이턴시 | 50ms | 5ms | 10x |
| 동시 연결 | 1,000 | 10,000 | 10x |

### 🎯 구현 로드맵

- [x] Phase 0: 프로젝트 구조 설계
- [ ] Phase 1: WebSocket 게이트웨이
- [ ] Phase 2: 데이터 파이프라인
- [ ] Phase 3: AI 모델 연동
- [ ] Phase 4: 백테스팅 엔진
- [ ] Phase 5: 실전 배포