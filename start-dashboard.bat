@echo off
title Business Command Launcher
echo ========================================================
echo       BUSINESS COMMAND - 24/7 LAUNCHER
echo ========================================================
echo.
cd /d "%~dp0"

echo [1/2] Launching local production server (http://localhost:3000)...
start /b cmd /c "npm run start -- -p 3000"

timeout /t 4 >nul

echo [2/2] Launching Cloudflare Tunnel for phone access...
.\cloudflared.exe tunnel --url http://localhost:3000

pause
