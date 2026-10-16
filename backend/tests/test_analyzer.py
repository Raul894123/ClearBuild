"""Пункт 4: /analyze и POST /publications. Данные — сид из backend/seed.json (свежая БД на модуль)."""

import json
from pathlib import Path

import pytest
from sqlalchemy import select

from app.analyzer import confidence_for, normalize_phone
from app.db import SessionLocal
from app.models import Publication

SEED = json.loads((Path(__file__).resolve().parent.parent / "seed.json").read_text(encoding="utf-8"))
SHARED_PHONE = "+7 (705) 999-00-11"  # jk-1, jk-4, jk-5


def analyze(client, **body):
    res = client.post("/api/v1/analyze", json=body)
    assert res.status_code == 200, res.text
    return res.json()


def factors(result):
    return [h["factor"] for h in result["hypotheses"]]


# --------------------------------------------------------------------------
# Определение ЖК
# --------------------------------------------------------------------------
def test_unknown_complex_is_null_not_jk1(client):
    r = analyze(client, text="Продажа квартир в новом доме, платная бронь 200 000 тг", complex_id="AUTO")
    assert r["complexId"] is None
    assert r["matchedComplexId"] is None
    assert r["complexName"] == "ЖК не определён"
    assert r["scorePreview"] is None
    assert r["phoneCollisions"] == []
    assert factors(r) == ["R2", "R3"]


def test_complex_matched_by_name(client):
    r = analyze(client, text="Квартиры в ЖК «Сатпаев Сити Парк», платная бронь")
    assert (r["complexId"], r["matchedBy"]) == ("jk-2", "name")


def test_complex_matched_by_unique_phone_and_account(client):
    assert analyze(client, text="Квартиры от застройщика", phone="+7 (701) 555-88-99")["complexId"] == "jk-6"
    r = analyze(client, text="Пишите в директ @irtysh_plaza_official, квартиры по ДДУ")
    assert (r["complexId"], r["matchedBy"]) == ("jk-7", "account")


def test_shared_phone_does_not_pick_a_complex(client):
    r = analyze(client, text="Квартиры от застройщика, звоните", phone=SHARED_PHONE)
    assert r["complexId"] is None
    assert r["candidates"] == ["jk-1", "jk-4", "jk-5"]
    assert [c["id"] for c in r["phoneCollisions"]] == ["jk-1", "jk-4", "jk-5"]


def test_explicit_complex_id(client):
    r = analyze(client, text="Квартиры в продаже", complex_id="jk-3")
    assert (r["complexId"], r["matchedBy"]) == ("jk-3", "complex_id")
    assert client.post("/api/v1/analyze", json={"text": "x", "complex_id": "jk-404"}).status_code == 404


# --------------------------------------------------------------------------
# Несколько факторов одновременно
# --------------------------------------------------------------------------
def test_finds_r2_r3_r5_at_once(client):
    # jk-1: подтверждённая готовность 30%, в объявлении 65% -> разница 35 п.п.
    r = analyze(client, text="ЖК «Ертіс Рівер Тауэрс»: готовность уже 65%! Внесите платный депозит 500 000 тг по договору бронирования.")
    assert r["complexId"] == "jk-1"
    assert factors(r) == ["R2", "R3", "R5"]
    r5 = next(h for h in r["hypotheses"] if h["factor"] == "R5")
    assert r["readinessClaim"]["gap"] == 35
    assert "65%" in r5["quote"]
    for h in r["hypotheses"]:
        assert h["triggers"] and h["quote"] and h["explanation"]
        assert all({"text", "strength", "source", "start", "end"} <= set(t) for t in h["triggers"])


@pytest.mark.parametrize("pub", SEED["publications"], ids=[p["id"] for p in SEED["publications"]])
def test_seed_texts_match_seed_flags(client, pub):
    r = analyze(client, text=pub["text"], phone=pub["phone"])
    assert r["complexId"] == pub["complexId"]
    found = factors(r)
    if pub["isActivePreCommissioningAd"]:
        assert "R3" in found
    else:
        assert "R3" not in found
    if pub["hasDirectPaymentOffer"]:
        assert "R2" in found


def test_ddu_text_is_not_r2(client):
    r = analyze(client, text="Продажа квартир исключительно по ДДУ через уполномоченный банк, гарантия АО «КЖК».")
    assert "R2" not in factors(r)
    assert {s["pattern"] for s in r["safeSignals"]} == {"ddu", "bank", "guarantee"}


def test_before_ddu_is_not_a_safe_signal(client):
    r = analyze(client, text="Внесите депозит до ДДУ")
    assert r["safeSignals"] == []
    assert "R2" in factors(r)


def test_commissioned_complex_gets_no_r3(client):
    r = analyze(client, text="Продажа квартир, рассрочка", complex_id="jk-8")
    assert "R3" not in factors(r)
    r = analyze(client, text="Дом сдан! Продажа квартир, ключи в день сделки")
    assert "R3" not in factors(r)
    assert any("сданного дома" in n for n in r["notes"])


# --------------------------------------------------------------------------
# R5: направленно, порог 20, нужен ЖК
# --------------------------------------------------------------------------
@pytest.mark.parametrize("claimed, expected", [(49, False), (50, True), (10, False)])
def test_r5_threshold_and_direction(client, claimed, expected):
    # jk-1: подтверждено 30% -> 49 (19 п.п.) нет, 50 (20 п.п.) есть, 10 (ниже факта) нет
    r = analyze(client, text=f"Готовность {claimed}%", complex_id="jk-1")
    assert ("R5" in factors(r)) is expected
    assert r["readinessClaim"]["gap"] == claimed - 30


def test_r5_without_complex_is_only_a_note(client):
    r = analyze(client, text="Готовность дома 90%")
    assert "R5" not in factors(r)
    assert r["readinessClaim"]["claimedPct"] == 90
    assert any("сравнить не с чем" in n for n in r["notes"])


# --------------------------------------------------------------------------
# Уверенность
# --------------------------------------------------------------------------
def test_confidence_formula():
    assert [confidence_for(s) for s in (0, 1, 2, 3, 6, 9, 30)] == [0, 28, 49, 63, 86, 95, 97]


def test_confidence_grows_with_number_and_strength_of_triggers(client):
    weak = analyze(client, text="Бронь")["hypotheses"][0]
    strong = analyze(client, text="Депозит")["hypotheses"][0]
    many = analyze(client, text="Внесите депозит. Первоначальный взнос 30% в кассу застройщика")["hypotheses"][0]
    assert weak["factor"] == strong["factor"] == many["factor"] == "R2"
    assert (weak["confidence"], strong["confidence"]) == (49, 63)
    assert many["strength"] == 3 + 3 + 2 + 1  # депозит, взнос, касса, «внесите»
    assert many["confidence"] == confidence_for(9) == 95


def test_single_weak_trigger_is_not_a_hypothesis(client):
    r = analyze(client, text="Рассрочка")
    assert r["hypotheses"] == []
    assert r["proposedFactor"] is None
    assert r["confidence"] == 0


def test_safe_wording_lowers_r2_confidence(client):
    plain = analyze(client, text="Внесите депозит 300 000 тг")
    safe = analyze(client, text="Внесите депозит 300 000 тг, оформление по ДДУ")
    r2 = lambda r: next(h for h in r["hypotheses"] if h["factor"] == "R2")  # noqa: E731
    assert r2(safe)["strength"] == r2(plain)["strength"] - 2
    assert r2(safe)["confidence"] < r2(plain)["confidence"]


# --------------------------------------------------------------------------
# Телефоны
# --------------------------------------------------------------------------
def test_phone_collisions_exclude_matched_complex(client):
    r = analyze(client, text="ЖК «Нурлы Жол Оскемен», квартиры", phone=SHARED_PHONE)
    assert r["complexId"] == "jk-5"
    assert [c["id"] for c in r["phoneCollisions"]] == ["jk-1", "jk-4"]
    assert {"name", "contactPhone", "legalBasisType", "riskZone"} <= set(r["phoneCollisions"][0])


def test_phone_found_in_text_any_format(client):
    r = analyze(client, text="ЖК «Нурлы Жол Оскемен», звоните 8 705 999 00 11")
    assert r["phonesFound"] == ["7059990011"]
    assert [c["id"] for c in r["phoneCollisions"]] == ["jk-1", "jk-4"]
    assert normalize_phone("+7 (705) 999-00-11") == normalize_phone("87059990011") == "7059990011"


def test_unique_phone_has_no_collisions(client):
    assert analyze(client, text="ЖК «Сатпаев Сити Парк»", phone="+7 (777) 404-22-10")["phoneCollisions"] == []


# --------------------------------------------------------------------------
# Скриншот и OCR
# --------------------------------------------------------------------------
def test_ocr_text_is_analyzed_like_text(client):
    r = analyze(client, ocr_text="ЖК «Ульба Гарденс». Внесите 1 000 000 тг для резерва квартиры",
                screenshot_url="https://example.org/stories/107.png")
    assert r["complexId"] == "jk-4"
    assert r["analyzedSources"] == ["ocr"]
    assert r["screenshotUrl"] == "https://example.org/stories/107.png"
    assert "R2" in factors(r)
    assert all(t["source"] == "ocr" for h in r["hypotheses"] for t in h["triggers"])


def test_text_and_ocr_combined(client):
    r = analyze(client, text="ЖК «Ертіс Рівер Тауэрс», квартиры у реки", ocrText="Готовность объекта уже 65%")
    assert r["analyzedSources"] == ["text", "ocr"]
    assert "R5" in factors(r)
    assert r["readinessClaim"]["source"] == "ocr"


def test_empty_input_is_rejected(client):
    assert client.post("/api/v1/analyze", json={"text": "   "}).status_code == 422
    assert client.post("/api/v1/analyze", json={}).status_code == 422


# --------------------------------------------------------------------------
# Результат — гипотеза: балл не меняется
# --------------------------------------------------------------------------
def test_analysis_does_not_change_score(client):
    before = client.get("/api/v1/complexes/jk-5").json()["riskProfile"]
    r = analyze(client, text="ЖК «Нурлы Жол Оскемен»: внесите депозит 400 000 тг по договору резервирования")
    assert (r["aiHypothesis"], r["humanConfirmationRequired"], r["scoreImpact"]) == (True, True, 0)
    assert all(h["status"] == "AI_HYPOTHESIS" and h["points"] == 0 for h in r["hypotheses"])
    assert r["scorePreview"] == {"currentScore": 60, "currentZone": "YELLOW", "ifConfirmedScore": 85, "ifConfirmedZone": "RED"}
    after = client.get("/api/v1/complexes/jk-5").json()["riskProfile"]
    assert (after["score"], after["zone"]) == (before["score"], before["zone"]) == (60, "YELLOW")
    with SessionLocal() as db:
        assert len(db.scalars(select(Publication)).all()) == 12


# --------------------------------------------------------------------------
# POST /publications: поля как в сиде
# --------------------------------------------------------------------------
def test_create_publication_with_seed_fields(client):
    res = client.post("/api/v1/publications", json={
        "complexId": "jk-2", "platform": "Instagram", "account": "@satpayev_city_demo", "phone": "+7 (777) 404-22-10",
        "url": "https://instagram.com/p/demo", "text": "Платная бронь квартиры в ЖК «Сатпаев Сити Парк»",
        "pubDate": "15.10.2026", "capturedAt": "2026-10-15T11:30:00+05:00", "screenshotUrl": "https://example.org/s.png",
    })
    assert res.status_code == 200
    pub = res.json()["publication"]
    assert pub["text"] == "Платная бронь квартиры в ЖК «Сатпаев Сити Парк»"
    assert pub["pubDate"] == "15.10.2026"
    assert pub["capturedAt"] == "2026-10-15T11:30:00+05:00"
    assert pub["screenshotUrl"] == "https://example.org/s.png"
    assert pub["status"] == "AI_HYPOTHESIS"
    assert set(SEED["publications"][0]) - {"hasDirectPaymentOffer", "isActivePreCommissioningAd"} <= set(pub)
    with SessionLocal() as db:
        row = db.get(Publication, pub["id"])
        assert (row.has_direct_payment_offer, row.is_active_pre_commissioning_ad) == (True, True)


def test_create_publication_accepts_legacy_and_old_time_format(client):
    # Так шлёт фронтенд: rawText + date, время фиксации в старом формате
    res = client.post("/api/v1/publications", json={
        "complexId": "jk-3", "rawText": "Квартиры по ДДУ", "date": "14.10.2026", "capturedAt": "14.10.2026, 18:40",
    })
    pub = res.json()["publication"]
    assert (pub["text"], pub["pubDate"], pub["capturedAt"]) == ("Квартиры по ДДУ", "14.10.2026", "2026-10-14T18:40:00+05:00")


def test_create_publication_without_complex_only_suggests(client):
    res = client.post("/api/v1/publications", json={"text": "ЖК «Иртыш Плаза», квартиры по ДДУ", "status": "CONFIRMED"})
    pub = res.json()["publication"]
    assert pub["complexId"] is None
    assert res.json()["analysis"]["complexId"] == "jk-7"
    with SessionLocal() as db:
        assert db.get(Publication, pub["id"]).ai_hypothesis["suggestedComplexId"] == "jk-7"
    assert client.get("/api/v1/complexes/jk-7").json()["riskProfile"]["score"] == 10


def test_create_publication_from_ocr_only(client):
    res = client.post("/api/v1/publications", json={"complexId": "jk-6", "ocrText": "Депозит 100 000 тг", "screenshotUrl": "https://example.org/o.png"})
    assert res.status_code == 200
    assert res.json()["publication"]["text"] == "Депозит 100 000 тг"
    assert client.post("/api/v1/publications", json={"complexId": "jk-6"}).status_code == 422
