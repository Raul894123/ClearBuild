@echo off
title ClearBuild (SAQ QURYLYS) - Backend
cd /d "%~dp0backend"

echo ========================================================
echo  ClearBuild (SAQ QURYLYS) - Backend (FastAPI + SQLite)
echo  http://localhost:8000/api/v1/health   ^|   http://localhost:8000/docs
echo ========================================================

:: Osvobozhdaem port 8000 esli tam zavis staryj server
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [1/2] Ustanovka zavisimostej (pip install -r requirements.txt)...
python -m pip install -q -r requirements.txt
echo [2/2] Zapusk: uvicorn app.main:app --port 8000
echo.
python -m uvicorn app.main:app --port 8000
pause
