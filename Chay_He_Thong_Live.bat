@echo off
chcp 65001 >nul
echo ====================================================
echo   KHOI DONG HE THONG ECOGO SMART (BACKEND + WEB APP)
echo ====================================================

echo [1/3] Dang khoi dong Backend API & Socket.IO (Port 5000 - Auto Watch)...
start "EcoGo Backend API (Port 5000)" cmd /k "cd /d %~dp0backend && node --watch src/server.js"

echo [2/3] Dang khoi dong Giao dien Mobile Web (Port 8081)...
start "EcoGo Mobile Web (Port 8081)" cmd /k "cd /d %~dp0mobile && npx expo start --web --port 8081"

echo [3/3] Dang mo trinh duyet Live App tai http://localhost:8081 ...
timeout /t 4 >nul
start http://localhost:8081

echo ====================================================
echo   HE THONG DA CHAY THANH CONG!
echo   - Web App Live: http://localhost:8081
echo   - Backend API : http://localhost:5000/api/health
echo ====================================================
pause
