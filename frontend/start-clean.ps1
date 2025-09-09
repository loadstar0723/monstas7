# Kill all Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "All Node processes killed" -ForegroundColor Green

# Wait a moment
Start-Sleep -Seconds 2

# Clear Next.js cache
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
    Write-Host ".next cache cleared" -ForegroundColor Green
}

# Start dev server
Write-Host "Starting development server..." -ForegroundColor Yellow
npx next dev -H 0.0.0.0 -p 3000