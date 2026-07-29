@echo off
chcp 65001 >nul
title CloudBase 登录助手
echo ============================================
echo    CloudBase 密钥登录助手
echo ============================================
echo.
echo 请先在腾讯云控制台创建密钥：
echo https://console.cloud.tencent.com/cam/capi
echo.
set /p SID=请粘贴 SecretId 后回车:
set /p SKEY=请粘贴 SecretKey 后回车:
echo.
echo 正在登录...
"%USERPROFILE%\.workbuddy\binaries\node\versions\22.12.0\tcb.cmd" login --apiKeyId "%SID%" --apiKey "%SKEY%"
echo.
if %errorlevel%==0 (
  echo [成功] 登录完成，可以关闭本窗口，回到 CodeBuddy 告诉我"好了"
) else (
  echo [失败] 请检查密钥是否正确，或把上方错误截图发给 AI
)
echo.
pause
