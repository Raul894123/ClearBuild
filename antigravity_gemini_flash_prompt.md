# Инструкция и Master-Промпт для Gemini 3.8 Flash в Antigravity (Проект ClearBuild · SAQ QURYLYS)

Модели семейства **Flash** в агентском режиме Antigravity работают отлично и очень быстро, если дать им **чёткое пошаговое ТЗ с фиксированной структурой файлов и точными формулами**, не оставляя пространства для домыслов.

## Шаг 0. Подготовка папки перед запуском агента (1 минута)

1. Откройте папку вашего репозитория `ClearBuild` в **Antigravity**.
2. Скачайте из нашего чата файл `clearbuild_saq_qurylys_app.html` и положите его в корень папки `ClearBuild` (или сразу в `frontend/index.html`).
3. *(По желанию)* Откройте `clearbuild_saq_qurylys_app.html` в браузере, перейдите на вкладку **«📦 Архитектура и GitHub»** и нажмите кнопки скачивания `seed.json`, `mockData.js`, `test_scoring.py`, `.env.example` и `.gitignore` — либо поручите Gemini 3.8 Flash создать их автоматически по промпту ниже.
4. Скопируйте **Промпт №1** ниже и отправьте его в чат агента **Gemini 3.8 Flash** внутри Antigravity.

## Промпт №1 — Полная сборка монорепозитория ClearBuild (Скопируйте целиком в Antigravity)

> **ЗАДАЧА ДЛЯ АГЕНТА ANTIGRAVITY (Gemini 3.8 Flash):**
> Мы делаем проект **ClearBuild (кейс SAQ QURYLYS)** для хакатона **Codemasters Hackathon 8.0 (г. Усть-Каменогорск)**.
> Твоя задача — строго по шагам организовать образцовый монорепозиторий в текущей рабочей директории, не удаляя и не ломая уже существующий функционал в `clearbuild_saq_qurylys_app.html`.
>
> ### ШАГ 1. Создай структуру папок и базовые конфиги
> Создай следующую структуру директорий и файлов, если их ещё нет:
> * `backend/app/__init__.py`
> * `backend/app/scoring.py`
> * `backend/app/main.py`
> * `backend/tests/test_scoring.py`
> * `backend/seed.json`
> * `backend/requirements.txt`
> * `frontend/index.html` (скопируй сюда содержимое `clearbuild_saq_qurylys_app.html`, чтобы приложение открывалось как основной интерфейс фронтенда)
> * `frontend/src/mocks/mockData.js`
> * `frontend/src/services/scoring.js`
> * `docs/` (папка для скриншотов и схемы архитектуры)
> * `.env.example`
> * `.gitignore`
> * `README.md`
>
> ### ШАГ 2. Заполни `.gitignore` и `.env.example` (Требование безопасности Раздела 7 ТЗ)
> 1. В `.gitignore` добавь:
>    `.env`, `.env.local`, `__pycache__/`, `*.py[cod]`, `.pytest_cache/`, `.venv/`, `venv/`, `node_modules/`, `dist/`, `.DS_Store`.
> 2. В `.env.example` запиши шаблон БЕЗ реальных секретных ключей:
>    * `VITE_USE_MOCK_DATA=true`
>    * `VITE_API_BASE_URL=http://localhost:8000/api/v1`
>    * `VITE_DEFAULT_CITY_LAT=49.9483`
>    * `VITE_DEFAULT_CITY_LNG=82.6278`
>    * `BACKEND_DB_URL=sqlite:///./clearbuild_demo.db`
>    * `AI_PROVIDER_MODE=rule_hybrid_explainable`
>
> ### ШАГ 3. Реализуй детерминированную формулу скоринга в `backend/app/scoring.py`
> Пропиши математику строго по Разделу 5 ТЗ SAQ QURYLYS:
> * Веса факторов:
>   * `R1`: `35` (Установлено отсутствие применимого правового основания. Важно: статус `UNVERIFIED` / «нет данных» или наличие действующей гарантии КЖК даёт `0` баллов!)
>   * `R2`: `25` (Прямое предложение внести деньги: платная бронь, депозит, первоначальный взнос до ДДУ)
>   * `R3`: `10` (Активная реклама строящегося жилья до ввода в эксплуатацию)
>   * `R4`: `15` (Подтверждённое коллективное обращение граждан)
>   * `R5`: `10` (Несовпадение заявленной и подтверждённой готовности на 20 и более процентных пунктов)
>   * `R6`: `5` (Подтверждённый простой или значимая просрочка)
> * Формула балла: `score = min(100, sum(WEIGHTS[code] for code in confirmed_factors))`
> * Важное правило ИИ: гипотезы ИИ (`AI_HYPOTHESIS`) НЕ прибавляются к подтверждённому баллу `score`, пока их не подтвердит аналитик (`CONFIRMED`). Они считаются только в отдельном поле `potential_score`.
> * Правило определения цветовой зоны (`zone`):
>   * Если `score >= 60` **И одновременно** `'R1' in confirmed_factors` **И** `'R2' in confirmed_factors` -> зона `"RED"` (`Красная`).
>   * Иначе если `score >= 25` (включая случаи `score >= 60` БЕЗ одновременной комбинации `R1 + R2`) -> зона `"YELLOW"` (`Жёлтая`).
>   * Иначе (`0–24` балла) -> зона `"GREEN"` (`Зелёная`).
>
> ### ШАГ 4. Создай автотесты в `backend/tests/test_scoring.py`
> Напиши 4 автотеста на `pytest`, проверяющих функцию `calculate_risk`:
> 1. `test_case_a_unverified_basis_with_paid_booking`: подтверждены `["R2", "R3"]` (основание не проверено = 0 б.) -> ожидается `score == 35` и `zone == "YELLOW"`.
> 2. `test_case_b_absent_basis_with_deposit`: подтверждены `["R1", "R2", "R3"]` -> ожидается `score == 70` и `zone == "RED"`.
> 3. `test_case_c_valid_kzh_guarantee_with_regular_ad`: подтверждён только `["R3"]` (действующая гарантия КЖК без отдельного разрешения МИО не даёт R1) -> ожидается `score == 10` и `zone == "GREEN"`.
> 4. `test_edge_case_60_plus_without_r1_and_r2_stays_yellow`: подтверждены `["R1", "R3", "R5", "R6"]` (`35 + 10 + 10 + 5 = 60`, но нет `R2`) -> ожидается `score == 60` и `zone == "YELLOW"`.
>
> ### ШАГ 5. Извлеки `seed.json` и `mockData.js` из `frontend/index.html`
> Извлеки массивы `INITIAL_COMPLEXES` (8 демонстрационных ЖК г. Усть-Каменогорска) и `INITIAL_ADS` (12 рекламных публикаций) из `frontend/index.html` и сохрани:
> 1. В `backend/seed.json` — как валидный JSON с полями `meta`, `complexes` и `publications`.
> 2. В `frontend/src/mocks/mockData.js` — с экспортом `export const USE_MOCK_DATA = true;`, `export const COMPLEXES = ...`, `export const PUBLICATIONS = ...`.
>
> ### ШАГ 6. Создай FastAPI-сервер в `backend/app/main.py` и `backend/requirements.txt`
> 1. В `backend/requirements.txt` укажи: `fastapi`, `uvicorn`, `pydantic`, `pytest`.
> 2. В `backend/app/main.py` реализуй FastAPI-приложение с CORS (`allow_origins=["*"]`), которое читает `backend/seed.json` и предоставляет эндпоинты:
>    * `GET /api/v1/health` — статус сервера и режим `DEMO_MODE: true`.
>    * `GET /api/v1/complexes` — список всех 8 ЖК с автоматическим расчётом скоринга через `calculate_risk`.
>    * `GET /api/v1/publications` — список 12 рекламных объявлений.
>    * `POST /api/v1/analyze` — принимает текст объявления (`text`, `phone`, `platform`), находит регулярными выражениями триггеры оплаты (`бронь`, `депозит`, `первоначальный взнос`, `в кассу`, `резерв`, `рассрочка`), сопоставляет с ЖК и возвращает гипотезу ИИ (`proposedFactor`, `confidence`, `triggerSpan`), не изменяя подтверждённый балл без участия человека.
>    * `POST /api/v1/complexes/{complex_id}/confirm-factor` — эндпоинт для подтверждения или отклонения фактора аналитиком с пересчётом балла.
>
> ### ШАГ 7. Запусти тесты в терминале
> Выполни в терминале команду `pytest backend/tests/test_scoring.py -v` и убедись, что все 4 теста проходят со статусом `PASSED`. Покажи мне отчёт о созданных файлах и выводе `pytest`.

## Промпт №2 — Связка фронтенда с бэкендом и пуш в GitHub (Отправьте после выполнения Промпта №1)

Когда Gemini 3.8 Flash создаст файлы и отчитается, что `pytest` прошёл успешно, отправьте ему второй короткий промпт:

> **ЗАДАЧА 2:**
> 1. Проверь, чтобы в `frontend/index.html` при переключении тумблера `USE_MOCK_DATA` в положение `false` выполнялся `fetch('http://localhost:8000/api/v1/complexes')` и `fetch('http://localhost:8000/api/v1/publications')` с безопасным откатом (fallback) на локальные `INITIAL_COMPLEXES`, если локальный бэкенд-сервер не запущен (чтобы демо никогда не падало с ошибкой на защите).
> 2. Проверь, что в корне лежит наш оформленный `README.md` со схемой Mermaid, таблицей факторов `R1–R6` и таблицей кейсов `A, B, C`.
> 3. Выполни `git status`, убедись, что в индексацию не попали лишние временные файлы или секреты, и выведи мне готовые команды `git add`, `git commit` и `git push origin main` для отправки в репозиторий `https://github.com/Raul894123/ClearBuild`.
