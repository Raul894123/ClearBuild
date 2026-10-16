"""Вывод факторов риска R1–R6 из данных БД (Раздел 3 ТЗ бэкенда).

Порядок для каждого фактора:
1. Факт из данных ЖК и его публикаций.
2. Решение аналитика (confirm-factor, Complex.factor_overrides) поверх факта.
   Подтверждение не может обойти жёсткие условия ТЗ: R1 — только при absent,
   R3 — только до ввода в эксплуатацию, R5 — только при разнице ≥20 п.п. с датами и источниками.

Статусы фактора: CONFIRMED (баллы начислены), AI_HYPOTHESIS (гипотеза ИИ, 0 баллов),
UNVERIFIED («Нужна проверка», 0 баллов), REJECTED (отклонено аналитиком), NONE (не выявлено).
"""

from typing import Any, Dict, List, Optional, Tuple

from app.models import Complex, Publication
from app.scoring import FACTOR_NAMES, WEIGHTS, calculate_risk

FACTOR_CODES = ["R1", "R2", "R3", "R4", "R5", "R6"]
READINESS_GAP_THRESHOLD = 20
OVERRIDE_STATUSES = {"CONFIRMED", "REJECTED", "NONE", "UNVERIFIED", "AI_HYPOTHESIS"}

NEEDS_CHECK_LABEL = "Нужна проверка"


def _result(code: str, status: str, reason: str, evidence: Optional[List[Dict[str, Any]]] = None,
            source: str = "data", label: Optional[str] = None) -> Dict[str, Any]:
    active = status == "CONFIRMED"
    return {
        "code": code,
        "name": FACTOR_NAMES[code],
        "weight": WEIGHTS[code],
        "points": WEIGHTS[code] if active else 0,
        "active": active,
        "status": status,
        "label": label,
        "reason": reason,
        "evidence": evidence or [],
        "source": source,
    }


def _pub_ref(p: Publication) -> Dict[str, Any]:
    return {"type": "publication", "ref": p.id, "url": p.url or None, "platform": p.source_platform}


def _note_ref(text: Optional[str]) -> List[Dict[str, Any]]:
    return [{"type": "document", "ref": text, "url": None}] if text else []


def _ids(pubs: List[Publication]) -> str:
    return ", ".join(p.id for p in pubs)


# --------------------------------------------------------------------------
# Факты из данных
# --------------------------------------------------------------------------
def _r1(c: Complex) -> Dict[str, Any]:
    evidence = _note_ref(c.verification_source)
    if c.legal_basis_type == "absent":
        return _result("R1", "CONFIRMED", "Установлено отсутствие правового основания (legal_basis_type = absent).", evidence)
    if c.legal_basis_type == "operator_guarantee":
        return _result("R1", "NONE", "Действует гарантия Единого оператора (АО «КЖК»): отдельное разрешение МИО не требуется, R1 не начисляется.", evidence)
    if c.legal_basis_type == "mio_permit":
        reason = "Объект введён в эксплуатацию." if c.is_commissioned else "Есть разрешение МИО на привлечение средств дольщиков."
        return _result("R1", "NONE", reason, evidence)
    return _result("R1", "UNVERIFIED", "Правовое основание не установлено (unknown): «нет данных» не считается R1, 0 баллов.",
                   evidence, label=NEEDS_CHECK_LABEL)


def _publication_factor(c: Complex, code: str, flag: str, what: str) -> Dict[str, Any]:
    pubs = [p for p in c.publications if getattr(p, flag)]
    confirmed = [p for p in pubs if p.status == "confirmed"]
    pending = [p for p in pubs if p.status == "pending_review"]
    if confirmed:
        return _result(code, "CONFIRMED", f"{what}: подтверждённые публикации {_ids(confirmed)}.",
                       [_pub_ref(p) for p in confirmed])
    if pending:
        return _result(code, "AI_HYPOTHESIS", f"Гипотеза ИИ ({_ids(pending)}) ждёт решения аналитика: 0 баллов.",
                       [_pub_ref(p) for p in pending])
    return _result(code, "NONE", "Подтверждённых публикаций нет.")


def _r2(c: Complex) -> Dict[str, Any]:
    return _publication_factor(c, "R2", "has_direct_payment_offer", "Прямое предложение внести деньги до ДДУ")


def _r3(c: Complex) -> Dict[str, Any]:
    if c.is_commissioned:
        return _result("R3", "NONE", "Объект введён в эксплуатацию: реклама готового жилья не является R3.")
    return _publication_factor(c, "R3", "is_active_pre_commissioning_ad", "Активная реклама строящегося жилья")


def readiness_gap(c: Complex) -> Tuple[Optional[int], Optional[str]]:
    """Разница stated − verified (направленно) или (None, причина), если не хватает данных."""
    if c.stated_readiness is None or c.verified_readiness is None:
        return None, "Нет заявленной или подтверждённой готовности."
    if not (c.stated_readiness_date and c.readiness_date):
        return None, "Нет дат заявленной и подтверждённой готовности."
    if not (c.stated_readiness_source and c.verified_readiness_source):
        return None, "Нет источников заявленной и подтверждённой готовности."
    return c.stated_readiness - c.verified_readiness, None


def _readiness_evidence(c: Complex) -> List[Dict[str, Any]]:
    evidence = [
        {"type": "readiness_stated", "ref": f"{c.stated_readiness}% · {c.stated_readiness_source}",
         "date": c.stated_readiness_date.isoformat() if c.stated_readiness_date else None, "url": None},
        {"type": "readiness_verified", "ref": f"{c.verified_readiness}% · {c.verified_readiness_source}",
         "date": c.readiness_date.isoformat() if c.readiness_date else None, "url": None},
    ]
    linked = _linked_publication(c)
    if linked:
        evidence.append(_pub_ref(linked))
    return evidence


def _linked_publication(c: Complex) -> Optional[Publication]:
    if not c.stated_readiness_publication_id:
        return None
    return next((p for p in c.publications if p.id == c.stated_readiness_publication_id), None)


def _r5(c: Complex) -> Dict[str, Any]:
    gap, missing = readiness_gap(c)
    if gap is None:
        return _result("R5", "NONE", missing)
    if gap < READINESS_GAP_THRESHOLD:
        return _result("R5", "NONE", f"Заявлено {c.stated_readiness}%, подтверждено {c.verified_readiness}%: разница {gap} п.п. < {READINESS_GAP_THRESHOLD}.",
                       _readiness_evidence(c))
    linked = _linked_publication(c)
    base = f"Заявлено {c.stated_readiness}%, подтверждено {c.verified_readiness}%: разница {gap} п.п. ≥ {READINESS_GAP_THRESHOLD}"
    if linked and linked.status == "pending_review":
        return _result("R5", "AI_HYPOTHESIS", f"{base}, но заявление взято из неподтверждённой публикации {linked.id}: гипотеза ИИ, 0 баллов.",
                       _readiness_evidence(c))
    if linked and linked.status == "rejected":
        return _result("R5", "REJECTED", f"{base}, но публикация {linked.id} с заявлением отклонена аналитиком.", _readiness_evidence(c))
    return _result("R5", "CONFIRMED", f"{base}.", _readiness_evidence(c))


def _r4(c: Complex) -> Dict[str, Any]:
    if c.has_collective_complaint:
        return _result("R4", "CONFIRMED", "Подтверждено коллективное обращение дольщиков.", _note_ref(c.collective_complaint_source))
    return _result("R4", "NONE", "Подтверждённых коллективных обращений нет.")


def _r6(c: Complex) -> Dict[str, Any]:
    if c.has_significant_delay:
        return _result("R6", "CONFIRMED", "Подтверждён простой или значимая просрочка сроков.", _note_ref(c.delay_source))
    return _result("R6", "NONE", "Простой или просрочка не подтверждены.")


_DERIVERS = {"R1": _r1, "R2": _r2, "R3": _r3, "R4": _r4, "R5": _r5, "R6": _r6}


# --------------------------------------------------------------------------
# Решение аналитика поверх данных
# --------------------------------------------------------------------------
def hard_precondition_error(c: Complex, code: str) -> Optional[str]:
    """Почему фактор нельзя подтвердить по данным ЖК, или None, если можно."""
    if code == "R1" and c.legal_basis_type != "absent":
        return "R1 начисляется только при установленном отсутствии правового основания (absent)."
    if code == "R3" and c.is_commissioned:
        return "R3 не начисляется: объект введён в эксплуатацию."
    if code == "R5":
        gap, missing = readiness_gap(c)
        if gap is None:
            return f"R5 нельзя подтвердить: {missing}"
        if gap < READINESS_GAP_THRESHOLD:
            return f"R5 нельзя подтвердить: разница {gap} п.п. < {READINESS_GAP_THRESHOLD}."
    return None


def _apply_override(c: Complex, fact: Dict[str, Any], override: Dict[str, Any]) -> Dict[str, Any]:
    code = fact["code"]
    status = override.get("status")
    who = override.get("analyst") or "аналитик МИО"
    note = override.get("evidence")
    suffix = f" Обоснование: {note}" if note else ""
    evidence = fact["evidence"] + _note_ref(note)

    if status == "CONFIRMED":
        blocked = hard_precondition_error(c, code)
        if blocked:
            return {**fact, "reason": f"Подтверждение ({who}) не применено: {blocked} {fact['reason']}"}
        return _result(code, "CONFIRMED", f"Подтверждено аналитиком ({who}).{suffix}", evidence, source="analyst")
    label = NEEDS_CHECK_LABEL if status == "UNVERIFIED" else None
    titles = {"REJECTED": "Отклонено", "NONE": "Не выявлено", "UNVERIFIED": "Нужна проверка", "AI_HYPOTHESIS": "Возвращено в гипотезы ИИ"}
    return _result(code, status, f"{titles.get(status, status)} аналитиком ({who}): 0 баллов.{suffix}", evidence,
                   source="analyst", label=label)


def evaluate_factors(c: Complex) -> List[Dict[str, Any]]:
    overrides = c.factor_overrides or {}
    results = []
    for code in FACTOR_CODES:
        fact = _DERIVERS[code](c)
        override = overrides.get(code)
        results.append(_apply_override(c, fact, override) if override else fact)
    return results


def risk_profile(c: Complex) -> Dict[str, Any]:
    """riskProfile для API: балл, зона и построчная расшифровка R1–R6."""
    factors = evaluate_factors(c)
    profile = calculate_risk(
        [f["code"] for f in factors if f["active"]],
        [f["code"] for f in factors if f["status"] == "AI_HYPOTHESIS"],
    )
    profile["needs_check"] = [f["code"] for f in factors if f["label"] == NEEDS_CHECK_LABEL]
    profile["factors"] = factors
    return profile


def factors_summary(factors: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    """Прежний формат поля complex.factors: {"R1": {"status": ..., "evidence": ...}}."""
    return {f["code"]: {"status": f["status"], "evidence": f["reason"]} for f in factors}
