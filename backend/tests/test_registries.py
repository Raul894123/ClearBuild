"""govChecks по 11 госреестрам, импорт выгрузки Ashyq Data и редиректы на /docs."""

import json
from pathlib import Path
from types import SimpleNamespace

import pytest

from app.registries import (
    LEGAL_BASIS_CHECKS,
    REGISTRY_CODES,
    ImportFormatError,
    legal_basis_from_row,
    match_complex,
    normalize_row,
    parse_export,
)

BACKEND_DIR = Path(__file__).resolve().parent.parent
SAMPLES = BACKEND_DIR / "samples"
SEED = json.loads((BACKEND_DIR / "seed.json").read_text(encoding="utf-8"))
SEED_LEGAL = {"ABSENT": "absent", "UNVERIFIED": "unknown", "KZH_GUARANTEE": "operator_guarantee",
              "MIO_PERMIT": "mio_permit", "COMMISSIONED": "mio_permit"}

TZ2_URLS = {
    "homeportal": "https://homeportal.kz",
    "qazreestr": "https://qazreestr.kz",
    "ashyq_data": "https://ashyq.data.gov.kz/dataset/magda-ds-b80110e9-218a-42ba-b8c8-01fa5e4c82c8",
    "elicense": "https://elicense.kz",
    "equrylys": "https://reestr.equrylys.kz/organizations",
    "egkn": "https://map.gov4c.kz/egkn/",
    "egov": "https://egov.kz",
    "kgd": "https://kgd.gov.kz",
    "rsp": "https://rsp.gov.kz",
    "rnu": "https://procurement.gov.kz/ru/registry/rnu",
    "data_egov": "https://data.egov.kz",
}


def _checks(client, complex_id, prefix="/api/v1"):
    return {g["code"]: g for g in client.get(f"{prefix}/complexes/{complex_id}").json()["govChecks"]}


def _complex(client, complex_id):
    return client.get(f"/api/v1/complexes/{complex_id}").json()


# --------------------------------------------------------------------------
# govChecks в карточке ЖК (только чтение — до тестов импорта)
# --------------------------------------------------------------------------
@pytest.mark.parametrize("prefix", ["/api/v1", "/api"])
def test_gov_checks_block_has_11_registries(client, prefix):
    checks = client.get(f"{prefix}/complexes/jk-1").json()["govChecks"]
    assert [g["code"] for g in checks] == list(TZ2_URLS)
    for g in checks:
        assert set(g) == {"code", "name", "url", "status", "checkedAt", "factors", "note"}
        assert g["url"] == TZ2_URLS[g["code"]]
        assert g["status"] in ("ok", "warning", "not_found", "not_checked")
        assert g["name"]
    by_code = {g["code"]: g for g in checks}
    assert by_code["equrylys"]["factors"] == ["R1", "R5"]
    assert by_code["kgd"]["factors"] == ["R6"]
    assert by_code["egov"]["factors"] == []
    assert by_code["homeportal"]["checkedAt"] == "2026-10-14T10:00:00+05:00"


@pytest.mark.parametrize("item", SEED["complexes"], ids=lambda c: c["id"])
def test_seed_gov_checks_match_legal_basis(client, item):
    """Демо-статусы реестров правового основания в seed.json согласованы с legalBasisType, API отдаёт их же."""
    legal = SEED_LEGAL[item["legalBasisType"]]
    raw = item["govChecks"]
    assert set(raw) == set(REGISTRY_CODES)
    for code, table in LEGAL_BASIS_CHECKS.items():
        assert raw[code]["status"] == table[legal], (item["id"], code)
    api = _checks(client, item["id"])
    assert {code: g["status"] for code, g in api.items()} == {code: e["status"] for code, e in raw.items()}


def test_gov_checks_not_checked_has_no_date(client):
    checks = _checks(client, "jk-2")
    assert checks["egkn"]["status"] == "not_checked"
    assert checks["egkn"]["checkedAt"] is None
    assert checks["homeportal"]["status"] == "warning"  # unknown -> «Нужна проверка»


def test_complex_list_includes_gov_checks(client):
    items = client.get("/api/v1/complexes").json()
    for item in items:
        assert [g["code"] for g in item["govChecks"]] == REGISTRY_CODES
    jk1 = next(c for c in items if c["id"] == "jk-1")
    assert jk1["govChecks"] == _complex(client, "jk-1")["govChecks"]


def test_confirm_r1_moves_legal_registries_to_not_found(client):
    assert _checks(client, "jk-7")["ashyq_data"]["status"] == "ok"
    res = client.post("/api/v1/complexes/jk-7/confirm-factor", json={"factor": "R1", "status": "CONFIRMED"})
    assert res.status_code == 200
    checks = _checks(client, "jk-7")
    assert [checks[c]["status"] for c in LEGAL_BASIS_CHECKS] == ["not_found"] * 3
    assert checks["elicense"]["status"] == "ok"  # прочие реестры не меняются


# --------------------------------------------------------------------------
# Разбор выгрузки и сопоставление (без БД)
# --------------------------------------------------------------------------
def test_parse_csv_semicolon_and_aliases():
    rows = [normalize_row(r) for r in parse_export((SAMPLES / "ashyq_permits_sample.csv").read_bytes())]
    assert len(rows) == 5
    assert rows[0]["bin"] == "231140055219"
    assert rows[0]["name"] == "ЖК «Сатпаев Сити Парк»"
    assert rows[0]["status"] == "Действует"
    assert "bin" not in rows[2] and rows[2]["name"] == "Ertis River Towers"


def test_parse_csv_comma_cp1251():
    content = "BIN,Name,Document_Type,Status\n240140066501,KShT Eco Quarter,Разрешение,Действует\n".encode("cp1251")
    rows = [normalize_row(r) for r in parse_export(content)]
    assert rows == [{"bin": "240140066501", "name": "KShT Eco Quarter", "document_type": "Разрешение", "status": "Действует"}]


def test_parse_json_shapes_match_csv_sample():
    from_json = [normalize_row(r) for r in parse_export((SAMPLES / "ashyq_permits_sample.json").read_bytes())]
    from_csv = [normalize_row(r) for r in parse_export((SAMPLES / "ashyq_permits_sample.csv").read_bytes())]
    assert from_json == from_csv
    assert parse_export(b'[{"bin": "1"}]') == [{"bin": "1"}]
    assert parse_export(b'{"data": [{"bin": "1"}]}', "json") == [{"bin": "1"}]


@pytest.mark.parametrize("content, fmt", [
    (b"", None),
    (b"hello;world\n1;2\n", None),
    (b'{"foo": 1}', None),
    (b"[1, 2]", None),
    (b"{broken", "json"),
])
def test_parse_export_errors(content, fmt):
    with pytest.raises(ImportFormatError):
        parse_export(content, fmt)


@pytest.mark.parametrize("row, expected", [
    ({"document_type": "Разрешение на привлечение денег дольщиков", "status": "Действует"}, ("mio_permit", False)),
    ({"document_type": "Разрешение", "status": "Отозвано"}, ("unknown", False)),
    ({"document_type": "Разрешение", "status": "Приостановлено"}, ("unknown", False)),
    ({"document_type": "Гарантия Единого оператора КЖК"}, ("operator_guarantee", False)),
    ({"document_type": "Акт ввода в эксплуатацию"}, ("mio_permit", True)),
    ({"permit_number": "МИО-1"}, ("mio_permit", False)),
    ({"legal_basis_type": "Absent", "document_type": "Разрешение"}, ("unknown", False)),
    ({"status": "Действует"}, (None, False)),
])
def test_legal_basis_from_row(row, expected):
    assert legal_basis_from_row(row) == expected


def _fake(id_, name, bin_):
    return SimpleNamespace(id=id_, name=name, developer_bin=bin_)


FAKES = [
    _fake("a", "ЖК «Альфа» (Alpha)", "111111111111 (демо)"),
    _fake("b", "ЖК «Бета» (Beta)", "222222222222"),
    _fake("c", "ЖК «Гамма»", "222222222222"),
    _fake("d", "Дельта", "333333333333"),
    _fake("e", "ЖК «Дельта»", "444444444444"),
]


@pytest.mark.parametrize("row, expected_id, method, conflict", [
    ({"bin": "111111111111"}, "a", "bin", False),
    ({"bin": "1111 1111 1111", "name": "Совсем другое"}, "a", "bin", False),  # другого ЖК с таким названием нет
    ({"bin": "111111111111", "name": "Бета"}, None, "none", True),            # БИН и название указывают на разные ЖК
    ({"bin": "222222222222", "name": "Gamma"}, None, "none", True),            # два ЖК по БИН, название не различает
    ({"bin": "222222222222", "name": "ЖК Гамма"}, "c", "bin+name", False),
    ({"name": "Beta"}, "b", "name", False),
    ({"name": "жк «альфа»"}, "a", "name", False),
    ({"name": "Дельта"}, None, "none", True),                                  # название у двух ЖК
    ({"bin": "999999999999", "name": "Омега"}, None, "none", False),          # не найден -> создать
])
def test_match_complex(row, expected_id, method, conflict):
    found, matched_by, reason = match_complex(row, FAKES)
    assert (found.id if found else None, matched_by, reason is not None) == (expected_id, method, conflict)


# --------------------------------------------------------------------------
# POST /registries/import
# --------------------------------------------------------------------------
def test_import_csv_sample_multipart(client):
    before_jk2 = _complex(client, "jk-2")["riskProfile"]["score"]
    content = (SAMPLES / "ashyq_permits_sample.csv").read_bytes()
    res = client.post("/api/v1/registries/import", files={"file": ("ashyq_permits_sample.csv", content, "text/csv")})
    assert res.status_code == 200
    report = res.json()
    assert (report["total"], report["updated"], report["created"], report["unchanged"], report["skipped"]) == (5, 1, 1, 2, 1)
    rows = report["rows"]
    assert [r["action"] for r in rows] == ["updated", "unchanged", "unchanged", "created", "skipped"]
    assert (rows[0]["complexId"], rows[0]["matchedBy"], rows[0]["previousLegalBasisType"], rows[0]["legalBasisType"]) == \
        ("jk-2", "bin", "UNVERIFIED", "MIO_PERMIT")
    assert (rows[2]["complexId"], rows[2]["matchedBy"], rows[2]["legalBasisType"]) == ("jk-1", "name", "ABSENT")
    assert rows[4]["reason"]

    # jk-2: правовое основание из выгрузки, R1 по-прежнему 0 баллов, Ashyq Data — ok с новой датой
    jk2 = _complex(client, "jk-2")
    assert jk2["legalBasisType"] == "MIO_PERMIT"
    assert "ДЕМО-2026/215" in jk2["legalSource"]
    assert jk2["riskProfile"]["score"] == before_jk2
    ashyq = {g["code"]: g for g in jk2["govChecks"]}["ashyq_data"]
    assert ashyq["status"] == "ok" and ashyq["checkedAt"] != "2026-10-12T11:00:00+05:00"

    # Новый ЖК создан с unknown («Нужна проверка», R1 = 0)
    new_id = rows[3]["complexId"]
    created = _complex(client, new_id)
    assert created["name"] == "ЖК «Береке Сити»"
    assert created["bin"] == "250340012345"
    assert created["legalBasisType"] == "UNVERIFIED"
    assert created["isDemo"] is False
    assert created["riskProfile"]["score"] == 0
    assert created["signal"]["status"] == "PENDING_HUMAN"
    checks = {g["code"]: g for g in created["govChecks"]}
    assert checks["ashyq_data"]["status"] == "warning"
    assert checks["kgd"]["status"] == "not_checked"

    audit = client.get("/api/v1/audit-log?limit=1").json()[0]
    assert (audit["action"], audit["entityId"]) == ("registry_import", "ashyq_data")
    assert (audit["details"]["updated"], audit["details"]["created"]) == (1, 1)


def test_import_json_sample_raw_body_is_idempotent_for_matched(client):
    """Повторный импорт тем же файлом (JSON телом запроса, алиас /api): новый ЖК уже найден по БИН."""
    content = (SAMPLES / "ashyq_permits_sample.json").read_bytes()
    res = client.post("/api/registries/import", content=content, headers={"Content-Type": "application/json"})
    assert res.status_code == 200
    report = res.json()
    assert (report["updated"], report["created"], report["unchanged"], report["skipped"]) == (1, 0, 3, 1)
    berek = report["rows"][3]
    assert (berek["action"], berek["matchedBy"], berek["legalBasisType"]) == ("updated", "bin", "MIO_PERMIT")


def test_import_revoked_permit_needs_check_not_r1(client):
    before = _complex(client, "jk-6")["riskProfile"]["score"]
    assert before == 5
    csv = "БИН;Наименование объекта;Тип документа;Номер разрешения;Статус\n" \
          "240140066501;ЖК «КШТ Эко Квартал»;Разрешение на привлечение денег дольщиков;МИО-2026/18;Отозвано\n"
    res = client.post("/api/v1/registries/import?format=CSV", content=csv.encode("utf-8"),
                      headers={"Content-Type": "text/plain"})
    assert res.status_code == 200
    assert res.json()["updated"] == 1
    jk6 = _complex(client, "jk-6")
    # Импорт не подтверждает R1: отозванное разрешение — «Нужна проверка», баллы не меняются
    assert jk6["legalBasisType"] == "UNVERIFIED"
    assert "отозвано" in jk6["legalBasisText"].lower()
    r1 = next(f for f in jk6["riskProfile"]["factors"] if f["code"] == "R1")
    assert (r1["status"], r1["points"]) == ("UNVERIFIED", 0)
    assert (jk6["riskProfile"]["score"], jk6["riskProfile"]["zone"]) == (5, "GREEN")
    assert jk6["signal"]["totalScore"] == 5
    assert {g["code"]: g for g in jk6["govChecks"]}["homeportal"]["status"] == "warning"

    # R1 подтверждает аналитик: после confirm-factor 5 + 35 = 40, жёлтая зона
    res = client.post("/api/v1/complexes/jk-6/confirm-factor", json={"factor": "R1", "status": "CONFIRMED"})
    assert res.status_code == 200
    jk6 = _complex(client, "jk-6")
    assert jk6["legalBasisType"] == "ABSENT"
    assert (jk6["riskProfile"]["score"], jk6["riskProfile"]["zone"]) == (40, "YELLOW")


def test_import_conflicting_row_is_skipped(client):
    rows = [{"bin": "210340011844", "name": "Иртыш Плаза", "document_type": "Разрешение"}]  # БИН jk-3, название jk-7
    res = client.post("/api/v1/registries/import", json=rows)
    report = res.json()
    assert (report["skipped"], report["updated"], report["created"]) == (1, 0, 0)
    assert "jk-3" in report["rows"][0]["reason"] and "jk-7" in report["rows"][0]["reason"]
    assert _complex(client, "jk-3")["legalBasisType"] == "KZH_GUARANTEE"


@pytest.mark.parametrize("kwargs", [
    {"content": b"hello;world\n1;2\n", "headers": {"Content-Type": "text/csv"}},
    {"content": b"{broken", "headers": {"Content-Type": "application/json"}},
    {"content": b"", "headers": {"Content-Type": "text/csv"}},
])
def test_import_bad_file_returns_422(client, kwargs):
    assert client.post("/api/v1/registries/import", **kwargs).status_code == 422


def test_import_rejects_unknown_format(client):
    assert client.post("/api/v1/registries/import?format=xml", content=b"[]").status_code == 422


# --------------------------------------------------------------------------
# Редиректы на Swagger
# --------------------------------------------------------------------------
@pytest.mark.parametrize("path", ["/", "/api", "/api/v1"])
def test_root_paths_redirect_to_docs(client, path):
    res = client.get(path, follow_redirects=False)
    assert res.status_code in (302, 307)
    assert res.headers["location"] == "/docs"
    assert client.get(path).status_code == 200  # /docs отдаётся


def test_redirects_hidden_from_swagger(client):
    paths = client.get("/openapi.json").json()["paths"]
    assert not {"/", "/api", "/api/v1"} & set(paths)
    assert "/api/v1/registries/import" in paths
