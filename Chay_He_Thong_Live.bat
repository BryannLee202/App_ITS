@echo off
chcp 65001 >nul
title EcoGo Smart - Khởi Động

:: Tự động ẩn / thu nhỏ cửa sổ ngay khi mở
if not "%1"=="min" (
    start /min "" cmd /c "%~f0" min
    exit /b
)

:: 1. Giải phóng cổng 5000 & 8081 nếu còn tiến trình cũ
for %%p in (5000 8081) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p ^| findstr LISTENING 2^>nul') do taskkill /f /pid %%a >nul 2>&1
)

:: 2. Khởi động Backend & Mobile ngầm (thu nhỏ, không chiếm màn hình)
start /min "EcoGo-Backend" cmd /k "cd /d %~dp0backend && node --watch src/server.js"
start /min "EcoGo-Mobile" cmd /k "cd /d %~dp0mobile && npx expo start --web --port 8081"

:: 3. Chờ Web sẵn sàng (HTTP 200) rồi tự động mở trình duyệt
powershell -NoProfile -Command ^
  "$t=35; while($t -gt 0){ try{ if((Invoke-WebRequest 'http://localhost:8081' -UseBasicParsing -TimeoutSec 1).StatusCode -eq 200){ break } }catch{}; Start-Sleep 1; $t-- }; Start-Process 'http://localhost:8081'"

:: 4. Tự động đóng terminal khởi động
exit /b 0
