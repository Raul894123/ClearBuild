"""Pydantic-модели запросов API. Перечисления валидируются через Literal (ошибка — 422).

Строковые перечисления принимаются в любом регистре: значение приводится к регистру Literal до проверки.
"""

from typing import Annotated, List, Literal, Optional

from pydantic import AliasChoices, BaseModel, BeforeValidator, Field


def _upper(v):
    return v.strip().upper() if isinstance(v, str) else v


def _lower(v):
    return v.strip().lower() if isinstance(v, str) else v


Upper = BeforeValidator(_upper)
Lower = BeforeValidator(_lower)

FactorCode = Annotated[Literal["R1", "R2", "R3", "R4", "R5", "R6"], Upper]
# AUTO снимает решение аналитика и возвращает расчёт по данным
FactorDecision = Annotated[Literal["CONFIRMED", "REJECTED", "NONE", "UNVERIFIED", "AI_HYPOTHESIS", "AUTO"], Upper]
# REJECTED — устаревший синоним RETURNED; draft (PENDING_HUMAN) решением аналитика не является
SignalDecision = Annotated[Literal["CONFIRMED", "RETURNED", "REJECTED"], Upper]
PublicationStatus = Annotated[Literal["AI_HYPOTHESIS", "PENDING_REVIEW", "CONFIRMED", "REJECTED"], Upper]
LegalBasis = Annotated[
    Literal["ABSENT", "UNVERIFIED", "IN_PROCESS", "KZH_GUARANTEE", "GUARANTEE", "MIO_PERMIT", "PERMIT", "COMMISSIONED"],
    Upper,
]
VerifyDecision = Annotated[Literal["accept", "reject"], Lower]
# ALL — значение фильтра «Все» на фронтенде
ZoneFilter = Annotated[Literal["red", "yellow", "green", "all"], Lower]
ImportFormat = Annotated[Literal["csv", "json"], Lower]


class AnalyzeRequest(BaseModel):
    """Нужен хотя бы один из text / ocr_text."""

    text: Optional[str] = Field(None, description="Текст рекламного объявления")
    ocr_text: Optional[str] = Field(
        None, validation_alias=AliasChoices("ocr_text", "ocrText"),
        description="Текст, распознанный со скриншота (анализируется как текст, OCR на сервере нет)",
    )
    screenshot_url: Optional[str] = Field(
        None, validation_alias=AliasChoices("screenshot_url", "screenshotUrl"), description="Ссылка на скриншот",
    )
    phone: Optional[str] = Field(None, description="Контактный телефон отдела продаж")
    account: Optional[str] = Field(None, description="Аккаунт автора, например @oskemen_invest_flat")
    platform: Optional[str] = Field(None, description="Платформа размещения (Krisha.kz, Instagram, Telegram и т.д.)")
    complex_id: Optional[str] = Field(
        None, validation_alias=AliasChoices("complex_id", "complexId"),
        description="ID комплекса, если выбран вручную; AUTO или пусто — определить по тексту",
    )


class ConfirmFactorRequest(BaseModel):
    factor: FactorCode = Field(..., description="Код фактора риска R1–R6")
    status: FactorDecision = Field("CONFIRMED", description="CONFIRMED, REJECTED, NONE, UNVERIFIED, AI_HYPOTHESIS или AUTO")
    evidence: Optional[str] = Field(None, description="Обоснование решения аналитика")
    analyst: Optional[str] = Field("Ахметов Д.К. (Аналитик МИО)", description="ФИО специалиста МИО")


class PublicationCreateRequest(BaseModel):
    """Поля как у публикаций в seed.json. rawText и date — устаревшие имена text и pubDate (их шлёт фронтенд)."""

    complexId: Optional[str] = Field(None, description="ID жилого комплекса (может быть пустым до привязки)")
    platform: str = Field("Krisha.kz", description="Платформа публикации")
    account: str = Field("Отдел продаж", description="Аккаунт автора")
    phone: str = Field("", description="Контактный телефон")
    url: str = Field("", description="URL адрес объявления")
    text: Optional[str] = Field(None, description="Текст публикации")
    pubDate: Optional[str] = Field(None, description="Дата публикации, ДД.ММ.ГГГГ или ISO; по умолчанию — сегодня")
    capturedAt: Optional[str] = Field(None, description="Время фиксации, ISO или «ДД.ММ.ГГГГ, ЧЧ:ММ»; по умолчанию — сейчас")
    screenshotUrl: Optional[str] = Field(None, description="Ссылка на скриншот")
    ocrText: Optional[str] = Field(None, description="Текст со скриншота: анализируется вместе с text")
    rawText: Optional[str] = Field(None, description="Устаревшее имя поля text")
    date: Optional[str] = Field(None, description="Устаревшее имя поля pubDate")
    status: PublicationStatus = Field("AI_HYPOTHESIS", description="AI_HYPOTHESIS (на проверке), CONFIRMED или REJECTED")
    hasDirectPaymentOffer: Optional[bool] = Field(None, description="Фактор R2; по умолчанию — по гипотезе ИИ")
    isActivePreCommissioningAd: Optional[bool] = Field(None, description="Фактор R3; по умолчанию — по тексту объявления")


class PublicationVerifyRequest(BaseModel):
    decision: VerifyDecision = Field(..., description="accept — принять гипотезу ИИ, reject — отклонить")
    analyst: Optional[str] = Field("Ахметов Д.К. (Аналитик МИО)", description="ФИО специалиста МИО")
    comment: Optional[str] = Field(None, description="Комментарий аналитика")


class SignalDecisionRequest(BaseModel):
    decision: SignalDecision = Field(..., description="CONFIRMED — подтвердить сигнал, RETURNED — вернуть на доработку")
    comment: Optional[str] = Field(None, description="Комментарий аналитика")
    author: Optional[str] = Field("Ахметов Д.К.", description="ФИО уполномоченного лица")


class ComplexCreateRequest(BaseModel):
    name: str = Field(..., description="Название жилого комплекса")
    developer: str = Field(..., description="Наименование застройщика")
    bin: str = Field(..., description="БИН организации")
    district: Optional[str] = Field("г. Усть-Каменогорск", description="Адрес или район")
    coords: Optional[List[float]] = Field([49.95, 82.61], description="Широта и долгота")
    stage: Optional[str] = Field("Строительно-монтажные работы", description="Стадия")
    legalBasisType: LegalBasis = Field("UNVERIFIED", description="Правовое основание")
