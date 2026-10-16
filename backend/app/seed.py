"""Создание таблиц и заполнение БД из backend/seed.json при первом старте."""

import json
from typing import Any, Dict

from sqlalchemy import func, select
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
from app.models import Complex, Publication, Signal, now

SEED_FILE = BACKEND_DIR / "seed.json"


def init_db() -> None:
    """Создаёт таблицы и заливает сид, если таблица ЖК пуста."""
    Base.metadata.create_all(engine)
    with Session(engine) as db:
        if db.scalar(select(func.count()).select_from(Complex)) == 0:
            seed_database(db)


def _factor_confirmed(factors: Dict[str, Any], code: str) -> bool:
    return (factors.get(code) or {}).get("status") == "CONFIRMED"


def seed_database(db: Session) -> None:
    if not SEED_FILE.exists():
        return
    with open(SEED_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    seeded_at = now()

    for item in data.get("complexes", []):
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
            legal_basis_type=legal_type,
            legal_basis_text=item.get("legalBasisText"),
            verification_status=verification_status_for(legal_type),
            verification_source=item.get("legalSource"),
            is_commissioned=commissioned,
            has_collective_complaint=_factor_confirmed(factors, "R4"),
            has_significant_delay=_factor_confirmed(factors, "R6"),
            contact_phone=item.get("contactPhone"),
            sales_account=item.get("salesAccount"),
            factors=factors,
            is_demo=True,
            created_at=seeded_at,
            updated_at=seeded_at,
        )
        db.add(c)

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

    db.flush()
    commissioned_ids = {c.id for c in db.scalars(select(Complex).where(Complex.is_commissioned))}

    for item in data.get("publications", []):
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
            has_direct_payment_offer=factor == "R2",
            is_active_pre_commissioning_ad=item.get("complexId") not in commissioned_ids,
            is_demo=True,
            created_at=seeded_at,
        ))

    db.commit()
