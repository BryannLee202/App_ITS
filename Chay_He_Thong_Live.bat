@echo off
chcp 65001 >nul
title EcoGo Smart - Khởi Động Hệ Thống

echo ===================================================================
echo             ECOGO SMART - HỆ THỐNG ITS THUÊ XE TỰ ĐỘNG
echo ===================================================================
echo.

echo [1/4] Đang dọn sạch các tiến trình cũ và giải phóng cổng 5000 & 8081...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING 2^>nul') do (
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8081 ^| findstr LISTENING 2^>nul') do (
    taskkill /f /pid %%a >nul 2>&1
)
timeout /t 1 >nul

echo [2/4] Đang khởi động Backend API & Socket.IO (Port 5000 - Auto Watch)...
start "EcoGo Backend API (Port 5000)" cmd /k "title EcoGo Backend API && cd /d %~dp0backend && node --watch src/server.js"

echo [3/4] Đang khởi động Giao diện Web Mobile (Port 8081 - Hot Reload)...
start "EcoGo Mobile Web (Port 8081)" cmd /k "title EcoGo Mobile Web && cd /d %~dp0mobile && npx expo start --web --port 8081"

echo.
echo [4/4] Đang chờ hệ thống Metro & Web App sẵn sàng (thường mất 8-12 giây)...
powershell -NoProfile -Command ^
  "$maxWait = 30; $i = 0; while ($i -lt $maxWait) { " ^
  "  try { " ^
  "    $r = Invoke-WebRequest -Uri 'http://localhost:8081' -UseBasicParsing -TimeoutSec 2; " ^
  "    if ($r.StatusCode -eq 200) { " ^
  "      Write-Host '   -> Web App da san sang 100%%!' -ForegroundColor Green; " ^
  "      exit 0; " ^
  "    } " ^
  "  } catch {} " ^
  "  Start-Sleep -Seconds 1; $i++; " ^
  "  Write-Host ('.' * $i) -NoNewline; " ^
  "}; " ^
  "Write-Host ''; Write-Host '   -> He thong dang tiep tuc khoi dong...' -ForegroundColor Yellow"

echo.
echo ===================================================================
echo   HỆ THỐNG ĐÃ SẴN SÀNG! ĐANG MỞ TRÌNH DUYỆT CHROME/EDGE...
echo   - Giao diện Web: http://localhost:8081
echo   - Backend API  : http://localhost:5000/api/health
echo ===================================================================
start http://localhost:8081

echo.
echo * Luu y: Khi sua doi code o mobile hoac backend, he thong se TU DONG
echo   cap nhat (Hot Reload) ma khong can khoi dong lai!
echo.
pause
