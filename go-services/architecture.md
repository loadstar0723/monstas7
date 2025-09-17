# MONSTA Go 하이브리드 아키텍처

## 현재 구조 (3-Tier)

```
┌──────────────────────────────────────────┐
│    Frontend Layer (Next.js/TypeScript)    │
│  - React Components                       │
│  - Real-time Charts                       │
│  - WebSocket Client                       │
└──────────────────┬───────────────────────┘
                   │ REST/WebSocket
┌──────────────────┴───────────────────────┐
│      Go Service Layer (Performance)       │
│  - WebSocket Server (Gorilla)             │
│  - API Gateway                            │
│  - Rate Limiter                           │
│  - Cache Manager (Redis)                  │
│  - Message Queue (NATS/RabbitMQ)         │
└──────────────────┬───────────────────────┘
                   │ gRPC/REST
┌──────────────────┴───────────────────────┐
│     Python AI/ML Layer (Intelligence)     │
│  - TensorFlow/PyTorch Models              │
│  - Scikit-learn Processing                │
│  - Data Analysis                          │
│  - Backtesting Engine                     │
└──────────────────────────────────────────┘
```

## Go 서비스 역할

### 1. WebSocket Server (고성능 실시간)
- **파일**: `websocket-server/main.go`
- **역할**: 실시간 가격 스트리밍
- **성능**: 10,000+ 동시 연결 처리

### 2. Price Collector
- **파일**: `price-collector/main.go`
- **역할**: Binance API 데이터 수집
- **특징**: Rate limiting, 자동 재연결

### 3. AI Model Executors
- **LSTM**: 시계열 예측 (1H, 4H, 1D)
- **XGBoost**: 분류 예측 (상승/하락)
- **LightGBM**: 고속 그래디언트 부스팅
- **Random Forest**: 앙상블 예측
- **GRU**: 게이트 순환 유닛
- **ARIMA**: 통계적 시계열

### 4. AI Trading Engine
- **파일**: `ai-trading/main.go`
- **역할**: 자동매매 실행
- **특징**: 리스크 관리, 포지션 관리

## Python과의 통신

### gRPC 프로토콜
```protobuf
service AIModel {
    rpc Predict(PredictionRequest) returns (PredictionResponse);
    rpc Train(TrainRequest) returns (TrainResponse);
    rpc GetMetrics(MetricsRequest) returns (MetricsResponse);
}
```

### REST API Fallback
```go
// Python 모델 호출
resp, err := http.Post("http://python-api:8000/predict",
    "application/json",
    bytes.NewBuffer(jsonData))
```

## 성능 최적화 전략

### 1. Connection Pooling
```go
var connPool = &sync.Pool{
    New: func() interface{} {
        return createNewConnection()
    },
}
```

### 2. Message Batching
```go
// 100ms 또는 100개 메시지마다 배치 처리
batch := make([]Message, 0, 100)
ticker := time.NewTicker(100 * time.Millisecond)
```

### 3. Circuit Breaker Pattern
```go
// 서비스 장애 시 자동 차단
breaker := gobreaker.NewCircuitBreaker(gobreaker.Settings{
    Timeout:  60 * time.Second,
    MaxRequests: 5,
})
```

## 확장 계획

### Phase 1: 인프라 강화
- [ ] Kubernetes 배포
- [ ] Service Mesh (Istio)
- [ ] Distributed Tracing (Jaeger)

### Phase 2: 성능 개선
- [ ] QUIC 프로토콜 도입
- [ ] Memory Pool 최적화
- [ ] Zero-copy 네트워킹

### Phase 3: AI 고도화
- [ ] Model Serving (TensorFlow Serving 연동)
- [ ] A/B Testing Framework
- [ ] AutoML Pipeline

## 모니터링 메트릭

### Go 서비스 메트릭
- Goroutine 수
- GC 일시정지 시간
- 메모리 사용량
- CPU 사용률
- WebSocket 연결 수
- 메시지 처리량 (msg/sec)

### 비즈니스 메트릭
- 예측 정확도
- 거래 수익률
- API 응답시간
- 시스템 가용성

## 보안 고려사항

### 1. TLS/SSL
- 모든 통신 암호화
- 인증서 자동 갱신

### 2. Rate Limiting
- IP별 요청 제한
- Token Bucket 알고리즘

### 3. Authentication
- JWT 토큰 인증
- API Key 관리

## 개발 가이드

### Go 코드 스타일
```go
// 항상 error 체크
if err != nil {
    return fmt.Errorf("failed to connect: %w", err)
}

// Context 사용
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

// Defer로 리소스 정리
defer conn.Close()
```

### 테스트
```bash
# 유닛 테스트
go test ./...

# 벤치마크
go test -bench=.

# 레이스 컨디션 체크
go test -race
```

### 빌드 최적화
```bash
# 최적화 빌드
CGO_ENABLED=0 GOOS=linux go build -a -ldflags="-s -w" -o app

# Docker 멀티스테이지 빌드
FROM golang:1.21-alpine AS builder
# ... build
FROM scratch
COPY --from=builder /app /app
```

## 결론

Go 하이브리드 아키텍처는 MONSTA 시스템의 핵심으로:
- **성능**: Python 대비 10배 빠른 응답
- **확장성**: 수평 확장 가능한 마이크로서비스
- **안정성**: 강력한 타입 시스템과 에러 처리
- **효율성**: 적은 리소스로 높은 처리량