@echo off
chcp 65001 >nul
title EcoGo Smart - Khởi Động Hệ Thống
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-live.ps1"
