# dev-push.ps1 - one-shot commit + push
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\dev-push.ps1
#   powershell -ExecutionPolicy Bypass -File .\dev-push.ps1 "fix: xxx"
param([string]$Message = "")
$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

# 🆕 先判断工作区是否有业务改动（不含 version.txt）
$porc = (git status --porcelain) -split "`n" | Where-Object { $_ -ne '' -and $_ -notmatch '\bversion\.txt$' }

if (-not $porc) {
    Write-Host "[dev-push] nothing to commit" -ForegroundColor Yellow
} else {
    # 先做一次业务提交（占用我们需要的 HEAD）
    if ([string]::IsNullOrWhiteSpace($Message)) {
        $stamp = Get-Date -Format "yyyy-MM-dd HH:mm"
        $Message = "chore: dev update @ $stamp"
    }
    git add -A | Out-Null
    # 先把 version.txt 之外的改动提交（如果 version.txt 也被改了，会一起包含进来，没关系）
    git commit -m "$Message" | Out-Null
    Write-Host "[dev-push] committed: $Message" -ForegroundColor Green
}

# 🆕 以"本次业务 commit"的 short hash 生成 version.txt，追加为一个独立 commit（amend 太容易出错，分开更稳）
$headShort = git rev-parse --short HEAD

# 生成 version.txt：hash + 时间戳
$stampUtc  = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$versionTxt = "$headShort $stampUtc"

Set-Content -Path ".\version.txt" -Value $versionTxt -Encoding ascii -NoNewline

$vDiff = git status --porcelain version.txt
if (-not [string]::IsNullOrWhiteSpace($vDiff)) {
    git add version.txt | Out-Null
    git commit -m "chore(version): bump to $headShort" | Out-Null
    Write-Host "[dev-push] version.txt -> $versionTxt" -ForegroundColor DarkGreen
    $headShort = git rev-parse --short HEAD
}

Write-Host "[dev-push] pushing to origin/main ..." -ForegroundColor Cyan
git push origin main

$fullUrl = "https://lupeng0330.github.io/english-tutor/?v=$headShort"
Write-Host ""
Write-Host "================ URLS ================" -ForegroundColor Magenta
Write-Host " HEAD            : $headShort"
Write-Host " Mobile (Pages)  : $fullUrl" -ForegroundColor Green
Write-Host " PC local        : http://localhost:8765/index.html"
Write-Host " IDE mobile      : http://localhost:8765/mobile.html"
Write-Host "======================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "TIP  version.txt 已自动更新为最新 commit，" -ForegroundColor Yellow
Write-Host "     手机端无需带 ?v=... 也会自动拉取最新版本。"
Write-Host "     （GitHub Pages CDN 通常 1-3 分钟生效）"
Write-Host ""

# 尝试把 URL 复制到剪贴板
try {
    $fullUrl | Set-Clipboard
    Write-Host "[dev-push] Mobile URL copied to clipboard." -ForegroundColor DarkGreen
} catch {}
