# Push script for OmniGen AI
# Usage: Open PowerShell in this folder and run: .\push.ps1

Write-Host "Configuring GitHub remote..." -ForegroundColor Cyan
git remote set-url origin https://github.com/mohd897/Prime_Coders-.git

Write-Host "Adding all files..." -ForegroundColor Cyan
git add -A

Write-Host "Creating commit..." -ForegroundColor Cyan
git commit -m "OmniGen AI - Complete Project Push"

Write-Host "Pushing to GitHub (Force)..." -ForegroundColor Cyan
git push -u origin main --force

Write-Host "`nDone! Your project is now pushed to https://github.com/mohd897/Prime_Coders-.git" -ForegroundColor Green
