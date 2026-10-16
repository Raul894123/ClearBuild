"""По тесту на каждый эндпоинт пункта 3 (ТЗ1 §4 и ТЗ2 §3), под /api/v1 и под алиасом /api."""

import pytest
from sqlalchemy import select

from app.db import SessionLocal
from app.models import AuditLog, Publication

PREFIXES = ["/api/v1", "/api"]


def _profile(client, complex_id, prefix="/api/v1"):
    return client.get(f"{prefix}/complexes/{complex_id}").json()["riskProfile"]


def _last_audit(client):
    return client.get("/api/v1/audit-log?limit=1").json()[0]


# --------------------------------------------------------------------------
# Чтение
# --------------------------------------------------------------------------
@pytest.mark.parametrize("prefix", PREFIXES)
def test_health(client, prefix):
    res = client.get(f"{prefix}/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"


@pytest.mark.parametrize("prefix", PREFIXES)
@pytest.mark.parametrize("zone, expected", [
    ("red", ["jk-1", "jk-4"]),
    ("YELLOW", ["jk-2", "jk-5"]),
    ("Green", ["jk-3", "jk-6", "jk-7", "jk-8"]),
    ("all", [f"jk-{i}" for i in range(1, 9)]),
    (None, [f"jk-{i}" for i in range(1, 9)]),
])
def test_list_complexes_with_zone_filter(client, prefix, zone, expected):
    params = {"zone": zone} if zone else {}
    res = client.get(f"{prefix}/complexes", params=params)
    assert res.status_code == 200
    assert [c["id"] for c in res.json()] == expected


def test_list_complexes_rejects_unknown_zone(client):
    assert client.get("/api/v1/complexes", params={"zone": "purple"}).status_code == 422


@pytest.mark.parametrize("prefix", PREFIXES)
def test_get_complex_with_publications_and_signal(client, prefix):
    res = client.get(f"{prefix}/complexes/jk-1")
    assert res.status_code == 200
    data = res.json()
    assert [p["id"] for p in data["publications"]] == ["AD-101", "AD-102"]
    assert all(p["complexId"] == "jk-1" for p in data["publications"])
    signal = data["signal"]
    assert (signal["status"], signal["totalScore"], signal["riskZone"]) == ("PENDING_HUMAN", 70, "RED")
    assert [f["code"] for f in signal["activeFactors"]] == ["R1", "R2", "R3"]
    assert signal["reviewedAt"].endswith("+05:00")
    assert len(data["riskProfile"]["factors"]) == 6
    assert client.get(f"{prefix}/complexes/jk-404").status_code == 404


@pytest.mark.parametrize("prefix", PREFIXES)
def test_list_publications(client, prefix):
    res = client.get(f"{prefix}/publications")
    assert res.status_code == 200
    assert [p["id"] for p in res.json()][:2] == ["AD-101", "AD-102"]
    assert len(res.json()) == 12


@pytest.mark.parametrize("prefix", PREFIXES)
def test_audit_log(client, prefix):
    res = client.get(f"{prefix}/audit-log")
    assert res.status_code == 200
    assert isinstance(res.json(), list)


@pytest.mark.parametrize("prefix", PREFIXES)
def test_analyze(client, prefix):
    res = client.post(f"{prefix}/analyze", json={
        "text": "ЖК «Нурлы Жол Оскемен»: внесите депозит 400 000 тг сегодня",
        "phone": "+7 (705) 999-00-11",
        "complex_id": "AUTO",
    })
    assert res.status_code == 200
    data = res.json()
    assert data["proposedFactor"] == "R2"
    assert data["humanConfirmationRequired"] is True
    assert data["phoneCollisions"]


# --------------------------------------------------------------------------
# R3 только по флагу is_active_pre_commissioning_ad
# --------------------------------------------------------------------------
def test_seed_r3_flags_are_explicit(client):
    with SessionLocal() as db:
        flags = {p.id: (p.has_direct_payment_offer, p.is_active_pre_commissioning_ad) for p in db.scalars(select(Publication))}
    assert flags["AD-104"] == (False, True)   # реклама строящегося ЖК без требования денег
    assert flags["AD-101"] == (True, True)
    assert flags["AD-112"] == (False, False)  # дом сдан


def test_confirmed_publication_without_ad_flag_gives_no_r3(client):
    res = client.post("/api/v1/publications", json={
        "complexId": "jk-8", "platform": "Telegram", "rawText": "Новости района", "status": "CONFIRMED",
    })
    assert res.status_code == 200
    pid = res.json()["publication"]["id"]
    with SessionLocal() as db:
        assert db.get(Publication, pid).is_active_pre_commissioning_ad is False
    assert _profile(client, "jk-8")["score"] == 0

    # Явный флаг false: подтверждённая публикация по строящемуся ЖК без признака рекламы не даёт R3
    res = client.post("/api/v1/publications", json={
        "complexId": "jk-6", "platform": "Telegram", "rawText": "Продажа квартир через ДДУ",
        "status": "CONFIRMED", "isActivePreCommissioningAd": False,
    })
    assert res.status_code == 200
    assert _profile(client, "jk-6")["score"] == 5


# --------------------------------------------------------------------------
# Запись
# --------------------------------------------------------------------------
@pytest.mark.parametrize("prefix", PREFIXES)
def test_create_publication(client, prefix):
    res = client.post(f"{prefix}/publications", json={
        "complexId": "jk-3", "platform": "Instagram", "rawText": "Квартиры в ЖК по ДДУ", "status": "ai_hypothesis",
    })
    assert res.status_code == 200
    assert res.json()["publication"]["status"] == "AI_HYPOTHESIS"
    assert client.post(f"{prefix}/publications", json={"rawText": "x", "status": "MAYBE"}).status_code == 422


def test_verify_accept_recalculates_and_audits(client):
    # jk-5: AD-108 (депозит) — гипотеза ИИ; принятие даёт R2 и Красную зону
    assert _profile(client, "jk-5")["score"] == 60
    res = client.post("/api/v1/publications/AD-108/verify", json={"decision": "accept", "analyst": "Тестов Т.Т.", "comment": "Звонок подтвердил"})
    assert res.status_code == 200
    data = res.json()
    assert data["publication"]["status"] == "CONFIRMED"
    assert (data["risk_profile"]["score"], data["risk_profile"]["zone"]) == (85, "RED")
    assert _profile(client, "jk-5")["zone"] == "RED"
    assert client.get("/api/v1/complexes/jk-5").json()["signal"]["totalScore"] == 85

    log = _last_audit(client)
    assert (log["action"], log["entityId"], log["actor"]) == ("publication_verify", "AD-108", "Тестов Т.Т.")
    assert (log["details"]["from"], log["details"]["to"]) == ("pending_review", "confirmed")
    assert (log["details"]["scoreBefore"], log["details"]["scoreAfter"]) == (60, 85)


def test_verify_reject_via_spec_alias(client):
    # Под алиасом /api, решение в любом регистре; отклонение возвращает jk-5 к 60
    res = client.post("/api/publications/AD-108/verify", json={"decision": "REJECT"})
    assert res.status_code == 200
    assert res.json()["publication"]["status"] == "REJECTED"
    assert (res.json()["risk_profile"]["score"], res.json()["risk_profile"]["zone"]) == (60, "YELLOW")


def test_verify_readiness_publication_activates_r5(client):
    # jk-1: заявленные 65% взяты из AD-102; после принятия R5 начисляется (70 -> 80)
    res = client.post("/api/v1/publications/AD-102/verify", json={"decision": "accept"})
    assert res.json()["risk_profile"]["score"] == 80
    assert res.json()["risk_profile"]["confirmed_factors"] == ["R1", "R2", "R3", "R5"]


def test_verify_validation(client):
    assert client.post("/api/v1/publications/AD-999/verify", json={"decision": "accept"}).status_code == 404
    assert client.post("/api/v1/publications/AD-101/verify", json={"decision": "maybe"}).status_code == 422


@pytest.mark.parametrize("prefix", PREFIXES)
def test_confirm_factor(client, prefix):
    res = client.post(f"{prefix}/complexes/jk-3/confirm-factor", json={"factor": "r4", "status": "confirmed", "evidence": "Обращение №7"})
    assert res.status_code == 200
    assert res.json()["risk_profile"]["score"] == 25
    res = client.post(f"{prefix}/complexes/jk-3/confirm-factor", json={"factor": "R4", "status": "NONE"})
    assert res.json()["risk_profile"]["score"] == 10
    assert client.post(f"{prefix}/complexes/jk-3/confirm-factor", json={"factor": "R7"}).status_code == 422


@pytest.mark.parametrize("prefix", PREFIXES)
def test_create_complex(client, prefix):
    res = client.post(f"{prefix}/complexes", json={"name": f"ЖК «Тест {prefix}»", "developer": "ТОО «Тест-Демо»", "bin": "1", "legalBasisType": "absent"})
    assert res.status_code == 200
    assert res.json()["complex"]["legalBasisType"] == "ABSENT"
    bad = client.post(f"{prefix}/complexes", json={"name": "x", "developer": "x", "bin": "1", "legalBasisType": "SOMETIMES"})
    assert bad.status_code == 422


@pytest.mark.parametrize("prefix", PREFIXES)
def test_signal_decision(client, prefix):
    res = client.post(f"{prefix}/complexes/jk-2/signal-decision", json={"decision": "CONFIRMED", "author": "Тестов Т.Т."})
    assert res.status_code == 200
    assert res.json()["signalStatus"] == "CONFIRMED"
    assert res.json()["signal"]["reviewedBy"] == "Тестов Т.Т."
    assert client.post(f"{prefix}/complexes/jk-2/signal-decision", json={"decision": "draft"}).status_code == 422


@pytest.mark.parametrize("prefix", PREFIXES)
def test_signals_decision_spec_path(client, prefix):
    # Путь и значения по ТЗ1: /signals/{complex_id}/decision, "confirmed" / "returned"
    res = client.post(f"{prefix}/signals/jk-4/decision", json={"decision": "returned", "comment": "Нужен акт ГАСК", "author": "Тестов Т.Т."})
    assert res.status_code == 200
    data = res.json()
    assert data["signalStatus"] == "RETURNED"
    assert data["signal"]["comment"] == "Нужен акт ГАСК"
    assert data["signal"]["reviewedAt"].endswith("+05:00")
    assert client.get(f"{prefix}/complexes/jk-4").json()["signal"]["status"] == "RETURNED"

    with SessionLocal() as db:
        row = db.scalars(select(AuditLog).order_by(AuditLog.id.desc())).first()
        assert (row.action, row.entity_id, row.details["decision"]) == ("signal_decision", "jk-4", "RETURNED")
    assert client.post(f"{prefix}/signals/jk-404/decision", json={"decision": "confirmed"}).status_code == 404
