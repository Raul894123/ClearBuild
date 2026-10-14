@echo off
title ClearBuild (SAQ QURYLYS) - Frontend
cd /d "W:\Projects\Hackathon 8.0"
echo ========================================================
echo  ClearBuild (SAQ QURYLYS) - Frontend Server
echo  Codemasters Hackathon 8.0 (Ust-Kamenogorsk)
echo ========================================================
echo.
echo [1/2] Zapusk lokalnogo servera dlya frontend...
echo [2/2] Otkrytie brauzera: http://localhost:3000
echo.
start http://localhost:3000/
python -m http.server 3000 -d frontend
pause
