@echo off
echo ====================================
echo 모든 Go AI 서비스 실행
echo ====================================

set GO_PATH=C:\Program Files\Go\bin\go.exe

echo LSTM 서비스 시작 (포트 8090)...
start cmd /k "cd /d %~dp0go-services\ai-models\lstm && "%GO_PATH%" run main.go"

timeout /t 2 /nobreak > nul

echo GRU 서비스 시작 (포트 8091)...
start cmd /k "cd /d %~dp0go-services\ai-models\gru && "%GO_PATH%" run main.go"

timeout /t 2 /nobreak > nul

echo ARIMA 서비스 시작 (포트 8092)...
start cmd /k "cd /d %~dp0go-services\ai-models\arima && "%GO_PATH%" run main.go"

timeout /t 2 /nobreak > nul

echo Random Forest 서비스 시작 (포트 8093)...
start cmd /k "cd /d %~dp0go-services\ai-models\randomforest && "%GO_PATH%" run main.go"

timeout /t 2 /nobreak > nul

echo XGBoost 서비스 시작 (포트 8094)...
start cmd /k "cd /d %~dp0go-services\ai-models\xgboost && "%GO_PATH%" run main.go"

timeout /t 2 /nobreak > nul

echo LightGBM 서비스 시작 (포트 8095)...
start cmd /k "cd /d %~dp0go-services\ai-models\lightgbm && "%GO_PATH%" run main.go"

echo.
echo ====================================
echo 모든 서비스가 시작되었습니다!
echo ====================================
echo.
echo 확인: http://localhost:3000/ai/lstm
echo       http://localhost:3000/ai/gru
echo       http://localhost:3000/ai/arima
echo       http://localhost:3000/ai/randomforest
echo       http://localhost:3000/ai/xgboost
echo       http://localhost:3000/ai/lightgbm
echo.
pause