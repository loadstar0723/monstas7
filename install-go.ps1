# PowerShell script to download and install Go
$ErrorActionPreference = "Stop"

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Go 자동 설치 스크립트" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Go 버전 설정
$goVersion = "1.21.5"
$goArch = "amd64"
$goOS = "windows"
$goFileName = "go$goVersion.$goOS-$goArch.msi"
$goUrl = "https://go.dev/dl/$goFileName"
$downloadPath = "$env:TEMP\$goFileName"

Write-Host "`nGo $goVersion 다운로드 중..." -ForegroundColor Yellow
Write-Host "URL: $goUrl" -ForegroundColor Gray

# Go 다운로드
try {
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri $goUrl -OutFile $downloadPath
    Write-Host "다운로드 완료!" -ForegroundColor Green
} catch {
    Write-Host "다운로드 실패: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`nGo 설치 중..." -ForegroundColor Yellow

# MSI 설치
try {
    Start-Process msiexec.exe -Wait -ArgumentList "/i", $downloadPath, "/quiet", "/norestart"
    Write-Host "설치 완료!" -ForegroundColor Green
} catch {
    Write-Host "설치 실패: $_" -ForegroundColor Red
    Write-Host "수동으로 설치하세요: $downloadPath" -ForegroundColor Yellow
    exit 1
}

# 환경 변수 업데이트
$goPath = "C:\Program Files\Go\bin"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($currentPath -notlike "*$goPath*") {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$goPath", "User")
    Write-Host "`n환경 변수 설정 완료!" -ForegroundColor Green
}

# 임시 파일 삭제
Remove-Item $downloadPath -Force -ErrorAction SilentlyContinue

Write-Host "`n====================================" -ForegroundColor Cyan
Write-Host "Go 설치 완료!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "`n새 터미널을 열고 다음 명령으로 확인하세요:"
Write-Host "go version" -ForegroundColor Yellow
Write-Host "`n주의: 현재 터미널을 닫고 새로 열어야 go 명령을 사용할 수 있습니다!" -ForegroundColor Red