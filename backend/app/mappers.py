"""Перевод между значениями БД (ТЗ, snake_case) и форматом API, который ждёт фронтенд (camelCase)."""

import re
from datetime import date, datetime
from typing import Any, Dict, Optional, Tuple

from app.factors import evaluate_factors, factors_summary, risk_profile
from app.models import TZ, AuditLog, Complex, Publication, Signal, to_tz
from app.scoring import WEIGHTS, calculate_risk

# --------------------------------------------------------------------------
# Перечисления: API -> БД
# --------------------------------------------------------------------------
LEGAL_BASIS_TO_DB: Dict[str, str] = {
    "ABSENT": "absent",
    "UNVERIFIED": "unknown",
    "IN_PROCESS": "unknown",
    "KZH_GUARANTEE": "operator_guarantee",
    "GUARANTEE": "operator_guarantee",
    "MIO_PERMIT": "mio_permit",
    "PERMIT": "mio_permit",
    # Введённый в эксплуатацию объект: is_commissioned = True
    "COMMISSIONED": "mio_permit",
}
LEGAL_BASIS_TO_API: Dict[str, str] = {
    "absent": "ABSENT",
    "unknown": "UNVERIFIED",
    "operator_guarantee": "KZH_GUARANTEE",
    "mio_permit": "MIO_PERMIT",
}

PUBLICATION_STATUS_TO_DB: Dict[str, str] = {
    "AI_HYPOTHESIS": "pending_review",
    "PENDING_REVIEW": "pending_review",
    "CONFIRMED": "confirmed",
    "REJECTED": "rejected",
}
PUBLICATION_STATUS_TO_API: Dict[str, str] = {
    "pending_review": "AI_HYPOTHESIS",
    "confirmed": "CONFIRMED",
    "rejected": "REJECTED",
}

SIGNAL_STATUS_TO_DB: Dict[str, str] = {
    "PENDING_HUMAN": "draft",
    "DRAFT": "draft",
    "CONFIRMED": "confirmed",
    "RETURNED": "returned",
    "REJECTED": "returned",
}
SIGNAL_STATUS_TO_API: Dict[str, str] = {
    "draft": "PENDING_HUMAN",
    "confirmed": "CONFIRMED",
    "returned": "RETURNED",
}


def legal_basis_to_db(value: Optional[str]) -> Tuple[str, bool]:
    """Возвращает (legal_basis_type, is_commissioned)."""
    key = (value or "UNVERIFIED").upper()
    return LEGAL_BASIS_TO_DB.get(key, "unknown"), key == "COMMISSIONED"


def legal_basis_to_api(c: Complex) -> str:
    if c.is_commissioned:
        return "COMMISSIONED"
    return LEGAL_BASIS_TO_API.get(c.legal_basis_type, "UNVERIFIED")


def verification_status_for(legal_basis_type: str) -> str:
    if legal_basis_type == "absent":
        return "violation_confirmed"
    if legal_basis_type == "unknown":
        return "needs_check"
    return "verified"


def publication_status_to_db(value: Optional[str]) -> str:
    return PUBLICATION_STATUS_TO_DB.get((value or "").upper(), "pending_review")


# --------------------------------------------------------------------------
# Даты и время.
# Время в API — ISO 8601 с поясом +05:00 («2026-10-14T09:15:00+05:00»).
# Даты без времени — «ДД.ММ.ГГГГ», как в seed.json и на фронтенде.
# На входе принимается ISO и старый формат «ДД.ММ.ГГГГ, ЧЧ:ММ (пометка)» (считается +05:00).
# --------------------------------------------------------------------------
_DT_RE = re.compile(
    r"^\s*(\d{1,2})\.(\d{1,2})\.(\d{4})(?:,?\s*(\d{1,2}):(\d{2})(?::\d{2})?)?\s*(?:\((.*)\))?\s*$"
)


def parse_date(value: Optional[str]) -> Optional[date]:
    dt, _ = parse_datetime(value)
    return dt.date() if dt else None


def parse_datetime(value: Optional[str]) -> Tuple[Optional[datetime], Optional[str]]:
    """Разбирает «14.10.2026, 09:15 (Snapshot #101)» или ISO-строку. Возвращает (datetime, пометка)."""
    if not value:
        return None, None
    m = _DT_RE.match(value)
    if m:
        day, month, year, hour, minute, note = m.groups()
        try:
            dt = datetime(int(year), int(month), int(day), int(hour or 0), int(minute or 0), tzinfo=TZ)
        except ValueError:
            return None, None
        return dt, (note or None)
    try:
        return to_tz(datetime.fromisoformat(value.strip())).replace(microsecond=0), None
    except ValueError:
        return None, None


def fmt_date(value: Optional[date]) -> Optional[str]:
    return value.strftime("%d.%m.%Y") if value else None


def fmt_datetime(value: Optional[datetime]) -> Optional[str]:
    return to_tz(value).isoformat(timespec="seconds") if value else None


# --------------------------------------------------------------------------
# Сериализация в формат API
# --------------------------------------------------------------------------
def complex_to_api(c: Complex) -> Dict[str, Any]:
    signal = c.current_signal
    return {
        "id": c.id,
        "caseTag": c.case_tag,
        "name": c.name,
        "district": c.address,
        "coords": [c.lat, c.lng],
        "svgPos": c.svg_pos,
        "developer": c.developer_name,
        "bin": c.developer_bin,
        "stage": c.stage,
        "declaredReadiness": {
            "pct": c.stated_readiness,
            "source": c.stated_readiness_source,
            "date": fmt_date(c.stated_readiness_date),
        },
        "confirmedReadiness": {
            "pct": c.verified_readiness,
            "source": c.verified_readiness_source,
            "date": fmt_date(c.readiness_date),
        },
        "legalBasisType": legal_basis_to_api(c),
        "legalBasisText": c.legal_basis_text,
        "legalSource": c.verification_source,
        "verificationStatus": c.verification_status,
        "contactPhone": c.contact_phone,
        "salesAccount": c.sales_account,
        "signalStatus": SIGNAL_STATUS_TO_API.get(signal.status, "PENDING_HUMAN") if signal else "PENDING_HUMAN",
        "signalAuthor": signal.reviewed_by if signal else None,
        "signalUpdatedAt": fmt_datetime(signal.reviewed_at or signal.created_at) if signal else None,
        "signalComment": signal.comment if signal else None,
        "factors": factors_summary(evaluate_factors(c)),
        "isDemo": c.is_demo,
    }


def complex_to_api_with_risk(c: Complex) -> Dict[str, Any]:
    data = complex_to_api(c)
    data["riskProfile"] = risk_profile(c)
    return data


def publication_to_api(p: Publication) -> Dict[str, Any]:
    hypo = p.ai_hypothesis or {}
    factor = hypo.get("proposedFactor")
    return {
        "id": p.id,
        "complexId": p.complex_id,
        "platform": p.source_platform,
        "account": p.account_name,
        "phone": p.phone,
        "url": p.url,
        "pubDate": fmt_date(p.published_at),
        "capturedAt": fmt_datetime(p.captured_at),
        "captureNote": p.capture_note,
        "text": p.text_content,
        "triggerSpan": hypo.get("quote"),
        "proposedFactor": factor,
        "confidence": hypo.get("confidence"),
        "status": PUBLICATION_STATUS_TO_API.get(p.status, "AI_HYPOTHESIS"),
        "evidenceTag": f"{factor} (+{WEIGHTS[factor]} б.)" if factor in WEIGHTS else None,
        "screenshotUrl": p.screenshot_url,
        "isDemo": p.is_demo,
    }


def signal_to_api(sig: Optional[Signal]) -> Optional[Dict[str, Any]]:
    if sig is None:
        return None
    return {
        "id": sig.id,
        "complexId": sig.complex_id,
        "status": SIGNAL_STATUS_TO_API.get(sig.status, "PENDING_HUMAN"),
        "totalScore": sig.total_score,
        "riskZone": sig.risk_zone.upper(),
        "activeFactors": sig.active_factors or [],
        "comment": sig.comment,
        "reviewedBy": sig.reviewed_by,
        "reviewedAt": fmt_datetime(sig.reviewed_at),
        "createdAt": fmt_datetime(sig.created_at),
    }


def audit_to_api(a: AuditLog) -> Dict[str, Any]:
    return {
        "id": a.id,
        "createdAt": fmt_datetime(a.created_at),
        "actor": a.actor,
        "action": a.action,
        "entityType": a.entity_type,
        "entityId": a.entity_id,
        "details": a.details or {},
    }


def signal_snapshot(c: Complex) -> Dict[str, Any]:
    """Балл, зона и сработавшие факторы для строки Signal по данным ЖК."""
    factors = evaluate_factors(c)
    active = [f for f in factors if f["active"]]
    risk = calculate_risk([f["code"] for f in active])
    return {
        "total_score": risk["score"],
        "risk_zone": risk["zone"].lower(),
        "active_factors": [
            {"code": f["code"], "points": f["points"], "reason": f["reason"], "evidence": f["evidence"]}
            for f in active
        ],
    }


def refresh_signal(signal: Optional[Signal], c: Complex) -> None:
    if signal is None:
        return
    snap = signal_snapshot(c)
    signal.total_score = snap["total_score"]
    signal.risk_zone = snap["risk_zone"]
    signal.active_factors = snap["active_factors"]
