@echo off
chcp 65001 >nul
title 乐学英语 · 开发服务器

echo ========================================
echo   🎓 乐学英语 English Tutor
echo ========================================
echo.
echo 🚀 启动本地开发服务器...
echo 📁 项目路径: %~dp0
echo.

cd /d "%~dp0"

REM 自动打开浏览器
start "" "http://localhost:8765/index.html"

REM 尝试 python 和 py 两种命令
python -m http.server 8765 2>nul
if %errorlevel% neq 0 (
    py -3 -m http.server 8765 2>nul
    if %errorlevel% neq 0 (
        echo.
        echo ❌ 未找到 Python，请先安装 Python 3
        echo    下载地址: https://www.python.org/downloads/
        pause
    )
)
