# PowerShell 스크립트 - 모든 AI 서비스 실행
# 실행 방법: PowerShell에서 .\start-all-ai-services.ps1

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "MONSTA AI Services 시작" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Go 설치 확인
try {
    $goVersion = go version
    Write-Host "Go 버전: $goVersion" -ForegroundColor Green
} catch {
    Write-Host "Go가 설치되지 않았습니다!" -ForegroundColor Red
    Write-Host "https://golang.org/dl/ 에서 Go를 설치하세요." -ForegroundColor Yellow
    exit
}

# 서비스 디렉토리
$baseDir = $PSScriptRoot
$services = @(
    @{Name="LSTM"; Path="$baseDir\go-services\ai-models\lstm"; Port="8090"},
    @{Name="GRU"; Path="$baseDir\go-services\ai-models\gru"; Port="8091"},
    @{Name="ARIMA"; Path="$baseDir\go-services\ai-models\arima"; Port="8092"},
    @{Name="Random Forest"; Path="$baseDir\go-services\ai-models\randomforest"; Port="8093"}
)

# 각 서비스를 새 터미널에서 실행
foreach ($service in $services) {
    Write-Host "Starting $($service.Name) service on port $($service.Port)..." -ForegroundColor Yellow
    
    $command = "cd '$($service.Path)'; go run main.go"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $command
    
    Start-Sleep -Seconds 2
}

Write-Host "`n====================================" -ForegroundColor Cyan
Write-Host "모든 서비스가 시작되었습니다!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "`n프론트엔드에서 확인하세요:"
Write-Host "http://localhost:3000/ai/lstm" -ForegroundColor Blue
Write-Host "http://localhost:3000/ai/gru" -ForegroundColor Blue
Write-Host "http://localhost:3000/ai/arima" -ForegroundColor Blue
Write-Host "http://localhost:3000/ai/randomforest" -ForegroundColor Blue