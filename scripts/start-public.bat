@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0.."

echo ============================================
echo  立夏衣语 - 本地服务 + ngrok 公网预览
echo ============================================

rem ---------- 1. 本地静态服务 ----------
where python >nul 2>nul
if errorlevel 1 (
  echo [ERROR] 未找到 python，请先安装 Python 3，或在仓库目录运行其他静态服务器。
  pause
  exit /b 1
)
start "立夏衣语-本地服务" cmd /k python -m http.server 8080 --bind 127.0.0.1 --directory .
timeout /t 2 >nul

rem ---------- 2. ngrok 隧道 ----------
set "NGROK=ngrok"
where ngrok >nul 2>nul
if errorlevel 1 (
  if exist "%USERPROFILE%\ngrok-v3-stable-windows-amd64\ngrok.exe" (
    set "NGROK=%USERPROFILE%\ngrok-v3-stable-windows-amd64\ngrok.exe"
  ) else if exist "C:\Users\ChongYe\ngrok-v3-stable-windows-amd64\ngrok.exe" (
    set "NGROK=C:\Users\ChongYe\ngrok-v3-stable-windows-amd64\ngrok.exe"
  )
)
"%NGROK%" version >nul 2>nul
if errorlevel 1 (
  echo [WARN] 未找到 ngrok，仅启动本地服务：http://127.0.0.1:8080
  pause
  exit /b 0
)
start "立夏衣语-ngrok" "%NGROK%" http 8080
timeout /t 6 >nul
start "" "http://127.0.0.1:4040"

echo 已打开 ngrok 面板，复制其中的 https 地址即可分享。
echo 首次访问需在 ngrok 提示页点 Visit Site。
pause