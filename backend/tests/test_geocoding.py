import pytest
from app.geocoding import geocode_address, svg_pos_from_coords


def test_geocode_satpayev_9():
    coords = geocode_address("ул. Сатпаева, 9 (мкр. Защита)")
    assert coords == [49.8980, 82.6236]
    coords2 = geocode_address("пр. Каныша Сатпаева, 9 (район КШТ)")
    assert coords2 == [49.8980, 82.6236]


def test_geocode_satpayev_avenue():
    assert geocode_address("пр. Сатпаева, 88") == [49.9095, 82.6190]
    assert geocode_address("пр. Каныша Сатпаева, 34") == [49.9051, 82.6195]
    assert geocode_address("пр. Каныша Сатпаева, 62") == [49.9295, 82.6176]


def test_geocode_other_districts():
    assert geocode_address("ул. Пермитина, 11 (мкр. Стрелка)") == [49.9464, 82.5989]
    assert geocode_address("ул. Жибек Жолы, 1") == [49.9296, 82.6160]
    assert geocode_address("ул. Астана, 32") == [49.9561, 82.6265]
    assert geocode_address("ул. Бажова, 110") == [49.9653, 82.5990]
    assert geocode_address("ул. Казыбек Би, 5") == [49.8954, 82.6148]
    assert geocode_address("ул. Абая, 5") == [49.9520, 82.6100]
    assert geocode_address("ул. Кокчетавская, 25") == [49.9772, 82.5703]


def test_geocode_empty_or_unknown():
    default_coords = [49.9490, 82.6200]
    assert geocode_address(None) == default_coords
    assert geocode_address("") == default_coords
    assert geocode_address("г. Усть-Каменогорск, ул. Неизвестная") == default_coords


def test_svg_pos_resolution():
    pos = svg_pos_from_coords([49.8980, 82.6236], "пр. Каныша Сатпаева, 9")
    assert pos["x"] == 605 and pos["y"] == 395
    pos_def = svg_pos_from_coords(None)
    assert "x" in pos_def and "y" in pos_def
