"""Короче, это главный FastAPI-сервер ClearBuild · SAQ QURYLYS.

Codemasters Hackathon 8.0 (г. Усть-Каменогорск).
По сути, отдаёт весь REST API для карточек ЖК Усть-Каменогорска,
рекламных публикаций, объяснимого ИИ-анализа (Explainable AI),
ручного добавления объявлений и верификации факторов риска аналитиком МИО (Human-in-the-Loop).
Все данные крутятся в SQLite через SQLAlchemy и при первом запуске подтягиваются из backend/seed.json.
"""

import re
from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, FastAPI, File, HTTPException, Query, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.analyzer import analyze
from app.db import get_db
from app.factors import evaluate_factors, hard_precondition_error, risk_profile
from app.geocoding import geocode_address, geocode_address_online, svg_pos_from_coords
from app.mappers import (
    SIGNAL_STATUS_TO_API,
    SIGNAL_STATUS_TO_DB,
    audit_to_api,
    complex_to_api,
    complex_to_api_with_risk,
    legal_basis_to_api,
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
from app.registries import (
    ImportFormatError,
    checked_entry,
    describe_row,
    gov_checks,
    is_revoked,
    legal_basis_check_status,
    legal_basis_from_row,
    match_complex,
    normalize_bin,
    normalize_row,
    parse_export,
)
from app.schemas import (
    AnalyzeRequest,
    ComplexCreateRequest,
    ConfirmFactorRequest,
    PublicationCreateRequest,
    PublicationVerifyRequest,
    ImportFormat,
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

# Открываем CORS настежь, чтобы веб-интерфейс спокойно стучался с любого домена/локалки
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Прикол в том, что все роуты подключаем сразу по двум префиксам: /api/v1/... (основной) и /api/... (алиасы на всякий пожарный)
router = APIRouter()


# --------------------------------------------------------------------------
# Вспомогательные утилитки для работы с БД
# --------------------------------------------------------------------------
def _id_number(entity_id: str) -> int:
    m = re.search(r"(\d+)$", entity_id or "")
    return int(m.group(1)) if m else 0


def _all_complexes(db: Session) -> List[Complex]:
    """Отдаёт список ЖК строго в порядке добавления (чтобы jk-2 всегда шёл раньше jk-10)."""
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
    """Сортируем так: добавленные руками объявления всегда висят сверху (свежие первыми), а дальше идёт демо-сид AD-101…AD-112."""
    return sorted(items, key=lambda p: (p.is_demo, _id_number(p.id) if p.is_demo else -_id_number(p.id)))


def _audit(db: Session, actor: str, action: str, entity_type: str, entity_id: str, details: Dict[str, Any]) -> None:
    db.add(AuditLog(actor=actor, action=action, entity_type=entity_type, entity_id=entity_id, details=details))


# --------------------------------------------------------------------------
# Основные эндпоинты REST API
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
    items = []
    for c in _all_complexes(db):
        item = complex_to_api_with_risk(c)
        item["govChecks"] = gov_checks(c)
        items.append(item)
    if zone and zone != "all":
        items = [c for c in items if c["riskProfile"]["zone"].lower() == zone]
    return items


@router.get("/complexes/{complex_id}", summary="Полная карточка ЖК: расшифровка R1–R6, публикации и текущая сигнальная карточка")
def get_complex_by_id(complex_id: str, db: Session = Depends(get_db)):
    c = _get_complex_or_404(db, complex_id)
    data = complex_to_api_with_risk(c)
    data["publications"] = [publication_to_api(p) for p in _sorted_publications(c.publications)]
    data["signal"] = signal_to_api(c.current_signal)
    data["govChecks"] = gov_checks(c)
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
            # Если complexId явно не передали, сами намертво не привязываем — просто сохраняем подсказку suggestedComplexId
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
        # Если публикация прилетела уже подтверждённой, она может сразу поменять R2/R3 — поэтому освежаем сигнальную карточку
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

    # Решение аналитика по объявлению напрямую влияет на R2/R3/R5 — пересчитываем скоринг и сигнальную карточку
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

    # Если аналитик вручную подтверждает R1 — значит он реально проверил реестры и установил отсутствие основания (absent)
    if factor_code == "R1" and status == "CONFIRMED" and target.legal_basis_type != "absent":
        target.legal_basis_type = "absent"
        target.verification_status = verification_status_for("absent")
        previous_source = target.verification_source
        target.verification_source = f"{evidence_text} (ранее: {previous_source})" if previous_source else evidence_text
    if status == "CONFIRMED":
        blocked = hard_precondition_error(target, factor_code)
        if blocked:
            raise HTTPException(status_code=400, detail=blocked)

    # R4 и R6 хранятся как прямые флажки в карточке ЖК, поэтому решение аналитика пишем сразу и туда
    if factor_code == "R4" and status != "AUTO":
        target.has_collective_complaint = status == "CONFIRMED"
        target.collective_complaint_source = evidence_text if status == "CONFIRMED" else None
    elif factor_code == "R6" and status != "AUTO":
        target.has_significant_delay = status == "CONFIRMED"
        target.delay_source = evidence_text if status == "CONFIRMED" else None

    # Создаём свежий копипаст словаря, чтобы SQLAlchemy точно заметил мутацию JSON-поля
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

    # Пересчитываем итоговый балл по свежим данным и обновляем текущую сигнальную карточку
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


@router.get("/geocode", summary="Геокодирование адреса в г. Усть-Каменогорск с привязкой к OpenStreetMap")
def geocode_api(q: str = Query(..., description="Адрес стройплощадки в г. Усть-Каменогорск")):
    coords, svg_pos, source = geocode_address_online(q)
    return {
        "status": "success",
        "query": q,
        "coords": coords,
        "lat": coords[0],
        "lng": coords[1],
        "svgPos": svg_pos,
        "source": source,
    }


@router.delete("/complexes/{complex_id}", summary="Удаление ЖК и связанных записей (сигналы, публикации, аудит)")
def delete_complex(complex_id: str, db: Session = Depends(get_db)):
    c = db.get(Complex, complex_id)
    if not c:
        c = db.scalar(select(Complex).where(func.lower(Complex.id) == complex_id.lower()))
    if not c:
        _audit(db, "Аналитик МИО (веб-интерфейс)", "complex_delete", "complex", complex_id, {"name": complex_id, "note": "idempotent"})
        db.commit()
        return {"status": "success", "already_deleted": True, "deleted_id": complex_id}

    name = c.name
    target_id = c.id
    db.query(Publication).filter(Publication.complex_id == target_id).delete()
    db.query(Signal).filter(Signal.complex_id == target_id).delete()
    db.query(AuditLog).filter(AuditLog.entity_id == target_id).delete()
    db.delete(c)
    _audit(db, "Аналитик МИО (веб-интерфейс)", "complex_delete", "complex", target_id, {"name": name})
    db.commit()
    return {"status": "success", "deleted_id": target_id, "name": name}


@router.post("/complexes/purge-tests", summary="Очистка тестовых демонстрационных ЖК (jk-10, jk-11)")
def purge_test_complexes_endpoint(db: Session = Depends(get_db)):
    test_ids = ["jk-10", "jk-11"]
    items = db.scalars(select(Complex).where(
        (Complex.id.in_(test_ids)) | 
        (Complex.name.ilike("%TEST%")) | 
        (Complex.name.ilike("%KOMPUTERNY OSLIK%"))
    )).all()
    purged = []
    for c in items:
        purged.append({"id": c.id, "name": c.name})
        db.query(Publication).filter(Publication.complex_id == c.id).delete()
        db.query(Signal).filter(Signal.complex_id == c.id).delete()
        db.query(AuditLog).filter(AuditLog.entity_id == c.id).delete()
        db.delete(c)
    db.commit()
    return {"status": "success", "purged": purged}


@router.post("/complexes", summary="Добавление нового проверяемого ЖК в реестр")
def create_complex(req: ComplexCreateRequest, db: Session = Depends(get_db)):
    legal_type, commissioned = legal_basis_to_db(req.legalBasisType)
    has_custom_coords = (
        req.coords
        and len(req.coords) >= 2
        and not (abs(req.coords[0] - 49.95) < 0.001 and abs(req.coords[1] - 82.61) < 0.001)
        and not (abs(req.coords[0] - 49.949) < 0.001 and abs(req.coords[1] - 82.62) < 0.001)
    )
    if has_custom_coords:
        coords = req.coords
        svg_pos = svg_pos_from_coords(coords, req.district)
    else:
        coords, svg_pos, _ = geocode_address_online(req.district)

    new_item = Complex(
        id=_next_id(db, Complex, "jk-"),
        name=req.name,
        address=req.district,
        lat=coords[0],
        lng=coords[1],
        svg_pos=svg_pos,
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


LEGAL_BASIS_TEXT = {
    "absent": "Отсутствует правовое основание привлечения средств (Ashyq Data)",
    "unknown": "Не проверено · Нужна проверка",
    "operator_guarantee": "Гарантия Единого оператора жилищного строительства (АО «КЖК»)",
    "mio_permit": "Разрешение МИО на привлечение денег дольщиков (Ashyq Data)",
}


@router.post("/registries/import", summary="Импорт выгрузки разрешений МИО Ashyq Data (CSV или JSON): обновление R1 и новые ЖК")
async def import_registry(
    request: Request,
    file: Optional[UploadFile] = File(None, description="Файл выгрузки .csv или .json (multipart/form-data)"),
    fmt: Optional[ImportFormat] = Query(None, alias="format", description="csv или json; по умолчанию — по имени файла или содержимому"),
    db: Session = Depends(get_db),
):
    """Принимает файл выгрузки либо через поле file (multipart), либо прямо сырым телом запроса (text/csv, application/json).

    Каждую строчку матчим с ЖК по БИН, а если не вышло — по названию. Для найденных обновляем legal_basis_type,
    а для новых создаём карточку со статусом unknown («Нужна проверка», R1 = 0 баллов).
    """
    if file is not None:
        content, filename = await file.read(), file.filename or ""
        content_type = file.content_type or ""
    else:
        content, filename = await request.body(), ""
        content_type = request.headers.get("content-type") or ""
    if fmt is None:
        if filename.lower().endswith(".csv") or "csv" in content_type:
            fmt = "csv"
        elif filename.lower().endswith(".json") or "json" in content_type:
            fmt = "json"
    try:
        records = parse_export(content, fmt)
    except ImportFormatError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return _import_records(db, records, filename or "тело запроса")


def _import_records(db: Session, records: List[Dict[str, Any]], source_name: str) -> Dict[str, Any]:
    at = now()
    complexes = _all_complexes(db)
    created_ids: set = set()
    counts = {"updated": 0, "created": 0, "unchanged": 0, "skipped": 0}
    rows: List[Dict[str, Any]] = []

    def report(n: int, action: str, c: Optional[Complex] = None, matched_by: Optional[str] = None,
               reason: Optional[str] = None, **extra):
        counts[action] += 1
        rows.append({
            "row": n,
            "action": action,
            "complexId": c.id if c else None,
            "name": c.name if c else None,
            "matchedBy": matched_by,
            "legalBasisType": legal_basis_to_api(c) if c else None,
            "reason": reason,
            **extra,
        })

    for n, raw in enumerate(records, start=1):
        row = normalize_row(raw)
        if not row.get("bin") and not row.get("name"):
            report(n, "skipped", reason="Нет БИН и названия ЖК")
            continue
        target, matched_by, conflict = match_complex(row, complexes)
        if conflict:
            report(n, "skipped", reason=conflict)
            continue
        source = describe_row(row)

        if target is None:
            if not row.get("name"):
                report(n, "skipped", reason="ЖК не найден по БИН, а для новой карточки нужно название")
                continue
            target = _create_imported_complex(db, row, source, at)
            complexes.append(target)
            created_ids.add(target.id)
            report(n, "created", target, reason="ЖК не найден: создана карточка, правовое основание — «Нужна проверка»")
            continue

        if target.id in created_ids:
            report(n, "skipped", target, matched_by, reason="Повтор ЖК, созданного этим импортом")
            continue
        legal, commissioned = legal_basis_from_row(row)
        if legal is None:
            report(n, "skipped", target, matched_by, reason="Не удалось определить правовое основание (тип документа, статус)")
            continue
        if legal == "unknown" and target.legal_basis_type == "absent":
            # Важный момент: если отсутствие основания уже было подтверждено аналитиком, импорт с unknown его не затирает
            legal, commissioned = "absent", False

        previous = legal_basis_to_api(target)
        changed = (target.legal_basis_type, bool(target.is_commissioned)) != (legal, commissioned)
        if changed:
            target.legal_basis_type = legal
            target.is_commissioned = commissioned
            target.verification_status = verification_status_for(legal)
            target.verification_source = source
            if commissioned:
                target.legal_basis_text = "Объект введён в эксплуатацию (Ashyq Data)"
            elif is_revoked(row):
                target.legal_basis_text = "Разрешение отозвано по данным Ashyq Data — нужна проверка, R1 подтверждает аналитик"
            else:
                target.legal_basis_text = LEGAL_BASIS_TEXT[legal]
            refresh_signal(target.current_signal, target)
        checks = dict(target.gov_checks or {})
        checks["ashyq_data"] = checked_entry(legal_basis_check_status("ashyq_data", legal), at, source)
        target.gov_checks = checks
        report(n, "updated" if changed else "unchanged", target, matched_by, previousLegalBasisType=previous)

    _audit(db, "Аналитик МИО (веб-интерфейс)", "registry_import", "registry", "ashyq_data", {
        "source": source_name,
        "total": len(records),
        **counts,
        "changes": [
            {k: r[k] for k in ("row", "action", "complexId", "previousLegalBasisType", "legalBasisType") if k in r}
            for r in rows if r["action"] in ("updated", "created")
        ],
    })
    db.commit()
    return {"status": "success", "source": source_name, "total": len(records), **counts, "rows": rows}


def _create_imported_complex(db: Session, row: Dict[str, str], source: str, at) -> Complex:
    address = row.get("address") or "г. Усть-Каменогорск"
    def parse_coord(key: str) -> Optional[float]:
        val = (row.get(key) or "").replace(",", ".").strip()
        try:
            return float(val) if val else None
        except ValueError:
            return None

    row_lat, row_lng = parse_coord("lat"), parse_coord("lng")
    if row_lat is not None and row_lng is not None:
        coords = [row_lat, row_lng]
    else:
        coords = geocode_address(address)
    svg_pos = svg_pos_from_coords(coords, address)

    c = Complex(
        id=_next_id(db, Complex, "jk-"),
        name=row["name"],
        address=address,
        lat=coords[0],
        lng=coords[1],
        svg_pos=svg_pos,
        developer_name=row.get("developer") or "Не указан",
        developer_bin=normalize_bin(row.get("bin")) or row.get("bin") or "",
        legal_basis_type="unknown",
        legal_basis_text=LEGAL_BASIS_TEXT["unknown"],
        verification_status=verification_status_for("unknown"),
        verification_source=f"{source}. Карточка создана импортом, правовое основание требует проверки аналитиком.",
        gov_checks={"ashyq_data": checked_entry(legal_basis_check_status("ashyq_data", "unknown"), at, source)},
        factor_overrides={},
        is_demo=False,
        created_at=at,
        updated_at=at,
    )
    db.add(c)
    db.add(Signal(complex=c, status="draft", reviewed_by="Ахметов Д.К.", reviewed_at=at, **signal_snapshot(c)))
    db.flush()
    return c


@router.post("/complexes/{complex_id}/signal-decision", summary="Утверждение или возврат Сигнальной карточки")
def signal_decision(complex_id: str, req: SignalDecisionRequest, db: Session = Depends(get_db)):
    target = _get_complex_or_404(db, complex_id)
    status = SIGNAL_STATUS_TO_DB[req.decision]

    previous = target.current_signal
    author = req.author or "Ахметов Д.К."
    # Каждое решение аналитика пишет новую строчку в Signal — так у нас сохраняется вся история решений
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


@app.get("/", include_in_schema=False)
@app.get("/api", include_in_schema=False)
@app.get("/api/v1", include_in_schema=False)
def redirect_to_docs():
    return RedirectResponse(url="/docs")


app.include_router(router, prefix="/api/v1")
# Дублируем роуты без /v1 (/api/complexes, /api/publications/{id}/verify и т.д.), но в Swagger их прячем, чтобы не мусорить
app.include_router(router, prefix="/api", include_in_schema=False)
