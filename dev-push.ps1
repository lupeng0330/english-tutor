# dev-push.ps1
# 一键：暂存所有改动 → 用参数或默认消息提交 → 推到 origin/main
# 用法：
#   pwsh ./dev-push.ps1                 # 默认消息
#   pwsh ./dev-push.ps1 "fix: 修xxx"    # 自定义消息
#
# 脚本完成后会打印：
#   - GitHub Pages 线上地址（手机测试用，约 1 分钟后生效）
#   - 本地开发地址（PC 浏览器测试用）
#   - 手机预览 mobile.html 地址（IDE 左侧预览用）

param(
    [string]$Message = ""
)

$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

# 1) 看有没有改动
$status = (git status --porcelain) -join "`n"
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "[dev-push] 工作区没有改动，跳过 commit。" -ForegroundColor Yellow
} else {
    if ([string]::IsNullOrWhiteSpace($Message)) {
        $stamp = Get-Date -Format "yyyy-MM-dd HH:mm"
        $Message = "chore: dev update @ $stamp"
    }
    git add -A | Out-Null
    git commit -m "$Message" | Out-Null
    Write-Host "[dev-push] committed: $Message" -ForegroundColor Green
}

# 2) 推
Write-Host "[dev-push] pushing to origin/main ..." -ForegroundColor Cyan
git push origin main

# 3) 输出地址
$headShort = git rev-parse --short HEAD
Write-Host ""
Write-Host "================ URLS ================" -ForegroundColor Magenta
Write-Host " HEAD            : $headShort"
Write-Host " 📱 手机线上测试 : https://lupeng0330.github.io/english-tutor/?v=$headShort"
Write-Host " 💻 PC 本地测试  : http://localhost:8765/index.html"
Write-Host " 📲 IDE 手机预览 : http://localhost:8765/mobile.html"
Write-Host "======================================" -ForegroundColor Magenta
Write-Host "提示：GitHub Pages 通常 1-2 分钟内生效（强刷 Ctrl+F5 / Cmd+Shift+R）" -ForegroundColor Gray
