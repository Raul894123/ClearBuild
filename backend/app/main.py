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

from fastapi import APIRouter, Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.analyzer import analyze
from app.db import get_db
from app.factors import evaluate_factors, hard_precondition_error, risk_profile
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
    signal_to_api,
    verification_status_for,
)
from app.models import AuditLog, Complex, Publication, Signal, now
from app.schemas import (
    AnalyzeRequest,
    ComplexCreateRequest,
    ConfirmFactorRequest,
    PublicationCreateRequest,
    PublicationVerifyRequest,
    SignalDecisionRequest,
    ZoneFilter,
)
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

# Все эндпоинты подключаются дважды: /api/v1/... (фронтенд, ТЗ2) и /api/... (алиасы по ТЗ1), см. конец файла
router = APIRouter()


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


def _sorted_publications(items) -> List[Publication]:
    """Ручные публикации сверху (новые первыми), затем сид в исходном порядке AD-101…AD-112."""
    return sorted(items, key=lambda p: (p.is_demo, _id_number(p.id) if p.is_demo else -_id_number(p.id)))


def _audit(db: Session, actor: str, action: str, entity_type: str, entity_id: str, details: Dict[str, Any]) -> None:
    db.add(AuditLog(actor=actor, action=action, entity_type=entity_type, entity_id=entity_id, details=details))


# --------------------------------------------------------------------------
# Эндпоинты API
# --------------------------------------------------------------------------
@router.get("/health", summary="Статус сервера и проверка демонстрационного режима")
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


@router.get("/complexes", summary="Список всех демонстрационных ЖК с автоматическим расчётом скоринга")
def get_complexes(
    zone: Optional[ZoneFilter] = Query(None, description="Фильтр по зоне: red, yellow, green или all (любой регистр)"),
    db: Session = Depends(get_db),
):
    items = [complex_to_api_with_risk(c) for c in _all_complexes(db)]
    if zone and zone != "all":
        items = [c for c in items if c["riskProfile"]["zone"].lower() == zone]
    return items


@router.get("/complexes/{complex_id}", summary="Полная карточка ЖК: расшифровка R1–R6, публикации и текущая сигнальная карточка")
def get_complex_by_id(complex_id: str, db: Session = Depends(get_db)):
    c = _get_complex_or_404(db, complex_id)
    data = complex_to_api_with_risk(c)
    data["publications"] = [publication_to_api(p) for p in _sorted_publications(c.publications)]
    data["signal"] = signal_to_api(c.current_signal)
    return data


@router.get("/publications", summary="Список рекламных объявлений")
def get_publications(db: Session = Depends(get_db)):
    return [publication_to_api(p) for p in _sorted_publications(db.scalars(select(Publication)).all())]


@router.post("/publications", summary="Добавление нового рекламного объявления вручную")
def create_publication(pub: PublicationCreateRequest, db: Session = Depends(get_db)):
    text = (pub.text or pub.rawText or "").strip()
    ocr_text = (pub.ocrText or "").strip()
    if not text and not ocr_text:
        raise HTTPException(status_code=422, detail="Нужен текст публикации (text) или текст со скриншота (ocrText)")
    target = _get_complex_or_404(db, pub.complexId) if pub.complexId else None

    analysis = _analyze(db, text=text, ocr_text=ocr_text, phone=pub.phone, account=pub.account,
                        screenshot_url=pub.screenshotUrl, explicit=target)
    hypotheses = {h["factor"]: h for h in analysis["hypotheses"]}

    captured_at, note = parse_datetime(pub.capturedAt)
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
        text_content=text or ocr_text,
        screenshot_url=pub.screenshotUrl,
        ai_hypothesis={
            "proposedFactor": analysis["proposedFactor"],
            "quote": analysis["triggerSpan"],
            "confidence": analysis["confidence"],
            "explanation": analysis["explanation"],
            "hypotheses": [{"factor": h["factor"], "confidence": h["confidence"], "quote": h["quote"]} for h in hypotheses.values()],
            # Без complexId публикация не привязывается автоматически: анализатор только предлагает ЖК
            "suggestedComplexId": None if target else analysis["complexId"],
            "ocrText": ocr_text or None,
        },
        status=publication_status_to_db(pub.status),
        has_direct_payment_offer=pub.hasDirectPaymentOffer if pub.hasDirectPaymentOffer is not None else "R2" in hypotheses,
        is_active_pre_commissioning_ad=(
            (pub.isActivePreCommissioningAd if pub.isActivePreCommissioningAd is not None else "R3" in hypotheses)
            and not (target and target.is_commissioned)
        ),
        is_demo=False,
    )
    if target:
        item.complex = target
    db.add(item)
    if target:
        # Подтверждённая публикация сразу меняет R2/R3 — обновляем текущую сигнальную карточку
        refresh_signal(target.current_signal, target)
    _audit(db, "Аналитик МИО (веб-интерфейс)", "publication_create", "publication", item.id, {
        "complexId": pub.complexId,
        "platform": pub.platform,
        "hypotheses": list(hypotheses),
    })
    db.commit()
    return {
        "status": "success",
        "publication": publication_to_api(item),
        "analysis": analysis,
    }


@router.post("/publications/{publication_id}/verify", summary="Решение аналитика по гипотезе ИИ: принять или отклонить публикацию")
def verify_publication(publication_id: str, req: PublicationVerifyRequest, db: Session = Depends(get_db)):
    pub = db.get(Publication, publication_id)
    if not pub:
        raise HTTPException(status_code=404, detail=f"Публикация {publication_id} не найдена")

    target = pub.complex
    before = risk_profile(target) if target else None
    previous_status = pub.status
    pub.status = "confirmed" if req.decision == "accept" else "rejected"
    analyst = req.analyst or "Ахметов Д.К. (Аналитик МИО)"

    # Решение по публикации меняет R2/R3/R5 — пересчитываем скоринг и текущую сигнальную карточку
    after = None
    if target:
        refresh_signal(target.current_signal, target)
        after = risk_profile(target)
    _audit(db, analyst, "publication_verify", "publication", pub.id, {
        "decision": req.decision,
        "from": previous_status,
        "to": pub.status,
        "comment": req.comment,
        "complexId": pub.complex_id,
        "scoreBefore": before["score"] if before else None,
        "scoreAfter": after["score"] if after else None,
        "zoneAfter": after["zone"] if after else None,
    })
    db.commit()

    return {
        "status": "success",
        "publication": publication_to_api(pub),
        "complex_id": pub.complex_id,
        "risk_profile": after,
        "complex": complex_to_api(target) if target else None,
    }


@router.post("/analyze", summary="ИИ-анализатор объявлений: гипотезы R2, R3, R5 с триггерами и уверенностью (в балл не идут)")
def analyze_advertisement(req: AnalyzeRequest, db: Session = Depends(get_db)):
    explicit = None
    if req.complex_id and req.complex_id.upper() != "AUTO":
        explicit = _get_complex_or_404(db, req.complex_id)
    return _analyze(db, text=req.text, ocr_text=req.ocr_text, phone=req.phone, account=req.account,
                    screenshot_url=req.screenshot_url, explicit=explicit)


def _analyze(db: Session, explicit: Optional[Complex] = None, **kwargs) -> Dict[str, Any]:
    try:
        return analyze(_all_complexes(db), explicit_complex=explicit, **kwargs)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.post("/complexes/{complex_id}/confirm-factor", summary="Подтверждение или отклонение фактора аналитиком (Human-in-the-Loop)")
def confirm_factor(complex_id: str, req: ConfirmFactorRequest, db: Session = Depends(get_db)):
    target = _get_complex_or_404(db, complex_id)

    factor_code = req.factor
    status = req.status

    analyst = req.analyst or "Ахметов Д.К. (Аналитик МИО)"
    evidence_text = req.evidence or f"Решение аналитика МИО ({analyst}) в рамках мониторинга."
    previous = next(f for f in evaluate_factors(target) if f["code"] == factor_code)

    # Подтверждение R1 = аналитик установил отсутствие правового основания: меняем данные ЖК
    if factor_code == "R1" and status == "CONFIRMED" and target.legal_basis_type != "absent":
        target.legal_basis_type = "absent"
        target.verification_status = verification_status_for("absent")
        previous_source = target.verification_source
        target.verification_source = f"{evidence_text} (ранее: {previous_source})" if previous_source else evidence_text
    if status == "CONFIRMED":
        blocked = hard_precondition_error(target, factor_code)
        if blocked:
            raise HTTPException(status_code=400, detail=blocked)

    # R4 и R6 — флаги ЖК по ТЗ: решение аналитика пишем прямо в них
    if factor_code == "R4" and status != "AUTO":
        target.has_collective_complaint = status == "CONFIRMED"
        target.collective_complaint_source = evidence_text if status == "CONFIRMED" else None
    elif factor_code == "R6" and status != "AUTO":
        target.has_significant_delay = status == "CONFIRMED"
        target.delay_source = evidence_text if status == "CONFIRMED" else None

    # Новый словарь, чтобы SQLAlchemy зафиксировал изменение JSON-колонки
    overrides = dict(target.factor_overrides or {})
    if status == "AUTO":
        overrides.pop(factor_code, None)
    else:
        overrides[factor_code] = {
            "status": status,
            "evidence": req.evidence,
            "analyst": analyst,
            "at": now().isoformat(),
        }
    target.factor_overrides = overrides

    # Пересчитываем балл по данным и обновляем текущую сигнальную карточку
    refresh_signal(target.current_signal, target)
    current = next(f for f in evaluate_factors(target) if f["code"] == factor_code)
    _audit(db, analyst, "factor_status_change", "complex", complex_id, {
        "factor": factor_code,
        "requested": status,
        "from": previous["status"],
        "to": current["status"],
        "evidence": evidence_text,
    })
    db.commit()

    return {
        "status": "success",
        "complex_id": complex_id,
        "factor": factor_code,
        "factor_status": current["status"],
        "risk_profile": risk_profile(target),
        "complex": complex_to_api(target),
    }


@router.post("/complexes", summary="Добавление нового проверяемого ЖК в реестр")
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


@router.post("/complexes/{complex_id}/signal-decision", summary="Утверждение или возврат Сигнальной карточки")
def signal_decision(complex_id: str, req: SignalDecisionRequest, db: Session = Depends(get_db)):
    target = _get_complex_or_404(db, complex_id)
    status = SIGNAL_STATUS_TO_DB[req.decision]

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
        "decision": req.decision,
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
        "signal": signal_to_api(signal),
        "complex": complex_to_api(target),
    }


@router.post("/signals/{complex_id}/decision", summary="Решение по сигнальной карточке (путь по ТЗ1, алиас signal-decision)")
def signal_decision_alias(complex_id: str, req: SignalDecisionRequest, db: Session = Depends(get_db)):
    return signal_decision(complex_id, req, db)


@router.get("/audit-log", summary="Журнал аудита действий аналитиков (новые записи сверху)")
def get_audit_log(limit: int = 100, db: Session = Depends(get_db)):
    rows = db.scalars(select(AuditLog).order_by(AuditLog.id.desc()).limit(max(1, min(limit, 1000)))).all()
    return [audit_to_api(a) for a in rows]


app.include_router(router, prefix="/api/v1")
# Алиасы путей по ТЗ1 (/api/complexes, /api/publications/{id}/verify, ...); в Swagger не дублируются
app.include_router(router, prefix="/api", include_in_schema=False)
