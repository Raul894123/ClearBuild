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

**Backend** (`backend/app/`): FastAPI + SQLAlchemy + SQLite. All endpoints are on one `APIRouter` mounted twice: `/api/v1/...` (what `js/api.js` uses, TZ2) and `/api/...` (TZ1 aliases, hidden from Swagger). Endpoints: health, complexes (`?zone=` in any case), complexes/{id} (with `publications[]` and the current `signal`), publications, publications/{id}/verify (accept/reject, then rescore and audit), analyze (rule-based ad trigger detection), confirm-factor, signal-decision plus its TZ1 alias `signals/{complex_id}/decision`, and audit-log.
- `analyzer.py`: rule-based ad analysis behind `/analyze` and `POST /publications`. It finds R2, R3 and R5 hypotheses at once. Confidence is `100·(1−e^(−strength/3))` (max 97), where strength is the sum of the strengths of the distinct triggers that matched; safe wording (ДДУ, КЖК, …) subtracts from R2. A hypothesis is proposed when strength ≥ 2. The ЖК is matched by name, then account, then phone; if the match is ambiguous (the phone shared by jk-1/4/5) or nothing matches, the result is `complexId: null` and «ЖК не определён», never a fallback ЖК. The result is always an AI hypothesis and never changes the score.
- `DATA_DIFF.md`: known differences between `js/data.js` and `backend/seed.json`.
- `schemas.py`: request models. Enums are `Literal`s that accept any case, and an invalid value returns 422.
- `db.py`: engine and session. The URL comes from env `BACKEND_DB_URL`, default `backend/clearbuild_demo.db` (gitignored). Delete that file to reseed.
- `models.py`: tables `Complex`, `Publication`, `Signal`, `AuditLog`. Column names and enum values follow TZ1, snake_case (`legal_basis_type`: absent/unknown/operator_guarantee/mio_permit, etc.). A signal decision **adds** a new `Signal` row; the current card is the latest row.
- `mappers.py`: the only place where DB values become the API format the frontend expects (camelCase keys, `ABSENT`/`UNVERIFIED`/`KZH_GUARANTEE`/`COMMISSIONED`, `AI_HYPOTHESIS`, `PENDING_HUMAN`). Timestamps are ISO 8601 with `+05:00`, both in the API and in the DB (`models.TZDateTime`, because SQLite drops the zone). Date-only fields stay `ДД.ММ.ГГГГ`. `COMMISSIONED` is stored as `mio_permit` plus `is_commissioned`.
- `seed.py`: on startup (FastAPI lifespan) it creates the tables and loads `backend/seed.json` if the complexes table is empty. Seeded rows get `is_demo=true`. `backend/seed.json` differs from the root/`frontend/` `seed.json`.
- `factors.py`: derives R1–R6 from DB data (`evaluate_factors`, `risk_profile`); see the rules below. The analyst's `confirm-factor` decisions are stored in `Complex.factor_overrides` and applied on top. `AUTO` removes a decision.
- `seed.py` aborts with a clear error when an existing DB file is missing columns, because `create_all` doesn't migrate. After a schema change, delete `clearbuild_demo.db`.
- Tests: `tests/conftest.py` points `BACKEND_DB_URL` at a temp file before `app.db` is imported. Its `client` fixture drops and reseeds the DB for each test module, so modules don't share state. `test_factors.py` covers the TZ rules on in-memory objects, `test_api.py` covers persistence and the seed, `test_endpoints.py` has one test per endpoint under both prefixes, and `test_analyzer.py` covers the analyzer, including every seed ad text checked against its seed flags.

## Scoring rules

The zone/score logic exists in `backend/app/scoring.py`, in `calculateComplexRisk` in `js/shared.js`, and in `frontend/src/services/scoring.js`. Only the backend derives factors from data; the frontend sums hand-set statuses from `js/data.js`, so the scores can differ (jk-6).

- Weights: R1=35, R2=25, R3=10, R4=15, R5=10, R6=5. `score = min(100, sum of CONFIRMED factors)`.
- Only `CONFIRMED` factors count. `AI_HYPOTHESIS`, needs-check/`UNVERIFIED` and `NONE` all give 0 (human-in-the-loop: AI never adds points on its own).
- R1 is awarded only when `legal_basis_type == absent`. `unknown` gives 0 with the label «Нужна проверка», and `operator_guarantee` or `mio_permit` give 0. Confirming R1 through `confirm-factor` sets the complex to `absent`.
- R2/R3 come only from `confirmed` publications with the matching flag set (`has_direct_payment_offer` / `is_active_pre_commissioning_ad`). In `backend/seed.json` the flags are explicit per publication (`hasDirectPaymentOffer`, `isActivePreCommissioningAd`). `POST /publications` takes them as optional fields; otherwise they come from the AI hypothesis (R2) and the sale-ad regex (R3). R3 never applies to a commissioned complex. `pending_review` publications show up as `AI_HYPOTHESIS` with 0 points.
- R4/R6 come from the `has_collective_complaint` / `has_significant_delay` flags.
- R5 requires `stated − verified ≥ 20` (directional, no `abs`), with both dates and both sources present. If the declared readiness comes from a publication (`stated_readiness_publication_id`) that isn't confirmed yet, R5 is an AI hypothesis.
- An analyst's CONFIRMED decision cannot bypass these hard rules (R1 needs absent, R3 needs pre-commissioning, R5 needs a gap of 20+); `confirm-factor` returns 400 in those cases.
- Zones: RED requires score ≥ 60 **and** both R1 and R2 confirmed. YELLOW covers score ≥ 25 otherwise, including ≥ 60 without R1+R2. GREEN is < 25.
- Seed invariants checked by tests (`SEED_EXPECTED` in `test_api.py`): jk-1 (Case B) = 70 Red, jk-2 (Case A) = 35 Yellow, jk-3 (Case C) = 10 Green, jk-4 = 100 Red, jk-5 (edge case) = **60 Yellow** (its R2 is still an AI hypothesis), jk-6 = 5 Green, jk-7 = 10 Green, jk-8 = 0 Green.

All developer names, BINs and phone numbers are fictional demo data (marked "-Демо"). The system flags risk indicators and does not assert violations, so keep that disclaimer wording intact in UI and act text.
