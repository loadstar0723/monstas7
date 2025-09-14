@echo off
echo ========================================
echo Go 의존성 설치 스크립트
echo ========================================
echo.

REM Go 설치 확인
where go >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Go가 설치되지 않았습니다!
    echo.
    echo Go 설치 방법:
    echo 1. https://golang.org/dl/ 접속
    echo 2. Windows용 Go 다운로드 (예: go1.21.5.windows-amd64.msi)
    echo 3. 설치 후 이 스크립트 다시 실행
    echo.
    pause
    exit /b 1
)

echo Go 버전:
go version
echo.

REM 각 서비스 디렉토리로 이동하여 의존성 설치
echo [1/4] LSTM 서비스 의존성 설치...
cd %~dp0go-services\ai-models\lstm
go mod download
if %errorlevel% neq 0 (
    echo LSTM 의존성 설치 실패
) else (
    echo LSTM 의존성 설치 완료
)
echo.

echo [2/4] GRU 서비스 의존성 설치...
cd %~dp0go-services\ai-models\gru
go mod download
if %errorlevel% neq 0 (
    echo GRU 의존성 설치 실패
) else (
    echo GRU 의존성 설치 완료
)
echo.

echo [3/4] ARIMA 서비스 의존성 설치...
cd %~dp0go-services\ai-models\arima
go mod download
if %errorlevel% neq 0 (
    echo ARIMA 의존성 설치 실패
) else (
    echo ARIMA 의존성 설치 완료
)
echo.

echo [4/4] Random Forest 서비스 의존성 설치...
cd %~dp0go-services\ai-models\randomforest
go mod download
if %errorlevel% neq 0 (
    echo Random Forest 의존성 설치 실패
) else (
    echo Random Forest 의존성 설치 완료
)

echo.
echo ========================================
echo 의존성 설치 완료!
echo 이제 각 서비스를 실행할 수 있습니다.
echo ========================================
pause