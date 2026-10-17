"""11 государственных реестров РК (ТЗ2, Раздел 1): статусы сверки govChecks и импорт выгрузки Ashyq Data.

Статусы сверки:
  ok           — проверка пройдена (запись есть и не противоречит данным; для «негативных» реестров — РНУ,
                 налоговая задолженность — запись не найдена);
  warning      — найден индикатор риска или данные надо перепроверить;
  not_found    — обязательная запись в реестре не найдена;
  not_checked  — сверка не проводилась.

Статусы реестров правового основания (Homeportal, Qazreestr, Ashyq Data) всегда выводятся
из Complex.legal_basis_type, чтобы карточка не противоречила фактору R1. Остальные берутся
из Complex.gov_checks (демо-значения из seed.json, обновления при импорте).
"""

import csv
import io
import json
import re
from datetime import datetime
from typing import Any, Dict, Iterable, List, Optional, Tuple

from app.mappers import fmt_datetime, parse_datetime
from app.models import Complex

GOV_CHECK_STATUSES = ("ok", "warning", "not_found", "not_checked")

ASHYQ_DATASET_URL = "https://ashyq.data.gov.kz/dataset/magda-ds-b80110e9-218a-42ba-b8c8-01fa5e4c82c8"

# Порядок и состав — как в ТЗ2 (Раздел 1)
REGISTRIES: List[Dict[str, Any]] = [
    {"code": "homeportal", "name": "Жилищный портал КЖК (гарантии КЖК и разрешения МИО)",
     "url": "https://homeportal.kz", "factors": ["R1"]},
    {"code": "qazreestr", "name": "Qazreestr (реестр ДДУ и долевого строительства)",
     "url": "https://qazreestr.kz", "factors": ["R1"]},
    {"code": "ashyq_data", "name": "Ashyq Data (открытый набор разрешений МИО)",
     "url": ASHYQ_DATASET_URL, "factors": ["R1"]},
    {"code": "elicense", "name": "E-License (строительная лицензия СМР I–III категории)",
     "url": "https://elicense.kz", "factors": ["R1"]},
    {"code": "equrylys", "name": "eQurylys (реестр строительных компаний)",
     "url": "https://reestr.equrylys.kz/organizations", "factors": ["R1", "R5"]},
    {"code": "egkn", "name": "Публичная кадастровая карта ЕГКН (кадастровый номер, целевое назначение участка)",
     "url": "https://map.gov4c.kz/egkn/", "factors": ["R1"]},
    {"code": "egov", "name": "Портал eGov (регистрация ТОО по БИН)",
     "url": "https://egov.kz", "factors": []},
    {"code": "kgd", "name": "КГД МФ РК (налоговая задолженность застройщика)",
     "url": "https://kgd.gov.kz", "factors": ["R6"]},
    {"code": "rsp", "name": "Реестр субъектов предпринимательства",
     "url": "https://rsp.gov.kz", "factors": []},
    {"code": "rnu", "name": "Реестр недобросовестных участников госзакупок (РНУ)",
     "url": "https://procurement.gov.kz/ru/registry/rnu", "factors": []},
    {"code": "data_egov", "name": "Открытые данные РК",
     "url": "https://data.egov.kz", "factors": []},
]
REGISTRY_CODES = [r["code"] for r in REGISTRIES]

# Статус реестров правового основания по legal_basis_type
LEGAL_BASIS_CHECKS: Dict[str, Dict[str, str]] = {
    "homeportal": {"operator_guarantee": "ok", "mio_permit": "ok", "unknown": "warning", "absent": "not_found"},
    "qazreestr": {"operator_guarantee": "ok", "mio_permit": "ok", "unknown": "warning", "absent": "not_found"},
    # При гарантии КЖК разрешение МИО не требуется — в наборе разрешений его и не ищем
    "ashyq_data": {"operator_guarantee": "not_checked", "mio_permit": "ok", "unknown": "warning", "absent": "not_found"},
}


def legal_basis_check_status(code: str, legal_basis_type: str) -> Optional[str]:
    """Статус реестра правового основания для legal_basis_type или None для прочих реестров."""
    table = LEGAL_BASIS_CHECKS.get(code)
    return table.get(legal_basis_type, "warning") if table else None


def gov_checks(c: Complex) -> List[Dict[str, Any]]:
    """Блок govChecks карточки ЖК: по строке на каждый из 11 реестров."""
    stored = c.gov_checks or {}
    result = []
    for reg in REGISTRIES:
        entry = stored.get(reg["code"]) or {}
        checked_at, _ = parse_datetime(entry.get("checkedAt"))
        if not checked_at:
            status = "not_checked"
        elif reg["code"] in LEGAL_BASIS_CHECKS:
            # Реестр правового основания показывает текущий legal_basis_type (в т.ч. после confirm-factor R1)
            status = legal_basis_check_status(reg["code"], c.legal_basis_type)
        else:
            status = entry.get("status") if entry.get("status") in GOV_CHECK_STATUSES else "not_checked"
        result.append({
            "code": reg["code"],
            "name": reg["name"],
            "url": reg["url"],
            "status": status,
            "checkedAt": fmt_datetime(checked_at),
            "factors": reg["factors"],
            "note": entry.get("note"),
        })
    return result


def seed_gov_checks(raw: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """govChecks из seed.json -> Complex.gov_checks (только известные реестры)."""
    out = {}
    for code, entry in (raw or {}).items():
        if code in REGISTRY_CODES and isinstance(entry, dict):
            checked_at, _ = parse_datetime(entry.get("checkedAt"))
            out[code] = {
                "status": entry.get("status", "not_checked"),
                "checkedAt": fmt_datetime(checked_at),
                "note": entry.get("note"),
            }
    return out


# --------------------------------------------------------------------------
# Импорт выгрузки Ashyq Data (CSV или JSON)
# --------------------------------------------------------------------------
# Колонки выгрузки и их синонимы (регистр и пробелы не важны)
COLUMN_ALIASES: Dict[str, Tuple[str, ...]] = {
    "bin": ("бин", "бин застройщика", "бин заказчика", "bin", "developer_bin", "customer_bin"),
    "name": ("наименование объекта", "название жк", "объект", "жк", "name", "object_name", "complex_name"),
    "developer": ("застройщик", "заказчик", "наименование застройщика", "developer", "customer"),
    "address": ("адрес", "адрес объекта", "address", "location"),
    "document_type": ("тип документа", "вид документа", "тип", "document_type", "doc_type"),
    "permit_number": ("номер разрешения", "номер документа", "номер", "permit_number", "doc_number"),
    "permit_date": ("дата выдачи", "дата разрешения", "дата документа", "permit_date", "issue_date", "doc_date"),
    "status": ("статус", "статус разрешения", "status"),
    "issuer": ("орган выдачи", "выдавший орган", "issuer", "authority"),
    "legal_basis_type": ("legal_basis_type", "правовое основание"),
    "lat": ("широта", "lat", "latitude"),
    "lng": ("долгота", "lng", "lon", "longitude"),
}
_ALIAS_TO_FIELD = {alias: field for field, aliases in COLUMN_ALIASES.items() for alias in aliases}

_LEGAL_BASIS_VALUES = {"absent", "unknown", "operator_guarantee", "mio_permit", "commissioned"}


class ImportFormatError(ValueError):
    """Файл не разобран как CSV или JSON выгрузки."""


def _norm_key(key: Any) -> str:
    return re.sub(r"\s+", " ", str(key or "")).strip().lower().replace("ё", "е")


def normalize_row(raw: Dict[str, Any]) -> Dict[str, str]:
    """Строка выгрузки -> {поле: значение} по COLUMN_ALIASES; лишние колонки отбрасываются."""
    row: Dict[str, str] = {}
    for key, value in raw.items():
        field = _ALIAS_TO_FIELD.get(_norm_key(key))
        if field and value is not None and str(value).strip() and field not in row:
            row[field] = str(value).strip()
    return row


def _decode(content: bytes) -> str:
    for encoding in ("utf-8-sig", "cp1251"):
        try:
            return content.decode(encoding)
        except UnicodeDecodeError:
            continue
    raise ImportFormatError("Не удалось определить кодировку файла (ожидается UTF-8 или Windows-1251)")


def _json_records(data: Any) -> List[Dict[str, Any]]:
    """Список записей: массив, {"records": [...]}, {"data": [...]} или {"result": {"records": [...]}} (CKAN/Magda)."""
    if isinstance(data, dict):
        for key in ("records", "data", "items", "result"):
            if key in data:
                return _json_records(data[key])
        raise ImportFormatError("В JSON нет массива записей (records / data / items / result.records)")
    if not isinstance(data, list) or not all(isinstance(r, dict) for r in data):
        raise ImportFormatError("JSON должен быть массивом объектов-записей")
    return data


def _csv_records(text: str) -> List[Dict[str, Any]]:
    header = text.lstrip().splitlines()[0] if text.strip() else ""
    delimiter = max((";", ",", "\t"), key=header.count)
    reader = csv.DictReader(io.StringIO(text.lstrip()), delimiter=delimiter)
    if not reader.fieldnames or not any(_norm_key(f) in _ALIAS_TO_FIELD for f in reader.fieldnames):
        raise ImportFormatError("В заголовке CSV нет колонок выгрузки Ashyq Data (БИН, Наименование объекта, ...)")
    return list(reader)


def parse_export(content: bytes, fmt: Optional[str] = None) -> List[Dict[str, Any]]:
    """Разбирает выгрузку. fmt: csv | json | None (определить по содержимому)."""
    text = _decode(content)
    if not text.strip():
        raise ImportFormatError("Пустой файл")
    if fmt is None:
        fmt = "json" if text.lstrip()[0] in "[{" else "csv"
    if fmt == "json":
        try:
            return _json_records(json.loads(text))
        except json.JSONDecodeError as e:
            raise ImportFormatError(f"Некорректный JSON: {e}") from e
    return _csv_records(text)


def normalize_bin(value: Optional[str]) -> Optional[str]:
    """БИН — 12 цифр; «240540099102 (Демо)» -> «240540099102»."""
    m = re.search(r"\d{12}", re.sub(r"[\s-]", "", value or ""))
    return m.group(0) if m else None


def _norm_name(value: str) -> str:
    value = value.lower().replace("ё", "е")
    value = re.sub(r"^\s*(жк|жилой комплекс|ж\.к\.)\s+", "", value)
    return re.sub(r"[^\w]+", " ", value).strip()


def name_variants(name: Optional[str]) -> set:
    """Варианты названия ЖК: целиком, в кавычках «...» и в скобках (латиница)."""
    if not name:
        return set()
    parts = [name] + re.findall(r"[«\"“]([^»\"”]+)[»\"”]", name) + re.findall(r"\(([^)]+)\)", name)
    parts.append(re.sub(r"\([^)]*\)", "", name))
    return {v for v in (_norm_name(p) for p in parts) if v}


def legal_basis_from_row(row: Dict[str, str]) -> Tuple[Optional[str], bool]:
    """(legal_basis_type, is_commissioned) по строке выгрузки или (None, False), если не определить."""
    explicit = (row.get("legal_basis_type") or "").strip().lower()
    if explicit in _LEGAL_BASIS_VALUES:
        return ("mio_permit", True) if explicit == "commissioned" else (explicit, False)

    status = (row.get("status") or "").lower()
    if re.search(r"отозван|аннулир|отменен|прекращ|revoked|cancel", status):
        return "absent", False
    if re.search(r"приостанов|на рассмотрении|suspend|pending", status):
        return "unknown", False

    doc = (row.get("document_type") or "").lower()
    if re.search(r"гарант|guarantee", doc):
        return "operator_guarantee", False
    if re.search(r"ввод|эксплуатац|commission", doc):
        return "mio_permit", True
    if re.search(r"разрешен|permit|постановлен", doc) or row.get("permit_number"):
        return "mio_permit", False
    return None, False


def describe_row(row: Dict[str, str]) -> str:
    """Источник для verification_source: «Ashyq Data: Разрешение МИО № ... от ... (Действует)»."""
    parts = [row.get("document_type") or "Запись"]
    if row.get("permit_number"):
        parts.append(f"№ {row['permit_number']}")
    if row.get("permit_date"):
        parts.append(f"от {row['permit_date']}")
    text = "Ashyq Data: " + " ".join(parts)
    if row.get("status"):
        text += f" ({row['status']})"
    if row.get("issuer"):
        text += f", {row['issuer']}"
    return text


def match_complex(row: Dict[str, str], complexes: Iterable[Complex]) -> Tuple[Optional[Complex], str, Optional[str]]:
    """Сопоставление строки с ЖК: сначала по БИН, затем по названию.

    Возвращает (ЖК, способ: bin | bin+name | name | none, причина пропуска при неоднозначности).
    """
    complexes = list(complexes)
    row_bin = normalize_bin(row.get("bin"))
    row_names = name_variants(row.get("name"))

    def by_name(items):
        return [c for c in items if row_names & name_variants(c.name)]

    by_bin = [c for c in complexes if row_bin and normalize_bin(c.developer_bin) == row_bin]
    if by_bin:
        if len(by_bin) == 1:
            other = [c for c in by_name(complexes) if c not in by_bin]
            if row_names and not by_name(by_bin) and other:
                return None, "none", f"БИН указывает на {by_bin[0].id}, а название — на {other[0].id}"
            return by_bin[0], "bin", None
        named = by_name(by_bin)
        if len(named) == 1:
            return named[0], "bin+name", None
        ids = ", ".join(c.id for c in (named or by_bin))
        return None, "none", f"По БИН найдено несколько ЖК ({ids}), название их не различает"

    named = by_name(complexes)
    if len(named) == 1:
        return named[0], "name", None
    if len(named) > 1:
        return None, "none", f"Название подходит к нескольким ЖК ({', '.join(c.id for c in named)})"
    return None, "none", None


def checked_entry(status: str, at: datetime, note: str) -> Dict[str, Any]:
    return {"status": status, "checkedAt": fmt_datetime(at), "note": note}
