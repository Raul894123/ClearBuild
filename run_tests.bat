@echo off
title ClearBuild (SAQ QURYLYS) - Pytest Tests
cd /d "W:\Projects\Hackathon 8.0"
echo ========================================================
echo  ClearBuild (SAQ QURYLYS) - Zapusk Autotestov Pytest
echo  Codemasters Hackathon 8.0 (Ust-Kamenogorsk)
echo ========================================================
echo.
python -m pytest backend/tests/test_scoring.py -v
echo.
pause
