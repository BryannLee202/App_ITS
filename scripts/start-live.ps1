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
Write-Host "[4/4] Dang cho Web App san sang (khoang 6-10s)..." -ForegroundColor Gray
$maxWait = 35
$ready = $false
for ($i = 1; $i -le $maxWait; $i++) {
    try {
        $res = Invoke-WebRequest -Uri "http://localhost:8081" -UseBasicParsing -TimeoutSec 1 -ErrorAction SilentlyContinue
        if ($res.StatusCode -eq 200) {
            $ready = $true
            break
        }
    } catch {}
    Start-Sleep -Seconds 1
    Write-Host "." -NoNewline -ForegroundColor DarkYellow
}
Write-Host ""

if ($ready) {
    Write-Host "`n[THANH CONG] He thong da san sang! Dang mo trinh duyet Chrome/Edge..." -ForegroundColor Green
    Start-Process "http://localhost:8081"
    Start-Sleep -Seconds 2
} else {
    Write-Host "`n[CANH BAO] Qua 35s ma Web chua phan hoi. Ban hay thu chay lai file." -ForegroundColor Red
    Start-Sleep -Seconds 3
}
