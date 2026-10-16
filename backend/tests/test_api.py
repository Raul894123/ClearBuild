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


def test_seed_scores_match_reference_cases(client):
    by_id = {c["id"]: c for c in client.get("/api/v1/complexes").json()}
    assert list(by_id) == [f"jk-{i}" for i in range(1, 9)]
    expected = {"jk-1": (70, "RED"), "jk-2": (35, "YELLOW"), "jk-3": (10, "GREEN"), "jk-5": (60, "YELLOW")}
    for cid, (score, zone) in expected.items():
        assert (by_id[cid]["riskProfile"]["score"], by_id[cid]["riskProfile"]["zone"]) == (score, zone)


def test_seed_stored_with_spec_values(client):
    with SessionLocal() as db:
        complexes = {c.id: c for c in db.scalars(select(Complex))}
        assert all(c.is_demo for c in complexes.values())
        assert complexes["jk-1"].legal_basis_type == "absent"
        assert complexes["jk-1"].verification_status == "violation_confirmed"
        assert complexes["jk-2"].legal_basis_type == "unknown"
        assert complexes["jk-2"].verification_status == "needs_check"
        assert complexes["jk-3"].legal_basis_type == "operator_guarantee"
        assert complexes["jk-8"].is_commissioned
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
    assert pubs["AD-101"]["capturedAt"] == "14.10.2026, 09:15 (Snapshot #101)"
    assert pubs["AD-108"]["status"] == "AI_HYPOTHESIS"


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

    feed = client.get("/api/v1/publications").json()
    assert feed[0]["id"] == "AD-113"
    with SessionLocal() as db:
        row = db.get(Publication, "AD-113")
        assert row.status == "pending_review"
        assert row.has_direct_payment_offer
        assert not row.is_demo
        assert db.scalar(select(AuditLog).where(AuditLog.entity_id == "AD-113")).action == "publication_create"


def test_create_complex_is_stored(client):
    res = client.post("/api/v1/complexes", json={"name": "ЖК «Тест»", "developer": "ТОО «Тест-Демо»", "bin": "000000000000"})
    assert res.status_code == 200
    created = res.json()["complex"]
    assert created["id"] == "jk-9"
    assert created["legalBasisType"] == "UNVERIFIED"
    assert _complex(client, "jk-9")["riskProfile"]["score"] == 0
    assert client.get("/api/v1/health").json()["complexes_count"] == 9
