$ErrorActionPreference = "SilentlyContinue"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   ECOGO SMART - DONG TOAN BO HE THONG" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

$ports = @(5000, 8081)
foreach ($port in $ports) {
    try {
        $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($conns) {
            foreach ($c in $conns) {
                Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
                Write-Host "  -> Da tat tien trinh port $port (PID: $($c.OwningProcess))" -ForegroundColor Green
            }
        }
    } catch {}
    $lines = netstat -ano | Select-String ":$port\s+.*LISTENING"
    foreach ($l in $lines) {
        $parts = ($l -split '\s+') | Where-Object { $_ -ne '' }
        $pidToKill = $parts[-1]
        if ($pidToKill -and $pidToKill -match '^\d+$') {
            Stop-Process -Id [int]$pidToKill -Force -ErrorAction SilentlyContinue
            Write-Host "  -> Da tat tien trinh netstat port $port (PID: $pidToKill)" -ForegroundColor Green
        }
    }
}

Write-Host "`n[DA XONG] Toan bo he thong da duoc tat sach se (0 task running)!" -ForegroundColor Green
Start-Sleep -Seconds 1
