@echo off
title ClearBuild (SAQ QURYLYS) - Launcher
cd /d "%~dp0"

echo ========================================================
echo  ClearBuild (SAQ QURYLYS) - Polnyj zapusk v 1 klik
echo  Codemasters Hackathon 8.0 (Ust-Kamenogorsk)
echo ========================================================
echo.

echo [1/2] Zapusk Backend servera (FastAPI + SQLite na portu 8000)...
start "ClearBuild - Backend (Port 8000)" run_backend.bat

echo [2/2] Ozhidanie 2 sekundy i zapusk Frontend (Port 3000)...
timeout /t 2 /nobreak >nul
start "ClearBuild - Frontend (Port 3000)" run_frontend.bat

echo.
echo ========================================================
echo  Vse uspeshno zapushcheno!
echo  Frontend: http://localhost:3000
echo  Backend:  http://localhost:8000/api/v1/health
echo  Swagger:  http://localhost:8000/docs
echo ========================================================
