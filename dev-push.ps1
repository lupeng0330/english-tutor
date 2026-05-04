# dev-push.ps1 - one-shot commit + push（含版本号自动递增）
#
# 版本号格式：YYYYMMDDVBB.SS
#   YYYYMMDD = 当前日期
#   BB       = 大版本号（两位，按 ISO 周递增，新的一周 +1）
#   SS       = 小版本号（同一周内每次推送 +1；跨周归 1）
#
# 状态保存在 version.txt：首行 = 完整版本字符串（便于前端直接读取）
#                       第二行 = 元数据 "big=BB small=SS weekKey=YYYY-Www"
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\dev-push.ps1
#   powershell -ExecutionPolicy Bypass -File .\dev-push.ps1 "fix: xxx"
#   # 手动强制设置版本号（常用于首次初始化/修正）：
#   powershell -ExecutionPolicy Bypass -File .\dev-push.ps1 "msg" -Big 1 -Small 1

param(
    [string]$Message = "",
    [int]$Big   = 0,
    [int]$Small = 0
)
$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

# ---------- 计算 ISO 周 key ----------
# ISO 8601: 周从周一开始；一年的第 1 周是包含第 1 个周四的那一周
# 兼容 PowerShell 5.1（没有 ISOWeek 类型）
function Get-IsoWeekKey([datetime]$d) {
    $cal = [System.Globalization.CultureInfo]::InvariantCulture.Calendar
    # ISO 周号
    $wk = $cal.GetWeekOfYear($d,
        [System.Globalization.CalendarWeekRule]::FirstFourDayWeek,
        [System.DayOfWeek]::Monday)
    # ISO 周年：取该周四所在的年份（处理 12 月末/1 月初跨年）
    $dow = [int]$d.DayOfWeek         # Sun=0..Sat=6
    if ($dow -eq 0) { $dow = 7 }     # 转成 Mon=1..Sun=7
    $thursday = $d.AddDays(4 - $dow) # 该周的周四
    $yr = $thursday.Year
    return ('{0}-W{1:D2}' -f $yr, $wk)
}

$now      = Get-Date
$weekKey  = Get-IsoWeekKey $now
$dateStr  = $now.ToString('yyyyMMdd')

# ---------- 读取现有 version.txt 状态 ----------
$verFile = ".\version.txt"
$prevBig   = 0
$prevSmall = 0
$prevWeek  = ""
if (Test-Path $verFile) {
    $lines = Get-Content $verFile -ErrorAction SilentlyContinue
    if ($lines.Count -ge 2) {
        $meta = $lines[1]
        if ($meta -match 'big=(\d+)')       { $prevBig   = [int]$Matches[1] }
        if ($meta -match 'small=(\d+)')     { $prevSmall = [int]$Matches[1] }
        if ($meta -match 'weekKey=([\w-]+)'){ $prevWeek  = $Matches[1] }
    }
}

# ---------- 决定本次 big/small ----------
$newBig = 0
$newSmall = 0
if ($Big -gt 0 -and $Small -gt 0) {
    # 用户手动指定
    $newBig   = $Big
    $newSmall = $Small
} elseif ($prevWeek -eq $weekKey -and $prevBig -gt 0) {
    # 同一周 → 小版本 +1，大版本不变
    $newBig   = $prevBig
    $newSmall = $prevSmall + 1
} elseif ($prevBig -gt 0) {
    # 跨到新周 → 大版本 +1，小版本归 1
    $newBig   = $prevBig + 1
    $newSmall = 1
} else {
    # 第一次使用
    $newBig   = 1
    $newSmall = 1
}

$versionStr = ('{0}V{1:D2}.{2:D2}' -f $dateStr, $newBig, $newSmall)

# ---------- 提交业务改动（不含 version.txt） ----------
$porc = (git status --porcelain) -split "`n" | Where-Object { $_ -ne '' -and $_ -notmatch '\bversion\.txt$' }

if (-not $porc) {
    Write-Host "[dev-push] no business changes to commit" -ForegroundColor Yellow
} else {
    if ([string]::IsNullOrWhiteSpace($Message)) {
        $stamp = Get-Date -Format "yyyy-MM-dd HH:mm"
        $Message = "chore: dev update @ $stamp"
    }
    git add -A | Out-Null
    git commit -m "$Message" | Out-Null
    Write-Host "[dev-push] committed: $Message" -ForegroundColor Green
}

# ---------- 写入 version.txt ----------
$headShort = git rev-parse --short HEAD
$stampUtc  = $now.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

$line1 = "$versionStr"
$line2 = "big=$newBig small=$newSmall weekKey=$weekKey hash=$headShort at=$stampUtc"
$content = "$line1`n$line2`n"

Set-Content -Path $verFile -Value $content -Encoding ascii -NoNewline

$vDiff = git status --porcelain version.txt
if (-not [string]::IsNullOrWhiteSpace($vDiff)) {
    git add version.txt | Out-Null
    git commit -m "chore(version): $versionStr" | Out-Null
    Write-Host "[dev-push] version.txt -> $versionStr" -ForegroundColor DarkGreen
    $headShort = git rev-parse --short HEAD
}

Write-Host "[dev-push] pushing to origin/main ..." -ForegroundColor Cyan
git push origin main

$fullUrl = "https://lupeng0330.github.io/english-tutor/?v=$versionStr"
Write-Host ""
Write-Host "================ URLS ================" -ForegroundColor Magenta
Write-Host " VERSION         : $versionStr" -ForegroundColor Green
Write-Host " HEAD            : $headShort"
Write-Host " Week            : $weekKey"
Write-Host " Mobile (Pages)  : $fullUrl" -ForegroundColor Green
Write-Host " PC local        : http://localhost:8765/index.html"
Write-Host "======================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "TIP  版本号规则：" -ForegroundColor Yellow
Write-Host "     - 同一周内每次 push -> 小版本 +1"
Write-Host "     - 跨到新的 ISO 周   -> 大版本 +1, 小版本归 1"
Write-Host "     - 手动指定          -> -Big X -Small Y"
Write-Host ""

try {
    $fullUrl | Set-Clipboard
    Write-Host "[dev-push] Mobile URL copied to clipboard." -ForegroundColor DarkGreen
} catch {}
