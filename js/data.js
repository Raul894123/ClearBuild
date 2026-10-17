// Centralized Data for SAQ QURYLYS / ClearBuild
// 100% Synchronized with backend/seed.json & SQLite evaluation (Section 5 & 7 TZ)
// Enriched with 11 State Registries Requisites & Contact Phones (Section 11 TZ)

const RAW_COMPLEXES = [
  {
    id: "jk-1",
    code: "CASE-B",
    caseTag: "Кейс B (Эталон ТЗ)",
    coords: [49.9440, 82.6302], // Verified parcel 17 on Permitin street / Strelka
    svgPos: { x: 350, y: 245 },
    names: { ru: "ЖК «Ертіс Рівер Тауэрс»", kz: "«Ертіс Рівер Тауэрс» ТК", en: "Ertis River Towers" },
    developers: { ru: "ТОО «ВостокСтройИнвест-Демо»", kz: "«ВостокСтройИнвест-Демо» ЖШС", en: "VostokStroyInvest-Demo LLP" },
    bin: "240540099102 (демо)",
    contactPhone: "+7 (705) 999-00-11",
    salesAccount: "@oskemen_invest_flat",
    cadastreNumber: "05:102:044:112",
    smrLicense: "ГСЛ №004921 от 14.03.2021 (II категория)",
    landPurpose: "Строительство многоэтажного жилого комплекса с паркингом",
    districts: { ru: "Стрелка / ул. Пермитина, уч. 17 (Набережная Славского)", kz: "Пермитин к-сі, 17 (Славский жағалауы, Ертіс)", en: "17 Permitin St (Slavsky Embankment)" },
    stages: { ru: "Возведение каркаса 3-го этажа из 16", kz: "16 қабаттың 3-қабатының қаңқасы", en: "3rd floor framework assembly out of 16" },
    readinessFact: 30,
    readinessDeclared: 65,
    declaredReadiness: { pct: 65, source: "Instagram @oskemen_invest_flat", date: "13.10.2026" },
    confirmedReadiness: { pct: 30, source: "Выездной мониторинг УГАСК ВКО №114", date: "08.10.2026" },
    legalStatus: "ABSENT",
    legalBasisType: "ABSENT",
    legalBasisText: "Установлено отсутствие правового основания",
    legalSource: "Официальный ответ ГУ «Управление ГАСК ВКО» №04-12/881 от 10.10.2026: разрешение МИО не выдавалось, договор гарантии АО «КЖК» отсутствует.",
    legalTexts: { ru: "Установлено отсутствие правового основания (нет разрешения МИО и гарантии КЖК)", kz: "ЖАО рұқсаты мен «ҚТҚ» АҚ кепілдігі жоқ", en: "No Akimat permit and no KZH guarantee" },
    legalDetails: {
      ru: "Официальный ответ ГУ «Управление ГАСК ВКО» №04-12/881 от 10.10.2026: разрешение МИО не выдавалось, договор гарантии АО «КЖК» отсутствует.",
      kz: "ШҚО МСҚБ №04-12/881 ресми жауабы: үлескерлер қаражатын тартуға рұқсат берілмеген. Қаражат жинау заңсыз.",
      en: "Official letter of GASK EKR No. 04-12/881: no permit issued. Raising funds is illegal."
    },
    signalStatus: "PENDING_HUMAN",
    signalAuthor: "Ахметов Д.К. (Ожидает подписи)",
    signalUpdatedAt: "14.10.2026, 16:40",
    signalComment: "Кейс B по ТЗ: подтверждены R1 (+35), R2 (+25) и R3 (+10) = 70 баллов (Красная зона). Имеется также ИИ-гипотеза по R5 (разница готовности 35 п.п.).",
    factors: {
      R1: { status: "CONFIRMED", weight: 35, evidence: { ru: "Ответ УГАСК ВКО №04-12/881 от 10.10.2026 и реестр АО «КЖК»: правовые основания для привлечения денег дольщиков отсутствуют.", kz: "ҚР «Тұрғын үй құрылысына үлестік қатысу туралы» Заңының 7-бабы бойынша негіз жоқ.", en: "No legal basis under Art. 7 of RK Shared Construction Act." } },
      R2: { status: "CONFIRMED", weight: 25, evidence: { ru: "Публикация AD-101 (Krisha.kz): прямое предложение внести платный депозит 500 000 ₸ и ПВ 20% в кассу до ДДУ.", kz: "AD-101 хабарландыруы: ҮҚШ жасалғанға дейін 500 000 ₸ депозит пен 20% жарна талап ету.", en: "Ad AD-101: demanding 500,000 KZT deposit and 20% down payment to cashier before contract." } },
      R3: { status: "CONFIRMED", weight: 10, evidence: { ru: "Активная таргетированная реклама продажи квартир на стадии строительства (AD-101).", kz: "Instagram (@oskemen_invest_flat) және Krisha.kz желілерінде белсенді сату жарнамасы.", en: "Active advertising of flats on Instagram and Krisha.kz." } },
      R4: { status: "NONE", weight: 15, evidence: { ru: "Зарегистрированных коллективных обращений в e-Otinish на 14.10.2026 не поступало.", kz: "e-Otinish арқылы шағым түспеген.", en: "No e-Otinish complaints recorded." } },
      R5: { status: "AI_HYPOTHESIS", weight: 10, evidence: { ru: "Гипотеза ИИ (92%, AD-102): в рекламе заявлена готовность 65%, тогда как по справке УГАСК №114 от 08.10.2026 фактическая готовность — 30% (разница 35 п.п.).", kz: "ЖИ дайындық айырмасын тапты: 65% мәлімделген, іс жүзінде — 30% (айырма 35 п.п.).", en: "AI detected readiness discrepancy: claimed 65%, verified 30% (35 pp delta)." } },
      R6: { status: "NONE", weight: 5, evidence: { ru: "Работы на площадке ведутся, простоя не зафиксировано.", kz: "Құрылыс тоқтамаған.", en: "No work stoppage." } }
    }
  },
  {
    id: "jk-2",
    code: "CASE-A",
    caseTag: "Кейс A (Эталон ТЗ)",
    coords: [49.9295, 82.6176], // Verified building parcel 88/2 on Satpayev Ave
    svgPos: { x: 585, y: 390 },
    names: { ru: "ЖК «Сатпаев Сити Парк»", kz: "«Сәтбаев Сити Парк» ТК", en: "Satpayev City Park" },
    developers: { ru: "ТОО «QazaqDomOskemen-Демо»", kz: "«QazaqDomOskemen-Демо» ЖШС", en: "QazaqDomOskemen-Demo LLP" },
    bin: "231140055219 (демо)",
    contactPhone: "+7 (777) 404-22-10",
    salesAccount: "@satpayev_city_demo",
    cadastreNumber: "05:102:055:219",
    smrLicense: "ГСЛ №008122 от 20.09.2022 (II категория)",
    landPurpose: "Строительство жилого комплекса с объектами обслуживания населения",
    districts: { ru: "пр. Каныша Сатпаева, уч. 88 (КШТ, р-н Дворца бракосочетаний)", kz: "Қаныш Сәтбаев даңғылы, 88-телім (КШТ)", en: "88 Satpayev Ave (KSHT District)" },
    stages: { ru: "Устройство фундамента / котлован", kz: "Қазаншұңқыр мен іргетас плитасын орнату", en: "Excavation and foundation slab laying" },
    readinessFact: 15,
    readinessDeclared: 20,
    declaredReadiness: { pct: 20, source: "Telegram @ukg_nedvizhimost", date: "12.10.2026" },
    confirmedReadiness: { pct: 15, source: "Фотофиксация МИО ВКО", date: "10.10.2026" },
    legalStatus: "UNVERIFIED",
    legalBasisType: "UNVERIFIED",
    legalBasisText: "Не проверено · Нужна проверка (0 баллов по R1)",
    legalSource: "Сведения в открытой выгрузке МИО отсутствуют; направлен межведомственный запрос №09-21/304 от 12.10.2026. По правилам Раздела 5 ТЗ «нет данных» НЕ считается R1.",
    legalTexts: { ru: "Не проверено · Нужна проверка (Запрос №09-21/304, 0 б. по R1)", kz: "Құқықтық мәртебе тексерілуде (№09-21/304 сұрауы)", en: "Legal status under formal review (Inquiry No. 09-21/304)" },
    legalDetails: {
      ru: "Сведения в открытой выгрузке МИО отсутствуют; направлен межведомственный запрос №09-21/304 от 12.10.2026. По правилам Раздела 5 ТЗ «нет данных» НЕ считается R1.",
      kz: "Ашық деректерде мәлімет жоқ. ТТ 5-бөлімі бойынша «дерек жоқ» жағдайында R1 берілмейді (0 ұпай).",
      en: "Missing from public registry. Per spec section 5, 'no data' gives 0 pts for R1 until confirmed."
    },
    signalStatus: "PENDING_HUMAN",
    signalAuthor: "Ахметов Д.К.",
    signalUpdatedAt: "14.10.2026, 15:20",
    signalComment: "Кейс A по ТЗ: правовое основание ещё на проверке (R1 = 0 б.), но зафиксирована платная бронь R2 (+25) и реклама R3 (+10) = 35 баллов (Жёлтая зона).",
    factors: {
      R1: { status: "UNVERIFIED", weight: 35, evidence: { ru: "Статус «Нужна проверка»: ожидание ответа МИО ВКО по запросу №09-21/304. Балл не начисляется (0 б.).", kz: "Мәртебе тексерілуде (0 ұпай).", en: "Under review (0 pts)." } },
      R2: { status: "CONFIRMED", weight: 25, evidence: { ru: "Публикация AD-103 (Telegram): «Платная бронь квартиры за 300 000 ₸ с фиксацией цены на стадии котлована».", kz: "AD-103 жарнамасы: «Шаршы метр бағасын бекітумен 300 000 ₸ брондау».", en: "Ad AD-103: '300,000 KZT booking to fix price per square meter'." } },
      R3: { status: "CONFIRMED", weight: 10, evidence: { ru: "Реклама строящегося ЖК в Telegram и Instagram (AD-103, AD-104).", kz: "@ukg_nedvizhimost Telegram арнасындағы жарнама.", en: "Classified promotion in @ukg_nedvizhimost Telegram channel." } },
      R4: { status: "NONE", weight: 15, evidence: { ru: "Обращений граждан не зафиксировано.", kz: "Шағымдар жоқ.", en: "No complaints." } },
      R5: { status: "NONE", weight: 10, evidence: { ru: "Разница готовности составляет 5 п.п. (менее порога в 20 п.п.).", kz: "Айырмашылық шектен аспайды (5 п.п.).", en: "Readiness delta within normal margin (5 pp)." } },
      R6: { status: "NONE", weight: 5, evidence: { ru: "Сроки в рамках начального этапа.", kz: "Жұмыс жүріп жатыр.", en: "Work in active progress." } }
    }
  },
  {
    id: "jk-3",
    code: "CASE-C",
    caseTag: "Кейс C (Эталон ТЗ)",
    coords: [49.9296, 82.6138], // Verified residential parcel on Zhibek Zholy 14
    svgPos: { x: 460, y: 365 },
    names: { ru: "ЖК «Алтай Премиум Резиденс»", kz: "«Алтай Премиум Резиденс» ТК", en: "Altai Premium Residence" },
    developers: { ru: "ТОО «AltaiBuildGroup-Демо»", kz: "«AltaiBuildGroup-Демо» ЖШС", en: "AltaiBuildGroup-Demo LLP" },
    bin: "210340011844 (демо)",
    contactPhone: "+7 (7232) 70-05-05",
    salesAccount: "@altaipremium_ukg",
    cadastreNumber: "05:102:012:891",
    smrLicense: "ГСЛ №001045 от 11.01.2018 (I категория)",
    landPurpose: "Строительство многоквартирного жилого дома с подземным паркингом",
    districts: { ru: "ул. Жибек Жолы, 14 (р-н Магнум, жилой сектор)", kz: "Жібек Жолы к-сі, 14", en: "14 Zhibek Zholy St" },
    stages: { ru: "Монтаж 8-го этажа из 12", kz: "8-қабатты тұрғызу, қасбет жұмыстары", en: "8th floor erection, exterior facade" },
    readinessFact: 58,
    readinessDeclared: 60,
    declaredReadiness: { pct: 60, source: "Официальный сайт застройщика", date: "11.10.2026" },
    confirmedReadiness: { pct: 58, source: "Отчёт инжиниринговой компании АО «КЖК»", date: "05.10.2026" },
    legalStatus: "KZH_GUARANTEE",
    legalBasisType: "KZH_GUARANTEE",
    legalBasisText: "Действующая гарантия Единого оператора (АО «КЖК»)",
    legalSource: "Договор о предоставлении гарантии АО «Казахстанская Жилищная Компания» №ГД-2026/049 от 15.05.2026 (проверено в реестре КЖК). По ст. 7 Закона РК отдельное разрешение МИО не требуется.",
    legalTexts: { ru: "Действующая гарантия Единого оператора АО «КЖК» №ГД-2026/049", kz: "«ҚТҚ» АҚ кепілдік шарты №ГД-2026/049", en: "KZH Guarantee Agreement No. GD-2026/049" },
    legalDetails: {
      ru: "Договор о предоставлении гарантии АО «Казахстанская Жилищная Компания» №ГД-2026/049 от 15.05.2026 (проверено в реестре КЖК). По ст. 7 Закона РК отдельное разрешение МИО не требуется.",
      kz: "Бірыңғай оператор «ҚТҚ» АҚ ресми тізіліміне енгізілген. Сатып алу заңмен толық қорғалған.",
      en: "Whitelisted by the Single Housing Operator KZH. Fully compliant and safe for buyers."
    },
    signalStatus: "CONFIRMED",
    signalAuthor: "Ахметов Д.К.",
    signalUpdatedAt: "14.10.2026, 14:10",
    signalComment: "Кейс C по ТЗ: действующая гарантия КЖК подтверждена (R1 = 0 б.), серого сбора денег нет (R2 = 0 б.), есть только обычная реклама строящегося ЖК R3 (+10) = 10 баллов (Зелёная зона).",
    factors: {
      R1: { status: "NONE", weight: 35, evidence: { ru: "Законное основание подтверждено: гарантия Единого оператора АО «КЖК» №ГД-2026/049. Отсутствие отдельного разрешения МИО не является нарушением.", kz: "ҚТҚ кепілдігі бар (0 ұпай).", en: "KZH Guarantee active (0 pts)." } },
      R2: { status: "NONE", weight: 25, evidence: { ru: "В рекламе (AD-105) указано оформление исключительно через ДДУ после регистрации в Казреестре.", kz: "Сұр сызбалар жоқ, ҮҚШ арқылы.", en: "No grey schemes, standard contract." } },
      R3: { status: "CONFIRMED", weight: 10, evidence: { ru: "Публикация AD-105 (Krisha.kz): штатная информационная реклама строящегося жилого комплекса.", kz: "ҚТҚ мемлекеттік кепілдік нөмірі көрсетілген заңды жарнама.", en: "Compliant advertising disclosing valid KZH guarantee license." } },
      R4: { status: "NONE", weight: 15, evidence: { ru: "Жалоб и обращений нет.", kz: "Шағымдар жоқ.", en: "No complaints." } },
      R5: { status: "NONE", weight: 10, evidence: { ru: "Заявленная готовность (60%) соответствует отчёту инжиниринговой компании (58%).", kz: "Дайындық кестеге сәйкес.", en: "Readiness on schedule." } },
      R6: { status: "NONE", weight: 5, evidence: { ru: "Строительство идёт по графику.", kz: "Құрылыс кідіріссіз.", en: "No delays." } }
    }
  },
  {
    id: "jk-4",
    code: "STAND-1",
    caseTag: "Красная · Макс. риск",
    coords: [49.9537, 82.5995], // Verified building 32 on Astana street
    svgPos: { x: 465, y: 215 },
    names: { ru: "ЖК «Ульба Гарденс»", kz: "«Үлбі Гарденс» ТК", en: "Ulba Gardens" },
    developers: { ru: "ТОО «УльбаИнвестГрупп-Демо»", kz: "«ҮлбіИнвестГрупп-Демо» ЖШС", en: "UlbaInvestGroup-Demo LLP" },
    bin: "220840077310 (демо)",
    contactPhone: "+7 (705) 999-00-11", // Shared umbrella contact with jk-1 and jk-5
    salesAccount: "@oskemen_invest_flat",
    cadastreNumber: "05:102:078:123",
    smrLicense: "ГСЛ №007341 от 05.06.2023 (II категория)",
    landPurpose: "Строительство жилого дома переменной этажности",
    districts: { ru: "ул. Астана, 32 (Набережная Ульбы, возле Дворца Спорта)", kz: "Астана к-сі, 32 (Үлбі жағалауы, Спорт сарайы)", en: "32 Astana St (Ulba Embankment, Sports Palace)" },
    stages: { ru: "Каркас на уровне 4-го этажа (работы остановлены)", kz: "4-қабат деңгейіндегі қаңқа (жұмыстар тоқтатылған)", en: "4th floor framework (works halted)" },
    readinessFact: 35,
    readinessDeclared: 80,
    declaredReadiness: { pct: 80, source: "OLX.kz и буклет отдела продаж", date: "09.10.2026" },
    confirmedReadiness: { pct: 35, source: "Акт осмотра МИО и УГАСК ВКО №89", date: "07.10.2026" },
    legalStatus: "ABSENT",
    legalBasisType: "ABSENT",
    legalBasisText: "Установлено отсутствие правового основания",
    legalSource: "Отказ МИО ВКО в выдаче разрешения №19-04/412 от 02.09.2026; гарантия КЖК отсутствует.",
    legalTexts: { ru: "Установлено отсутствие правового основания (отказ МИО №19-04/412)", kz: "Құқықтық негіздің жоқтығы анықталды (ЖАО бас тартуы №19-04/412)", en: "Absence of legal basis established (Akimat Refusal No. 19-04/412)" },
    legalDetails: {
      ru: "Отказ МИО ВКО в выдаче разрешения №19-04/412 от 02.09.2026; гарантия КЖК отсутствует. Все 6 факторов риска подтверждены (100 баллов).",
      kz: "ШҚО ЖАО рұқсат беруден бас тартуы №19-04/412; ҚТҚ кепілдігі жоқ. Барлық 6 тәуекел факторы расталды (100 ұпай).",
      en: "Akimat refusal No. 19-04/412 (02.09.2026); no KZH guarantee. All 6 risk factors confirmed (100 pts)."
    },
    signalStatus: "CONFIRMED",
    signalAuthor: "Ахметов Д.К. — Главный специалист МИО",
    signalUpdatedAt: "14.10.2026, 16:05",
    signalComment: "Критический сигнал (100 баллов): подтверждены все 6 факторов R1–R6, включая коллективное обращение дольщиков в e-Otinish и совпадение телефона отдела продаж с ЖК «Ертіс Рівер Тауэрс».",
    factors: {
      R1: { status: "CONFIRMED", weight: 35, evidence: { ru: "Официальный отказ МИО ВКО №19-04/412 от 02.09.2026; в реестре КЖК объект отсутствует.", kz: "ШҚО ЖАО рұқсат беруден бас тартуы №19-04/412; ҚТҚ кепілдігі жоқ.", en: "Akimat refusal No. 19-04/412; no KZH guarantee." } },
      R2: { status: "CONFIRMED", weight: 25, evidence: { ru: "Публикации AD-106, AD-107: сбор первоначального взноса 30% по «предварительным договорам инвестирования».", kz: "Алдын ала шарт бойынша кассаға 30% бастапқы жарна жинау.", en: "30% down payment deposit collected to cashier." } },
      R3: { status: "CONFIRMED", weight: 10, evidence: { ru: "Агрессивная реклама в OLX.kz и Instagram со скидками за наличный расчёт до ввода в эксплуатацию (AD-106, AD-107).", kz: "OLX.kz және Instagram желілеріндегі агрессивті жарнама.", en: "Aggressive ads on OLX.kz and Instagram." } },
      R4: { status: "CONFIRMED", weight: 15, evidence: { ru: "Коллективное обращение 14 граждан в системе e-Otinish №ЖТ-2026-089112 от 04.10.2026 о привлечении наличных средств.", kz: "e-Otinish арқылы 14 үлескердің ұжымдық шағымы.", en: "Collective petition of 14 citizens on e-Otinish." } },
      R5: { status: "CONFIRMED", weight: 10, evidence: { ru: "В рекламе заявлено 80% готовности (09.10.2026), по акту УГАСК №89 (07.10.2026) фактическая готовность — 35% (разница 45 п.п. >= 20 п.п.).", kz: "Жарнамада 80%, МСҚБ актісі бойынша — 35% (айырма 45 п.п.).", en: "Claimed 80%, fact 35% (45 pp discrepancy)." } },
      R6: { status: "CONFIRMED", weight: 5, evidence: { ru: "Документированный простой башенного крана более 4 месяцев; перенос заявленного срока сдачи с II кв. 2026 на IV кв. 2027.", kz: "Мұнаралы кран мен құрылыс алаңының 4 айдан астам тоқтап тұруы.", en: "Documented construction standstill exceeding 4 months." } }
    }
  },
  {
    id: "jk-5",
    code: "STAND-2",
    caseTag: "Граничный 60+ без R2",
    coords: [49.9999, 82.5646], // Verified building parcel 102 on Bazhov street
    svgPos: { x: 245, y: 145 },
    names: { ru: "ЖК «Нурлы Жол Оскемен»", kz: "«Нұрлы Жол Өскемен» ТК", en: "Nurly Zhol Oskemen" },
    developers: { ru: "ТОО «ШыгысМонолит-Демо»", kz: "«ШығысМонолит-Демо» ЖШС", en: "ShygysMonolit-Demo LLP" },
    bin: "200940033418 (демо)",
    contactPhone: "+7 (705) 999-00-11", // Shared umbrella contact with jk-1 and jk-4
    salesAccount: "@nurly_zhol_ukg",
    cadastreNumber: "05:102:033:991",
    smrLicense: "ГСЛ №003299 от 18.08.2020 (II категория)",
    landPurpose: "Строительство МЖД (производственная зона, требуется смена ПДП)",
    districts: { ru: "ул. Бажова, 102", kz: "Бажов к-сі, 102", en: "102 Bazhov St" },
    stages: { ru: "Кладка стен 5-го этажа", kz: "5-қабат қабырғаларын қалау", en: "5th floor wall masonry" },
    readinessFact: 45,
    readinessDeclared: 75,
    declaredReadiness: { pct: 75, source: "Instagram @nurly_zhol_ukg", date: "13.10.2026" },
    confirmedReadiness: { pct: 45, source: "Справка мониторинга МИО ВКО №67", date: "06.10.2026" },
    legalStatus: "ABSENT",
    legalBasisType: "ABSENT",
    legalBasisText: "Установлено отсутствие правового основания",
    legalSource: "По данным МИО ВКО от 01.10.2026 разрешение на привлечение средств дольщиков не оформлено.",
    legalTexts: { ru: "Разрешение отсутствует · Граничный кейс 60 б. без R2", kz: "Рұқсат жоқ · R2-сіз 60 ұпай шекаралық кейс", en: "No permit · Boundary 60 pts without confirmed R2" },
    legalDetails: {
      ru: "По данным МИО ВКО от 01.10.2026 разрешение на привлечение средств дольщиков не оформлено. Подтверждены R1(35)+R3(10)+R5(10)+R6(5) = 60 баллов (Жёлтая зона до подтверждения R2).",
      kz: "ШҚО МСҚБ қаражат тартуға тыйым салу туралы нұсқама берді. R2 расталғанға дейін Сары аймақта (60 ұпай).",
      en: "GASK EKR issued prohibition notice. 60 pts (Yellow zone until R2 is confirmed by human analyst)."
    },
    signalStatus: "PENDING_HUMAN",
    signalAuthor: "Ахметов Д.К.",
    signalUpdatedAt: "14.10.2026, 16:50",
    signalComment: "Демонстрация правила ТЗ: сейчас подтверждены R1(35)+R3(10)+R5(10)+R6(5) = 60 баллов, но без подтверждённого R2 объект остаётся в Жёлтой зоне! Если подтвердить ИИ-гипотезу по объявлению AD-108 (+25 б.), объект перейдёт в Красную зону (85 б.).",
    factors: {
      R1: { status: "CONFIRMED", weight: 35, evidence: { ru: "Справка МИО ВКО от 01.10.2026: разрешение на привлечение денег дольщиков отсутствует.", kz: "ШҚО ЖАО анықтамасы: үлескерлер қаражатын тартуға рұқсат жоқ.", en: "Akimat letter: no legal permit for equity funds." } },
      R2: { status: "AI_HYPOTHESIS", weight: 25, evidence: { ru: "Гипотеза ИИ (95%) по объявлению AD-108: найдена фраза «Внесите депозит 400 000 тг по договору резервирования сегодня». Ожидает подтверждения аналитиком!", kz: "ЖИ күдігі (95%): «400 000 ₸ депозит салыңыз». Сарапшының растауын күтуде!", en: "AI flag (95%): 'Pay 400,000 KZT deposit'. Awaiting human confirmation." } },
      R3: { status: "CONFIRMED", weight: 10, evidence: { ru: "Реклама продажи квартир в строящемся блоке Б (AD-108, AD-109).", kz: "Б блогында пәтер сату жарнамасы (AD-108, AD-109).", en: "Active promotion in block B (AD-108, AD-109)." } },
      R4: { status: "NONE", weight: 15, evidence: { ru: "Подтверждённых коллективных обращений нет.", kz: "Расталған ұжымдық шағым жоқ.", en: "No confirmed complaints." } },
      R5: { status: "CONFIRMED", weight: 10, evidence: { ru: "Заявлено в рекламе 75% (13.10.2026), подтверждено МИО 45% (06.10.2026) — расхождение 30 п.п. ≥ 20 п.п.", kz: "75% мәлімделген, 45% расталған (айырма 30 п.п.).", en: "Claimed 75%, confirmed 45% (30 pp discrepancy)." } },
      R6: { status: "CONFIRMED", weight: 5, evidence: { ru: "Зафиксировано отставание от графика строительства более чем на 6 месяцев.", kz: "Құрылыс кестесінен 6 айдан астам кешігу.", en: "Schedule delay exceeding 6 months." } }
    }
  },
  {
    id: "jk-6",
    code: "STAND-3",
    caseTag: "ИИ-гипотеза AD-110 · 5 баллов",
    coords: [49.8995, 82.6025], // Verified residential parcel in KShT
    svgPos: { x: 675, y: 425 },
    names: { ru: "ЖК «КШТ Эко Квартал»", kz: "«КШТ Эко Орамы» ТК", en: "KShT Eco Quarter" },
    developers: { ru: "ТОО «EcoStroyVKO-Демо»", kz: "«EcoStroyVKO-Демо» ЖШС", en: "EcoStroyVKO-Demo LLP" },
    bin: "240140066501 (демо)",
    contactPhone: "+7 (701) 555-88-99",
    salesAccount: "@ecostroy_vko",
    cadastreNumber: "05:102:090:111",
    smrLicense: "ГСЛ №006154 от 02.04.2022 (II категория)",
    landPurpose: "Строительство жилого комплекса (КШТ)",
    districts: { ru: "ул. Рыскулова / Казыбек би, 22 (КШТ)", kz: "Рысқұлов / Қазыбек би к-сі, 22 (КШТ)", en: "22 Ryskulov / Kazybek Bi St (KSHT)" },
    stages: { ru: "Фасадные работы и остекление", kz: "Қасбет жұмыстары және әйнектеу", en: "Facade works and glazing" },
    readinessFact: 65,
    readinessDeclared: 90,
    declaredReadiness: { pct: 90, source: "Krisha.kz объявление AD-110", date: "10.10.2026" },
    confirmedReadiness: { pct: 65, source: "Отчёт инжиниринга БВУ №41", date: "03.10.2026" },
    legalStatus: "MIO_PERMIT",
    legalBasisType: "MIO_PERMIT",
    legalBasisText: "Разрешение МИО ВКО + проект БВУ",
    legalSource: "Разрешение акимата г. Усть-Каменогорска №РД-2026/18 от 20.03.2026 (с участием банка второго уровня).",
    legalTexts: { ru: "Разрешение МИО ВКО №РД-2026/18 от 20.03.2026 + проект БВУ", kz: "ШҚО ЖАО рұқсаты №РД-2026/18 (20.03.2026)", en: "Akimat Permit No. RD-2026/18 (20.03.2026)" },
    legalDetails: {
      ru: "Разрешение акимата г. Усть-Каменогорска №РД-2026/18 от 20.03.2026 действует. По публикации AD-110 ожидает проверки ИИ-гипотеза о расхождении готовности (90% vs 65% по отчёту БВУ №41).",
      kz: "Өскемен қаласы әкімдігінің №РД-2026/18 рұқсаты бар. AD-110 хабарландыруы бойынша дайындық айырмасы (90% vs 65%) тексерілуде.",
      en: "Akimat Permit No. RD-2026/18 is active. AI hypothesis on AD-110 readiness gap (90% vs 65%) awaits analyst verification."
    },
    signalStatus: "PENDING_HUMAN",
    signalAuthor: "Ахметов Д.К.",
    signalUpdatedAt: "13.10.2026, 11:30",
    signalComment: "Разрешение МИО имеется (R1 = 0). Подтверждён перенос сроков сдачи (R6 +5 б. = 5 баллов, Зелёная зона). При подтверждении публикации AD-110 добавятся R3 (+10) и R5 (+10) → 25 баллов (Жёлтая зона).",
    factors: {
      R1: { status: "NONE", weight: 35, evidence: { ru: "Действующее разрешение МИО №РД-2026/18 от 20.03.2026 проверено.", kz: "№РД-2026/18 ЖАО рұқсаты жарамды.", en: "Valid Akimat Permit No. RD-2026/18 verified." } },
      R2: { status: "NONE", weight: 25, evidence: { ru: "Оплата принимается строго на спецсчёт в БВУ по зарегистрированным ДДУ.", kz: "Төлем тек ҮҚШ бойынша ЕДБ арнайы шотына қабылданады.", en: "Payments accepted strictly via registered DDU escrow account." } },
      R3: { status: "AI_HYPOTHESIS", weight: 10, evidence: { ru: "Гипотеза ИИ (AD-110) ждёт решения аналитика: 0 баллов.", kz: "ЖИ гипотезасы (AD-110) сарапшы шешімін күтуде: 0 ұпай.", en: "AI hypothesis (AD-110) awaiting analyst verification: 0 pts." } },
      R4: { status: "NONE", weight: 15, evidence: { ru: "Коллективных жалоб о незаконном сборе средств нет.", kz: "Шағымдар жоқ.", en: "No complaints." } },
      R5: { status: "AI_HYPOTHESIS", weight: 10, evidence: { ru: "Заявлено 90%, подтверждено 65%: разница 25 п.п. ≥ 20, но заявление взято из неподтверждённой публикации AD-110: гипотеза ИИ, 0 баллов.", kz: "Жарнамада 90% мәлімделген, іс жүзінде — 65% (AD-110 расталмаған, 0 ұпай).", en: "Claimed 90%, verified 65% (25 pp >= 20 pp), linked to unverified AD-110: AI hypothesis, 0 pts." } },
      R6: { status: "CONFIRMED", weight: 5, evidence: { ru: "Перенос планового ввода с III кв. 2026 на I кв. 2027 (простой подрядчика по фасадам).", kz: "Пайдалануға беру мерзімінің шегерілуі расталды.", en: "Confirmed schedule delay from Q3 2026 to Q1 2027." } }
    }
  },
  {
    id: "jk-7",
    code: "STAND-4",
    caseTag: "Зелёная · Норма",
    coords: [49.9507, 82.6318], // Verified building 72 on Kazakhstan street
    svgPos: { x: 430, y: 250 },
    names: { ru: "ЖК «Иртыш Плаза»", kz: "«Ертіс Плаза» ТК", en: "Irtysh Plaza" },
    developers: { ru: "ТОО «OskemenDevelopment-Демо»", kz: "«OskemenDevelopment-Демо» ЖШС", en: "OskemenDevelopment-Demo LLP" },
    bin: "190740022109 (демо)",
    contactPhone: "+7 (7232) 55-12-34",
    salesAccount: "@irtysh_plaza_official",
    cadastreNumber: "05:102:044:567",
    smrLicense: "ГСЛ №000871 от 19.11.2016 (I категория)",
    landPurpose: "Строительство многоквартирного жилого дома с офисными помещениями",
    districts: { ru: "ул. Казахстан, 72 (Центр города)", kz: "Қазақстан к-сі, 72 (Қала орталығы)", en: "72 Kazakhstan St (City Center)" },
    stages: { ru: "Внутренняя отделка и благоустройство", kz: "Ішкі әрлеу, абаттандыру", en: "Interior finishing, landscaping" },
    readinessFact: 82,
    readinessDeclared: 85,
    declaredReadiness: { pct: 85, source: "Krisha.kz AD-111", date: "12.10.2026" },
    confirmedReadiness: { pct: 82, source: "Мониторинг МИО ВКО", date: "09.10.2026" },
    legalStatus: "MIO_PERMIT",
    legalBasisType: "MIO_PERMIT",
    legalBasisText: "Разрешение МИО ВКО + проект БВУ",
    legalSource: "Разрешение МИО ВКО №РД-2025/94 от 14.11.2025, проверено в реестре Казреестра.",
    legalTexts: { ru: "Разрешение МИО ВКО №РД-2025/94 от 14.11.2025", kz: "ЖАО (әкімдік) рұқсаты №РД-2025/94 (14.11.2025)", en: "Akimat Permit No. RD-2025/94 (14.11.2025)" },
    legalDetails: {
      ru: "Разрешение МИО ВКО №РД-2025/94 от 14.11.2025, проверено в реестре Казреестра. Законно.",
      kz: "Өскемен қ. әкімдігінің үлескерлер қаражатын тартуға ресми рұқсаты бар. Заңды.",
      en: "Official Akimat permit granted for raising equity. Fully compliant."
    },
    signalStatus: "CONFIRMED",
    signalAuthor: "Ахметов Д.К.",
    signalUpdatedAt: "12.10.2026, 17:00",
    signalComment: "Плановый мониторинг: все реквизиты разрешения МИО указаны в рекламе корректно. Балл 10 (Зелёная зона).",
    factors: {
      R1: { status: "NONE", weight: 35, evidence: { ru: "Разрешение МИО №РД-2025/94 действующее.", kz: "№РД-2025/94 әкімдік рұқсаты жарамды.", en: "Akimat permit No. RD-2025/94 valid." } },
      R2: { status: "NONE", weight: 25, evidence: { ru: "Предложений серой брони или оплаты мимо ДДУ не обнаружено.", kz: "Барлық сату тек ҮҚШ бойынша.", en: "All sales via official contract." } },
      R3: { status: "CONFIRMED", weight: 10, evidence: { ru: "Штатная публикация AD-111 о продаже строящихся квартир.", kz: "Әкімдік рұқсатының нөмірі міндетті көрсетілген жарнама.", en: "Compliant marketing with permit license disclosed." } },
      R4: { status: "NONE", weight: 15, evidence: { ru: "Обращений нет.", kz: "Шағымдар жоқ.", en: "No complaints." } },
      R5: { status: "NONE", weight: 10, evidence: { ru: "Разница готовности 3 п.п. (85% vs 82%, в пределах нормы).", kz: "Дайындық расталды (85% vs 82%).", en: "Readiness confirmed (85% vs 82%)." } },
      R6: { status: "NONE", weight: 5, evidence: { ru: "Работы идут по графику.", kz: "Құрылыс аяқталуда.", en: "Finishing stage." } }
    }
  },
  {
    id: "jk-8",
    code: "STAND-5",
    caseTag: "Зелёная · 0 баллов",
    coords: [50.0293, 82.7385], // Verified building 15 on Yegorov in Nova Sogra
    svgPos: { x: 690, y: 115 },
    names: { ru: "ЖК «Согра Парк»", kz: "«Согра Саябағы» ТК", en: "Sogra Park" },
    developers: { ru: "ТОО «СограДомСтрой-Демо»", kz: "«СограДомСтрой-Демо» ЖШС", en: "SograDomStroy-Demo LLP" },
    bin: "180440088712 (демо)",
    contactPhone: "+7 (7232) 61-00-99",
    salesAccount: "@sogra_park_dom",
    cadastreNumber: "05:102:011:234",
    smrLicense: "ГСЛ №000512 от 12.05.2015 (I категория)",
    landPurpose: "Эксплуатация и обслуживание многоквартирного жилого дома",
    districts: { ru: "пос. Новая Согра, ул. Егорова, 15 (р-н ТМК)", kz: "Жаңа Согра кенті, Егоров к-сі, 15", en: "Nova Sogra, 15 Yegorov St" },
    stages: { ru: "Введён в эксплуатацию (Готовый дом)", kz: "Пайдалануға берілді (Дайын үй)", en: "Commissioned (Ready building)" },
    readinessFact: 100,
    readinessDeclared: 100,
    declaredReadiness: { pct: 100, source: "Krisha.kz AD-112", date: "01.10.2026" },
    confirmedReadiness: { pct: 100, source: "Акт приёмки объекта в эксплуатацию №АВ-2026/77", date: "25.09.2026" },
    legalStatus: "COMMISSIONED",
    legalBasisType: "COMMISSIONED",
    legalBasisText: "Объект введён в эксплуатацию (Акт зарегистрирован)",
    legalSource: "Акт ввода в эксплуатацию №АВ-2026/77 от 25.09.2026. Продажа готовых квартир по договорам купли-продажи.",
    legalTexts: { ru: "Объект введён в эксплуатацию (Акт №АВ-2026/77 от 25.09.2026)", kz: "Нысан пайдалануға берілді (№АВ-2026/77 актісі)", en: "Commissioned (Handover Act No. AV-2026/77)" },
    legalDetails: {
      ru: "Акт ввода в эксплуатацию №АВ-2026/77 от 25.09.2026. Продажа готовых квартир по договорам купли-продажи. Рисков долевого участия нет (0 баллов).",
      kz: "Үй толық салынып бітті және мемлекеттік комиссиядан өтті. Тәуекел жоқ.",
      en: "Fully built and cleared by state inspection. Zero risk for buyers."
    },
    signalStatus: "CONFIRMED",
    signalAuthor: "Ахметов Д.К.",
    signalUpdatedAt: "10.10.2026, 10:15",
    signalComment: "Объект сдан в эксплуатацию, рисков долевого участия нет (0 баллов).",
    factors: {
      R1: { status: "NONE", weight: 35, evidence: { ru: "Дом введён в эксплуатацию, разрешение на ДЖС не требуется.", kz: "Үй тапсырылды, мемлекеттік акт бар.", en: "Commissioned, state act cleared." } },
      R2: { status: "NONE", weight: 25, evidence: { ru: "Обычная продажа готового жилья.", kz: "Сұр сызбалар жоқ.", en: "No grey schemes." } },
      R3: { status: "NONE", weight: 10, evidence: { ru: "Реклама относится к готовому введённому дому (не строящееся жильё).", kz: "Дайын баспана жарнамасы.", en: "Ready housing promotion." } },
      R4: { status: "NONE", weight: 15, evidence: { ru: "Обращений нет.", kz: "Шағымдар жоқ.", en: "No complaints." } },
      R5: { status: "NONE", weight: 10, evidence: { ru: "100% готовность подтверждена актом.", kz: "Нақты дайындық 100%.", en: "Actual readiness 100%." } },
      R6: { status: "NONE", weight: 5, evidence: { ru: "Просрочек нет.", kz: "Үй пайдалануға берілді.", en: "Commissioned." } }
    }
  }
];

const INITIAL_ADS = [
  {
    id: "AD-101",
    complexId: "jk-1",
    source: "Krisha.kz",
    platform: "Krisha.kz",
    account: "Отдел продаж (@oskemen_invest_flat)",
    accounts: {
      ru: "Отдел продаж (@oskemen_invest_flat)",
      kz: "Сату бөлімі (@oskemen_invest_flat)",
      en: "Sales Office (@oskemen_invest_flat)"
    },
    phone: "+7 (705) 999-00-11",
    date: "13.10.2026",
    pubDate: "13.10.2026",
    capturedAt: "14.10.2026, 09:15 (Snapshot #101)",
    url: "https://krisha.kz/a/show/698100101-demo",
    rawText: "ЖК «Ертіс Рівер Тауэрс» на Стрелке! Видовые квартиры на Иртыш. Успейте внести платный депозит 500 000 тг по договору бронирования до старта официальных продаж! Первоначальный взнос 20% в кассу застройщика, рассрочка от застройщика на 36 мес.",
    text: "ЖК «Ертіс Рівер Тауэрс» на Стрелке! Видовые квартиры на Иртыш. Успейте внести платный депозит 500 000 тг по договору бронирования до старта официальных продаж! Первоначальный взнос 20% в кассу застройщика, рассрочка от застройщика на 36 мес.",
    texts: {
      ru: "ЖК «Ертіс Рівер Тауэрс» на Стрелке! Видовые квартиры на Иртыш. Успейте внести платный депозит 500 000 тг по договору бронирования до старта официальных продаж! Первоначальный взнос 20% в кассу застройщика, рассрочка от застройщика на 36 мес.",
      kz: "Стрелкадағы «Ертіс Рівер Тауэрс» ТК! Ертіске қарайтын пәтерлер. Ресми сатылым басталғанға дейін броньдау шарты бойынша 500 000 тг ақылы депозит салып үлгеріңіз! Бастапқы жарна 20% құрылыс салушы кассасына, 36 айға бөліп төлеу.",
      en: "Ertis River Towers RC at Strelka! Panoramic river views. Pay a 500,000 KZT booking deposit under a reservation agreement before official sales launch! 20% down payment to developer's cash desk, 36-month installment plan."
    },
    triggerSpan: "внести платный депозит 500 000 тг по договору бронирования до старта официальных продаж! Первоначальный взнос 20% в кассу застройщика",
    triggerSpans: {
      ru: "внести платный депозит 500 000 тг по договору бронирования до старта официальных продаж! Первоначальный взнос 20% в кассу застройщика",
      kz: "броньдау шарты бойынша 500 000 тг ақылы депозит салып үлгеріңіз! Бастапқы жарна 20% құрылыс салушы кассасына",
      en: "Pay a 500,000 KZT booking deposit under a reservation agreement before official sales launch! 20% down payment to developer's cash desk"
    },
    triggers: ["депозит 500 000 тг", "договор бронирования", "в кассу застройщика"],
    proposedFactor: "R2",
    confidence: 96,
    aiHypothesis: "R2 (+25 баллов): Незаконный сбор денег до ДДУ",
    aiHypotheses: {
      ru: "R2 (+25 баллов): Незаконный сбор денег до ДДУ (бронь и касса)",
      kz: "R2 (+25 ұпай): ҮҚШ-қа дейін заңсыз ақша жинау (бронь және касса)",
      en: "R2 (+25 pts): Unlawful pre-DDU deposit & cash desk payment"
    },
    status: "CONFIRMED",
    hasDirectPaymentOffer: true,
    isActivePreCommissioningAd: true
  },
  {
    id: "AD-102",
    complexId: "jk-1",
    source: "Instagram",
    platform: "Instagram",
    account: "@oskemen_invest_flat",
    accounts: { ru: "@oskemen_invest_flat", kz: "@oskemen_invest_flat", en: "@oskemen_invest_flat" },
    phone: "+7 (705) 999-00-11",
    date: "13.10.2026",
    pubDate: "13.10.2026",
    capturedAt: "14.10.2026, 09:42 (Snapshot #102 · OCR Stories)",
    url: "https://instagram.com/p/C8demoErtis102",
    rawText: "Сторис ЖК Ертіс Рівер Тауэрс: Готовность объекта уже 65%! Осталось 4 квартиры по акционной цене 390 000 тг/м² при оплате первоначального взноса наличными сегодня!",
    text: "Сторис ЖК Ертіс Рівер Тауэрс: Готовность объекта уже 65%! Осталось 4 квартиры по акционной цене 390 000 тг/м² при оплате первоначального взноса наличными сегодня!",
    texts: {
      ru: "Сторис ЖК Ертіс Рівер Тауэрс: Готовность объекта уже 65%! Осталось 4 квартиры по акционной цене 390 000 тг/м² при оплате первоначального взноса наличными сегодня!",
      kz: "Ертіс Рівер Тауэрс ТК сторисі: Нысанның дайындығы 65%! Бүгін бастапқы жарнаны қолма-қол төлегенде шаршы метрі 390 000 тг акциялық бағамен 4 пәтер қалды!",
      en: "Instagram Story Ertis River Towers: Construction readiness already at 65%! Only 4 apartments left at 390,000 KZT/m² when paying down payment in cash today!"
    },
    triggerSpan: "Готовность объекта уже 65%! ... при оплате первоначального взноса наличными сегодня",
    triggerSpans: {
      ru: "Готовность объекта уже 65%! ... при оплате первоначального взноса наличными сегодня",
      kz: "Нысанның дайындығы 65%! ... бастапқы жарнаны қолма-қол төлегенде",
      en: "Construction readiness already at 65%! ... paying down payment in cash today"
    },
    triggers: ["Готовность 65%", "наличными сегодня"],
    proposedFactor: "R5",
    confidence: 92,
    aiHypothesis: "R5 (+10 баллов): Завышение готовности (65% vs факт 30%, разница 35 п.п.)",
    aiHypotheses: {
      ru: "R5 (+10 баллов): Завышение готовности (65% vs факт 30%, разница 35 п.п.)",
      kz: "R5 (+10 ұпай): Дайындықты асыра көрсету (65% vs нақты 30%, айырма 35 п.п.)",
      en: "R5 (+10 pts): Readiness overstatement (65% vs 30% actual, 35 pp gap)"
    },
    status: "AI_HYPOTHESIS",
    hasDirectPaymentOffer: true,
    isActivePreCommissioningAd: true
  },
  {
    id: "AD-103",
    complexId: "jk-2",
    source: "Telegram",
    platform: "Telegram",
    account: "@ukg_nedvizhimost / @satpayev_city_demo",
    accounts: { ru: "@ukg_nedvizhimost / @satpayev_city_demo", kz: "@ukg_nedvizhimost / @satpayev_city_demo", en: "@ukg_nedvizhimost / @satpayev_city_demo" },
    phone: "+7 (777) 404-22-10",
    date: "12.10.2026",
    pubDate: "12.10.2026",
    capturedAt: "13.10.2026, 14:20 (Snapshot #103)",
    url: "https://t.me/ukg_nedvizhimost/4812-demo",
    rawText: "Новый ЖК «Сатпаев Сити Парк» на КШТ! Старт котлована! Доступна платная бронь квартиры за 300 000 тг с жёсткой фиксацией цены за квадрат. Оформляем предварительное соглашение.",
    text: "Новый ЖК «Сатпаев Сити Парк» на КШТ! Старт котлована! Доступна платная бронь квартиры за 300 000 тг с жёсткой фиксацией цены за квадрат. Оформляем предварительное соглашение.",
    texts: {
      ru: "Новый ЖК «Сатпаев Сити Парк» на КШТ! Старт котлована! Доступна платная бронь квартиры за 300 000 тг с жёсткой фиксацией цены за квадрат. Оформляем предварительное соглашение.",
      kz: "КШТ-дағы жаңа «Сәтбаев Сити Парк» ТК! Қазаншұңқыр басталды! Шаршы метр бағасын бекітумен 300 000 тг-ге пәтерді ақылы броньдау қолжетімді. Алдын ала келісім рәсімдейміз.",
      en: "New Satpayev City Park RC in KShT! Excavation stage! Paid apartment booking for 300,000 KZT with fixed price per sq.m. Preliminary agreement signed on the spot."
    },
    triggerSpan: "платная бронь квартиры за 300 000 тг с жёсткой фиксацией цены за квадрат",
    triggerSpans: {
      ru: "платная бронь квартиры за 300 000 тг с жёсткой фиксацией цены за квадрат",
      kz: "300 000 тг-ге пәтерді ақылы броньдау қолжетімді",
      en: "Paid apartment booking for 300,000 KZT with fixed price per sq.m."
    },
    triggers: ["платная бронь", "300 000 тг", "предварительное соглашение"],
    proposedFactor: "R2",
    confidence: 95,
    aiHypothesis: "R2 (+25 баллов): Платная бронь до ДДУ",
    aiHypotheses: {
      ru: "R2 (+25 баллов): Платная бронь до ДДУ",
      kz: "R2 (+25 ұпай): ҮҚШ-қа дейін ақылы броньдау",
      en: "R2 (+25 pts): Paid booking prior to DDU"
    },
    status: "CONFIRMED",
    hasDirectPaymentOffer: true,
    isActivePreCommissioningAd: true
  },
  {
    id: "AD-104",
    complexId: "jk-2",
    source: "Instagram",
    platform: "Instagram",
    account: "@satpayev_city_demo",
    accounts: { ru: "@satpayev_city_demo", kz: "@satpayev_city_demo", en: "@satpayev_city_demo" },
    phone: "+7 (777) 404-22-10",
    date: "12.10.2026",
    pubDate: "12.10.2026",
    capturedAt: "13.10.2026, 14:25 (Snapshot #104)",
    url: "https://instagram.com/p/C8demoSatpayev104",
    rawText: "Выбирайте планировки 1, 2 и 3-комнатных квартир в строящемся ЖК «Сатпаев Сити Парк» (пр. Сатпаева, 88). Сдача во II квартале 2028 года.",
    text: "Выбирайте планировки 1, 2 и 3-комнатных квартир в строящемся ЖК «Сатпаев Сити Парк» (пр. Сатпаева, 88). Сдача во II квартале 2028 года.",
    texts: {
      ru: "Выбирайте планировки 1, 2 и 3-комнатных квартир в строящемся ЖК «Сатпаев Сити Парк» (пр. Сатпаева, 88). Сдача во II квартале 2028 года.",
      kz: "Салынып жатқан «Сәтбаев Сити Парк» ТК-де (Сәтбаев даңғ., 88) 1, 2 және 3 бөлмелі пәтерлердің жоспарларын таңдаңыз. Тапсыру мерзімі — 2028 ж. II тоқсаны.",
      en: "Choose 1, 2, and 3-bedroom layouts in the under-construction Satpayev City Park RC (88 Satpayev Ave). Handover in Q2 2028."
    },
    triggerSpan: "в строящемся ЖК «Сатпаев Сити Парк» ... Сдача во II квартале 2028 года",
    triggerSpans: {
      ru: "в строящемся ЖК «Сатпаев Сити Парк» ... Сдача во II квартале 2028 года",
      kz: "Салынып жатқан «Сәтбаев Сити Парк» ТК-де ... Тапсыру мерзімі — 2028 ж. II тоқсаны",
      en: "in the under-construction Satpayev City Park RC ... Handover in Q2 2028"
    },
    triggers: ["в строящемся ЖК", "Сдача во II квартале 2028"],
    proposedFactor: "R3",
    confidence: 98,
    aiHypothesis: "R3 (+10 баллов): Реклама строящегося ЖК",
    aiHypotheses: {
      ru: "R3 (+10 баллов): Реклама строящегося ЖК до ввода",
      kz: "R3 (+10 ұпай): Салынып жатқан ТҮК жарнамасы",
      en: "R3 (+10 pts): Pre-commissioning housing advertisement"
    },
    status: "CONFIRMED",
    hasDirectPaymentOffer: false,
    isActivePreCommissioningAd: true
  },
  {
    id: "AD-105",
    complexId: "jk-3",
    source: "Krisha.kz",
    platform: "Krisha.kz",
    account: "@altaipremium_ukg",
    accounts: { ru: "@altaipremium_ukg", kz: "@altaipremium_ukg", en: "@altaipremium_ukg" },
    phone: "+7 (7232) 70-05-05",
    date: "11.10.2026",
    pubDate: "11.10.2026",
    capturedAt: "12.10.2026, 11:00 (Snapshot #105)",
    url: "https://krisha.kz/a/show/698100105-demo",
    rawText: "ЖК «Алтай Премиум Резиденс» (Левый берег). Строительство защищено гарантией АО «КЖК» №ГД-2026/049. Заключение официальных ДДУ через Казреестр, ипотека Отбасы Банка.",
    text: "ЖК «Алтай Премиум Резиденс» (Левый берег). Строительство защищено гарантией АО «КЖК» №ГД-2026/049. Заключение официальных ДДУ через Казреестр, ипотека Отбасы Банка.",
    texts: {
      ru: "ЖК «Алтай Премиум Резиденс» (Левый берег). Строительство защищено гарантией АО «КЖК» №ГД-2026/049. Заключение официальных ДДУ через Казреестр, ипотека Отбасы Банка.",
      kz: "«Алтай Премиум Резиденс» ТК (Сол жағалау). Құрылыс «ҚТҚ» АҚ №ГД-2026/049 кепілдігімен қорғалған. Қазреестр арқылы ресми ҮҚШ жасасу, Отбасы Банк ипотекасы.",
      en: "Altai Premium Residence RC (Left Bank). Backed by KZH Guarantee No. GD-2026/049. Official DDU registration via Qazreestr, Otbasy Bank mortgages available."
    },
    triggerSpan: "Строительство защищено гарантией АО «КЖК» №ГД-2026/049. Заключение официальных ДДУ",
    triggerSpans: {
      ru: "Строительство защищено гарантией АО «КЖК» №ГД-2026/049. Заключение официальных ДДУ",
      kz: "Құрылыс «ҚТҚ» АҚ №ГД-2026/049 кепілдігімен қорғалған. Қазреестр арқылы ресми ҮҚШ жасасу",
      en: "Backed by KZH Guarantee No. GD-2026/049. Official DDU registration via Qazreestr"
    },
    triggers: ["Гарантия КЖК", "Казреестр", "Отбасы Банк"],
    proposedFactor: "R3",
    confidence: 99,
    aiHypothesis: "R3 (+10 баллов): Штатная реклама с гарантией КЖК",
    aiHypotheses: {
      ru: "R3 (+10 баллов): Штатная реклама с гарантией КЖК (Зелёная зона)",
      kz: "R3 (+10 ұпай): ҚТҚ кепілдігі бар заңды жарнама (Жасыл аймақ)",
      en: "R3 (+10 pts): Lawful ad backed by KZH Guarantee (Green Zone)"
    },
    status: "CONFIRMED",
    hasDirectPaymentOffer: false,
    isActivePreCommissioningAd: true
  },
  {
    id: "AD-106",
    complexId: "jk-4",
    source: "OLX.kz",
    platform: "OLX.kz",
    account: "@oskemen_invest_flat",
    accounts: { ru: "@oskemen_invest_flat", kz: "@oskemen_invest_flat", en: "@oskemen_invest_flat" },
    phone: "+7 (705) 999-00-11", // Collision phone!
    date: "09.10.2026",
    pubDate: "09.10.2026",
    capturedAt: "10.10.2026, 16:40 (Snapshot #106)",
    url: "https://olx.kz/d/obyavlenie/ulba-gardens-demo-106",
    rawText: "Срочная продажа от инвестора и застройщика в ЖК «Ульба Гарденс»! Первоначальный взнос 30% по предварительному договору инвестирования, остальное в рассрочку до сдачи дома. Готовность дома 80%!",
    text: "Срочная продажа от инвестора и застройщика в ЖК «Ульба Гарденс»! Первоначальный взнос 30% по предварительному договору инвестирования, остальное в рассрочку до сдачи дома. Готовность дома 80%!",
    texts: {
      ru: "Срочная продажа от инвестора и застройщика в ЖК «Ульба Гарденс»! Первоначальный взнос 30% по предварительному договору инвестирования, остальное в рассрочку до сдачи дома. Готовность дома 80%!",
      kz: "«Үлбі Гарденс» ТК-де инвестор мен құрылыс салушыдан жедел сатылым! Алдын ала инвестициялау шарты бойынша бастапқы жарна 30%, қалғаны үй тапсырылғанға дейін бөліп төлеуге. Үйдің дайындығы 80%!",
      en: "Urgent sale from investor & developer at Ulba Gardens RC! 30% down payment under preliminary investment agreement, balance in installments until handover. Readiness 80%!"
    },
    triggerSpan: "Первоначальный взнос 30% по предварительному договору инвестирования",
    triggerSpans: {
      ru: "Первоначальный взнос 30% по предварительному договору инвестирования",
      kz: "Алдын ала инвестициялау шарты бойынша бастапқы жарна 30%",
      en: "30% down payment under preliminary investment agreement"
    },
    triggers: ["ПВ 30%", "предварительный договор инвестирования", "Готовность 80%"],
    proposedFactor: "R2",
    confidence: 97,
    aiHypothesis: "R2 (+25 баллов): Взнос по предварительному договору",
    aiHypotheses: {
      ru: "R2 (+25 баллов): Взнос по предварительному договору в обход ДДУ",
      kz: "R2 (+25 ұпай): ҮҚШ-ты айналып өтіп алдын ала шарт бойынша жарна",
      en: "R2 (+25 pts): Down payment under preliminary contract bypassing DDU"
    },
    status: "CONFIRMED",
    hasDirectPaymentOffer: true,
    isActivePreCommissioningAd: true
  },
  {
    id: "AD-107",
    complexId: "jk-4",
    source: "Instagram",
    platform: "Instagram",
    account: "@oskemen_invest_flat",
    accounts: { ru: "@oskemen_invest_flat", kz: "@oskemen_invest_flat", en: "@oskemen_invest_flat" },
    phone: "+7 (705) 999-00-11", // Collision phone!
    date: "10.10.2026",
    pubDate: "10.10.2026",
    capturedAt: "11.10.2026, 10:05 (Snapshot #107)",
    url: "https://instagram.com/p/C8demoUlba107",
    rawText: "ЖК «Ульба Гарденс» на Протозанова! Внесите 1 000 000 тг сегодня для резерва квартиры с видом на Ульбу без участия банков и лишних справок!",
    text: "ЖК «Ульба Гарденс» на Протозанова! Внесите 1 000 000 тг сегодня для резерва квартиры с видом на Ульбу без участия банков и лишних справок!",
    texts: {
      ru: "ЖК «Ульба Гарденс» на Протозанова! Внесите 1 000 000 тг сегодня для резерва квартиры с видом на Ульбу без участия банков и лишних справок!",
      kz: "Протозановтағы «Үлбі Гарденс» ТК! Банктердің қатысуынсыз және артық анықтамаларсыз Үлбіге қарайтын пәтерді резервтеу үшін бүгін 1 000 000 тг салыңыз!",
      en: "Ulba Gardens RC on Protozanov St! Pay 1,000,000 KZT today to reserve a riverfront apartment without banks or extra paperwork!"
    },
    triggerSpan: "Внесите 1 000 000 тг сегодня для резерва квартиры ... без участия банков",
    triggerSpans: {
      ru: "Внесите 1 000 000 тг сегодня для резерва квартиры ... без участия банков",
      kz: "Банктердің қатысуынсыз ... пәтерді резервтеу үшін бүгін 1 000 000 тг салыңыз",
      en: "Pay 1,000,000 KZT today to reserve a riverfront apartment without banks"
    },
    triggers: ["1 000 000 тг", "для резерва квартиры", "без участия банков"],
    proposedFactor: "R2",
    confidence: 94,
    aiHypothesis: "R2 (+25 баллов): Задаток 1 млн ₸ за резерв",
    aiHypotheses: {
      ru: "R2 (+25 баллов): Задаток 1 млн ₸ за резерв без участия банков",
      kz: "R2 (+25 ұпай): Банктерсіз резерв үшін 1 млн ₸ кепілпұл",
      en: "R2 (+25 pts): 1M KZT cash reservation deposit without banks"
    },
    status: "CONFIRMED",
    hasDirectPaymentOffer: true,
    isActivePreCommissioningAd: true
  },
  {
    id: "AD-108",
    complexId: "jk-5",
    source: "Telegram",
    platform: "Telegram",
    account: "@nurly_zhol_ukg",
    accounts: { ru: "@nurly_zhol_ukg", kz: "@nurly_zhol_ukg", en: "@nurly_zhol_ukg" },
    phone: "+7 (705) 999-00-11", // Collision phone!
    date: "13.10.2026",
    pubDate: "13.10.2026",
    capturedAt: "14.10.2026, 10:30 (Snapshot #108)",
    url: "https://t.me/ukg_nedvizhimost/5108-demo",
    rawText: "ЖК «Нурлы Жол Оскемен» (пр. Назарбаева, 112). Закрытый пресейл блока Б! Внесите депозит 400 000 тг по договору резервирования сегодня и получите паркинг в подарок!",
    text: "ЖК «Нурлы Жол Оскемен» (пр. Назарбаева, 112). Закрытый пресейл блока Б! Внесите депозит 400 000 тг по договору резервирования сегодня и получите паркинг в подарок!",
    texts: {
      ru: "ЖК «Нурлы Жол Оскемен» (пр. Назарбаева, 112). Закрытый пресейл блока Б! Внесите депозит 400 000 тг по договору резервирования сегодня и получите паркинг в подарок!",
      kz: "«Нұрлы Жол Өскемен» ТК (Назарбаев даңғ., 112). Б блогының жабық пресейлі! Бүгін резервтеу шарты бойынша 400 000 тг депозит салыңыз да, паркингті сыйлыққа алыңыз!",
      en: "Nurly Zhol Oskemen RC (112 Nazarbayev Ave). Closed Block B presale! Pay a 400,000 KZT deposit under a reservation contract today and get a free parking spot!"
    },
    triggerSpan: "Внесите депозит 400 000 тг по договору резервирования сегодня",
    triggerSpans: {
      ru: "Внесите депозит 400 000 тг по договору резервирования сегодня",
      kz: "Бүгін резервтеу шарты бойынша 400 000 тг депозит салыңыз",
      en: "Pay a 400,000 KZT deposit under a reservation contract today"
    },
    triggers: ["депозит 400 000 тг", "договор резервирования"],
    proposedFactor: "R2",
    confidence: 95,
    aiHypothesis: "R2 (+25 баллов): Депозит 400 000 ₸ (ожидает подтверждения инспектором)",
    aiHypotheses: {
      ru: "R2 (+25 баллов): Депозит 400 000 ₸ (ожидает подтверждения инспектором)",
      kz: "R2 (+25 ұпай): 400 000 ₸ депозит (инспектордың растауын күтуде)",
      en: "R2 (+25 pts): 400,000 KZT deposit (awaiting inspector confirmation)"
    },
    status: "AI_HYPOTHESIS",
    hasDirectPaymentOffer: true,
    isActivePreCommissioningAd: true
  },
  {
    id: "AD-109",
    complexId: "jk-5",
    source: "Instagram",
    platform: "Instagram",
    account: "@nurly_zhol_ukg",
    accounts: { ru: "@nurly_zhol_ukg", kz: "@nurly_zhol_ukg", en: "@nurly_zhol_ukg" },
    phone: "+7 (705) 999-00-11", // Collision phone!
    date: "13.10.2026",
    pubDate: "13.10.2026",
    capturedAt: "14.10.2026, 10:35 (Snapshot #109)",
    url: "https://instagram.com/p/C8demoNurly109",
    rawText: "Строительство ЖК «Нурлы Жол Оскемен» идёт полным ходом, готовность уже 75%! Открыта продажа 2-комнатных квартир на стадии строительства.",
    text: "Строительство ЖК «Нурлы Жол Оскемен» идёт полным ходом, готовность уже 75%! Открыта продажа 2-комнатных квартир на стадии строительства.",
    texts: {
      ru: "Строительство ЖК «Нурлы Жол Оскемен» идёт полным ходом, готовность уже 75%! Открыта продажа 2-комнатных квартир на стадии строительства.",
      kz: "«Нұрлы Жол Өскемен» ТК құрылысы қарқынды жүруде, дайындығы 75%! Құрылыс сатысында 2 бөлмелі пәтерлер сатылымы ашық.",
      en: "Construction of Nurly Zhol Oskemen RC is in full swing, readiness already at 75%! Sales of 2-bedroom apartments open during construction."
    },
    triggerSpan: "готовность уже 75%! Открыта продажа 2-комнатных квартир на стадии строительства",
    triggerSpans: {
      ru: "готовность уже 75%! Открыта продажа 2-комнатных квартир на стадии строительства",
      kz: "дайындығы 75%! Құрылыс сатысында 2 бөлмелі пәтерлер сатылымы ашық",
      en: "readiness already at 75%! Sales of 2-bedroom apartments open during construction"
    },
    triggers: ["готовность 75%", "на стадии строительства"],
    proposedFactor: "R5",
    confidence: 91,
    aiHypothesis: "R5 (+10 баллов): Завышение готовности (75% vs факт 45%, разница 30 п.п.)",
    aiHypotheses: {
      ru: "R5 (+10 баллов): Завышение готовности (75% vs факт 45%, разница 30 п.п.)",
      kz: "R5 (+10 ұпай): Дайындықты асыра көрсету (75% vs нақты 45%, айырма 30 п.п.)",
      en: "R5 (+10 pts): Readiness overstatement (75% vs 45% actual, 30 pp gap)"
    },
    status: "CONFIRMED",
    hasDirectPaymentOffer: false,
    isActivePreCommissioningAd: true
  },
  {
    id: "AD-110",
    complexId: "jk-6",
    source: "Krisha.kz",
    platform: "Krisha.kz",
    account: "@ecostroy_vko",
    accounts: { ru: "@ecostroy_vko", kz: "@ecostroy_vko", en: "@ecostroy_vko" },
    phone: "+7 (701) 555-88-99",
    date: "10.10.2026",
    pubDate: "10.10.2026",
    capturedAt: "11.10.2026, 12:15 (Snapshot #110)",
    url: "https://krisha.kz/a/show/698100110-demo",
    rawText: "ЖК «КШТ Эко Квартал» (ул. Увалиева). Разрешение МИО №РД-2026/18. Дом почти готов — готовность 90%, успейте купить квартиру в строящемся комплексе через ДДУ!",
    text: "ЖК «КШТ Эко Квартал» (ул. Увалиева). Разрешение МИО №РД-2026/18. Дом почти готов — готовность 90%, успейте купить квартиру в строящемся комплексе через ДДУ!",
    texts: {
      ru: "ЖК «КШТ Эко Квартал» (ул. Увалиева). Разрешение МИО №РД-2026/18. Дом почти готов — готовность 90%, успейте купить квартиру в строящемся комплексе через ДДУ!",
      kz: "«КШТ Эко Квартал» ТК (Уәлиев к-сі). ЖАО рұқсаты №РД-2026/18. Үй дерлік дайын — дайындығы 90%, салынып жатқан кешеннен ҮҚШ арқылы пәтер сатып алып үлгеріңіз!",
      en: "KShT Eco Quarter RC (Uvaliyev St). MIO Permit No. RD-2026/18. Almost ready — 90% completion, buy an apartment in the under-construction complex via DDU!"
    },
    triggerSpan: "Дом почти готов — готовность 90%",
    triggerSpans: {
      ru: "Дом почти готов — готовность 90%",
      kz: "Үй дерлік дайын — дайындығы 90%",
      en: "Almost ready — 90% completion"
    },
    triggers: ["готовность 90%", "в строящемся комплексе"],
    proposedFactor: "R5",
    confidence: 89,
    aiHypothesis: "R5 (+10 баллов): Разница готовности 25 п.п. (90% vs 65% по отчёту БВУ)",
    aiHypotheses: {
      ru: "R5 (+10 баллов): Разница готовности 25 п.п. (90% vs 65% по отчёту БВУ)",
      kz: "R5 (+10 ұпай): Дайындық айырмасы 25 п.п. (90% vs ЕДБ есебі бойынша 65%)",
      en: "R5 (+10 pts): Readiness gap 25 pp (90% stated vs 65% bank audit)"
    },
    status: "AI_HYPOTHESIS",
    hasDirectPaymentOffer: false,
    isActivePreCommissioningAd: true
  },
  {
    id: "AD-111",
    complexId: "jk-7",
    source: "Krisha.kz",
    platform: "Krisha.kz",
    account: "@irtysh_plaza_official",
    accounts: { ru: "@irtysh_plaza_official", kz: "@irtysh_plaza_official", en: "@irtysh_plaza_official" },
    phone: "+7 (7232) 55-12-34",
    date: "12.10.2026",
    pubDate: "12.10.2026",
    capturedAt: "12.10.2026, 15:00 (Snapshot #111)",
    url: "https://krisha.kz/a/show/698100111-demo",
    rawText: "ЖК «Иртыш Плаза», ул. Казахстан, 75. Разрешение МИО ВКО №РД-2025/94. Продажа квартир исключительно по ДДУ через уполномоченный банк.",
    text: "ЖК «Иртыш Плаза», ул. Казахстан, 75. Разрешение МИО ВКО №РД-2025/94. Продажа квартир исключительно по ДДУ через уполномоченный банк.",
    texts: {
      ru: "ЖК «Иртыш Плаза», ул. Казахстан, 75. Разрешение МИО ВКО №РД-2025/94. Продажа квартир исключительно по ДДУ через уполномоченный банк.",
      kz: "«Ертіс Плаза» ТК, Қазақстан к-сі, 75. ШҚО ЖАО рұқсаты №РД-2025/94. Пәтерлерді уәкілетті банк арқылы тек ҮҚШ бойынша сату.",
      en: "Irtysh Plaza RC, 75 Kazakhstan St. MIO Permit No. RD-2025/94. Apartment sales exclusively via registered DDU through an authorized bank."
    },
    triggerSpan: "Продажа квартир исключительно по ДДУ через уполномоченный банк",
    triggerSpans: {
      ru: "Продажа квартир исключительно по ДДУ через уполномоченный банк",
      kz: "Пәтерлерді уәкілетті банк арқылы тек ҮҚШ бойынша сату",
      en: "Apartment sales exclusively via registered DDU through an authorized bank"
    },
    triggers: ["Разрешение №РД-2025/94", "Договор ДДУ"],
    proposedFactor: "R3",
    confidence: 97,
    aiHypothesis: "R3 (+10 баллов): Штатная реклама строящегося ЖК (разрешение действует)",
    aiHypotheses: {
      ru: "R3 (+10 баллов): Штатная реклама строящегося ЖК (разрешение действует)",
      kz: "R3 (+10 ұпай): Салынып жатқан ТҮК заңды жарнамасы (рұқсат күшінде)",
      en: "R3 (+10 pts): Standard pre-commissioning ad (permit active)"
    },
    status: "CONFIRMED",
    hasDirectPaymentOffer: false,
    isActivePreCommissioningAd: true
  },
  {
    id: "AD-112",
    complexId: "jk-8",
    source: "Krisha.kz",
    platform: "Krisha.kz",
    account: "@sogra_park_dom",
    accounts: { ru: "@sogra_park_dom", kz: "@sogra_park_dom", en: "@sogra_park_dom" },
    phone: "+7 (7232) 61-00-99",
    date: "01.10.2026",
    pubDate: "01.10.2026",
    capturedAt: "05.10.2026, 13:10 (Snapshot #112)",
    url: "https://krisha.kz/a/show/698100112-demo",
    rawText: "ЖК «Согра Парк» — ДОМ СДАН! Акт ввода в эксплуатацию №АВ-2026/77. Ключи в день сделки, подходят все виды ипотеки. Звоните в отдел продаж, торг за наличный расчёт.",
    text: "ЖК «Согра Парк» — ДОМ СДАН! Акт ввода в эксплуатацию №АВ-2026/77. Ключи в день сделки, подходят все виды ипотеки. Звоните в отдел продаж, торг за наличный расчёт.",
    texts: {
      ru: "ЖК «Согра Парк» — ДОМ СДАН! Акт ввода в эксплуатацию №АВ-2026/77. Ключи в день сделки, подходят все виды ипотеки. Звоните в отдел продаж, торг за наличный расчёт.",
      kz: "«Согра Парк» ТК — ҮЙ ТАПСЫРЫЛДЫ! Пайдалануға беру актісі №АВ-2026/77. Кілтті мәміле күні аласыз, ипотеканың барлық түрі жарайды. Қолма-қол есеп айырысуға жеңілдік бар.",
      en: "Sogra Park RC — BUILDING COMMISSIONED! Handover Act No. AV-2026/77. Keys on the day of deal, all mortgages accepted. Discount for cash payment."
    },
    triggerSpan: "торг за наличный расчёт",
    triggerSpans: {
      ru: "торг за наличный расчёт",
      kz: "Қолма-қол есеп айырысуға жеңілдік бар",
      en: "Discount for cash payment"
    },
    triggers: ["ДОМ СДАН", "Акт №АВ-2026/77", "наличный расчёт"],
    proposedFactor: "R2",
    confidence: 62,
    aiHypothesis: "Отклонено аналитиком: Дом введён в эксплуатацию (0 баллов)",
    aiHypotheses: {
      ru: "Отклонено инспектором: Дом введён в эксплуатацию (0 баллов)",
      kz: "Инспектор қабылдамады: Үй пайдалануға берілген (0 ұпай)",
      en: "Rejected by Inspector: Building already commissioned (0 pts)"
    },
    status: "REJECTED",
    hasDirectPaymentOffer: false,
    isActivePreCommissioningAd: false
  }
];

const AI_DEMO_PRESETS = [
  {
    id: "preset-1",
    aliases: ["preset-1", "preset-nurly", "preset-nurly-r2"],
    complexId: "jk-5",
    platform: "Telegram",
    phone: "+7 (705) 999-00-11",
    url: "https://t.me/ukg_nedvizhimost/5199-demo",
    ocrSourceLabel: {
      ru: "Скриншот Telegram-канала @nurly_zhol_ukg (16.10.2026)",
      kz: "Telegram-арна скриншоты @nurly_zhol_ukg (16.10.2026)",
      en: "Telegram channel screenshot @nurly_zhol_ukg (16.10.2026)"
    },
    titles: {
      ru: "🔥 Сценарий 1: Незаконная бронь «Нурлы Жол» (60 б. Жёлтая → 85 б. Красная)",
      kz: "🔥 1-сценарий: «Нұрлы Жол» заңсыз бронь (60 ұп. Сары → 85 ұп. Қызыл)",
      en: "🔥 Preset 1: Unlawful deposit at Nurly Zhol (60 pts Yellow → 85 pts Red)"
    },
    subtitles: {
      ru: "Незаконный депозит 400 000 ₸ в кассу без разрешения МИО (триггер R2 +25 б.)",
      kz: "ЖАО рұқсатынсыз кассаға 400 000 ₸ заңсыз депозит (R2 +25 ұп. триггері)",
      en: "Unlawful 400,000 KZT cash deposit without MIO permit (R2 +25 pts trigger)"
    },
    texts: {
      ru: "ЖК «Нурлы Жол Оскемен» (ул. Бажова, 102). Закрытая акция! Внесите платный депозит 400 000 тг в кассу застройщика по предварительному договору бронирования до получения разрешения МИО!",
      kz: "ЖК «Нурлы Жол Оскемен» (ул. Бажова, 102). Закрытая акция! Внесите платный депозит 400 000 тг в кассу застройщика по предварительному договору бронирования до получения разрешения МИО!",
      en: "ЖК «Нурлы Жол Оскемен» (ул. Бажова, 102). Закрытая акция! Внесите платный депозит 400 000 тг в кассу застройщика по предварительному договору бронирования до получения разрешения МИО!"
    }
  },
  {
    id: "preset-2",
    aliases: ["preset-2", "preset-shared-phone", "preset-umbrella"],
    complexId: "",
    platform: "Instagram",
    phone: "+7 (705) 999-00-11",
    url: "https://instagram.com/p/C8demoUmbrella999",
    ocrSourceLabel: {
      ru: "Скриншот Instagram Stories @oskemen_invest_flat (16.10.2026)",
      kz: "Instagram Stories скриншоты @oskemen_invest_flat (16.10.2026)",
      en: "Instagram Stories screenshot @oskemen_invest_flat (16.10.2026)"
    },
    titles: {
      ru: "📞 Сценарий 2: Общий телефон +7 (705) 999-00-11 (авто-поиск 3 ЖК)",
      kz: "📞 2-сценарий: Ортақ телефон +7 (705) 999-00-11 (3 ТҮК таңдау)",
      en: "📞 Preset 2: Shared phone +7 (705) 999-00-11 (3 candidate complexes)"
    },
    subtitles: {
      ru: "В тексте нет названия ЖК — система найдёт 3 объекта-кандидата по номеру телефона",
      kz: "Мәтінде ТҮК атауы жоқ — жүйе телефон арқылы 3 үміткер нысанды табады",
      en: "No complex named in text — system resolves 3 candidate projects by phone"
    },
    texts: {
      ru: "Горячее предложение на квартиры в строящемся доме в Усть-Каменогорске! Платная бронь 350 000 тг наличными в кассу, первоначальный взнос 20% без справок и банков! Готовность 80%!",
      kz: "Горячее предложение на квартиры в строящемся доме в Усть-Каменогорске! Платная бронь 350 000 тг наличными в кассу, первоначальный взнос 20% без справок и банков! Готовность 80%!",
      en: "Горячее предложение на квартиры в строящемся доме в Усть-Каменогорске! Платная бронь 350 000 тг наличными в кассу, первоначальный взнос 20% без справок и банков! Готовность 80%!"
    }
  },
  {
    id: "preset-3",
    aliases: ["preset-3", "preset-overstate", "preset-r5"],
    complexId: "jk-6",
    platform: "Krisha.kz",
    phone: "+7 (701) 555-88-99",
    url: "https://krisha.kz/a/show/698100777-demo",
    ocrSourceLabel: {
      ru: "Скриншот объявления Krisha.kz #698100777 (16.10.2026)",
      kz: "Krisha.kz #698100777 хабарландыру скриншоты (16.10.2026)",
      en: "Krisha.kz listing #698100777 screenshot (16.10.2026)"
    },
    titles: {
      ru: "🏗️ Сценарий 3: Завышение этапа готовности R5 (90% в рекламе vs 65% по факту)",
      kz: "🏗️ 3-сценарий: Дайындықты асыра көрсету R5 (жарнамада 90% vs нақты 65%)",
      en: "🏗️ Preset 3: Readiness Inflation R5 (90% advertised vs 65% verified)"
    },
    subtitles: {
      ru: "Расхождение 25 п.п. с актом технадзора УГАСК (одновременно факторы R3 и R5)",
      kz: "Мемлекеттік сәулет-құрылыс бақылау актісімен 25 п.т. алшақтық (R3 және R5)",
      en: "25 pp discrepancy against GASK engineering inspection report (R3 + R5)"
    },
    texts: {
      ru: "Продажа квартир в строящемся ЖК «КШТ Эко Квартал»! Дом почти сдан, готовность 90%! Успейте приобрести 2-комнатную квартиру до повышения цен.",
      kz: "Продажа квартир в строящемся ЖК «КШТ Эко Квартал»! Дом почти сдан, готовность 90%! Успейте приобрести 2-комнатную квартиру до повышения цен.",
      en: "Продажа квартир в строящемся ЖК «КШТ Эко Квартал»! Дом почти сдан, готовность 90%! Успейте приобрести 2-комнатную квартиру до повышения цен."
    }
  },
  {
    id: "preset-4",
    aliases: ["preset-4", "preset-clean", "preset-safe"],
    complexId: "jk-8",
    platform: "Krisha.kz",
    phone: "+7 (7232) 61-00-99",
    url: "https://krisha.kz/a/show/698100888-demo",
    ocrSourceLabel: {
      ru: "Скриншот Krisha.kz — ЖК «Согра Парк» (16.10.2026)",
      kz: "Krisha.kz скриншоты — «Согра Парк» ТК (16.10.2026)",
      en: "Krisha.kz screenshot — Sogra Park RC (16.10.2026)"
    },
    titles: {
      ru: "✅ Сценарий 4: Законный готовый дом «Согра Парк» (0 баллов риска)",
      kz: "✅ 4-сценарий: Пайдалануға берілген «Согра Парк» үйі (0 тәуекел ұпайы)",
      en: "✅ Preset 4: Commissioned Sogra Park RC (0 risk points)"
    },
    subtitles: {
      ru: "Объект введён в эксплуатацию — продажа готовых квартир законна (0 баллов)",
      kz: "Нысан пайдалануға берілген — дайын пәтерлерді сату заңды (0 ұпай)",
      en: "Building already commissioned — ready apartment sales are lawful (0 pts)"
    },
    texts: {
      ru: "Уютные квартиры в сданном доме ЖК «Согра Парк» (акт ввода №АВ-2026/77). Полный пакет документов, оформление в ЦОНе за 1 день.",
      kz: "Уютные квартиры в сданном доме ЖК «Согра Парк» (акт ввода №АВ-2026/77). Полный пакет документов, оформление в ЦОНе за 1 день.",
      en: "Уютные квартиры в сданном доме ЖК «Согра Парк» (акт ввода №АВ-2026/77). Полный пакет документов, оформление в ЦОНе за 1 день."
    }
  }
];

const CONTROL_TEST_CASES = [
  {
    id: "jk-2",
    key: "case-a",
    badge: "Кейс A",
    zone: "YELLOW",
    score: 35,
    title: {
      ru: "🟡 Кейс A: Сатпаев Сити (35 б.)",
      kz: "🟡 А кейсі: Сәтбаев Сити (35 ұп.)",
      en: "🟡 Case A: Satpayev City (35 pts)"
    },
    subtitle: {
      ru: "R2 (25) + R3 (10) = 35 · Основание на проверке ≠ R1",
      kz: "R2 (25) + R3 (10) = 35 · Негіз тексерілуде ≠ R1",
      en: "R2 (25) + R3 (10) = 35 · Unverified basis ≠ R1"
    },
    toast: {
      ru: "🟡 <strong>Кейс A (Раздел 5 ТЗ):</strong> ЖК «Сатпаев Сити Парк» — 35 баллов (Жёлтая зона). Правовое основание на проверке («нет данных» даёт 0 баллов и не превращается автоматически в R1).",
      kz: "🟡 <strong>А кейсі (ТТ 5-бөлімі):</strong> «Сәтбаев Сити Парк» ТК — 35 ұпай (Сары аймақ). Құқықтық негіз тексерілуде («деректер жоқ» = 0 ұпай, автоматты түрде R1 болмайды).",
      en: "🟡 <strong>Case A (TZ Sec. 5):</strong> Satpayev City Park RC — 35 pts (Yellow Zone). Legal basis is unverified ('no data' gives 0 pts and never becomes R1 automatically)."
    }
  },
  {
    id: "jk-1",
    key: "case-b",
    badge: "Кейс B",
    zone: "RED",
    score: 70,
    title: {
      ru: "🔴 Кейс B: Ертіс Рівер (70 б.)",
      kz: "🔴 В кейсі: Ертіс Рівер (70 ұп.)",
      en: "🔴 Case B: Ertis River (70 pts)"
    },
    subtitle: {
      ru: "R1 (35) + R2 (25) + R3 (10) = 70 · Красная зона",
      kz: "R1 (35) + R2 (25) + R3 (10) = 70 · Қызыл аймақ",
      en: "R1 (35) + R2 (25) + R3 (10) = 70 · Red Zone"
    },
    toast: {
      ru: "🔴 <strong>Кейс B (Раздел 5 ТЗ):</strong> ЖК «Ертіс Рівер Тауэрс» — 70 баллов (Красная зона). Одновременно подтверждены отсутствие разрешения (R1 +35) и сбор депозитов (R2 +25) при активной рекламе (R3 +10).",
      kz: "🔴 <strong>В кейсі (ТТ 5-бөлімі):</strong> «Ертіс Рівер Тауэрс» ТК — 70 ұпай (Қызыл аймақ). Рұқсаттың жоқтығы (R1 +35) мен депозит жинау (R2 +25) бір мезгілде расталған.",
      en: "🔴 <strong>Case B (TZ Sec. 5):</strong> Ertis River Towers RC — 70 pts (Red Zone). Confirmed absence of permit (R1 +35) and deposit collection (R2 +25) with active ads (R3 +10)."
    }
  },
  {
    id: "jk-3",
    key: "case-c",
    badge: "Кейс C",
    zone: "GREEN",
    score: 10,
    title: {
      ru: "🟢 Кейс C: Алтай Премиум (10 б.)",
      kz: "🟢 С кейсі: Алтай Премиум (10 ұп.)",
      en: "🟢 Case C: Altai Premium (10 pts)"
    },
    subtitle: {
      ru: "R3 (10) = 10 · Действует гарантия АО «КЖК»",
      kz: "R3 (10) = 10 · «ҚТҚ» АҚ кепілдігі бар",
      en: "R3 (10) = 10 · Active KZH Guarantee"
    },
    toast: {
      ru: "🟢 <strong>Кейс C (Раздел 5 ТЗ):</strong> ЖК «Алтай Премиум Резиденс» — 10 баллов (Зелёная зона). Подтверждена действующая гарантия АО «КЖК» — отдельное разрешение МИО не требуется.",
      kz: "🟢 <strong>С кейсі (ТТ 5-бөлімі):</strong> «Алтай Премиум Резиденс» ТК — 10 ұпай (Жасыл аймақ). «ҚТҚ» АҚ кепілдігі расталған — ЖАО-ның бөлек рұқсаты талап етілмейді.",
      en: "🟢 <strong>Case C (TZ Sec. 5):</strong> Altai Premium Residence RC — 10 pts (Green Zone). Active KZH guarantee confirmed — separate Akimat permit is not required."
    }
  },
  {
    id: "jk-5",
    key: "case-edge",
    badge: "Граничный 60+",
    zone: "YELLOW",
    score: 60,
    title: {
      ru: "⚡ Граничный: Нурлы Жол (60 б. = Жёлтая!)",
      kz: "⚡ Шектік: Нұрлы Жол (60 ұп. = Сары!)",
      en: "⚡ Edge Case: Nurly Zhol (60 pts = Yellow!)"
    },
    subtitle: {
      ru: "R1+R3+R5+R6 = 60 б., но R2 = гипотеза ИИ (AD-108)",
      kz: "R1+R3+R5+R6 = 60 ұп., бірақ R2 = ЖИ гипотезасы",
      en: "R1+R3+R5+R6 = 60 pts, R2 is unconfirmed AI hypothesis"
    },
    toast: {
      ru: "⚡ <strong>Граничный кейс (Раздел 5 ТЗ):</strong> ЖК «Нурлы Жол Оскемен» набрал <strong>60 баллов</strong> (R1+R3+R5+R6), но остаётся в <strong>Жёлтой зоне</strong>, так как фактор R2 (объявление AD-108) ещё не подтверждён человеком!",
      kz: "⚡ <strong>Шектік кейс (ТТ 5-бөлімі):</strong> «Нұрлы Жол Өскемен» ТК <strong>60 ұпай</strong> жинады (R1+R3+R5+R6), бірақ R2 факторын (AD-108) инспектор әлі растамағандықтан <strong>Сары аймақта</strong> қалады!",
      en: "⚡ <strong>Edge Case (TZ Sec. 5):</strong> Nurly Zhol Oskemen RC has <strong>60 points</strong> (R1+R3+R5+R6), yet stays in the <strong>Yellow Zone</strong> because R2 (ad AD-108) has not been confirmed by a human inspector!"
    }
  }
];

// Ensure all ad objects have complete field aliases (text, rawText, date, pubDate, platform, source)
INITIAL_ADS.forEach(a => {
  a.text = a.text || a.rawText || "";
  a.rawText = a.rawText || a.text || "";
  a.pubDate = a.pubDate || a.date || a.capturedAt || "14.10.2026";
  a.date = a.date || a.pubDate || a.capturedAt || "14.10.2026";
  a.capturedAt = a.capturedAt || a.date || a.pubDate || "14.10.2026, 12:00";
  a.platform = a.platform || a.source || "Krisha.kz";
  a.source = a.source || a.platform || "Krisha.kz";
  a.url = a.url || "#";
});

const CITIZEN_VERDICTS = {
  RED: {
    ru: "⛔ ОПАСНО ДЛЯ ПОКУПКИ: У застройщика нет законного права привлекать деньги граждан (нет разрешения акимата и гарантии КЖК), но в рекламе предлагается внести бронь/депозит. Любые предварительные договоры вне ДДУ незаконны!",
    kz: "⛔ САТЫП АЛУ ӨТЕ ҚАУІПТІ: Құрылыс салушының азаматтардан ақша жинауға заңды құқығы жоқ (әкімдік рұқсаты мен ҚТҚ кепілдігі жоқ), бірақ жарнамада бронь/депозит салу ұсынылуда. ҮҚШ-тан тыс кез келген алдын ала келісімшарттар заңсыз!",
    en: "⛔ DANGEROUS TO PURCHASE: The developer has no legal authority to raise citizen funds (no Akimat permit and no KZH guarantee), yet ads demand booking deposits. Any preliminary agreements outside official shared-construction contracts (DDU) are unlawful!"
  },
  YELLOW: {
    ru: "⚠️ ТРЕБУЕТ ОСТОРОЖНОСТИ: Документы застройщика находятся на проверке либо выявлены расхождения по срокам и готовности. Не вносите деньги (бронь, резерв, ПВ) до проверки официального разрешения МИО или гарантии КЖК.",
    kz: "⚠️ АБАЙ БОЛЫҢЫЗ: Құрылыс салушының құжаттары тексерілуде немесе мерзімдер мен дайындық бойынша сәйкессіздіктер бар. ЖАО ресми рұқсатын немесе ҚТҚ кепілдігін тексермейінше ақша салмаңыз.",
    en: "⚠️ PROCEED WITH CAUTION: Developer documentation is under review or timeline discrepancies exist. Do not pay any booking deposits or reservations until verifying official Akimat permit or KZH guarantee."
  },
  GREEN: {
    ru: "✅ БЕЗОПАСНАЯ СДЕЛКА: Объект имеет официальную гарантию АО «КЖК» либо разрешение акимата г. Усть-Каменогорска. Договор долевого участия регистрируется в Казреестре, вклады дольщиков защищены государством.",
    kz: "✅ ҚАУІПСІЗ МӘМІЛЕ: Нысанның «ҚТҚ» АҚ ресми кепілдігі немесе Өскемен қаласы әкімдігінің рұқсаты бар. Үлестік қатысу шарты Қазреестрде тіркеледі, салымдар мемлекетпен қорғалған.",
    en: "✅ SAFE FOR PURCHASE: Project holds an official KZH Guarantee or Akimat permit. DDU contract is registered in Qazreestr, protecting citizen investments under RK law."
  }
};

const FACTOR_INFO = {
  R1: { code: "R1", weight: 35, ru: "Отсутствие правового основания на привлечение средств (ст. 7 Закона о ДЖС)", kz: "Қаражат тартудың құқықтық негізінің болмауы (ҮҚ туралы Заңның 7-бабы)", en: "Absence of legal basis for attracting equity funds" },
  R2: { code: "R2", weight: 25, ru: "Прямое предложение внести деньги до ДДУ (бронь, депозит, взнос в кассу)", kz: "ҮҚШ-қа дейін ақша салуды тікелей ұсыну (бронь, депозит, кассаға жарна)", en: "Direct solicitation of funds prior to DDU (booking, deposit)" },
  R3: { code: "R3", weight: 10, ru: "Реклама строящегося жилья до ввода (признак раннего привлечения)", kz: "Пайдалануға берілгенге дейін салынып жатқан баспана жарнамасы", en: "Advertising under-construction housing prior to commissioning" },
  R4: { code: "R4", weight: 15, ru: "Коллективные обращения и жалобы граждан (e-Otinish / МИО)", kz: "Азаматтардың ұжымдық өтініштері мен шағымдары (e-Otinish)", en: "Collective citizen petitions and complaints (e-Otinish)" },
  R5: { code: "R5", weight: 10, ru: "Расхождение заявленной и фактической готовности ≥ 20 п.п.", kz: "Мәлімделген және нақты дайындықтың алшақтығы ≥ 20 п.п.", en: "Declared vs actual construction readiness delta >= 20 pp" },
  R6: { code: "R6", weight: 5, ru: "Подтвержденный простой объекта или критический срыв графика", kz: "Құрылыстың тоқтап қалуы немесе кестенің бұзылуы", en: "Confirmed construction standstill or critical delay" }
};

// Factor Status Labels for plain language
const FACTOR_STATUS_LABELS = {
  CONFIRMED: {
    ru: "✅ Подтверждено",
    kz: "✅ Расталды",
    en: "✅ Confirmed"
  },
  AI_HYPOTHESIS: {
    ru: "🤖 Подозрение ИИ (0 б. до проверки)",
    kz: "🤖 ЖИ күдігі (тексеруге дейін 0 ұпай)",
    en: "🤖 AI Flagged (0 pts until verified)"
  },
  UNVERIFIED: {
    ru: "⚠️ Нужна проверка (0 б.)",
    kz: "⚠️ Тексеруді талап етеді (0 ұпай)",
    en: "⚠️ Requires Verification (0 pts)"
  },
  REJECTED: {
    ru: "✕ Отклонено аналитиком (0 б.)",
    kz: "✕ Сарапшы қабылдамады (0 ұпай)",
    en: "✕ Rejected by Analyst (0 pts)"
  },
  NONE: {
    ru: "⚪ Не выявлено (0 б.)",
    kz: "⚪ Анықталған жоқ (0 ұпай)",
    en: "⚪ Not Detected (0 pts)"
  }
};

function getFactorStatusLabel(status, lang = "ru") {
  const normStatus = (status || "").toUpperCase();
  if (FACTOR_STATUS_LABELS[normStatus]) {
    return FACTOR_STATUS_LABELS[normStatus][lang] || FACTOR_STATUS_LABELS[normStatus].ru;
  }
  return status;
}

// 11 Official State Registries of the Republic of Kazakhstan
const STATE_REGISTRIES_RK = [
  {
    id: "REG-01",
    code: "KZ-HOUSING-PORTAL",
    name: {
      ru: "Homeportal.kz (АО «Казахстанская Жилищная Компания»)",
      kz: "Homeportal.kz («Қазақстан Тұрғын үй Компаниясы» АҚ)",
      en: "Homeportal.kz (Kazakhstan Housing Company JSC)"
    },
    authority: {
      ru: "Единый оператор жилищного строительства РК / НУХ «Байтерек»",
      kz: "Тұрғын үй құрылысының бірыңғай операторы",
      en: "Single Housing Construction Operator of Kazakhstan"
    },
    lawArticle: "ст. 7, 8 Закона РК «О долевом участии в жилищном строительстве»",
    status: "ONLINE",
    statusText: { ru: "Интегрировано · Реестр гарантий", kz: "Біріктірілген · Кепілдіктер тізілімі", en: "Integrated · Guarantees Registry" },
    recordsCount: 8,
    matchedValid: "ЖК «Алтай Премиум Резиденс» (Договор гарантии №ГД-2026/049)",
    lastSync: "15.10.2026, 09:30",
    url: "https://homeportal.kz"
  },
  {
    id: "REG-02",
    code: "MIO-PERMITS-VKO",
    name: {
      ru: "Ashyq Data МИО (Разрешения акимата г. Усть-Каменогорск)",
      kz: "ЖАО ашық деректері (Өскемен қ. әкімдігінің рұқсаттары)",
      en: "MIO Open Data (Ust-Kamenogorsk Akimat Equity Permits)"
    },
    authority: {
      ru: "ГУ «Отдел строительства г. Усть-Каменогорска» / Акимат ВКО",
      kz: "«Өскемен қаласының құрылыс бөлімі» ММ",
      en: "Construction Department of Ust-Kamenogorsk Akimat"
    },
    lawArticle: "ст. 18 Закона РК о ДЖС (Разрешение МИО на привлечение денег)",
    status: "ONLINE",
    statusText: { ru: "Интегрировано · Постановления акимата", kz: "Біріктірілген · Әкімдік қаулылары", en: "Integrated · Akimat Resolutions" },
    recordsCount: 8,
    matchedValid: "ЖК «КШТ Эко Квартал» (№РД-2026/18) и ЖК «Иртыш Плаза» (№РД-2025/94)",
    lastSync: "15.10.2026, 09:15",
    url: "https://data.egov.kz"
  },
  {
    id: "REG-03",
    code: "QAZREESTR-DDU",
    name: {
      ru: "Казреестр (Единая информационная система учета договоров ДДУ)",
      kz: "Қазреестр (Үлестік қатысу шарттарын есепке алу бірыңғай жүйесі)",
      en: "Qazreestr (Single National Equity Contract Registry)"
    },
    authority: {
      ru: "Министерство промышленности и строительства РК",
      kz: "ҚР Өнеркәсіп және құрылыс министрлігі",
      en: "Ministry of Industry and Construction of the Republic of Kazakhstan"
    },
    lawArticle: "ст. 12 Закона РК о ДЖС (Обязательный учет выписок ДДУ в уполномоченном органе)",
    status: "ONLINE",
    statusText: { ru: "Интегрировано · Проверка выписок ДДУ", kz: "Біріктірілген · ҮҚШ тексеру", en: "Integrated · DDU verification" },
    recordsCount: 8,
    matchedValid: "ЖК «Алтай Премиум Резиденс», ЖК «КШТ Эко Квартал», ЖК «Иртыш Плаза»",
    lastSync: "15.10.2026, 08:45",
    url: "https://qazreestr.kz"
  },
  {
    id: "REG-04",
    code: "UGASK-CONTROL-VKO",
    name: {
      ru: "УГАСК ВКО (Государственный архитектурно-строительный контроль)",
      kz: "ШҚО МСҚБ (Мемлекеттік сәулет-құрылыс бақылауы басқармасы)",
      en: "State Architectural and Construction Control Department of East Kazakhstan"
    },
    authority: {
      ru: "ГУ «Управление государственного архитектурно-строительного контроля ВКО»",
      kz: "«ШҚО мемлекеттік сәулет-құрылыс бақылауы басқармасы» ММ",
      en: "State GASK Authority of East Kazakhstan Region"
    },
    lawArticle: "Закон РК «Об архитектурной, градостроительной и строительной деятельности»",
    status: "ONLINE",
    statusText: { ru: "Интегрировано · Проверки и предписания", kz: "Біріктірілген · Тексерістер мен нұсқамалар", en: "Integrated · Inspections & Injunctions" },
    recordsCount: 8,
    matchedValid: "Ответ №04-12/881 (jk-1), отказ №19-04/412 (jk-4) и справка МИО (jk-5)",
    lastSync: "15.10.2026, 09:40",
    url: "https://elicense.kz"
  },
  {
    id: "REG-05",
    code: "E-OTINISH-PETITIONS",
    name: {
      ru: "ИС «e-Otinish» (Единая платформа обращений граждан)",
      kz: "«e-Otinish» АЖ (Азаматтардың өтініштерін қабылдау бірыңғай жүйесі)",
      en: "e-Otinish National Citizen Complaints & Petitions System"
    },
    authority: {
      ru: "Комитет по правовой статистике и специальным учетам ГП РК",
      kz: "ҚР Бас прокуратурасының ҚСжАЕК",
      en: "General Prosecutor's Office of the Republic of Kazakhstan"
    },
    lawArticle: "АППК РК (Автоматический мониторинг коллективных жалоб по фактору R4)",
    status: "ONLINE",
    statusText: { ru: "Интегрировано · Жалобы дольщиков", kz: "Біріктірілген · Үлескерлер шағымы", en: "Integrated · Citizen Complaints" },
    recordsCount: 8,
    matchedValid: "ЖК «Ульба Гарденс» (коллективное обращение 14 граждан №ЖТ-2026-089112)",
    lastSync: "15.10.2026, 09:10",
    url: "https://eotinish.kz"
  },
  {
    id: "REG-06",
    code: "E-SHANYRAQ",
    name: {
      ru: "ИС «Е-Шаңырақ» (Единая система жилищного фонда)",
      kz: "«Е-Шаңырақ» АЖ (Тұрғын үй қорының бірыңғай жүйесі)",
      en: "E-Shanyraq National Housing & Utility System"
    },
    authority: {
      ru: "АО «КазЦентр ЖКХ» / МПС РК",
      kz: "«ТҮКШ ҚазОрталығы» АҚ",
      en: "KazCenter Housing and Utilities JSC"
    },
    lawArticle: "Закон РК «О жилищных отношениях» (Паспортизация строящихся МЖД)",
    status: "ONLINE",
    statusText: { ru: "Интегрировано · Цифровые паспорта домов", kz: "Біріктірілген · Цифрлық төлқұжаттар", en: "Integrated · Digital house passports" },
    recordsCount: 8,
    matchedValid: "Все 8 комплексов привязаны к электронным паспортам объектов",
    lastSync: "15.10.2026, 08:30",
    url: "https://eshanyraq.gov.kz"
  },
  {
    id: "REG-07",
    code: "AIS-GZK-LAND",
    name: {
      ru: "АИС ГЗК (Земельный кадастр Республики Казахстан)",
      kz: "МЖК ААЖ (Қазақстан Республикасының жер кадастры)",
      en: "Automated Land Cadastre of the Republic of Kazakhstan"
    },
    authority: {
      ru: "НАО «Государственная корпорация «Правительство для граждан» / МСХ РК",
      kz: "«Азаматтарға арналған үкімет» МК КЕАҚ",
      en: "State Corporation 'Government for Citizens'"
    },
    lawArticle: "Земельный кодекс РК (Проверка целевого назначения земельных участков)",
    status: "ONLINE",
    statusText: { ru: "Интегрировано · Кадастровые номера", kz: "Біріктірілген · Кадастрлық нөмірлер", en: "Integrated · Cadastre IDs" },
    recordsCount: 8,
    matchedValid: "Сверка земельных участков (Сатпаева 88, Пермитина 17, Астана 32, Жибек Жолы 14)",
    lastSync: "15.10.2026, 09:00",
    url: "https://map.gov4c.kz/egkn/"
  },
  {
    id: "REG-08",
    code: "UNRELIABLE-REGISTRY",
    name: {
      ru: "Реестр недобросовестных застройщиков и участников закупок",
      kz: "Жосықсыз құрылыс салушылар мен сатып алуға қатысушылар тізілімі",
      en: "Registry of Unreliable Developers & Contractors"
    },
    authority: {
      ru: "Министерство финансов РК / Портал Goszakup.gov.kz",
      kz: "ҚР Қаржы министрлігі",
      en: "Ministry of Finance of the Republic of Kazakhstan"
    },
    lawArticle: "Закон РК «О государственных закупках» и ст. 31 Закона РК о ДЖС",
    status: "ONLINE",
    statusText: { ru: "Интегрировано · Проверка по БИН", kz: "Біріктірілген · БСН бойынша тексеру", en: "Integrated · BIN check" },
    recordsCount: 8,
    matchedValid: "Автоматический скрининг 8 БИН застройщиков на включение в чёрный список",
    lastSync: "15.10.2026, 09:35",
    url: "https://goszakup.gov.kz"
  },
  {
    id: "REG-09",
    code: "TORELIK-COURTS",
    name: {
      ru: "ИС «Төрелік» (Банк судебных актов Верховного Суда РК)",
      kz: "«Төрелік» АЖ (ҚР Жоғарғы Сотының сот актілері банкі)",
      en: "Torelik Judicial Acts Bank of the Supreme Court"
    },
    authority: {
      ru: "Департамент по обеспечению деятельности судов при Верховном Суде РК",
      kz: "ҚР Жоғарғы Сотының жанындағы Соттардың қызметін қамтамасыз ету департаменті",
      en: "Department of Court Administration of the RK"
    },
    lawArticle: "ГПК РК (Проверка споров, арестов земельных участков и решений о сносе)",
    status: "ONLINE",
    statusText: { ru: "Интегрировано · Поиск судебных тяжб", kz: "Біріктірілген · Сот істерін іздеу", en: "Integrated · Litigation search" },
    recordsCount: 8,
    matchedValid: "Иск УГАСК ВКО о приостановлении привлечения средств по объекту jk-4",
    lastSync: "15.10.2026, 07:45",
    url: "https://sud.gov.kz"
  },
  {
    id: "REG-10",
    code: "BANKRUPT-REGISTRY",
    name: {
      ru: "Реестр банкротов и реабилитируемых лиц КГД МФ РК",
      kz: "ҚР ҚМ МКК банкроттар мен оңалтылатын тұлғалар тізілімі",
      en: "State Revenue Committee Insolvency & Bankruptcy Registry"
    },
    authority: {
      ru: "Комитет государственных доходов Министерства финансов РК",
      kz: "ҚР Қаржы министрлігінің Мемлекеттік кірістер комитеті",
      en: "State Revenue Committee of the Ministry of Finance"
    },
    lawArticle: "Закон РК «О реабилитации и банкротстве» (Финансовая состоятельность застройщика)",
    status: "ONLINE",
    statusText: { ru: "Интегрировано · Проверка платежеспособности", kz: "Біріктірілген · Төлем қабілеттілігін тексеру", en: "Integrated · Solvency check" },
    recordsCount: 8,
    matchedValid: "8 застройщиков проверены: признаков банкротства и арестов счетов не выявлено",
    lastSync: "15.10.2026, 08:15",
    url: "https://kgd.gov.kz"
  },
  {
    id: "REG-11",
    code: "NATURAL-MONOPOLIES",
    name: {
      ru: "Реестр субъектов естественных монополий и техусловий",
      kz: "Табиғи монополиялар субъектілері мен техникалық шарттар тізілімі",
      en: "State Natural Monopolies & Utility Connections Registry"
    },
    authority: {
      ru: "Комитет по регулированию естественных монополий МНЭ РК (КРЕМ)",
      kz: "ҚР ҰЭМ Табиғи монополияларды реттеу комитеті",
      en: "Committee for Regulation of Natural Monopolies"
    },
    lawArticle: "Закон РК «О естественных монополиях» (ТУ: теплоснабжение, вода, электроэнергия)",
    status: "ONLINE",
    statusText: { ru: "Интегрировано · Проверка подключений", kz: "Біріктірілген · Қосылымдарды тексеру", en: "Integrated · Utilities verified" },
    recordsCount: 8,
    matchedValid: "Сверка ТУ с АО «Усть-Каменогорские тепловые сети» и ГКП «Оскемен Водоканал»",
    lastSync: "15.10.2026, 09:05",
    url: "https://krem.gov.kz"
  }
];

// Global window attachments
if (typeof window !== 'undefined') {
  window.RAW_COMPLEXES = RAW_COMPLEXES;
  window.COMPLEXES_DB = RAW_COMPLEXES;
  window.INITIAL_ADS = INITIAL_ADS;
  window.AI_DEMO_PRESETS = AI_DEMO_PRESETS;
  window.CONTROL_TEST_CASES = CONTROL_TEST_CASES;
  window.CITIZEN_VERDICTS = CITIZEN_VERDICTS;
  window.FACTOR_INFO = FACTOR_INFO;
  window.FACTOR_STATUS_LABELS = FACTOR_STATUS_LABELS;
  window.STATE_REGISTRIES_RK = STATE_REGISTRIES_RK;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    RAW_COMPLEXES,
    COMPLEXES_DB: RAW_COMPLEXES,
    INITIAL_ADS,
    AI_DEMO_PRESETS,
    CONTROL_TEST_CASES,
    CITIZEN_VERDICTS,
    FACTOR_INFO,
    FACTOR_STATUS_LABELS,
    STATE_REGISTRIES_RK
  };
}
