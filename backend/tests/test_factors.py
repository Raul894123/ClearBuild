"""Правила ТЗ для вывода факторов R1–R6 из данных и для цветовых зон (без БД)."""

from datetime import date

import pytest

from app import scoring
from app.factors import evaluate_factors, risk_profile
from app.models import Complex, Publication
from app.scoring import calculate_risk, zone_for


def make_complex(**kw) -> Complex:
    base = dict(
        id="jk-t", name="ЖК «Тест»", lat=49.95, lng=82.61, developer_name="ТОО «Тест-Демо»", developer_bin="000",
        legal_basis_type="mio_permit", is_commissioned=False,
        has_collective_complaint=False, has_significant_delay=False, factor_overrides={},
    )
    base.update(kw)
    return Complex(**base)


def make_pub(pid: str, status: str, payment: bool = False, ad: bool = True) -> Publication:
    return Publication(id=pid, source_platform="Krisha.kz", text_content="...", url=f"https://krisha.kz/{pid}",
                       status=status, has_direct_payment_offer=payment, is_active_pre_commissioning_ad=ad)


def with_readiness(stated, verified, **kw) -> Complex:
    data = dict(
        stated_readiness=stated, stated_readiness_source="Instagram", stated_readiness_date=date(2026, 10, 13),
        verified_readiness=verified, verified_readiness_source="Акт УГАСК", readiness_date=date(2026, 10, 8),
    )
    data.update(kw)
    return make_complex(**data)


def factor(c: Complex, code: str) -> dict:
    return next(f for f in evaluate_factors(c) if f["code"] == code)


# --------------------------------------------------------------------------
# Зоны и балл
# --------------------------------------------------------------------------
@pytest.mark.parametrize("score, has_r1, has_r2, zone", [
    (0, False, False, "GREEN"),
    (24, False, False, "GREEN"),
    (25, False, False, "YELLOW"),
    (59, False, False, "YELLOW"),
    (59, True, True, "YELLOW"),     # R1+R2 есть, но балл < 60
    (60, True, True, "RED"),
    (60, True, False, "YELLOW"),    # 60+ без R2
    (60, False, True, "YELLOW"),    # 60+ без R1
    (100, False, False, "YELLOW"),
    (100, True, True, "RED"),
])
def test_zone_boundaries(score, has_r1, has_r2, zone):
    assert zone_for(score, has_r1, has_r2)[0] == zone


def test_r1_plus_r2_alone_is_exactly_60_and_red():
    res = calculate_risk(["R1", "R2"])
    assert (res["score"], res["zone"]) == (60, "RED")


def test_score_60_plus_without_r1_and_r2_is_yellow():
    res = calculate_risk(["R1", "R3", "R4", "R5", "R6"])
    assert (res["score"], res["zone"]) == (75, "YELLOW")


def test_all_factors_give_exactly_100():
    assert calculate_risk(["R1", "R2", "R3", "R4", "R5", "R6"])["score"] == 100


def test_score_is_capped_at_100(monkeypatch):
    # С весами ТЗ сумма всех факторов ровно 100, поэтому потолок проверяем на завышенном весе
    monkeypatch.setitem(scoring.WEIGHTS, "R1", 50)
    assert calculate_risk(["R1", "R2", "R3", "R4", "R5", "R6"])["score"] == 100


# --------------------------------------------------------------------------
# R1: только absent
# --------------------------------------------------------------------------
def test_r1_absent_gives_35():
    f = factor(make_complex(legal_basis_type="absent", verification_source="Ответ УГАСК №04-12/881"), "R1")
    assert (f["active"], f["points"]) == (True, 35)
    assert f["evidence"][0]["ref"] == "Ответ УГАСК №04-12/881"


def test_r1_unknown_gives_0_and_needs_check():
    c = make_complex(legal_basis_type="unknown")
    f = factor(c, "R1")
    assert (f["active"], f["points"], f["status"], f["label"]) == (False, 0, "UNVERIFIED", "Нужна проверка")
    assert risk_profile(c)["needs_check"] == ["R1"]


@pytest.mark.parametrize("legal", ["operator_guarantee", "mio_permit"])
def test_r1_guarantee_or_permit_gives_0(legal):
    f = factor(make_complex(legal_basis_type=legal), "R1")
    assert (f["active"], f["points"], f["status"]) == (False, 0, "NONE")


def test_r1_override_cannot_confirm_without_absent():
    c = make_complex(legal_basis_type="operator_guarantee",
                     factor_overrides={"R1": {"status": "CONFIRMED", "analyst": "Тестов"}})
    assert factor(c, "R1")["active"] is False


# --------------------------------------------------------------------------
# R2 / R3: только подтверждённые публикации
# --------------------------------------------------------------------------
def test_r2_r3_from_confirmed_publication():
    c = make_complex()
    c.publications.append(make_pub("AD-1", "confirmed", payment=True))
    assert [f["code"] for f in evaluate_factors(c) if f["active"]] == ["R2", "R3"]
    assert factor(c, "R2")["evidence"][0] == {"type": "publication", "ref": "AD-1", "url": "https://krisha.kz/AD-1", "platform": "Krisha.kz"}


def test_ai_hypothesis_does_not_change_score():
    c = make_complex()
    c.publications.append(make_pub("AD-1", "pending_review", payment=True))
    profile = risk_profile(c)
    assert profile["score"] == 0
    assert factor(c, "R2")["status"] == "AI_HYPOTHESIS"
    assert profile["hypothetical_factors"] == ["R2", "R3"]
    assert profile["potential_score"] == 35


def test_rejected_publication_gives_nothing():
    c = make_complex()
    c.publications.append(make_pub("AD-1", "rejected", payment=True))
    assert risk_profile(c)["score"] == 0
    assert factor(c, "R2")["status"] == "NONE"


def test_r3_not_for_commissioned_complex():
    c = make_complex(is_commissioned=True)
    c.publications.append(make_pub("AD-1", "confirmed", ad=True))
    assert factor(c, "R3")["active"] is False


def test_analyst_can_confirm_r2_hypothesis():
    c = make_complex(factor_overrides={"R2": {"status": "CONFIRMED", "analyst": "Тестов", "evidence": "Звонок в отдел продаж"}})
    c.publications.append(make_pub("AD-1", "pending_review", payment=True))
    f = factor(c, "R2")
    assert (f["active"], f["source"]) == (True, "analyst")


def test_analyst_rejection_overrides_data():
    c = make_complex(factor_overrides={"R3": {"status": "REJECTED", "analyst": "Тестов"}})
    c.publications.append(make_pub("AD-1", "confirmed"))
    assert factor(c, "R3")["active"] is False


# --------------------------------------------------------------------------
# R4 / R6: флаги
# --------------------------------------------------------------------------
def test_r4_r6_from_flags():
    c = make_complex(has_collective_complaint=True, collective_complaint_source="Обращение №12",
                     has_significant_delay=True)
    assert [f["code"] for f in evaluate_factors(c) if f["active"]] == ["R4", "R6"]
    assert risk_profile(c)["score"] == 20
    assert factor(c, "R4")["evidence"][0]["ref"] == "Обращение №12"


# --------------------------------------------------------------------------
# R5: stated − verified ≥ 20, направленно, с датами и источниками
# --------------------------------------------------------------------------
def test_r5_gap_19_gives_0():
    assert factor(with_readiness(49, 30), "R5")["active"] is False


def test_r5_gap_20_gives_10():
    f = factor(with_readiness(50, 30), "R5")
    assert (f["active"], f["points"]) == (True, 10)
    assert [e["type"] for e in f["evidence"]] == ["readiness_stated", "readiness_verified"]


def test_r5_is_directional():
    # Подтверждено больше, чем заявлено: это не R5
    assert factor(with_readiness(30, 60), "R5")["active"] is False


@pytest.mark.parametrize("missing", ["stated_readiness_date", "readiness_date", "stated_readiness_source", "verified_readiness_source"])
def test_r5_requires_dates_and_sources(missing):
    assert factor(with_readiness(80, 30, **{missing: None}), "R5")["active"] is False


def test_r5_from_unconfirmed_publication_is_hypothesis():
    c = with_readiness(65, 30, stated_readiness_publication_id="AD-1")
    c.publications.append(make_pub("AD-1", "pending_review"))
    f = factor(c, "R5")
    assert (f["status"], f["points"]) == ("AI_HYPOTHESIS", 0)
    c.publications[0].status = "confirmed"
    assert factor(c, "R5")["active"] is True


def test_r5_override_cannot_confirm_small_gap():
    c = with_readiness(40, 30, factor_overrides={"R5": {"status": "CONFIRMED", "analyst": "Тестов"}})
    assert factor(c, "R5")["active"] is False


# --------------------------------------------------------------------------
# Контрольные сценарии ТЗ на данных (не на списке кодов)
# --------------------------------------------------------------------------
def test_case_a_from_data():
    c = make_complex(legal_basis_type="unknown")
    c.publications.append(make_pub("AD-1", "confirmed", payment=True))
    p = risk_profile(c)
    assert (p["score"], p["zone"]) == (35, "YELLOW")


def test_case_b_from_data():
    c = make_complex(legal_basis_type="absent")
    c.publications.append(make_pub("AD-1", "confirmed", payment=True))
    p = risk_profile(c)
    assert (p["score"], p["zone"]) == (70, "RED")


def test_case_c_from_data():
    c = make_complex(legal_basis_type="operator_guarantee")
    c.publications.append(make_pub("AD-1", "confirmed"))
    p = risk_profile(c)
    assert (p["score"], p["zone"]) == (10, "GREEN")
