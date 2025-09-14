@echo off
echo ===================================
echo MONSTA AI Services 실행 스크립트
echo ===================================
echo.
echo Go가 설치되어 있어야 합니다!
echo https://golang.org/dl/ 에서 Go 1.21+ 를 다운로드하세요.
echo.
echo Go가 설치되어 있다면 각 터미널에서 다음 명령을 실행하세요:
echo.
echo [터미널 1] LSTM 서비스 (포트 8090):
echo cd %~dp0go-services\ai-models\lstm
echo go run main.go
echo.
echo [터미널 2] GRU 서비스 (포트 8091):
echo cd %~dp0go-services\ai-models\gru
echo go run main.go
echo.
echo [터미널 3] ARIMA 서비스 (포트 8092):
echo cd %~dp0go-services\ai-models\arima
echo go run main.go
echo.
echo [터미널 4] Random Forest 서비스 (포트 8093):
echo cd %~dp0go-services\ai-models\randomforest
echo go run main.go
echo.
echo ===================================
echo Redis가 필요한 경우 (선택사항):
echo redis-server
echo ===================================
echo.
pause