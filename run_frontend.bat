@echo off
title ClearBuild (SAQ QURYLYS) - Frontend
cd /d "%~dp0"

echo ========================================================
echo  ClearBuild (SAQ QURYLYS) - Frontend
echo  Codemasters Hackathon 8.0 (Ust-Kamenogorsk)
echo ========================================================

:: Osvobozhdaem port 3000 esli tam zavis staryj server
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [1/2] Zapusk servera ClearBuild...
echo [2/2] Otkrytie brauzera: http://localhost:3000/
echo.
start http://localhost:3000/
python -m http.server 3000
pause
