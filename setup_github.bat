@echo off
echo ========================================
echo   MONSTA Platform - GitHub Setup
echo ========================================
echo.
echo Please follow these steps to push to GitHub:
echo.
echo 1. Create a Personal Access Token:
echo    - Go to: https://github.com/settings/tokens
echo    - Click "Generate new token (classic)"
echo    - Select scopes: repo, workflow
echo    - Copy the generated token
echo.
echo 2. Set environment variable:
echo    set GITHUB_TOKEN=your_token_here
echo.
echo 3. Create repository:
echo    gh auth login --with-token
echo    gh repo create monstas7 --public --push
echo.
echo OR use manual push:
echo    git remote add origin https://github.com/YOUR_USERNAME/monstas7.git
echo    git push -u origin master
echo.
pause