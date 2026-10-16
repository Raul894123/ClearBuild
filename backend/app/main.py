"""FastAPI сервер ClearBuild · SAQ QURYLYS.

Codemasters Hackathon 8.0 (г. Усть-Каменогорск).
Предоставляет REST API для карточек объектов ЖК г. Усть-Каменогорска,
рекламных публикаций, модуля объяснимого ИИ-анализа (Explainable AI),
ручного добавления публикаций и подтверждения факторов риска аналитиком МИО (Human-in-the-Loop).
Данные хранятся в SQLite (SQLAlchemy) и заполняются из backend/seed.json при первом старте.
"""

import re
from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.mappers import (
    SIGNAL_STATUS_TO_API,
    SIGNAL_STATUS_TO_DB,
    audit_to_api,
    complex_to_api,
    complex_to_api_with_risk,
    legal_basis_to_db,
    parse_date,
    parse_datetime,
    publication_status_to_db,
    publication_to_api,
    refresh_signal,
    signal_snapshot,
    verification_status_for,
)
from app.models import AuditLog, Complex, Publication, Signal, now
from app.scoring import WEIGHTS, calculate_risk_for_complex
from app.seed import init_db


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="ClearBuild · SAQ QURYLYS API",
    description="Интеллектуальный мониторинг рисков в долевом жилищном строительстве (г. Усть-Каменогорск)",
    version="1.0.0",
    lifespan=lifespan,
)

# Разрешаем CORS для веб-интерфейса фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------------------------------
# Вспомогательные функции
# --------------------------------------------------------------------------
def _id_number(entity_id: str) -> int:
    m = re.search(r"(\d+)$", entity_id or "")
    return int(m.group(1)) if m else 0


def _all_complexes(db: Session) -> List[Complex]:
    """ЖК в порядке добавления (jk-2 раньше jk-10)."""
    items = db.scalars(select(Complex)).all()
    return sorted(items, key=lambda c: (c.created_at, _id_number(c.id)))


def _get_complex_or_404(db: Session, complex_id: str) -> Complex:
    c = db.get(Complex, complex_id)
    if not c:
        raise HTTPException(status_code=404, detail=f"Комплекс {complex_id} не найден")
    return c


def _next_id(db: Session, model, prefix: str, floor: int = 0) -> str:
    ids = db.scalars(select(model.id)).all()
    return f"{prefix}{max([floor] + [_id_number(i) for i in ids]) + 1}"


def _audit(db: Session, actor: str, action: str, entity_type: str, entity_id: str, details: Dict[str, Any]) -> None:
    db.add(AuditLog(actor=actor, action=action, entity_type=entity_type, entity_id=entity_id, details=details))


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


class PublicationCreateRequest(BaseModel):
    complexId: Optional[str] = Field(None, description="ID жилого комплекса (может быть пустым до привязки)")
    platform: str = Field("Krisha.kz", description="Платформа публикации")
    account: str = Field("Отдел продаж", description="Аккаунт автора")
    phone: str = Field("", description="Контактный телефон")
    date: Optional[str] = Field(None, description="Дата публикации (устаревшее имя поля, см. pubDate)")
    pubDate: Optional[str] = Field(None, description="Дата публикации, ДД.ММ.ГГГГ")
    capturedAt: Optional[str] = Field(None, description="Время фиксации; по умолчанию — текущее время сервера")
    url: str = Field("", description="URL адрес объявления")
    rawText: Optional[str] = Field(None, description="Текст публикации")
    text: Optional[str] = Field(None, description="Текст публикации (альтернативное имя поля)")
    screenshotUrl: Optional[str] = Field(None, description="Ссылка на скриншот")
    status: Optional[str] = Field("AI_HYPOTHESIS", description="Статус верификации")


class SignalDecisionRequest(BaseModel):
    decision: str = Field(..., description="Резолюция: CONFIRMED, REJECTED, RETURNED")
    comment: Optional[str] = Field(None, description="Комментарий аналитика")
    author: Optional[str] = Field("Ахметов Д.К.", description="ФИО уполномоченного лица")


class ComplexCreateRequest(BaseModel):
    name: str = Field(..., description="Название жилого комплекса")
    developer: str = Field(..., description="Наименование застройщика")
    bin: str = Field(..., description="БИН организации")
    district: Optional[str] = Field("г. Усть-Каменогорск", description="Адрес или район")
    coords: Optional[List[float]] = Field([49.95, 82.61], description="Широта и долгота")
    stage: Optional[str] = Field("Строительно-монтажные работы", description="Стадия")
    legalBasisType: Optional[str] = Field("UNVERIFIED", description="Правовое основание")


# --------------------------------------------------------------------------
# Эндпоинты API
# --------------------------------------------------------------------------
@app.get("/api/v1/health", summary="Статус сервера и проверка демонстрационного режима")
def get_health(db: Session = Depends(get_db)):
    return {
        "status": "healthy",
        "DEMO_MODE": True,
        "app": "ClearBuild (SAQ QURYLYS)",
        "city": "Ust-Kamenogorsk",
        "domain": "komputerny-oslik.site",
        "version": "1.0.0",
        "complexes_count": db.scalar(select(func.count()).select_from(Complex)),
        "publications_count": db.scalar(select(func.count()).select_from(Publication)),
    }


@app.get("/api/v1/complexes", summary="Список всех демонстрационных ЖК с автоматическим расчётом скоринга")
def get_complexes(db: Session = Depends(get_db)):
    return [complex_to_api_with_risk(c) for c in _all_complexes(db)]


@app.get("/api/v1/complexes/{complex_id}", summary="Получение конкретного ЖК по ID")
def get_complex_by_id(complex_id: str, db: Session = Depends(get_db)):
    return complex_to_api_with_risk(_get_complex_or_404(db, complex_id))


@app.get("/api/v1/publications", summary="Список рекламных объявлений")
def get_publications(db: Session = Depends(get_db)):
    items = db.scalars(select(Publication)).all()
    # Ручные публикации сверху (новые первыми), затем сид в исходном порядке AD-101…AD-112
    items = sorted(items, key=lambda p: (p.is_demo, _id_number(p.id) if p.is_demo else -_id_number(p.id)))
    return [publication_to_api(p) for p in items]


@app.post("/api/v1/publications", summary="Добавление нового рекламного объявления вручную")
def create_publication(pub: PublicationCreateRequest, db: Session = Depends(get_db)):
    text = (pub.rawText or pub.text or "").strip()
    if not text:
        raise HTTPException(status_code=422, detail="Текст публикации (rawText или text) обязателен")
    if pub.complexId and not db.get(Complex, pub.complexId):
        raise HTTPException(status_code=404, detail=f"Комплекс {pub.complexId} не найден")

    analysis = _run_analysis(db, AnalyzeRequest(
        text=text,
        phone=pub.phone,
        platform=pub.platform,
        complex_id=pub.complexId,
    ))

    captured_at, note = parse_datetime(pub.capturedAt)
    factor = analysis["proposedFactor"]
    target = db.get(Complex, pub.complexId) if pub.complexId else None
    item = Publication(
        id=_next_id(db, Publication, "AD-", floor=100),
        complex_id=pub.complexId,
        source_platform=pub.platform,
        account_name=pub.account,
        phone=pub.phone,
        url=pub.url,
        published_at=parse_date(pub.pubDate or pub.date) or now().date(),
        captured_at=captured_at or now(),
        capture_note=note,
        text_content=text,
        screenshot_url=pub.screenshotUrl,
        ai_hypothesis={
            "proposedFactor": factor,
            "quote": analysis.get("triggerSpan"),
            "confidence": analysis.get("confidence"),
            "explanation": analysis.get("explanation"),
        },
        status=publication_status_to_db(pub.status),
        has_direct_payment_offer=factor == "R2",
        is_active_pre_commissioning_ad=not (target and target.is_commissioned),
        is_demo=False,
    )
    db.add(item)
    _audit(db, "Аналитик МИО (веб-интерфейс)", "publication_create", "publication", item.id, {
        "complexId": pub.complexId,
        "platform": pub.platform,
        "proposedFactor": factor,
    })
    db.commit()
    return {
        "status": "success",
        "publication": publication_to_api(item),
        "analysis": analysis,
    }


@app.post("/api/v1/analyze", summary="ИИ-анализатор объявлений с извлечением триггеров и гипотезой фактора")
def analyze_advertisement(req: AnalyzeRequest, db: Session = Depends(get_db)):
    return _run_analysis(db, req)


def _run_analysis(db: Session, req: AnalyzeRequest) -> Dict[str, Any]:
    raw_text = req.text.strip()
    if not raw_text:
        raise HTTPException(status_code=400, detail="Текст объявления не может быть пустым")

    complexes = [complex_to_api(c) for c in _all_complexes(db)]

    # 1. Поиск привязанного ЖК
    matched_complex = None
    if req.complex_id and req.complex_id != "AUTO":
        for c in complexes:
            if c.get("id") == req.complex_id:
                matched_complex = c
                break

    if not matched_complex:
        lower_text = raw_text.lower()
        for c in complexes:
            clean_name = re.sub(r"[«»]", "", c.get("name", "")).split("(")[0].replace("ЖК", "").strip().lower()
            if (clean_name and clean_name in lower_text) or (req.phone and c.get("contactPhone") == req.phone):
                matched_complex = c
                break

    if not matched_complex and complexes:
        matched_complex = complexes[0]

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
        conf_pct = matched_complex.get("confirmedReadiness", {}).get("pct") or 0
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
        for c in complexes:
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
def confirm_factor(complex_id: str, req: ConfirmFactorRequest, db: Session = Depends(get_db)):
    target = _get_complex_or_404(db, complex_id)

    factor_code = req.factor.upper()
    if factor_code not in WEIGHTS:
        raise HTTPException(status_code=400, detail=f"Недопустимый код фактора {factor_code}. Допустимы: R1-R6")

    analyst = req.analyst or "Ахметов Д.К. (Аналитик МИО)"
    evidence_text = req.evidence or f"Подтверждено аналитиком МИО ({analyst}) в рамках мониторинга."
    previous = (target.factors or {}).get(factor_code, {}).get("status")

    # Новый словарь, чтобы SQLAlchemy зафиксировал изменение JSON-колонки
    factors = dict(target.factors or {})
    factors[factor_code] = {"status": req.status, "evidence": evidence_text}
    target.factors = factors
    if factor_code == "R4":
        target.has_collective_complaint = req.status == "CONFIRMED"
    elif factor_code == "R6":
        target.has_significant_delay = req.status == "CONFIRMED"

    # Пересчитываем балл строго детерминированной функцией и обновляем текущую сигнальную карточку
    refresh_signal(target.current_signal, target)
    _audit(db, analyst, "factor_status_change", "complex", complex_id, {
        "factor": factor_code,
        "from": previous,
        "to": req.status,
        "evidence": evidence_text,
    })
    db.commit()

    data = complex_to_api(target)
    return {
        "status": "success",
        "complex_id": complex_id,
        "factor": factor_code,
        "factor_status": req.status,
        "risk_profile": calculate_risk_for_complex(data),
        "complex": data,
    }


@app.post("/api/v1/complexes", summary="Добавление нового проверяемого ЖК в реестр")
def create_complex(req: ComplexCreateRequest, db: Session = Depends(get_db)):
    legal_type, commissioned = legal_basis_to_db(req.legalBasisType)
    coords = req.coords if req.coords and len(req.coords) >= 2 else [49.95, 82.61]
    new_item = Complex(
        id=_next_id(db, Complex, "jk-"),
        name=req.name,
        address=req.district,
        lat=coords[0],
        lng=coords[1],
        developer_name=req.developer,
        developer_bin=req.bin,
        stage=req.stage,
        legal_basis_type=legal_type,
        legal_basis_text="Не проверено · В процессе проверки",
        verification_status=verification_status_for(legal_type),
        verification_source="Добавлено аналитиком МИО через веб-интерфейс",
        is_commissioned=commissioned,
        contact_phone="+7 (7232) 00-00-00",
        sales_account="@new_developer",
        factors={
            "R1": {"status": "UNVERIFIED" if legal_type == "unknown" else "NONE", "evidence": "Требуется проверка"},
            "R2": {"status": "NONE", "evidence": "Не выявлено"},
            "R3": {"status": "NONE", "evidence": "Не выявлено"},
            "R4": {"status": "NONE", "evidence": "Не выявлено"},
            "R5": {"status": "NONE", "evidence": "Не выявлено"},
            "R6": {"status": "NONE", "evidence": "Не выявлено"},
        },
        is_demo=False,
    )
    db.add(new_item)
    db.add(Signal(complex=new_item, status="draft", reviewed_by="Ахметов Д.К.", reviewed_at=now(), **signal_snapshot(new_item)))
    _audit(db, "Аналитик МИО (веб-интерфейс)", "complex_create", "complex", new_item.id, {
        "name": req.name,
        "bin": req.bin,
        "legalBasisType": req.legalBasisType,
    })
    db.commit()
    return {"status": "success", "complex": complex_to_api(new_item)}


@app.post("/api/v1/complexes/{complex_id}/signal-decision", summary="Утверждение или возврат Сигнальной карточки")
def signal_decision(complex_id: str, req: SignalDecisionRequest, db: Session = Depends(get_db)):
    target = _get_complex_or_404(db, complex_id)

    status = SIGNAL_STATUS_TO_DB.get(req.decision.upper())
    if not status:
        raise HTTPException(status_code=400, detail=f"Недопустимое решение {req.decision}. Допустимы: CONFIRMED, RETURNED")

    previous = target.current_signal
    author = req.author or "Ахметов Д.К."
    # Каждое решение — новая строка Signal: история решений сохраняется
    signal = Signal(
        complex=target,
        status=status,
        comment=req.comment or (previous.comment if previous else None),
        reviewed_by=author,
        reviewed_at=now(),
        **signal_snapshot(target),
    )
    db.add(signal)
    _audit(db, author, "signal_decision", "complex", complex_id, {
        "decision": req.decision.upper(),
        "comment": req.comment,
        "score": signal.total_score,
        "zone": signal.risk_zone,
    })
    db.commit()

    return {
        "status": "success",
        "complex_id": complex_id,
        "signalStatus": SIGNAL_STATUS_TO_API[status],
        "signalAuthor": author,
        "complex": complex_to_api(target),
    }


@app.get("/api/v1/audit-log", summary="Журнал аудита действий аналитиков (новые записи сверху)")
def get_audit_log(limit: int = 100, db: Session = Depends(get_db)):
    rows = db.scalars(select(AuditLog).order_by(AuditLog.id.desc()).limit(max(1, min(limit, 1000)))).all()
    return [audit_to_api(a) for a in rows]
