# dev-push.ps1 - one-shot commit + push
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\dev-push.ps1
#   powershell -ExecutionPolicy Bypass -File .\dev-push.ps1 "fix: xxx"
param([string]$Message = "")
$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot
$status = (git status --porcelain) -join "`n"
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "[dev-push] nothing to commit" -ForegroundColor Yellow
} else {
    if ([string]::IsNullOrWhiteSpace($Message)) {
        $stamp = Get-Date -Format "yyyy-MM-dd HH:mm"
        $Message = "chore: dev update @ $stamp"
    }
    git add -A | Out-Null
    git commit -m "$Message" | Out-Null
    Write-Host "[dev-push] committed: $Message" -ForegroundColor Green
}
Write-Host "[dev-push] pushing to origin/main ..." -ForegroundColor Cyan
git push origin main
$headShort = git rev-parse --short HEAD
Write-Host ""
Write-Host "================ URLS ================" -ForegroundColor Magenta
Write-Host " HEAD            : $headShort"
Write-Host " Mobile (Pages)  : https://lupeng0330.github.io/english-tutor/?v=$headShort"
Write-Host " PC local        : http://localhost:8765/index.html"
Write-Host " IDE mobile      : http://localhost:8765/mobile.html"
Write-Host "======================================" -ForegroundColor Magenta