"""Объяснимый ИИ-анализатор рекламных объявлений (rule-based, Раздел 3 ТЗ2).

Ищет одновременно три гипотезы:
  R2 — прямое предложение внести деньги до ДДУ (бронь, депозит, взнос, касса, предварительный договор);
  R3 — активная реклама продажи квартир в строящемся ЖК;
  R5 — заявленная готовность выше подтверждённой на ≥20 п.п. (направленно, нужны дата и источник).

Уверенность считается по совпавшим триггерам, а не задаётся константой:
  каждый триггер имеет силу 1 (слабый), 2 (средний) или 3 (сильный); один шаблон считается один раз,
  перекрывающиеся совпадения внутри фактора не суммируются;
  безопасные формулировки (ДДУ, гарантия КЖК, Казреестр, уполномоченный банк) уменьшают силу R2 на 2 каждая;
  confidence = round(100 · (1 − e^(−сила / 3))), не больше 97; гипотеза предлагается при силе ≥ 2.

Результат — всегда гипотеза ИИ: в балл ЖК он не идёт, пока аналитик не подтвердит публикацию.
"""

import math
import re
from typing import Any, Dict, List, Optional, Sequence, Tuple

from app.factors import evaluate_factors, readiness_gap, risk_profile
from app.mappers import legal_basis_to_api
from app.models import Complex, now
from app.scoring import FACTOR_NAMES, WEIGHTS, calculate_risk

UNKNOWN_COMPLEX = "ЖК не определён"
MIN_STRENGTH = 2
MAX_CONFIDENCE = 97
READINESS_GAP_THRESHOLD = 20

_F = re.IGNORECASE | re.UNICODE

# (id, шаблон, сила)
R2_TRIGGERS = [
    ("paid_booking", r"платн\w*\s+(?:брон\w*|резерв\w*|депозит\w*)", 3),
    ("deposit", r"депозит\w*", 3),
    ("down_payment", r"первоначальн\w*\s+взнос\w*", 3),
    ("pre_contract", r"(?:договор\w*|соглашени\w*)\s+(?:о\s+)?(?:брониров\w*|резервиров\w*|инвестиров\w*)|предварительн\w*\s+(?:договор\w*|соглашени\w*)", 3),
    ("cashier", r"в\s+кассу\w*|наличн\w*\s+(?:расч[её]т\w*|оплат\w*)|оплат\w*\s+наличн\w*", 2),
    ("booking", r"брон\w*|забронир\w*", 2),
    ("reserve", r"резерв\w*", 2),
    ("money_sum", r"\d[\d\s]{2,}\s*(?:тг|тенге|₸)", 1),
    ("installment", r"рассрочк\w*", 1),
    ("pay_now", r"внес\w*|внест\w*|оплат\w*", 1),
]
R2_SAFE = [
    ("ddu", r"(?<!до\s)(?<!без\s)(?<!регистрации\s)\bДДУ\b|договор\w*\s+долевого\s+участия"),
    ("guarantee", r"гаранти\w*\s+(?:единого\s+оператора|АО\s*«?КЖК»?|КЖК)"),
    ("qazreestr", r"казреестр\w*"),
    ("bank", r"уполномоченн\w*\s+банк\w*|эскроу"),
]
R3_TRIGGERS = [
    ("under_construction", r"строящ\w*|на\s+стадии\s+(?:строительства|котлована)|котлован\w*|строительство\s+(?:ЖК|идёт)|идёт\s+строительств\w*", 3),
    ("sale_start", r"старт\s+продаж\w*|открыт\w*\s+продаж\w*|пресейл\w*|сдача\s+(?:во?\s+)?(?:[IV]+\s+квартал\w*\s+)?20\d\d", 3),
    ("sale", r"продаж\w*|прода[её]м|купить|выбирайте", 2),
    ("sale_offer", r"брон\w*|забронир\w*|резерв\w*|депозит\w*|первоначальн\w*\s+взнос\w*", 2),
    ("flats", r"квартир\w*|планировк\w*|\d-комнатн\w*", 1),
    ("construction", r"строительств\w*", 1),
    ("mortgage", r"ипотек\w*", 1),
]
# Признаки готового (сданного) дома: реклама после ввода не является R3
R3_COMMISSIONED = r"дом\s+сдан|сданн\w*\s+дом|введ[её]н\w*\s+в\s+эксплуатаци\w*|акт\w*\s+ввода|ключи\s+в\s+день"
READINESS_CLAIM = [
    r"готовност\w*(?:\s+(?:объекта|дома|здания|жк))?(?:\s+(?:уже|составляет|более|около))?\s*[—:-]?\s*(\d{1,3})\s*%",
    r"(\d{1,3})\s*%\s+готовност\w*",
]
PHONE_RE = re.compile(r"(?:\+7|8)[\s(-]*\d{3,4}[\s)-]*\d{2,3}[\s-]*\d{2}[\s-]*\d{2}")
HANDLE_RE = re.compile(r"@[A-Za-z0-9_.]{3,}")


def confidence_for(strength: int) -> int:
    if strength <= 0:
        return 0
    return min(MAX_CONFIDENCE, round(100 * (1 - math.exp(-strength / 3))))


# --------------------------------------------------------------------------
# Поиск триггеров
# --------------------------------------------------------------------------
def _sentence(text: str, start: int, end: int) -> str:
    left = max(text.rfind(ch, 0, start) for ch in ".!?\n")
    rights = [i for i in (text.find(ch, end) for ch in ".!?\n") if i != -1]
    right = min(rights) + 1 if rights else len(text)
    return text[left + 1:right].strip()


def _find_triggers(sources: Sequence[Tuple[str, str]], patterns, factor: str) -> List[Dict[str, Any]]:
    """Первое неперекрывающееся совпадение каждого шаблона; сильные шаблоны выбираются первыми."""
    found: List[Dict[str, Any]] = []
    taken: Dict[str, List[Tuple[int, int]]] = {}
    for pid, pattern, strength in sorted(patterns, key=lambda p: -p[2]):
        for source, text in sources:
            spans = taken.setdefault(source, [])
            match = next(
                (m for m in re.finditer(pattern, text, _F)
                 if not any(m.start() < e and s < m.end() for s, e in spans)),
                None,
            )
            if match:
                spans.append((match.start(), match.end()))
                found.append({
                    "factor": factor, "pattern": pid, "text": match.group(0).strip(), "strength": strength,
                    "source": source, "start": match.start(), "end": match.end(),
                    "_quote": _sentence(text, match.start(), match.end()),
                })
                break
    return found


def _find_safe(sources: Sequence[Tuple[str, str]]) -> List[Dict[str, Any]]:
    found = []
    for pid, pattern in R2_SAFE:
        for source, text in sources:
            m = re.search(pattern, text, _F)
            if m:
                found.append({"pattern": pid, "text": m.group(0).strip(), "source": source, "start": m.start(), "end": m.end()})
                break
    return found


def _readiness_claim(sources: Sequence[Tuple[str, str]]) -> Optional[Dict[str, Any]]:
    for source, text in sources:
        for pattern in READINESS_CLAIM:
            m = re.search(pattern, text, _F)
            if m and 0 <= int(m.group(1)) <= 100:
                return {"pct": int(m.group(1)), "text": m.group(0).strip(), "source": source,
                        "start": m.start(), "end": m.end(), "_quote": _sentence(text, m.start(), m.end())}
    return None


# --------------------------------------------------------------------------
# Определение ЖК
# --------------------------------------------------------------------------
def _norm(text: str) -> str:
    text = (text or "").lower().replace("ё", "е")
    text = re.sub(r"[«»\"'“”]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def _name_variants(c: Complex) -> List[str]:
    name = c.name or ""
    variants = [name.split("(")[0]] + re.findall(r"\(([^)]+)\)", name)
    out = []
    for v in variants:
        v = _norm(re.sub(r"^\s*жк\s+", "", _norm(v)))
        if len(v) >= 4:
            out.append(v)
    return out


def normalize_phone(phone: Optional[str]) -> Optional[str]:
    digits = re.sub(r"\D", "", phone or "")
    return digits[-10:] if len(digits) >= 10 else None


def _match_complex(
    complexes: Sequence[Complex], blob: str, phones: List[str], handles: List[str],
) -> Tuple[Optional[Complex], Optional[str], List[Complex]]:
    """(ЖК, способ, кандидаты): название → аккаунт → телефон; при неоднозначности ЖК не выбирается."""
    norm_blob = _norm(blob)
    by_name = [c for c in complexes if any(v in norm_blob for v in _name_variants(c))]
    if len(by_name) == 1:
        return by_name[0], "name", by_name
    if len(by_name) > 1:
        return None, None, by_name

    lowered = {h.lower() for h in handles}
    by_account = [c for c in complexes if c.sales_account and c.sales_account.lower() in lowered]
    if len(by_account) == 1:
        return by_account[0], "account", by_account

    by_phone = [c for c in complexes if normalize_phone(c.contact_phone) in phones]
    if len(by_phone) == 1:
        return by_phone[0], "phone", by_phone
    candidates = by_account or by_phone
    return None, None, candidates


# --------------------------------------------------------------------------
# Анализ
# --------------------------------------------------------------------------
def _public_trigger(t: Dict[str, Any]) -> Dict[str, Any]:
    return {k: v for k, v in t.items() if not k.startswith("_")}


def _hypothesis(factor: str, triggers: List[Dict[str, Any]], strength: int, explanation: str,
                quote: Optional[str]) -> Dict[str, Any]:
    return {
        "factor": factor,
        "name": FACTOR_NAMES[factor],
        "weight": WEIGHTS[factor],
        "strength": strength,
        "confidence": confidence_for(strength),
        "quote": quote,
        "triggers": [_public_trigger(t) for t in triggers],
        "explanation": explanation,
        "status": "AI_HYPOTHESIS",
        "points": 0,
    }


def _strongest_quote(triggers: List[Dict[str, Any]]) -> Optional[str]:
    if not triggers:
        return None
    return max(triggers, key=lambda t: (t["strength"], -t["start"]))["_quote"]


def analyze(
    complexes: Sequence[Complex],
    text: Optional[str] = None,
    ocr_text: Optional[str] = None,
    phone: Optional[str] = None,
    account: Optional[str] = None,
    screenshot_url: Optional[str] = None,
    explicit_complex: Optional[Complex] = None,
) -> Dict[str, Any]:
    sources = [(name, value.strip()) for name, value in (("text", text), ("ocr", ocr_text)) if value and value.strip()]
    if not sources:
        raise ValueError("Нужен текст объявления (text) или текст со скриншота (ocr_text)")
    blob = "\n".join(v for _, v in sources)

    phones = []
    for p in [phone] + PHONE_RE.findall(blob):
        n = normalize_phone(p)
        if n and n not in phones:
            phones.append(n)
    handles = HANDLE_RE.findall(blob) + HANDLE_RE.findall(account or "")

    if explicit_complex is not None:
        matched, matched_by, candidates = explicit_complex, "complex_id", [explicit_complex]
    else:
        matched, matched_by, candidates = _match_complex(complexes, blob, phones, handles)

    notes: List[str] = []
    hypotheses: List[Dict[str, Any]] = []

    # R2
    r2 = _find_triggers(sources, R2_TRIGGERS, "R2")
    safe = _find_safe(sources)
    r2_strength = sum(t["strength"] for t in r2) - 2 * len(safe)
    if r2 and r2_strength >= MIN_STRENGTH:
        words = ", ".join(f"«{t['text']}»" for t in r2)
        expl = f"Найдены признаки сбора денег до ДДУ: {words}."
        if safe:
            expl += f" Уверенность снижена: есть безопасные формулировки ({', '.join(s['text'] for s in safe)})."
        hypotheses.append(_hypothesis("R2", r2, r2_strength, expl, _strongest_quote(r2)))
    elif r2:
        notes.append("R2 не предложен: признаки оплаты слабые или перекрыты формулировками ДДУ / гарантии КЖК.")

    # R3
    commissioned_text = re.search(R3_COMMISSIONED, blob, _F)
    r3 = _find_triggers(sources, R3_TRIGGERS, "R3")
    r3_strength = sum(t["strength"] for t in r3)
    if matched is not None and matched.is_commissioned:
        if r3:
            notes.append(f"R3 не предложен: {matched.id} введён в эксплуатацию.")
    elif commissioned_text:
        notes.append(f"R3 не предложен: в тексте признак сданного дома («{commissioned_text.group(0)}»).")
    elif r3 and r3_strength >= MIN_STRENGTH:
        words = ", ".join(f"«{t['text']}»" for t in r3)
        hypotheses.append(_hypothesis("R3", r3, r3_strength, f"Реклама продажи квартир в строящемся ЖК: {words}.", _strongest_quote(r3)))

    # R5
    claim = _readiness_claim(sources)
    readiness = None
    if claim:
        readiness = {"claimedPct": claim["pct"], "text": claim["text"], "source": claim["source"],
                     "verifiedPct": None, "gap": None}
        if matched is None:
            notes.append(f"Заявлена готовность {claim['pct']}%, но ЖК не определён: сравнить не с чем.")
        else:
            gap, missing = readiness_gap(_with_claim(matched, claim["pct"]))
            readiness.update({"verifiedPct": matched.verified_readiness, "gap": gap,
                              "verifiedSource": matched.verified_readiness_source,
                              "verifiedDate": matched.readiness_date.isoformat() if matched.readiness_date else None})
            if gap is None:
                notes.append(f"R5 не проверен: {missing}")
            elif gap >= READINESS_GAP_THRESHOLD:
                bonus = 2 if gap >= 40 else 1 if gap >= 30 else 0
                trigger = {"factor": "R5", "pattern": "readiness_claim", "text": claim["text"], "strength": 3 + bonus,
                           "source": claim["source"], "start": claim["start"], "end": claim["end"], "_quote": claim["_quote"]}
                hypotheses.append(_hypothesis(
                    "R5", [trigger], 3 + bonus,
                    f"Заявлено {claim['pct']}%, подтверждено {matched.verified_readiness}% "
                    f"({matched.verified_readiness_source}): разница {gap} п.п. ≥ {READINESS_GAP_THRESHOLD}.",
                    claim["_quote"],
                ))
            else:
                notes.append(f"R5 не предложен: заявлено {claim['pct']}%, подтверждено {matched.verified_readiness}%, разница {gap} п.п. < {READINESS_GAP_THRESHOLD}.")

    # Коллизии телефона: другие ЖК с тем же номером
    collisions = [
        {"id": c.id, "name": c.name, "contactPhone": c.contact_phone, "legalBasisType": legal_basis_to_api(c),
         "riskZone": risk_profile(c)["zone"]}
        for c in complexes
        if normalize_phone(c.contact_phone) in phones and (matched is None or c.id != matched.id)
    ]

    top = max(hypotheses, key=lambda h: (h["confidence"], h["weight"])) if hypotheses else None
    if matched is None and candidates:
        notes.append("ЖК не определён однозначно: " + ", ".join(c.id for c in candidates) + ".")

    return {
        "aiHypothesis": True,
        "humanConfirmationRequired": True,
        "scoreImpact": 0,
        "complexId": matched.id if matched else None,
        "complexName": matched.name if matched else UNKNOWN_COMPLEX,
        "matchedBy": matched_by,
        "candidates": [c.id for c in candidates] if matched is None else [],
        "hypotheses": sorted(hypotheses, key=lambda h: h["factor"]),
        "safeSignals": safe,
        "readinessClaim": readiness,
        "phoneCollisions": collisions,
        "phonesFound": phones,
        "analyzedSources": [name for name, _ in sources],
        "screenshotUrl": screenshot_url,
        "scorePreview": _score_preview(matched, [h["factor"] for h in hypotheses]),
        "notes": notes,
        # Поля прежнего формата ответа
        "proposedFactor": top["factor"] if top else None,
        "factorWeight": top["weight"] if top else 0,
        "confidence": top["confidence"] if top else 0,
        "triggerSpan": top["quote"] if top else None,
        "explanation": top["explanation"] if top else "Признаков факторов R2, R3, R5 не выявлено.",
        "matchedComplexId": matched.id if matched else None,
        "matchedComplexName": matched.name if matched else UNKNOWN_COMPLEX,
    }


def _with_claim(c: Complex, claimed: int) -> Complex:
    """Заявленная готовность из анализируемого объявления (источник — само объявление, дата — сегодня)
    против подтверждённой готовности ЖК: для readiness_gap, без изменения самого ЖК."""
    return Complex(
        stated_readiness=claimed, stated_readiness_source="анализируемое объявление", stated_readiness_date=now().date(),
        verified_readiness=c.verified_readiness, verified_readiness_source=c.verified_readiness_source,
        readiness_date=c.readiness_date,
    )


def _score_preview(c: Optional[Complex], hypothesis_factors: List[str]) -> Optional[Dict[str, Any]]:
    """Текущий балл ЖК и балл, если аналитик подтвердит все гипотезы. Анализ сам балл не меняет."""
    if c is None:
        return None
    current = [f["code"] for f in evaluate_factors(c) if f["active"]]
    now_risk = calculate_risk(current)
    if_confirmed = calculate_risk(sorted(set(current) | set(hypothesis_factors)))
    return {
        "currentScore": now_risk["score"], "currentZone": now_risk["zone"],
        "ifConfirmedScore": if_confirmed["score"], "ifConfirmedZone": if_confirmed["zone"],
    }
