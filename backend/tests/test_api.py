"""API-тесты на хранилище SQLite: сид, сохранение изменений и журнал аудита."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.db import SessionLocal
from app.main import app
from app.models import AuditLog, Complex, Publication, Signal


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def _complex(client, complex_id):
    res = client.get(f"/api/v1/complexes/{complex_id}")
    assert res.status_code == 200
    return res.json()


def test_health_reports_seeded_counts(client):
    data = client.get("/api/v1/health").json()
    assert data["status"] == "healthy"
    assert data["complexes_count"] == 8
    assert data["publications_count"] == 12


# Баллы всех 8 ЖК сида, посчитанные из данных БД по ТЗ (факторы, баллы, зона)
SEED_EXPECTED = {
    "jk-1": (["R1", "R2", "R3"], 70, "RED"),            # Кейс B; R5 — гипотеза ИИ (AD-102 не подтверждена)
    "jk-2": (["R2", "R3"], 35, "YELLOW"),               # Кейс A; R1 = «Нужна проверка»
    "jk-3": (["R3"], 10, "GREEN"),                      # Кейс C; гарантия КЖК
    "jk-4": (["R1", "R2", "R3", "R4", "R5", "R6"], 100, "RED"),
    "jk-5": (["R1", "R3", "R5", "R6"], 60, "YELLOW"),   # граничный: R2 — гипотеза ИИ (AD-108)
    "jk-6": (["R6"], 5, "GREEN"),                       # только гипотеза AD-110, подтверждённых публикаций нет
    "jk-7": (["R3"], 10, "GREEN"),
    "jk-8": ([], 0, "GREEN"),                           # введён в эксплуатацию, AD-112 отклонена
}


def test_seed_scores_derived_from_data(client):
    by_id = {c["id"]: c for c in client.get("/api/v1/complexes").json()}
    assert list(by_id) == [f"jk-{i}" for i in range(1, 9)]
    for cid, (factors, score, zone) in SEED_EXPECTED.items():
        profile = by_id[cid]["riskProfile"]
        assert (profile["confirmed_factors"], profile["score"], profile["zone"]) == (factors, score, zone), cid


def test_seed_reference_cases_explained(client):
    jk1 = {f["code"]: f for f in _complex(client, "jk-1")["riskProfile"]["factors"]}
    assert jk1["R5"]["status"] == "AI_HYPOTHESIS" and jk1["R5"]["points"] == 0
    assert [e["ref"] for e in jk1["R2"]["evidence"]] == ["AD-101"]
    assert jk1["R2"]["evidence"][0]["url"].startswith("https://")

    jk2 = _complex(client, "jk-2")["riskProfile"]
    assert jk2["needs_check"] == ["R1"]
    assert {f["code"]: f for f in jk2["factors"]}["R1"]["label"] == "Нужна проверка"

    jk5 = {f["code"]: f for f in _complex(client, "jk-5")["riskProfile"]["factors"]}
    assert jk5["R2"]["status"] == "AI_HYPOTHESIS"
    assert "AD-108" in jk5["R2"]["reason"]


def test_risk_profile_has_breakdown_for_every_factor(client):
    factors = _complex(client, "jk-4")["riskProfile"]["factors"]
    assert [f["code"] for f in factors] == ["R1", "R2", "R3", "R4", "R5", "R6"]
    for f in factors:
        assert {"code", "points", "active", "status", "reason", "evidence"} <= set(f)
        assert f["reason"]
    assert sum(f["points"] for f in factors) == 100


def test_legacy_factors_field_matches_breakdown(client):
    c = _complex(client, "jk-5")
    assert c["factors"]["R2"]["status"] == "AI_HYPOTHESIS"
    assert c["factors"]["R1"]["status"] == "CONFIRMED"


def test_seed_stored_with_spec_values(client):
    with SessionLocal() as db:
        complexes = {c.id: c for c in db.scalars(select(Complex))}
        assert all(c.is_demo for c in complexes.values())
        assert complexes["jk-1"].legal_basis_type == "absent"
        assert complexes["jk-1"].verification_status == "violation_confirmed"
        assert complexes["jk-2"].legal_basis_type == "unknown"
        assert complexes["jk-2"].verification_status == "needs_check"
        assert complexes["jk-3"].legal_basis_type == "operator_guarantee"
        assert complexes["jk-8"].legal_basis_type == "mio_permit"
        assert complexes["jk-8"].is_commissioned
        assert complexes["jk-1"].stated_readiness_publication_id == "AD-102"
        assert complexes["jk-4"].has_collective_complaint and complexes["jk-4"].collective_complaint_source
        assert db.get(Publication, "AD-108").status == "pending_review"
        assert db.get(Publication, "AD-112").status == "rejected"
        assert db.scalar(select(Signal).where(Signal.complex_id == "jk-1")).risk_zone == "red"


def test_api_keeps_frontend_values_and_formats(client):
    jk2 = _complex(client, "jk-2")
    assert jk2["legalBasisType"] == "UNVERIFIED"
    assert jk2["signalStatus"] == "PENDING_HUMAN"
    assert jk2["declaredReadiness"] == {"pct": 20, "source": "Telegram @ukg_nedvizhimost", "date": "12.10.2026"}
    assert _complex(client, "jk-8")["legalBasisType"] == "COMMISSIONED"

    pubs = {p["id"]: p for p in client.get("/api/v1/publications").json()}
    assert pubs["AD-101"]["capturedAt"] == "2026-10-14T09:15:00+05:00"
    assert pubs["AD-101"]["captureNote"] == "Snapshot #101"
    assert pubs["AD-101"]["pubDate"] == "13.10.2026"
    assert pubs["AD-108"]["status"] == "AI_HYPOTHESIS"
    assert jk2["signalUpdatedAt"] == "2026-10-14T15:20:00+05:00"


def test_confirm_factor_recalculates_persists_and_audits(client):
    # Граничный кейс jk-5: подтверждение R2 переводит 60 (Жёлтая) в 85 (Красная)
    res = client.post("/api/v1/complexes/jk-5/confirm-factor", json={"factor": "R2", "status": "CONFIRMED", "analyst": "Тестов Т.Т."})
    assert res.status_code == 200
    assert res.json()["risk_profile"]["score"] == 85
    assert res.json()["risk_profile"]["zone"] == "RED"
    assert _complex(client, "jk-5")["riskProfile"]["zone"] == "RED"

    log = client.get("/api/v1/audit-log").json()
    assert log[0]["action"] == "factor_status_change"
    assert log[0]["actor"] == "Тестов Т.Т."
    assert log[0]["details"]["from"] == "AI_HYPOTHESIS"
    assert log[0]["details"]["to"] == "CONFIRMED"
    assert log[0]["createdAt"].endswith("+05:00")

    # AUTO снимает решение аналитика: снова расчёт по данным, 60 и Жёлтая
    res = client.post("/api/v1/complexes/jk-5/confirm-factor", json={"factor": "R2", "status": "AUTO"})
    assert res.json()["risk_profile"]["score"] == 60
    assert res.json()["risk_profile"]["zone"] == "YELLOW"


def test_confirm_factor_cannot_bypass_spec_rules(client):
    # jk-2: разница готовности 5 п.п. — R5 подтвердить нельзя
    res = client.post("/api/v1/complexes/jk-2/confirm-factor", json={"factor": "R5", "status": "CONFIRMED"})
    assert res.status_code == 400
    # jk-8 введён в эксплуатацию — R3 подтвердить нельзя
    assert client.post("/api/v1/complexes/jk-8/confirm-factor", json={"factor": "R3", "status": "CONFIRMED"}).status_code == 400
    assert client.post("/api/v1/complexes/jk-1/confirm-factor", json={"factor": "R1", "status": "MAYBE"}).status_code == 400
    assert _complex(client, "jk-2")["riskProfile"]["score"] == 35


def test_confirm_r1_sets_legal_basis_absent(client):
    # jk-7 с разрешением МИО: аналитик установил отсутствие основания -> absent и +35
    res = client.post("/api/v1/complexes/jk-7/confirm-factor", json={"factor": "R1", "status": "CONFIRMED", "evidence": "Разрешение отозвано"})
    assert res.status_code == 200
    assert res.json()["complex"]["legalBasisType"] == "ABSENT"
    assert res.json()["risk_profile"]["score"] == 45
    assert res.json()["risk_profile"]["zone"] == "YELLOW"


def test_rejecting_data_factor_removes_points(client):
    res = client.post("/api/v1/complexes/jk-4/confirm-factor", json={"factor": "R6", "status": "NONE"})
    assert res.json()["risk_profile"]["score"] == 95
    with SessionLocal() as db:
        assert not db.get(Complex, "jk-4").has_significant_delay


def test_confirm_factor_rejects_unknown_code(client):
    assert client.post("/api/v1/complexes/jk-1/confirm-factor", json={"factor": "R9"}).status_code == 400
    assert client.post("/api/v1/complexes/jk-404/confirm-factor", json={"factor": "R1"}).status_code == 404


def test_signal_decision_creates_history_row_with_real_time(client):
    res = client.post("/api/v1/complexes/jk-1/signal-decision", json={"decision": "RETURNED", "comment": "Нужны доп. документы", "author": "Тестов Т.Т."})
    assert res.status_code == 200
    data = res.json()
    assert data["signalStatus"] == "RETURNED"
    assert data["complex"]["signalComment"] == "Нужны доп. документы"
    assert data["complex"]["signalUpdatedAt"] != "14.10.2026, 16:40"

    with SessionLocal() as db:
        signals = db.scalars(select(Signal).where(Signal.complex_id == "jk-1").order_by(Signal.id)).all()
        assert [s.status for s in signals] == ["draft", "returned"]
        assert signals[-1].reviewed_by == "Тестов Т.Т."
        assert signals[-1].reviewed_at is not None

    assert client.post("/api/v1/complexes/jk-1/signal-decision", json={"decision": "MAYBE"}).status_code == 400


def test_create_publication_is_stored(client):
    res = client.post("/api/v1/publications", json={
        "complexId": "jk-2",
        "platform": "Instagram",
        "phone": "+7 (777) 404-22-10",
        "rawText": "Платная бронь квартиры, депозит 300 000 тг",
        "pubDate": "15.10.2026",
        "status": "AI_HYPOTHESIS",
    })
    assert res.status_code == 200
    pub = res.json()["publication"]
    assert pub["id"] == "AD-113"
    assert pub["proposedFactor"] == "R2"
    assert pub["pubDate"] == "15.10.2026"
    # Гипотеза ИИ не меняет балл jk-2
    assert _complex(client, "jk-2")["riskProfile"]["score"] == 35

    feed = client.get("/api/v1/publications").json()
    assert feed[0]["id"] == "AD-113"
    with SessionLocal() as db:
        row = db.get(Publication, "AD-113")
        assert row.status == "pending_review"
        assert row.has_direct_payment_offer
        assert not row.is_demo
        assert db.scalar(select(AuditLog).where(AuditLog.entity_id == "AD-113")).action == "publication_create"


def test_confirmed_publication_adds_r2_and_r3(client):
    # jk-6: подтверждённых публикаций не было (5 баллов); подтверждённая бронь даёт R2 + R3
    res = client.post("/api/v1/publications", json={
        "complexId": "jk-6",
        "platform": "Krisha.kz",
        "rawText": "Платная бронь квартиры в КШТ Эко Квартал",
        "status": "CONFIRMED",
    })
    assert res.status_code == 200
    profile = _complex(client, "jk-6")["riskProfile"]
    assert (profile["score"], profile["zone"]) == (40, "YELLOW")
    with SessionLocal() as db:
        assert db.scalars(select(Signal).where(Signal.complex_id == "jk-6").order_by(Signal.id)).all()[-1].total_score == 40


def test_create_complex_is_stored(client):
    res = client.post("/api/v1/complexes", json={"name": "ЖК «Тест»", "developer": "ТОО «Тест-Демо»", "bin": "000000000000"})
    assert res.status_code == 200
    created = res.json()["complex"]
    assert created["id"] == "jk-9"
    assert created["legalBasisType"] == "UNVERIFIED"
    assert _complex(client, "jk-9")["riskProfile"]["score"] == 0
    assert client.get("/api/v1/health").json()["complexes_count"] == 9
