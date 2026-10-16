"""Подключение к БД ClearBuild · SAQ QURYLYS (SQLAlchemy + SQLite).

URL берётся из переменной окружения BACKEND_DB_URL (см. .env.example),
по умолчанию — файл backend/clearbuild_demo.db.
"""

import os
from pathlib import Path
from typing import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

BACKEND_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DB_URL = f"sqlite:///{(BACKEND_DIR / 'clearbuild_demo.db').as_posix()}"
DB_URL = os.environ.get("BACKEND_DB_URL") or DEFAULT_DB_URL

engine = create_engine(
    DB_URL,
    connect_args={"check_same_thread": False} if DB_URL.startswith("sqlite") else {},
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_db() -> Iterator[Session]:
    """FastAPI-зависимость: одна сессия БД на запрос."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
