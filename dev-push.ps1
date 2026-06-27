# dev-push.ps1 — 一键 commit + push
# ============================================================
# 版本号统一由 GitHub Actions（.github/workflows/update-version.yml）管理：
#   - 推送后 CI 对 feat/fix 等「功能性提交」自动 bump version.txt（单行格式：
#       "20260627V02.31 <hash> (<utc>)"），docs/chore/ci/test/style/build 不 bump。
#   - 本脚本**不再本地写 version.txt**，避免与 CI 的格式/递增规则冲突（曾导致 rebase 冲突）。
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\dev-push.ps1
#   powershell -ExecutionPolicy Bypass -File .\dev-push.ps1 "feat: xxx"

param(
    [string]$Message = ""
)
$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

# ---------- 提交业务改动 ----------
$porc = (git status --porcelain) -split "`n" | Where-Object { $_ -ne '' }
if (-not $porc) {
    Write-Host "[dev-push] no changes to commit" -ForegroundColor Yellow
} else {
    if ([string]::IsNullOrWhiteSpace($Message)) {
        $stamp = Get-Date -Format "yyyy-MM-dd HH:mm"
        $Message = "chore: dev update @ $stamp"
    }
    git add -A | Out-Null
    git commit -m "$Message" | Out-Null
    Write-Host "[dev-push] committed: $Message" -ForegroundColor Green
}

# ---------- 同步远端 + 推送 ----------
Write-Host "[dev-push] git pull --rebase origin main ..." -ForegroundColor Cyan
git pull --rebase origin main
Write-Host "[dev-push] git push origin main ..." -ForegroundColor Cyan
git push origin main

# ---------- 提示 ----------
$curVer = ""
if (Test-Path ".\version.txt") {
    $curVer = (Get-Content ".\version.txt" -ErrorAction SilentlyContinue | Select-Object -First 1)
}
$headShort = git rev-parse --short HEAD

Write-Host ""
Write-Host "================ PUSHED ================" -ForegroundColor Magenta
Write-Host " HEAD        : $headShort"
Write-Host " version.txt : $curVer" -ForegroundColor Green
Write-Host "               (功能性提交推送后，CI 会自动 bump 为下一个版本号)"
Write-Host " Pages       : https://lupeng0330.github.io/english-tutor/" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "TIP 版本号规则（由 CI 统一管理，见 .github/workflows/update-version.yml）：" -ForegroundColor Yellow
Write-Host "    - feat/fix 等功能性提交  -> CI 自动 +1（同月小版本 +1，跨月大版本 +1）"
Write-Host "    - docs/chore/ci/test/... -> 不 bump"
Write-Host ""
