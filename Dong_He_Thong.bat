@echo off
chcp 65001 >nul
title EcoGo Smart - Đóng Hệ Thống

echo ===================================================================
echo             ECOGO SMART - ĐÓNG TOÀN BỘ HỆ THỐNG
echo ===================================================================
echo.
echo Đang tắt các tiến trình máy chủ trên cổng 5000 và 8081...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING 2^>nul') do (
    taskkill /f /pid %%a >nul 2>&1
    echo   -> Đã tắt tiến trình cổng 5000 (PID: %%a)
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8081 ^| findstr LISTENING 2^>nul') do (
    taskkill /f /pid %%a >nul 2>&1
    echo   -> Đã tắt tiến trình cổng 8081 (PID: %%a)
)

echo.
echo ===================================================================
echo   ĐÃ ĐÓNG TOÀN BỘ HỆ THỐNG THÀNH CÔNG! (0 TASK RUNNING)
echo ===================================================================
timeout /t 2 >nul
