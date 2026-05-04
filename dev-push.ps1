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
$fullUrl   = "https://lupeng0330.github.io/english-tutor/?v=$headShort"
Write-Host ""
Write-Host "================ URLS ================" -ForegroundColor Magenta
Write-Host " HEAD            : $headShort"
Write-Host " Mobile (Pages)  : $fullUrl" -ForegroundColor Green
Write-Host " PC local        : http://localhost:8765/index.html"
Write-Host " IDE mobile      : http://localhost:8765/mobile.html"
Write-Host "======================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "TIP  手机端看不到最新？" -ForegroundColor Yellow
Write-Host "  1) 用上面带 ?v=$headShort 的链接打开即可强制破缓存"
Write-Host "  2) 微信内置浏览器：右上角...菜单 -> 刷新 / 用Safari打开"
Write-Host "  3) GitHub Pages CDN 通常 1-3 分钟生效，若还看不到先等一下再刷新"
Write-Host ""

# 🆕 尝试把 URL 复制到剪贴板，方便直接在手机上粘贴或发到微信
try {
    $fullUrl | Set-Clipboard
    Write-Host "[dev-push] Mobile URL copied to clipboard." -ForegroundColor DarkGreen
} catch {}
