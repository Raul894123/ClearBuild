import pytest
from app.geocoding import geocode_address, geocode_address_online, svg_pos_from_coords


def test_geocode_satpayev_9():
    coords = geocode_address("ул. Сатпаева, 9 (мкр. Защита)")
    assert coords == [49.8980, 82.6236]
    coords2 = geocode_address("пр. Каныша Сатпаева, 9 (район КШТ)")
    assert coords2 == [49.8980, 82.6236]


def test_geocode_satpayev_avenue():
    assert geocode_address("пр. Сатпаева, 88") == [49.9095, 82.6190]
    assert geocode_address("пр. Каныша Сатпаева, 34") == [49.9051, 82.6195]
    assert geocode_address("пр. Каныша Сатпаева, 62") == [49.9295, 82.6176]


def test_geocode_kabanbay_batyr():
    # Проверка адреса из обращения пользователя: ул. Кабанбай Батыра 134
    coords = geocode_address("ул. Кабанбай Батыра 134")
    assert coords == [49.95207, 82.63645]
    assert coords != [49.9490, 82.6200]  # Не дефолтный центр/парк


def test_geocode_permitina_29():
    # Проверка адреса из обращения пользователя: ул. Пермитина, 29 (мкр. Стрелка)
    coords = geocode_address("ул. Пермитина, 29 (мкр. Стрелка)")
    assert coords == [49.94814, 82.63402]
    # Убеждаемся, что не спутано с акиматом (Пермитина 17: [49.9440, 82.6302])
    assert coords != [49.9440, 82.6302]


def test_geocode_other_districts():
    assert geocode_address("ул. Пермитина, 11 (мкр. Стрелка)") == [49.9464, 82.5989]
    assert geocode_address("ул. Жибек Жолы, 1") == [49.9296, 82.6160]
    assert geocode_address("ул. Астана, 32") == [49.9561, 82.6265]
    assert geocode_address("ул. Бажова, 110") == [49.9653, 82.5990]
    assert geocode_address("ул. Казыбек Би, 5") == [49.8954, 82.6148]
    assert geocode_address("ул. Абая, 5") == [49.9520, 82.6100]
    assert geocode_address("ул. Кокчетавская, 25") == [49.9772, 82.5703]
    assert geocode_address("ул. Максима Горького, 21") == [49.9463, 82.6303]


def test_geocode_empty_or_unknown():
    default_coords = [49.9490, 82.6200]
    assert geocode_address(None) == default_coords
    assert geocode_address("") == default_coords
    assert geocode_address("г. Усть-Каменогорск, ул. Неизвестная") == default_coords


def test_geocode_online_fallback():
    coords, svg_pos, source = geocode_address_online("ул. Кабанбай Батыра 134", timeout=1.0)
    assert len(coords) == 2
    assert 49.80 <= coords[0] <= 50.15
    assert 82.40 <= coords[1] <= 82.90
    assert "x" in svg_pos and "y" in svg_pos
    assert source in ("osm_nominatim", "offline_dictionary")


def test_svg_pos_resolution():
    pos = svg_pos_from_coords([49.8980, 82.6236], "пр. Каныша Сатпаева, 9")
    assert pos["x"] == 605 and pos["y"] == 395
    pos_def = svg_pos_from_coords(None)
    assert "x" in pos_def and "y" in pos_def
