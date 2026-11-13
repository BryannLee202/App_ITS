@echo off
chcp 65001 >nul
title EcoGo Smart - Đóng Hệ Thống

:: Tắt các tiến trình đang chạy trên cổng 5000 và 8081
for %%p in (5000 8081) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p ^| findstr LISTENING 2^>nul') do taskkill /f /pid %%a >nul 2>&1
)

echo [EcoGo Smart] Đã đóng toàn bộ hệ thống!
timeout /t 1 >nul
exit /b 0
