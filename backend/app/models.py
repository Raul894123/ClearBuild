"""ORM-модели ClearBuild · SAQ QURYLYS.

Имена колонок и значения перечислений — по ТЗ бэкенда (Раздел 2, snake_case):
  Complex.legal_basis_type:     mio_permit | operator_guarantee | absent | unknown
  Complex.verification_status:  verified | needs_check | violation_confirmed
  Publication.status:           pending_review | confirmed | rejected
  Signal.status:                draft | confirmed | returned
  Signal.risk_zone:             green | yellow | red
Перевод в значения, которые ждёт фронтенд (camelCase / UPPER_CASE), — в app/mappers.py.
"""

from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import JSON, Boolean, Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import TypeDecorator

from app.db import Base

# Время Усть-Каменогорска (ВКО), UTC+05:00
TZ = timezone(timedelta(hours=5), "+05:00")


def now() -> datetime:
    """Текущее время в поясе +05:00 без микросекунд."""
    return datetime.now(TZ).replace(microsecond=0)


def to_tz(value: datetime) -> datetime:
    """Наивное время считается временем +05:00, aware-время переводится в +05:00."""
    return value.replace(tzinfo=TZ) if value.tzinfo is None else value.astimezone(TZ)


class TZDateTime(TypeDecorator):
    """Хранит время ISO-строкой с поясом («2026-10-14T09:15:00+05:00»): SQLite сам пояс не сохраняет."""

    impl = String(32)
    cache_ok = True

    def process_bind_param(self, value: Optional[datetime], dialect) -> Optional[str]:
        return to_tz(value).isoformat(timespec="seconds") if value is not None else None

    def process_result_value(self, value: Optional[str], dialect) -> Optional[datetime]:
        return to_tz(datetime.fromisoformat(value)) if value else None


class Complex(Base):
    __tablename__ = "complexes"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    case_tag: Mapped[Optional[str]] = mapped_column(String(64))
    name: Mapped[str] = mapped_column(String(255))
    address: Mapped[Optional[str]] = mapped_column(String(255))
    lat: Mapped[float]
    lng: Mapped[float]
    svg_pos: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON)
    developer_name: Mapped[str] = mapped_column(String(255))
    developer_bin: Mapped[str] = mapped_column(String(64))
    stage: Mapped[Optional[str]] = mapped_column(String(255))

    # Готовность: заявленная (реклама) и подтверждённая (МИО / УГАСК), фактор R5
    stated_readiness: Mapped[Optional[int]]
    stated_readiness_source: Mapped[Optional[str]] = mapped_column(String(255))
    stated_readiness_date: Mapped[Optional[date]] = mapped_column(Date)
    verified_readiness: Mapped[Optional[int]]
    verified_readiness_source: Mapped[Optional[str]] = mapped_column(String(255))
    readiness_date: Mapped[Optional[date]] = mapped_column(Date)

    # Правовое основание, фактор R1
    legal_basis_type: Mapped[str] = mapped_column(String(32), default="unknown")
    legal_basis_text: Mapped[Optional[str]] = mapped_column(Text)
    verification_status: Mapped[str] = mapped_column(String(32), default="needs_check")
    verification_source: Mapped[Optional[str]] = mapped_column(Text)
    # Объект введён в эксплуатацию: legal_basis_type = mio_permit, в API — legalBasisType = COMMISSIONED
    is_commissioned: Mapped[bool] = mapped_column(Boolean, default=False)

    # Публикация, из которой взята заявленная готовность. Пока она не подтверждена, R5 — гипотеза ИИ.
    # Без внешнего ключа: complexes и publications ссылаются друг на друга.
    stated_readiness_publication_id: Mapped[Optional[str]] = mapped_column(String(32))

    has_collective_complaint: Mapped[bool] = mapped_column(Boolean, default=False)  # R4
    collective_complaint_source: Mapped[Optional[str]] = mapped_column(Text)
    has_significant_delay: Mapped[bool] = mapped_column(Boolean, default=False)  # R6
    delay_source: Mapped[Optional[str]] = mapped_column(Text)

    contact_phone: Mapped[Optional[str]] = mapped_column(String(64))
    sales_account: Mapped[Optional[str]] = mapped_column(String(255))

    # Решения аналитика через confirm-factor поверх данных:
    # {"R2": {"status": "CONFIRMED", "evidence": "...", "analyst": "...", "at": "2026-10-16T17:48:00+05:00"}}
    factor_overrides: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)

    is_demo: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(TZDateTime, default=now)
    updated_at: Mapped[datetime] = mapped_column(TZDateTime, default=now, onupdate=now)

    publications: Mapped[List["Publication"]] = relationship(back_populates="complex")
    signals: Mapped[List["Signal"]] = relationship(back_populates="complex", order_by="Signal.id")

    @property
    def current_signal(self) -> Optional["Signal"]:
        return self.signals[-1] if self.signals else None


class Publication(Base):
    __tablename__ = "publications"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    complex_id: Mapped[Optional[str]] = mapped_column(ForeignKey("complexes.id"))
    source_platform: Mapped[str] = mapped_column(String(64))
    account_name: Mapped[Optional[str]] = mapped_column(String(255))
    phone: Mapped[Optional[str]] = mapped_column(String(64))
    url: Mapped[Optional[str]] = mapped_column(String(512))
    published_at: Mapped[Optional[date]] = mapped_column(Date)
    captured_at: Mapped[datetime] = mapped_column(TZDateTime, default=now)
    # Пометка снимка, например «Snapshot #102 · OCR Stories»
    capture_note: Mapped[Optional[str]] = mapped_column(String(255))
    text_content: Mapped[str] = mapped_column(Text)
    screenshot_url: Mapped[Optional[str]] = mapped_column(String(512))
    # {"proposedFactor": "R2", "quote": "...", "confidence": 94}
    ai_hypothesis: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    status: Mapped[str] = mapped_column(String(32), default="pending_review")
    has_direct_payment_offer: Mapped[bool] = mapped_column(Boolean, default=False)  # R2
    is_active_pre_commissioning_ad: Mapped[bool] = mapped_column(Boolean, default=False)  # R3
    is_demo: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(TZDateTime, default=now)

    complex: Mapped[Optional[Complex]] = relationship(back_populates="publications")


class Signal(Base):
    """Сигнальная карточка. Каждое решение аналитика — новая строка, текущая — последняя."""

    __tablename__ = "signals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    complex_id: Mapped[str] = mapped_column(ForeignKey("complexes.id"))
    total_score: Mapped[int] = mapped_column(Integer, default=0)
    risk_zone: Mapped[str] = mapped_column(String(16), default="green")
    # [{"code": "R1", "points": 35, "evidence": "..."}]
    active_factors: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list)
    status: Mapped[str] = mapped_column(String(16), default="draft")
    comment: Mapped[Optional[str]] = mapped_column(Text)
    reviewed_by: Mapped[Optional[str]] = mapped_column(String(255))
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(TZDateTime)
    created_at: Mapped[datetime] = mapped_column(TZDateTime, default=now)

    complex: Mapped[Complex] = relationship(back_populates="signals")


class AuditLog(Base):
    __tablename__ = "audit_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    created_at: Mapped[datetime] = mapped_column(TZDateTime, default=now)
    actor: Mapped[str] = mapped_column(String(255))
    action: Mapped[str] = mapped_column(String(64))
    entity_type: Mapped[str] = mapped_column(String(32))
    entity_id: Mapped[str] = mapped_column(String(32))
    details: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
