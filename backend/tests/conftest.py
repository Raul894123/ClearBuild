import os
import sys
import tempfile
from pathlib import Path

import pytest

# Обеспечиваем корректный импорт app.* при запуске pytest из любого каталога
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# Тесты работают на отдельной временной БД, рабочий clearbuild_demo.db не трогаем.
# Переменная должна быть выставлена до первого импорта app.db.
_TEST_DB = Path(tempfile.mkdtemp(prefix="clearbuild_test_")) / "test.db"
os.environ["BACKEND_DB_URL"] = f"sqlite:///{_TEST_DB.as_posix()}"


@pytest.fixture(scope="module")
def client():
    """TestClient на свежей БД: каждый модуль тестов начинает с чистого сида."""
    from fastapi.testclient import TestClient

    from app.db import Base, engine
    from app.main import app

    Base.metadata.drop_all(engine)
    with TestClient(app) as c:  # lifespan -> init_db() создаёт таблицы и заливает сид
        yield c
