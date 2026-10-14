import sys
from pathlib import Path

# Обеспечиваем корректный импорт app.scoring при запуске pytest из любого каталога
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest
from app.scoring import calculate_risk, WEIGHTS


def test_case_a_unverified_basis_with_paid_booking():
    """Кейс A (Эталон ТЗ): ЖК «Сатпаев Сити Парк» (jk-2).
    Правовое основание не проверено (UNVERIFIED = 0 б., не начисляется R1!).
    Зафиксированы платная бронь R2 (25 б.) + реклама строящегося жилья R3 (10 б.).
    Ожидается: score == 35 и zone == 'YELLOW'.
    """
    res = calculate_risk(["R2", "R3"])
    assert res["score"] == 35
    assert res["zone"] == "YELLOW"


def test_case_b_absent_basis_with_deposit():
    """Кейс B (Эталон ТЗ): ЖК «Ертіс Рівер Тауэрс» (jk-1).
    Установлено отсутствие правового основания R1 (35 б.) +
    платный депозит R2 (25 б.) + активная реклама R3 (10 б.).
    Ожидается: score == 70 и zone == 'RED' (балл >= 60 и одновременно подтверждены R1 + R2).
    """
    res = calculate_risk(["R1", "R2", "R3"])
    assert res["score"] == 70
    assert res["zone"] == "RED"


def test_case_c_valid_kzh_guarantee_with_regular_ad():
    """Кейс C (Эталон ТЗ): ЖК «Алтай Премиум Резиденс» (jk-3).
    Подтверждена действующая гарантия АО «КЖК» (по закону РК отдельное разрешение
    МИО не требуется, поэтому R1 не начисляется = 0 б.).
    Присутствует обычная реклама R3 (10 б.).
    Ожидается: score == 10 и zone == 'GREEN'.
    """
    res = calculate_risk(["R3"])
    assert res["score"] == 10
    assert res["zone"] == "GREEN"


def test_edge_case_60_plus_without_r1_and_r2_stays_yellow():
    """Граничный кейс Раздела 5 ТЗ: ЖК «Нурлы Жол Оскемен» (jk-5).
    Подтверждены факторы R1 (35) + R3 (10) + R5 (10) + R6 (5) = 60 баллов.
    Фактор R2 находится в статусе гипотезы ИИ (не подтверждён человеком).
    Правило: балл 60+ БЕЗ одновременной комбинации подтверждённых R1 + R2 остаётся
    в Жёлтой зоне!
    Ожидается: score == 60 и zone == 'YELLOW'.
    """
    res = calculate_risk(["R1", "R3", "R5", "R6"])  # 35 + 10 + 10 + 5 = 60, но нет R2
    assert res["score"] == 60
    assert res["zone"] == "YELLOW"
