@echo off
chcp 65001 >nul
title EcoGo Smart - Quét Mã Test Điện Thoại Thật & Tự Động Cập Nhật
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$wifiIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -like '*Wi-Fi*' -or $_.InterfaceAlias -like '*Wireless*' -or ($_.IPAddress -like '192.168.*' -and $_.InterfaceAlias -notlike '*VMware*' -and $_.InterfaceAlias -notlike '*Virtual*') } | Select-Object -ExpandProperty IPAddress -First 1);" ^
  "if (-not $wifiIp) { $wifiIp = '192.168.1.26' };" ^
  "Write-Host '==========================================================' -ForegroundColor Cyan;" ^
  "Write-Host '   ECOGO SMART - KET NOI TEST DIEN THOAI THAT' -ForegroundColor Yellow;" ^
  "Write-Host '==========================================================' -ForegroundColor Cyan;" ^
  "Write-Host '📱 Link mo app tren dien thoai: http://' $wifiIp ':8081' -ForegroundColor Green;" ^
  "Write-Host '⚡ Tự động reload: Khi bạn sửa file trên máy, điện thoại tự cập nhật ngay!' -ForegroundColor DarkYellow;" ^
  "Write-Host 'Dang mo trang Quet Ma QR...' -ForegroundColor Gray;" ^
  "$htmlPath = Join-Path (Get-Item $PSScriptRoot).FullName 'scripts\mobile_connect.html';" ^
  "Start-Process $htmlPath;"
