"""Детерминированный движок риск-скоринга ClearBuild · SAQ QURYLYS.

Раздел 5 ТЗ: Codemasters Hackathon 8.0 (г. Усть-Каменогорск).
Детерминированный расчёт баллов факторов R1-R6, разделение подтверждённых
фактов и ИИ-гипотез (Human-in-the-Loop) и строгое распределение по цветовым зонам.
"""

from typing import Any, Dict, List, Optional, Set, Tuple

# Веса факторов риска строго по Разделу 5 ТЗ SAQ QURYLYS:
# R1: 35 (Установлено отсутствие применимого правового основания.
#        Статус UNVERIFIED / «нет данных» или действующая гарантия КЖК даёт 0 баллов!)
# R2: 25 (Прямое предложение внести деньги: платная бронь, депозит, ПВ до ДДУ)
# R3: 10 (Активная реклама строящегося жилья до ввода в эксплуатацию)
# R4: 15 (Подтверждённое коллективное обращение граждан)
# R5: 10 (Несовпадение заявленной и подтверждённой готовности на 20 и более п.п.)
# R6: 5  (Подтверждённый простой или значимая просрочка)
WEIGHTS: Dict[str, int] = {
    "R1": 35,
    "R2": 25,
    "R3": 10,
    "R4": 15,
    "R5": 10,
    "R6": 5,
}

FACTOR_NAMES: Dict[str, str] = {
    "R1": "Отсутствие правового основания",
    "R2": "Прямое предложение внести деньги до ДДУ",
    "R3": "Реклама строящегося жилья до ввода",
    "R4": "Коллективное обращение граждан",
    "R5": "Расхождение заявленной и фактической готовности ≥20 п.п.",
    "R6": "Подтверждённый простой или просрочка строительства",
}


def zone_for(score: int, has_r1: bool, has_r2: bool) -> Tuple[str, str, str]:
    """Цветовая зона по баллу: (код, название, обоснование)."""
    if score >= 60 and has_r1 and has_r2:
        return "RED", "Красная", (
            f"Балл {score} (≥60) и одновременно подтверждены R1 (нет основания) "
            "и R2 (сбор средств)."
        )
    if score >= 25:
        if score >= 60:
            return "YELLOW", "Жёлтая", (
                f"Балл {score} (≥60), но отсутствует одновременная комбинация "
                "подтверждённых R1+R2 — по правилу Раздела 5 ТЗ присвоена Жёлтая зона."
            )
        return "YELLOW", "Жёлтая", f"Балл {score} в диапазоне 25–59 баллов."
    return "GREEN", "Зелёная", "Балл 0–24: существенных подтверждённых признаков нарушения не выявлено."


def calculate_risk(
    confirmed_factors: List[str],
    hypothetical_factors: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """Детерминированный расчёт балла риска и цветовой зоны.

    Правила:
    1. score = min(100, sum(WEIGHTS[code] for code in confirmed_factors))
    2. Гипотезы ИИ (AI_HYPOTHESIS) НЕ прибавляются к подтверждённому баллу score,
       пока их не подтвердит аналитик. Учитываются только в potential_score.
    3. Зоны:
       - RED (Красная): score >= 60 И одновременно 'R1' in confirmed И 'R2' in confirmed
       - YELLOW (Жёлтая): score >= 25 (включая score >= 60 БЕЗ одновременной пары R1+R2)
       - GREEN (Зелёная): 0-24 балла
    """
    unique_confirmed: Set[str] = set(confirmed_factors or [])
    unique_hypo: Set[str] = set(hypothetical_factors or []) - unique_confirmed

    # 1. Подтверждённый балл (только проверенные факты)
    confirmed_score = min(100, sum(WEIGHTS.get(code, 0) for code in unique_confirmed))

    # 2. Потенциальный балл (с учётом неподтверждённых гипотез ИИ)
    hypo_points = sum(WEIGHTS.get(code, 0) for code in unique_hypo)
    potential_score = min(100, confirmed_score + hypo_points)

    has_r1 = "R1" in unique_confirmed
    has_r2 = "R2" in unique_confirmed

    # 3. Определение цветовой зоны строго по Разделу 5 ТЗ
    zone, zone_label, zone_reason = zone_for(confirmed_score, has_r1, has_r2)

    return {
        "score": confirmed_score,
        "potential_score": potential_score,
        "zone": zone,
        "zone_label": zone_label,
        "zone_reason": zone_reason,
        "has_r1": has_r1,
        "has_r2": has_r2,
        "confirmed_factors": sorted(list(unique_confirmed)),
        "hypothetical_factors": sorted(list(unique_hypo)),
    }


def calculate_risk_for_complex(complex_data: Dict[str, Any]) -> Dict[str, Any]:
    """Вспомогательная функция расчёта профиля риска по словарю карточки ЖК."""
    factors = complex_data.get("factors", {})
    confirmed = []
    hypothetical = []

    for code, factor_info in factors.items():
        status = factor_info.get("status") if isinstance(factor_info, dict) else factor_info
        if status == "CONFIRMED":
            confirmed.append(code)
        elif status == "AI_HYPOTHESIS":
            hypothetical.append(code)

    return calculate_risk(confirmed, hypothetical)
