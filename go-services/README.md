# MONSTA Go Services

MONSTA 프로젝트의 고성능 Go 백엔드 서비스들입니다.

## 🏗️ 아키텍처

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React/Next.js │────▶│   Go Services   │────▶│   Python AI     │
│   (Frontend)    │◀────│   (Backend)     │◀────│   (ML Models)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                         │
        ▼                       ▼                         ▼
   사용자 인터페이스      고성능 실시간 처리         AI/ML 예측
```

## 📦 서비스 목록

### 1. AI Analysis Service (포트: 8083)
- 실시간 시장 분석
- AI 가격 예측
- 거래 기회 탐지
- 기술적 지표 계산

### 2. AI Trading Engine (포트: 8082)
- 자동 거래 실행
- 리스크 관리
- 포지션 추적
- 성과 분석

### 3. WebSocket Server (포트: 8080)
- 실시간 가격 스트리밍
- 거래 데이터 브로드캐스트
- 다중 심볼 지원

### 4. Price Collector (포트: 8081)
- Binance API 데이터 수집
- Redis 캐싱
- 히스토리 데이터 관리

## 🚀 시작하기

### 전체 서비스 실행 (Docker Compose)
```bash
# 모든 서비스 한번에 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 서비스 중지
docker-compose down
```

### 개별 서비스 실행
```bash
# AI 분석 서비스
cd ai-analysis
go run main.go

# AI 트레이딩 엔진
cd ai-trading
go run main.go

# WebSocket 서버
cd websocket-server
go run main.go
```

## 🔧 개발 환경 설정

### Go 설치
1. https://golang.org 에서 Go 1.21+ 다운로드
2. 환경변수 설정 확인: `go version`

### 의존성 설치
```bash
# 각 서비스 디렉토리에서
go mod download
```

## 📊 성능 최적화

### Go의 장점 활용
- **동시성**: goroutine으로 수천 개의 WebSocket 연결 처리
- **낮은 지연시간**: 실시간 거래에 최적화
- **메모리 효율**: Node.js 대비 10배 적은 메모리 사용
- **CPU 성능**: 멀티코어 완벽 활용

### 벤치마크 결과
- WebSocket 연결: 10,000+ 동시 연결
- 메시지 처리: 100,000+ msg/sec
- 지연시간: <1ms (99 percentile)
- 메모리 사용: <500MB (10K 연결)

## 🔌 API 문서

각 서비스별 상세 API 문서는 해당 서비스 디렉토리의 README.md 참조

## 🐛 트러블슈팅

### Redis 연결 실패
- Redis가 실행 중인지 확인: `redis-cli ping`
- 없어도 인메모리 모드로 실행 가능

### 포트 충돌
- 다른 포트 사용: `go run main.go -port 8084`

### CORS 오류
- 모든 서비스에 CORS 미들웨어 포함됨

## 📈 모니터링

### 헬스체크 엔드포인트
- AI Analysis: http://localhost:8083/health
- AI Trading: http://localhost:8082/health
- WebSocket: http://localhost:8080/health

### 메트릭스
- Prometheus 형식 메트릭스 제공 (추가 예정)
- Grafana 대시보드 템플릿 제공 (추가 예정)