import os
import sys
import tempfile
from pathlib import Path

# Обеспечиваем корректный импорт app.* при запуске pytest из любого каталога
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# Тесты работают на отдельной временной БД, рабочий clearbuild_demo.db не трогаем.
# Переменная должна быть выставлена до первого импорта app.db.
_TEST_DB = Path(tempfile.mkdtemp(prefix="clearbuild_test_")) / "test.db"
os.environ["BACKEND_DB_URL"] = f"sqlite:///{_TEST_DB.as_posix()}"
