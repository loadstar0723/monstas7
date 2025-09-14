# Go AI 서비스 실행 가이드

## 🚀 빠른 실행

### 모든 서비스 한번에 실행
```bash
run-all-go-services.bat
```

## 📋 서비스 목록

| 모델 | 포트 | 설명 |
|------|------|------|
| LSTM | 8090 | 장단기 메모리 신경망 |
| GRU | 8091 | 게이트 순환 유닛 |
| ARIMA | 8092 | 자기회귀 이동평균 |
| Random Forest | 8093 | 랜덤 포레스트 |
| XGBoost | 8094 | 익스트림 그래디언트 부스팅 |

## 🔧 개별 실행 방법

### LSTM 서비스
```bash
cd go-services\ai-models\lstm
go run main.go
```

### GRU 서비스
```bash
cd go-services\ai-models\gru
go run main.go
```

### ARIMA 서비스
```bash
cd go-services\ai-models\arima
go run main.go
```

### Random Forest 서비스
```bash
cd go-services\ai-models\randomforest
go run main.go
```

### XGBoost 서비스
```bash
cd go-services\ai-models\xgboost
go run main.go
```

## 📡 WebSocket 연결

각 서비스는 WebSocket을 통해 실시간 예측을 제공합니다:
- ws://localhost:8090/ws (LSTM)
- ws://localhost:8091/ws (GRU)
- ws://localhost:8092/ws (ARIMA)
- ws://localhost:8093/ws (Random Forest)
- ws://localhost:8094/ws (XGBoost)

## 🌐 프론트엔드 접속

Next.js 개발 서버 실행:
```bash
cd frontend
npm run dev
```

브라우저에서 접속:
- http://localhost:3000/ai/lstm
- http://localhost:3000/ai/gru
- http://localhost:3000/ai/arima
- http://localhost:3000/ai/randomforest
- http://localhost:3000/ai/xgboost

## ⚡ 성능 최적화 팁

1. **Redis 설치 권장** (선택사항)
   - Windows: https://github.com/microsoftarchive/redis/releases
   - 캐싱을 통한 성능 향상

2. **Go 의존성 설치**
   ```bash
   cd go-services\ai-models
   go mod download
   ```

3. **병렬 실행**
   - 배치 파일이 모든 서비스를 병렬로 실행합니다
   - 각 서비스는 독립적으로 작동합니다

## 🔍 문제 해결

### "WebSocket 연결 실패" 메시지
- Go 서비스가 실행 중인지 확인
- 포트가 사용 중인지 확인: `netstat -an | findstr :809`
- 방화벽 설정 확인

### "go: command not found"
- Go가 설치되어 있는지 확인
- 환경 변수 PATH에 Go 경로 추가
- 설치: https://golang.org/dl/

### 서비스가 시작되지 않을 때
1. 개별 터미널에서 직접 실행해보기
2. 에러 메시지 확인
3. 의존성 재설치: `go mod tidy`

## 📊 모니터링

각 서비스는 다음 엔드포인트를 제공합니다:
- `/api/predictions` - 모든 코인 예측
- `/api/predict/{symbol}` - 특정 코인 예측
- `/api/metrics` - 모델 성능 지표
- `/api/visualization/{symbol}` - 시각화 데이터

## 🛡️ 보안 참고사항

- 모든 서비스는 localhost에서만 접근 가능
- 프로덕션 환경에서는 적절한 인증 추가 필요
- CORS는 개발 환경용으로 설정됨