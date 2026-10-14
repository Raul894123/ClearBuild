@echo off
title ClearBuild (SAQ QURYLYS) - Backend API
cd /d "W:\Projects\Hackathon 8.0"
echo ========================================================
echo  ClearBuild (SAQ QURYLYS) - FastAPI REST Server
echo  Codemasters Hackathon 8.0 (Ust-Kamenogorsk)
echo ========================================================
echo.
echo Swagger UI docs: http://localhost:8000/docs
echo Health endpoint: http://localhost:8000/api/v1/health
echo.
start http://localhost:8000/docs
python -m uvicorn backend.app.main:app --reload --port 8000
pause
