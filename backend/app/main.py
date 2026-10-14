"""FastAPI сервер ClearBuild · SAQ QURYLYS.

Codemasters Hackathon 8.0 (г. Усть-Каменогорск).
Предоставляет REST API для карточек объектов ЖК г. Усть-Каменогорска,
рекламных публикаций, модуля объяснимого ИИ-анализа (Explainable AI)
и подтверждения факторов риска аналитиком МИО (Human-in-the-Loop).
"""

import json
import os
import re
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.scoring import (
    FACTOR_NAMES,
    WEIGHTS,
    calculate_risk,
    calculate_risk_for_complex,
)

BASE_DIR = Path(__file__).resolve().parent.parent
SEED_FILE = BASE_DIR / "seed.json"

app = FastAPI(
    title="ClearBuild · SAQ QURYLYS API",
    description="Интеллектуальный мониторинг рисков в долевом жилищном строительстве (г. Усть-Каменогорск)",
    version="1.0.0",
)

# Разрешаем CORS для веб-интерфейса фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Загрузка демонстрационной базы в память
DB: Dict[str, Any] = {"meta": {}, "complexes": [], "publications": []}


def load_seed_data():
    if SEED_FILE.exists():
        with open(SEED_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            DB["meta"] = data.get("meta", {})
            DB["complexes"] = data.get("complexes", [])
            DB["publications"] = data.get("publications", [])
    else:
        DB["meta"] = {"project": "ClearBuild / SAQ QURYLYS"}
        DB["complexes"] = []
        DB["publications"] = []


load_seed_data()


# --------------------------------------------------------------------------
# Pydantic Модели
# --------------------------------------------------------------------------
class AnalyzeRequest(BaseModel):
    text: str = Field(..., description="Текст рекламного объявления или результат OCR")
    phone: Optional[str] = Field(None, description="Контактный телефон отдела продаж")
    platform: Optional[str] = Field(None, description="Платформа размещения (Krisha.kz, Instagram, Telegram и т.д.)")
    complex_id: Optional[str] = Field(None, description="ID комплекса (если выбран вручную)")


class ConfirmFactorRequest(BaseModel):
    factor: str = Field(..., description="Код фактора риска (R1, R2, R3, R4, R5, R6)")
    status: str = Field("CONFIRMED", description="Новый статус (CONFIRMED, REJECTED, NONE)")
    evidence: Optional[str] = Field(None, description="Обоснование решения аналитика")
    analyst: Optional[str] = Field("Ахметов Д.К. (Аналитик МИО)", description="ФИО специалиста МИО")


# --------------------------------------------------------------------------
# Эндпоинты API
# --------------------------------------------------------------------------
@app.get("/api/v1/health", summary="Статус сервера и проверка демонстрационного режима")
def get_health():
    return {
        "status": "healthy",
        "DEMO_MODE": True,
        "app": "ClearBuild (SAQ QURYLYS)",
        "city": "Ust-Kamenogorsk",
        "version": "1.0.0",
        "complexes_count": len(DB["complexes"]),
        "publications_count": len(DB["publications"]),
    }


@app.get("/api/v1/complexes", summary="Список всех демонстрационных ЖК с автоматическим расчётом скоринга")
def get_complexes():
    results = []
    for item in DB["complexes"]:
        c = dict(item)
        risk = calculate_risk_for_complex(c)
        c["riskProfile"] = risk
        results.append(c)
    return results


@app.get("/api/v1/complexes/{complex_id}", summary="Получение конкретного ЖК по ID")
def get_complex_by_id(complex_id: str):
    for item in DB["complexes"]:
        if item.get("id") == complex_id:
            c = dict(item)
            c["riskProfile"] = calculate_risk_for_complex(c)
            return c
    raise HTTPException(status_code=404, detail=f"Комплекс {complex_id} не найден")


@app.get("/api/v1/publications", summary="Список рекламных объявлений")
def get_publications():
    return DB["publications"]


@app.post("/api/v1/analyze", summary="ИИ-анализатор объявлений с извлечением триггеров и гипотезой фактора")
def analyze_advertisement(req: AnalyzeRequest):
    raw_text = req.text.strip()
    if not raw_text:
        raise HTTPException(status_code=400, detail="Текст объявления не может быть пустым")

    # 1. Поиск привязанного ЖК
    matched_complex = None
    if req.complex_id and req.complex_id != "AUTO":
        for c in DB["complexes"]:
            if c.get("id") == req.complex_id:
                matched_complex = c
                break

    if not matched_complex:
        lower_text = raw_text.lower()
        for c in DB["complexes"]:
            clean_name = re.sub(r"[«»]", "", c.get("name", "")).split("(")[0].replace("ЖК", "").strip().lower()
            if (clean_name and clean_name in lower_text) or (req.phone and c.get("contactPhone") == req.phone):
                matched_complex = c
                break

    if not matched_complex and DB["complexes"]:
        matched_complex = DB["complexes"][0]

    # 2. Детекция триггеров R2 (платная бронь, депозит, взнос, касса, резерв, рассрочка)
    r2_patterns = [
        r"платн[а-я]+\s+брон[а-я]+",
        r"забронировать\s+квартиру[^.!?;]*",
        r"внес[а-я]+\s+(?:платный\s+)?депозит[^.!?;]*",
        r"первоначальн[а-я]+\s+взнос[^.!?;]*",
        r"по\s+договору\s+(?:резервирования|бронирования|инвестирования)[^.!?;]*",
        r"в\s+кассу\s+застройщика[^.!?;]*",
        r"рассрочк[а-я]+\s+на\s+\d+\s+мес[^.!?;]*",
        r"бронь",
        r"депозит",
        r"первоначальный взнос",
        r"в кассу",
        r"резерв",
        r"рассрочка",
    ]
    r2_regex = re.compile(r"|".join(f"(?:{p})" for p in r2_patterns), re.IGNORECASE)
    r2_matches = r2_regex.findall(raw_text)

    # 3. Детекция безопасных формулировок ДДУ и гарантии КЖК
    safe_ddu_regex = re.compile(
        r"(?:гаранти[а-я]+\s+(?:единого\s+оператора|ао\s+«?кжк»?)|"
        r"оформление\s+(?:строго\s+)?по\s+(?:официальным\s+)?(?:договорам\s+долевого\s+участия|дду))",
        re.IGNORECASE,
    )
    safe_matches = safe_ddu_regex.findall(raw_text)

    # 4. Детекция готовности для R5
    readiness_match = re.search(r"готовность(?:\s+объекта|\s+дома|\s+уже)?\s*(\d{1,3})\s*%", raw_text, re.IGNORECASE)
    r5_detected = False
    declared_pct = None
    if readiness_match and matched_complex:
        declared_pct = int(readiness_match.group(1))
        conf_pct = matched_complex.get("confirmedReadiness", {}).get("pct", 0)
        if abs(declared_pct - conf_pct) >= 20:
            r5_detected = True

    # 5. Определение предлагаемого фактора
    if r2_matches and not safe_matches:
        proposed_factor = "R2"
        confidence = 94
        trigger_span = r2_matches[0] if isinstance(r2_matches[0], str) else str(r2_matches[0])
        explanation = (
            f"ИИ обнаружил прямое предложение внести деньги до проверки правовых оснований: «{trigger_span}». "
            f"Рекомендуется начислить фактор R2 (+{WEIGHTS['R2']} баллов)."
        )
    elif r5_detected:
        proposed_factor = "R5"
        confidence = 91
        trigger_span = readiness_match.group(0)
        explanation = (
            f"ИИ обнаружил расхождение готовности ≥20 п.п.: в рекламе заявлено {declared_pct}%, "
            f"фактическая готовность МИО/ГАСК: {matched_complex.get('confirmedReadiness', {}).get('pct')}%. "
            f"Рекомендуется фактор R5 (+{WEIGHTS['R5']} баллов)."
        )
    else:
        proposed_factor = "R3"
        confidence = 88
        trigger_span = raw_text[:80] + "..." if len(raw_text) > 80 else raw_text
        explanation = (
            f"Обнаружена стандартная реклама строящегося объекта (R3 +{WEIGHTS['R3']} баллов). "
            "Признаков незаконного сбора денег в обход ДДУ не выявлено."
        )

    # Проверка коллизий телефона отдела продаж (Бонус Раздела 11)
    phone_collisions = []
    if req.phone:
        for c in DB["complexes"]:
            if c.get("contactPhone") == req.phone and c.get("id") != (matched_complex.get("id") if matched_complex else ""):
                phone_collisions.append({
                    "id": c.get("id"),
                    "name": c.get("name"),
                    "legalBasisType": c.get("legalBasisType"),
                })

    return {
        "proposedFactor": proposed_factor,
        "factorWeight": WEIGHTS.get(proposed_factor, 0),
        "confidence": confidence,
        "triggerSpan": trigger_span,
        "explanation": explanation,
        "matchedComplexId": matched_complex.get("id") if matched_complex else None,
        "matchedComplexName": matched_complex.get("name") if matched_complex else None,
        "humanConfirmationRequired": True,
        "phoneCollisions": phone_collisions,
    }


@app.post("/api/v1/complexes/{complex_id}/confirm-factor", summary="Подтверждение или отклонение фактора аналитиком (Human-in-the-Loop)")
def confirm_factor(complex_id: str, req: ConfirmFactorRequest):
    target = None
    for c in DB["complexes"]:
        if c.get("id") == complex_id:
            target = c
            break

    if not target:
        raise HTTPException(status_code=404, detail=f"Комплекс {complex_id} не найден")

    factor_code = req.factor.upper()
    if factor_code not in WEIGHTS:
        raise HTTPException(status_code=400, detail=f"Недопустимый код фактора {factor_code}. Допустимы: R1-R6")

    # Обновляем статус фактора
    if "factors" not in target:
        target["factors"] = {}

    evidence_text = req.evidence or f"Подтверждено аналитиком МИО ({req.analyst}) в рамках мониторинга."
    target["factors"][factor_code] = {
        "status": req.status,
        "evidence": evidence_text,
    }

    # Пересчитываем балл строго детерминированной функцией
    new_risk = calculate_risk_for_complex(target)
    target["signalUpdatedAt"] = "14.10.2026, 17:00"
    target["signalAuthor"] = req.analyst

    return {
        "status": "success",
        "complex_id": complex_id,
        "factor": factor_code,
        "factor_status": req.status,
        "risk_profile": new_risk,
        "complex": target,
    }
