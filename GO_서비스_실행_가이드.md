# Go AI 서비스 실행 가이드

## 1. Go 설치하기

1. https://golang.org/dl/ 접속
2. Windows용 Go 1.21+ 다운로드 (예: go1.21.5.windows-amd64.msi)
3. 설치 파일 실행 (기본 경로: C:\Program Files\Go)
4. 설치 완료 후 새 터미널 열기
5. 확인: `go version`

## 2. Go 서비스 실행하기

### 방법 1: 개별 배치 파일 실행
각 서비스 폴더에 `run.bat` 파일이 있습니다:

- LSTM: `C:\monsta\monstas7\go-services\ai-models\lstm\run.bat`
- GRU: `C:\monsta\monstas7\go-services\ai-models\gru\run.bat`
- ARIMA: `C:\monsta\monstas7\go-services\ai-models\arima\run.bat`
- Random Forest: `C:\monsta\monstas7\go-services\ai-models\randomforest\run.bat`

각 파일을 더블클릭하면 서비스가 실행됩니다.

### 방법 2: 터미널에서 직접 실행

**터미널 1 - LSTM (포트 8090)**
```bash
cd C:\monsta\monstas7\go-services\ai-models\lstm
go run main.go
```

**터미널 2 - GRU (포트 8091)**
```bash
cd C:\monsta\monstas7\go-services\ai-models\gru
go run main.go
```

**터미널 3 - ARIMA (포트 8092)**
```bash
cd C:\monsta\monstas7\go-services\ai-models\arima
go run main.go
```

**터미널 4 - Random Forest (포트 8093)**
```bash
cd C:\monsta\monstas7\go-services\ai-models\randomforest
go run main.go
```

## 3. 서비스 확인하기

각 서비스가 실행되면 다음과 같이 표시됩니다:
- "LSTM Service starting on :8090"
- "GRU Service starting on :8091"
- "ARIMA Service starting on :8092"
- "Random Forest Service starting on :8093"

## 4. 프론트엔드에서 확인

서비스가 모두 실행된 후:
1. http://localhost:3000/ai/lstm - LSTM 예측
2. http://localhost:3000/ai/gru - GRU 모델
3. http://localhost:3000/ai/arima - ARIMA 분석
4. http://localhost:3000/ai/randomforest - Random Forest

## 5. Redis (선택사항)

Redis가 필요한 경우:
1. https://github.com/microsoftarchive/redis/releases 에서 Redis-x64-3.0.504.msi 다운로드
2. 설치 후 실행: `redis-server`

## 주의사항

- 각 서비스는 별도의 터미널에서 실행해야 합니다
- 서비스가 실행 중이면 WebSocket 연결이 자동으로 성공합니다
- 실시간 예측 데이터가 표시됩니다