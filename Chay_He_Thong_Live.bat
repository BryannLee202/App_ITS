@echo off
chcp 65001 >nul
title EcoGo Smart - Khởi Động Hệ Thống
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-live.ps1"
if %ERRORLEVEL% NEQ 0 (
    echo [Fallback] Dang mo trinh duyet truc tiep...
    start http://localhost:8081
)
