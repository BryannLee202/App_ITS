@echo off
chcp 65001 >nul
title EcoGo Smart - Đóng Hệ Thống
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\stop-live.ps1"
