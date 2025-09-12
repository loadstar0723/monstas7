# PowerShell script to trigger GitHub Actions workflow
$owner = "loadstar0723"
$repo = "monstas7"
$workflow_file = "simple-deploy.yml"

# Trigger workflow using curl (no authentication needed for public repos with workflow_dispatch)
Write-Host "🚀 Triggering Simple Deploy workflow..." -ForegroundColor Green

# Use GitHub API to trigger workflow
$url = "https://api.github.com/repos/$owner/$repo/actions/workflows/$workflow_file/dispatches"

# Create the JSON payload
$json = @{
    ref = "master"
} | ConvertTo-Json

# Try to trigger without auth (for public repos)
try {
    Invoke-RestMethod -Uri $url -Method Post -Body $json -ContentType "application/json" -Headers @{
        "Accept" = "application/vnd.github.v3+json"
        "User-Agent" = "PowerShell"
    }
    Write-Host "✅ Workflow triggered successfully!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Triggering workflow requires authentication. Opening GitHub Actions page..." -ForegroundColor Yellow
    Start-Process "https://github.com/$owner/$repo/actions/workflows/$workflow_file"
    Write-Host "Please click 'Run workflow' button manually in the browser." -ForegroundColor Cyan
}

# Also open the Actions page to monitor
Write-Host "📊 Opening GitHub Actions page to monitor deployment..." -ForegroundColor Blue
Start-Process "https://github.com/$owner/$repo/actions"

Write-Host "`n📝 To check deployment status:" -ForegroundColor Cyan
Write-Host "1. Go to GitHub Actions page" -ForegroundColor White
Write-Host "2. Check for green checkmarks" -ForegroundColor White
Write-Host "3. Visit http://13.209.84.93:3000 to verify" -ForegroundColor White