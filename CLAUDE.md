# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

ClearBuild · SAQ QURYLYS: a hackathon MVP (Codemasters Hackathon 8.0, Ust-Kamenogorsk) that monitors risk in shared-equity housing construction. It cross-checks construction complexes (ЖК) against permit and guarantee registries and ad publications, then assigns a deterministic R1–R6 risk score and a color zone. UI text, comments and docs are mostly Russian, and the UI is localized kz/ru/en. Production: https://komputerny-oslik.site (static hosting, `CNAME`). `CLEARBUILD_MASTER_GUIDE.md` is the detailed project context: modules, the 8-complex demo dataset and the 11 state registries. `docs/tz_backend_1.txt` and `docs/tz_backend_2.txt` are the backend specs (TZ).

## Ownership: backend only

This developer works on the backend only; Raul owns the frontend. **Never modify** any file in the repo root (`README.md`, `.env.example`, `*.html`, `seed.json`, `*.bat`, etc.; `CLAUDE.md` is the only exception), or anything in `frontend/`, `js/` or `css/`. Change only `backend/`. If a backend change needs a frontend change to work, describe what's needed instead of making the edit. The API contract is whatever `js/api.js` sends and expects under `/api/v1`.

## Commands

```bash
# Frontend: static, no build step. Serve the repo root (run_frontend.bat does this and frees port 3000)
python -m http.server 3000            # http://localhost:3000/

# JS syntax check (there is no linter or bundler)
node --check js/data.js && node --check js/shared.js && node --check js/api.js

# Backend venv lives in backend/.venv (gitignored); system Python has no pytest
python -m venv backend/.venv
backend/.venv/Scripts/python -m pip install -r backend/requirements.txt

# Backend tests: 4 tests that must stay green; test file adds backend/ to sys.path
backend/.venv/Scripts/python -m pytest backend/tests/test_scoring.py -v
backend/.venv/Scripts/python -m pytest backend/tests/test_scoring.py -k case_b -v     # single test

# Backend server: run from backend/, because main.py imports `app.scoring`
cd backend && .venv/Scripts/python -m uvicorn app.main:app --reload --port 8000   # /api/v1/health, /docs
```

The README's `uvicorn backend.app.main:app` from the repo root fails with `ModuleNotFoundError: app`. `run_backend.bat` and `run_tests.bat` are mentioned in the master guide but don't exist.

## Architecture

**Mirrored frontend.** The root files (`index.html`, `about/ads/registry/scoring/signal.html`, `css/style.css`, `js/*.js`, `seed.json`, `CNAME`) and their copies under `frontend/` must stay **byte-identical**. Any edit to one must be copied to the other (check with `cmp`). `frontend/src/` (`mocks/mockData.js`, `services/api.js`, `services/scoring.js`) is an older module layout and no HTML page loads it.

**Plain-script globals, no modules.** Every page loads `js/data.js` → `js/api.js` → `js/shared.js` in that order, and they share globals:
- `data.js`: reference data (`RAW_COMPLEXES`, `INITIAL_ADS`, registry and spec content).
- `api.js`: `window.apiClient`. It pings `${baseUrl}/health` (default `http://localhost:8000/api/v1`, overridable through `localStorage.clearbuild_api_url`). If the backend is unreachable, it silently falls back to local data. The app has to work fully offline (mock-first).
- `shared.js`: app state persisted to localStorage under `clearbuild_state_v2`, plus the legacy `clearbuild_*` keys. It also holds the `I18N` dictionary with `setLang()` → `refreshAllViews()` and `safeSetText()`, the client-side scoring `calculateComplexRisk()`, the factor status changes that write to the audit log, and the signal decisions.
- `index.html` is the main SPA. Its 6 tabs are switched with `switchTab()` in an inline script: map (Leaflet, loaded from unpkg), registry, ads monitoring, scoring, signal act (printable via `@media print` / `.no-print`), and phone-network graph. The other HTML pages are standalone views built on the same scripts.

**Backend** (`backend/app/`): FastAPI + SQLAlchemy + SQLite. Routes live under `/api/v1/...`: health, complexes, publications, analyze (rule-based ad trigger detection), confirm-factor, signal-decision, audit-log.
- `db.py`: engine and session. The URL comes from env `BACKEND_DB_URL`, default `backend/clearbuild_demo.db` (gitignored). Delete that file to reseed.
- `models.py`: tables `Complex`, `Publication`, `Signal`, `AuditLog`. Column names and enum values follow TZ1, snake_case (`legal_basis_type`: absent/unknown/operator_guarantee/mio_permit, etc.). A signal decision **adds** a new `Signal` row; the current card is the latest row.
- `mappers.py`: the only place where DB values become the API format the frontend expects (camelCase keys, `ABSENT`/`UNVERIFIED`/`KZH_GUARANTEE`/`COMMISSIONED`, `AI_HYPOTHESIS`, `PENDING_HUMAN`, dates as `ДД.ММ.ГГГГ, ЧЧ:ММ`). `COMMISSIONED` is stored as `operator_guarantee` plus `is_commissioned`.
- `seed.py`: on startup (FastAPI lifespan) it creates the tables and loads `backend/seed.json` if the complexes table is empty. Seeded rows get `is_demo=true`. `backend/seed.json` differs from the root/`frontend/` `seed.json`.
- Per-factor statuses (R1–R6) currently live in the `Complex.factors` JSON column and feed `scoring.py`.
- Tests: `tests/conftest.py` points `BACKEND_DB_URL` at a temp file before `app.db` is imported. `test_api.py` covers the endpoints through `TestClient`.

## Scoring rules (implemented three times — keep them in sync)

The same logic lives in `backend/app/scoring.py`, in `calculateComplexRisk` in `js/shared.js`, and in `frontend/src/services/scoring.js`.

- Weights: R1=35, R2=25, R3=10, R4=15, R5=10, R6=5. `score = min(100, sum of CONFIRMED factors)`.
- Only `CONFIRMED` factors count. `AI_HYPOTHESIS`, needs-check/`UNVERIFIED` and `NONE` all give 0 (human-in-the-loop: AI never adds points on its own).
- R1 is awarded only when the absence of a legal basis is *established*. Unknown data gives 0, and a KZhK operator guarantee also means no R1.
- Zones: RED requires score ≥ 60 **and** both R1 and R2 confirmed. YELLOW covers score ≥ 25 otherwise, including ≥ 60 without R1+R2. GREEN is < 25.
- Invariants checked by tests and the demo: jk-2 (Case A) = 35 Yellow, jk-1 (Case B) = 70 Red, jk-3 (Case C) = 10 Green, and the edge case jk-5 = **60 Yellow**, because its R2 is still an AI hypothesis.

All developer names, BINs and phone numbers are fictional demo data (marked "-Демо"). The system flags risk indicators and does not assert violations, so keep that disclaimer wording intact in UI and act text.
