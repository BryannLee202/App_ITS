$ErrorActionPreference = "SilentlyContinue"
$root = (Get-Item $PSScriptRoot).Parent.FullName

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   ECOGO SMART - HE THONG ITS KHOI DONG TU DONG" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Giai phong cong 5000 va 8081 neu con tien trinh cu
Write-Host "[1/4] Dang giai phong cong 5000 & 8081..." -ForegroundColor Gray
$ports = @(5000, 8081)
foreach ($port in $ports) {
    try {
        $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($conns) {
            foreach ($c in $conns) {
                Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
            }
        }
    } catch {}
    $lines = netstat -ano | Select-String ":$port\s+.*LISTENING"
    foreach ($l in $lines) {
        $parts = ($l -split '\s+') | Where-Object { $_ -ne '' }
        $pidToKill = $parts[-1]
        if ($pidToKill -and $pidToKill -match '^\d+$') {
            Stop-Process -Id [int]$pidToKill -Force -ErrorAction SilentlyContinue
        }
    }
}
Start-Sleep -Milliseconds 600

# 2. Khoi dong Backend & Mobile ngam thu nho
$backendDir = Join-Path $root "backend"
$mobileDir = Join-Path $root "mobile"

Write-Host "[2/4] Dang khoi dong Backend API (Port 5000)..." -ForegroundColor Gray
Start-Process cmd.exe -ArgumentList "/c cd /d `"$backendDir`" && node --watch src/server.js" -WindowStyle Minimized

Write-Host "[3/4] Dang khoi dong Mobile Web App (Port 8081)..." -ForegroundColor Gray
Start-Process cmd.exe -ArgumentList "/c cd /d `"$mobileDir`" && npx expo start --web --port 8081" -WindowStyle Minimized

# 3. Kiem tra san sang va tu dong mo trinh duyet
Write-Host "[4/4] Dang kiem tra ket noi Metro Bundler (khoang 5-8s)..." -ForegroundColor Gray
$maxWait = 20
$ready = $false
for ($i = 1; $i -le $maxWait; $i++) {
    $listening = Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction SilentlyContinue
    if (-not $listening) {
        $listening = netstat -ano | Select-String ":8081\s+.*LISTENING"
    }
    if ($listening) {
        $ready = $true
        break
    }
    Start-Sleep -Seconds 1
    Write-Host "." -NoNewline -ForegroundColor DarkYellow
}
Write-Host ""

# Lay dia chi IP Wi-Fi thuc te cua may tinh
$wifiIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -like "*Wi-Fi*" -or $_.InterfaceAlias -like "*Wireless*" -or ($_.IPAddress -like "192.168.*" -and $_.InterfaceAlias -notlike "*VMware*" -and $_.InterfaceAlias -notlike "*Virtual*") } | Select-Object -ExpandProperty IPAddress -First 1)
if (-not $wifiIp) { $wifiIp = "192.168.1.26" }

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "   HE THONG DA SAN SANG TEST TREN DIEN THOAI THAT!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "💻 May tinh (Local):      http://localhost:8081" -ForegroundColor Cyan
Write-Host "📱 Dien thoai (Wifi LAN): http://$($wifiIp):8081" -ForegroundColor Yellow
Write-Host "⚡ AUTO-RELOAD (HOT REFRESH): DANG BAT" -ForegroundColor Magenta
Write-Host "   -> Khi ban sua file tren may tinh, dien thoai se tu dong cap nhat ngay!" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Green

# Mo trinh duyet tren may tinh
Start-Process "http://localhost:8081"

# Mo trang Quet ma QR de dien thoai de dang quet vao app
$qrHtml = Join-Path $root "scripts\mobile_connect.html"
if (Test-Path $qrHtml) {
    Start-Process "$qrHtml?ip=$wifiIp"
}
Start-Sleep -Seconds 2
