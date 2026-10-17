@echo off
chcp 65001 >nul
rem ClearBuild · SAQ QURYLYS — тесты бэкенда (pytest). Сам создаёт .venv и ставит зависимости, если их нет.
rem Аргументы передаются в pytest: run_tests.bat -k case_b
setlocal
cd /d "%~dp0"

call :setup || exit /b 1

if exist ".env" for /f "usebackq eol=# tokens=1,* delims==" %%A in (".env") do set "%%A=%%B"

".venv\Scripts\python.exe" -m pytest tests -v %*
exit /b %errorlevel%

:setup
if not exist ".venv\Scripts\python.exe" (
    echo [setup] Создаю виртуальное окружение backend\.venv ...
    python -m venv .venv 2>nul || py -3 -m venv .venv
    if not exist ".venv\Scripts\python.exe" (
        echo [ошибка] Не найден Python 3. Установите его с https://www.python.org/downloads/ ^(галочка "Add to PATH"^).
        exit /b 1
    )
)
".venv\Scripts\python.exe" -c "import fastapi, uvicorn, sqlalchemy, pydantic, multipart, httpx, pytest" 2>nul
if errorlevel 1 (
    echo [setup] Устанавливаю зависимости из requirements.txt ...
    ".venv\Scripts\python.exe" -m pip install --disable-pip-version-check -r requirements.txt || (
        echo [ошибка] Не удалось установить зависимости.
        exit /b 1
    )
)
exit /b 0
