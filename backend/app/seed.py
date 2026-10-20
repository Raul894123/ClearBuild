"""Короче, тут у нас создание табличек и заливка стартовых данных из backend/seed.json при первом запуске."""

import json
import re
from typing import Any, Dict, Optional

from sqlalchemy import func, inspect, select
from sqlalchemy.orm import Session

from app.db import BACKEND_DIR, Base, engine
from app.mappers import (
    SIGNAL_STATUS_TO_DB,
    legal_basis_to_db,
    parse_date,
    parse_datetime,
    publication_status_to_db,
    signal_snapshot,
    verification_status_for,
)
from app.models import AuditLog, Complex, Publication, Signal, now
from app.registries import seed_gov_checks

SEED_FILE = BACKEND_DIR / "seed.json"


def _purge_test_complexes(db: Session) -> None:
    """Удаляет только тестовые мусорные ЖК (jk-17, TEST, KOMPUTERNY, БЛА БЛА), добавленные в ходе ранних тестов."""
    test_ids = ["jk-17"]
    items = db.scalars(select(Complex).where(
        (Complex.id.in_(test_ids)) | 
        (Complex.name.ilike("%TEST%")) | 
        (Complex.name.ilike("%KOMPUTERNY%")) |
        (Complex.name.ilike("%БЛА%"))
    )).all()
    if items:
        for c in items:
            db.query(Publication).filter(Publication.complex_id == c.id).delete()
            db.query(Signal).filter(Signal.complex_id == c.id).delete()
            db.query(AuditLog).filter(AuditLog.entity_id == c.id).delete()
            db.delete(c)
        db.commit()


def _check_schema() -> None:
    """Короче, create_all сам по себе новые колонки в старые таблицы не пихает — если схема поменялась, проще грохнуть старый файл БД."""
    insp = inspect(engine)
    for table in Base.metadata.sorted_tables:
        if not insp.has_table(table.name):
            continue
        existing = {col["name"] for col in insp.get_columns(table.name)}
        missing = sorted(col.name for col in table.columns if col.name not in existing)
        if missing:
            raise RuntimeError(
                f"Схема БД устарела: в таблице {table.name} нет колонок {missing}. "
                f"Удалите файл БД ({engine.url.database}) — при старте он пересоздастся из seed.json."
            )


def _sync_seed_locations(db: Session) -> None:
    """На всякий пожарный: если база уже была создана раньше, подтягиваем актуальные адреса и координаты демо-ЖК из seed.json."""
    if not SEED_FILE.exists():
        return
    with open(SEED_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    changed = False
    for item in data.get("complexes", []):
        c = db.get(Complex, item["id"])
        if not c or not c.is_demo:
            continue
        coords = item.get("coords") or [c.lat, c.lng]
        new_addr = item.get("district") or c.address
        if c.address != new_addr or c.lat != coords[0] or c.lng != coords[1]:
            c.address = new_addr
            c.lat = coords[0]
            c.lng = coords[1]
            c.svg_pos = item.get("svgPos") or c.svg_pos
            changed = True
    if changed:
        db.commit()


def init_db() -> None:
    """По сути, создаёт таблицы и заливает сид, если база ещё пустая (или докидывает новые демо-ЖК и обновляет координаты старых)."""
    _check_schema()
    Base.metadata.create_all(engine)
    with Session(engine) as db:
        _purge_test_complexes(db)
        if db.scalar(select(func.count()).select_from(Complex)) == 0:
            seed_database(db)
        else:
            _sync_seed_locations(db)
            seed_database(db, only_missing=True)


def _factor_confirmed(factors: Dict[str, Any], code: str) -> bool:
    return (factors.get(code) or {}).get("status") == "CONFIRMED"


def _confirmed_evidence(factors: Dict[str, Any], code: str) -> Optional[str]:
    return (factors.get(code) or {}).get("evidence") if _factor_confirmed(factors, code) else None


def _readiness_publication_id(item: Dict[str, Any], publications: list) -> Optional[str]:
    """Ищем публикацию, откуда взяли заявленную готовность — типа 'AD-110' в строке источника или объявление с гипотезой R5."""
    own = [p for p in publications if p.get("complexId") == item["id"]]
    m = re.search(r"AD-\d+", (item.get("declaredReadiness") or {}).get("source") or "")
    if m and any(p["id"] == m.group(0) for p in own):
        return m.group(0)
    return next((p["id"] for p in own if p.get("proposedFactor") == "R5"), None)


def seed_database(db: Session, only_missing: bool = False) -> None:
    """only_missing=True — для уже живой базы: заливаем только те ЖК из сида, которых в ней ещё нет, вместе с их объявлениями."""
    if not SEED_FILE.exists():
        return
    with open(SEED_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    seeded_at = now()
    all_publications = data.get("publications", [])
    items = data.get("complexes", [])
    publications = all_publications
    if only_missing:
        existing_complexes = set(db.scalars(select(Complex.id)))
        existing_pubs = set(db.scalars(select(Publication.id)))
        items = [i for i in items if i["id"] not in existing_complexes]
        new_ids = {i["id"] for i in items}
        publications = [p for p in all_publications if p.get("complexId") in new_ids and p["id"] not in existing_pubs]
        if not items:
            return

    # Короче, статусы факторов напрямую из seed.json мы не копируем в тупую — они у нас честно считаются на лету в app/factors.py.
    # Отсюда забираем чисто флажки R4/R6 и тексты доказательств к ним.
    for item in items:
        legal_type, commissioned = legal_basis_to_db(item.get("legalBasisType"))
        factors = item.get("factors", {})
        declared = item.get("declaredReadiness") or {}
        confirmed = item.get("confirmedReadiness") or {}
        coords = item.get("coords") or [0.0, 0.0]
        c = Complex(
            id=item["id"],
            case_tag=item.get("caseTag"),
            name=item["name"],
            address=item.get("district"),
            lat=coords[0],
            lng=coords[1],
            svg_pos=item.get("svgPos"),
            developer_name=item.get("developer", ""),
            developer_bin=item.get("bin", ""),
            stage=item.get("stage"),
            stated_readiness=declared.get("pct"),
            stated_readiness_source=declared.get("source"),
            stated_readiness_date=parse_date(declared.get("date")),
            verified_readiness=confirmed.get("pct"),
            verified_readiness_source=confirmed.get("source"),
            readiness_date=parse_date(confirmed.get("date")),
            stated_readiness_publication_id=_readiness_publication_id(item, all_publications),
            legal_basis_type=legal_type,
            legal_basis_text=item.get("legalBasisText"),
            verification_status=verification_status_for(legal_type),
            verification_source=item.get("legalSource"),
            is_commissioned=commissioned,
            has_collective_complaint=_factor_confirmed(factors, "R4"),
            collective_complaint_source=_confirmed_evidence(factors, "R4"),
            has_significant_delay=_factor_confirmed(factors, "R6"),
            delay_source=_confirmed_evidence(factors, "R6"),
            contact_phone=item.get("contactPhone"),
            sales_account=item.get("salesAccount"),
            gov_checks=seed_gov_checks(item.get("govChecks")),
            is_demo=True,
            created_at=seeded_at,
            updated_at=seeded_at,
        )
        db.add(c)

    db.flush()
    commissioned_ids = {c.id for c in db.scalars(select(Complex).where(Complex.is_commissioned))}

    for item in publications:
        factor = item.get("proposedFactor")
        captured_at, note = parse_datetime(item.get("capturedAt"))
        db.add(Publication(
            id=item["id"],
            complex_id=item.get("complexId"),
            source_platform=item.get("platform", ""),
            account_name=item.get("account"),
            phone=item.get("phone"),
            url=item.get("url"),
            published_at=parse_date(item.get("pubDate")),
            captured_at=captured_at or seeded_at,
            capture_note=note,
            text_content=item.get("text", ""),
            ai_hypothesis={
                "proposedFactor": factor,
                "quote": item.get("triggerSpan"),
                "confidence": item.get("confidence"),
            },
            status=publication_status_to_db(item.get("status")),
            # Короче, флаги R2/R3 в seed.json прописаны явно по тексту объявления, а если их нет — смотрим на гипотезу ИИ
            has_direct_payment_offer=item.get("hasDirectPaymentOffer", factor == "R2"),
            is_active_pre_commissioning_ad=(
                item.get("isActivePreCommissioningAd", True) and item.get("complexId") not in commissioned_ids
            ),
            is_demo=True,
            created_at=seeded_at,
        ))

    db.flush()
    for item in items:
        c = db.get(Complex, item["id"])
        db.refresh(c, ["publications"])
        reviewed_at, _ = parse_datetime(item.get("signalUpdatedAt"))
        db.add(Signal(
            complex=c,
            status=SIGNAL_STATUS_TO_DB.get((item.get("signalStatus") or "").upper(), "draft"),
            comment=item.get("signalComment"),
            reviewed_by=item.get("signalAuthor"),
            reviewed_at=reviewed_at,
            created_at=seeded_at,
            **signal_snapshot(c),
        ))

    db.commit()
