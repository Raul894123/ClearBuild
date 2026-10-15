// Centralized Data for SAQ QURYLYS / ClearBuild
// 100% Accurate Parcel Coordinates for Ust-Kamenogorsk
// Enriched with 11 State Registries Requisites & Contact Phones (Section 11 TZ)

const RAW_COMPLEXES = [
  {
    id: "jk-1",
    code: "CASE-B",
    coords: [49.9440, 82.6302], // Verified parcel 17 on Permitin street / Strelka
    names: { ru: "ЖК «Ертіс Рівер Тауэрс»", kz: "«Ертіс Рівер Тауэрс» ТК", en: "Ertis River Towers" },
    developers: { ru: "ТОО «ВостокСтройИнвест-Демо»", kz: "«ВостокСтройИнвест-Демо» ЖШС", en: "VostokStroyInvest-Demo LLP" },
    bin: "240540099102",
    contactPhone: "+7 (705) 999-00-11",
    cadastreNumber: "05:102:044:112",
    smrLicense: "ГСЛ №004921 от 14.03.2021 (II категория)",
    landPurpose: "Строительство многоэтажного жилого комплекса с паркингом",
    districts: { ru: "ул. Пермитина, 17 (Набережная Славского, Стрелка)", kz: "Пермитин к-сі, 17 (Славский жағалауы, Ертіс)", en: "17 Permitin St (Slavsky Embankment)" },
    stages: { ru: "Возведение каркаса 3-го этажа из 16", kz: "16 қабаттың 3-қабатының қаңқасы", en: "3rd floor framework assembly out of 16" },
    readinessFact: 30,
    readinessDeclared: 65,
    legalStatus: "ABSENT",
    legalTexts: { ru: "Отсутствует разрешение МИО и гарантия АО «КЖК»", kz: "ЖАО рұқсаты мен «ҚТҚ» АҚ кепілдігі жоқ", en: "No Akimat permit and no KZH guarantee" },
    legalDetails: {
      ru: "Официальный ответ УГАСК ВКО №04-12/881: разрешение на привлечение средств дольщиков не выдавалось. Сбор денег незаконен.",
      kz: "ШҚО МСҚБ №04-12/881 ресми жауабы: үлескерлер қаражатын тартуға рұқсат берілмеген. Қаражат жинау заңсыз.",
      en: "Official letter of GASK EKR No. 04-12/881: no permit issued. Raising funds is illegal."
    },
    factors: {
      R1: { status: "CONFIRMED", weight: 35, evidence: { ru: "Отсутствуют основания по ст. 7 Закона РК «О долевом участии в жилищном строительстве».", kz: "ҚР «Тұрғын үй құрылысына үлестік қатысу туралы» Заңының 7-бабы бойынша негіз жоқ.", en: "No legal basis under Art. 7 of RK Shared Construction Act." } },
      R2: { status: "CONFIRMED", weight: 25, evidence: { ru: "Объявление AD-101: требование внести депозит 500 000 ₸ и 20% взнос в кассу до ДДУ.", kz: "AD-101 хабарландыруы: ҮҚШ жасалғанға дейін 500 000 ₸ депозит пен 20% жарна талап ету.", en: "Ad AD-101: demanding 500,000 KZT deposit and 20% down payment to cashier before contract." } },
      R3: { status: "CONFIRMED", weight: 10, evidence: { ru: "Активная реклама продаж строящихся квартир в Instagram (@oskemen_invest_flat) и Krisha.kz.", kz: "Instagram (@oskemen_invest_flat) және Krisha.kz желілерінде белсенді сату жарнамасы.", en: "Active advertising of flats on Instagram and Krisha.kz." } },
      R4: { status: "NONE", weight: 15, evidence: { ru: "Жалоб в e-Otinish не зафиксировано.", kz: "e-Otinish арқылы шағым түспеген.", en: "No e-Otinish complaints recorded." } },
      R5: { status: "AI_HYPOTHESIS", weight: 10, evidence: { ru: "ИИ выявил расхождение готовности: заявлено 65%, по факту проверки УГАСК — 30% (разница 35 п.п.).", kz: "ЖИ дайындық айырмасын тапты: 65% мәлімделген, іс жүзінде — 30% (айырма 35 п.п.).", en: "AI detected readiness discrepancy: claimed 65%, verified 30% (35 pp delta)." } },
      R6: { status: "NONE", weight: 5, evidence: { ru: "Простоя работ не зафиксировано.", kz: "Құрылыс тоқтамаған.", en: "No work stoppage." } }
    }
  },
  {
    id: "jk-2",
    code: "CASE-A",
    coords: [49.9295, 82.6176], // Verified building parcel 88/2 on Satpayev Ave (Palace of Marriages lot)
    names: { ru: "ЖК «Сатпаев Сити Парк»", kz: "«Сәтбаев Сити Парк» ТК", en: "Satpayev City Park" },
    developers: { ru: "ТОО «QazaqDomOskemen-Демо»", kz: "«QazaqDomOskemen-Демо» ЖШС", en: "QazaqDomOskemen-Demo LLP" },
    bin: "231140055219",
    contactPhone: "+7 (777) 404-22-10",
    cadastreNumber: "05:102:055:219",
    smrLicense: "ГСЛ №008122 от 20.09.2022 (II категория)",
    landPurpose: "Строительство жилого комплекса с объектами обслуживания населения",
    districts: { ru: "пр. Каныша Сатпаева, уч. 88 (КШТ)", kz: "Қаныш Сәтбаев даңғылы, 88-телім (КШТ)", en: "88 Satpayev Ave (KSHT District)" },
    stages: { ru: "Устройство котлована и фундаментной плиты", kz: "Қазаншұңқыр мен іргетас плитасын орнату", en: "Excavation and foundation slab laying" },
    readinessFact: 15,
    readinessDeclared: 20,
    legalStatus: "UNVERIFIED",
    legalTexts: { ru: "Правовой статус на проверке (Запрос №09-21/304)", kz: "Құқықтық мәртебе тексерілуде (№09-21/304 сұрауы)", en: "Legal status under formal review (Inquiry No. 09-21/304)" },
    legalDetails: {
      ru: "Сведения в открытой выгрузке отсутствуют. Согласно Разделу 5 ТЗ «нет данных» не считается R1 (0 баллов до ответа).",
      kz: "Ашық деректерде мәлімет жоқ. ТТ 5-бөлімі бойынша «дерек жоқ» жағдайында R1 берілмейді (0 ұпай).",
      en: "Missing from public registry. Per spec section 5, 'no data' gives 0 pts for R1 until confirmed."
    },
    factors: {
      R1: { status: "NONE", weight: 35, evidence: { ru: "Статус проверяется (0 баллов).", kz: "Мәртебе тексерілуде (0 ұпай).", en: "Under review (0 pts)." } },
      R2: { status: "CONFIRMED", weight: 25, evidence: { ru: "Реклама AD-103: «Бронирование 300 000 ₸ с фиксацией цены квадратного метра».", kz: "AD-103 жарнамасы: «Шаршы метр бағасын бекітумен 300 000 ₸ брондау».", en: "Ad AD-103: '300,000 KZT booking to fix price per square meter'." } },
      R3: { status: "CONFIRMED", weight: 10, evidence: { ru: "Реклама в Telegram-канале @ukg_nedvizhimost.", kz: "@ukg_nedvizhimost Telegram арнасындағы жарнама.", en: "Classified promotion in @ukg_nedvizhimost Telegram channel." } },
      R4: { status: "NONE", weight: 15, evidence: { ru: "Жалоб нет.", kz: "Шағымдар жоқ.", en: "No complaints." } },
      R5: { status: "NONE", weight: 10, evidence: { ru: "Расхождение в пределах нормы (5 п.п.).", kz: "Айырмашылық шектен аспайды (5 п.п.).", en: "Readiness delta within normal margin (5 pp)." } },
      R6: { status: "NONE", weight: 5, evidence: { ru: "Работы ведутся активно.", kz: "Жұмыс жүріп жатыр.", en: "Work in active progress." } }
    }
  },
  {
    id: "jk-3",
    code: "CASE-C",
    coords: [49.9296, 82.6138], // Verified residential parcel on Zhibek Zholy 14
    names: { ru: "ЖК «Алтай Премиум Резиденс»", kz: "«Алтай Премиум Резиденс» ТК", en: "Altai Premium Residence" },
    developers: { ru: "ТОО «AltaiBuildGroup-Демо»", kz: "«AltaiBuildGroup-Демо» ЖШС", en: "AltaiBuildGroup-Demo LLP" },
    bin: "210340012891",
    contactPhone: "+7 (7232) 70-05-05",
    cadastreNumber: "05:102:012:891",
    smrLicense: "ГСЛ №001045 от 11.01.2018 (I категория)",
    landPurpose: "Строительство многоквартирного жилого дома с подземным паркингом",
    districts: { ru: "ул. Жибек Жолы, 14", kz: "Жібек Жолы к-сі, 14", en: "14 Zhibek Zholy St" },
    stages: { ru: "Возведение 8-го этажа, фасадные работы", kz: "8-қабатты тұрғызу, қасбет жұмыстары", en: "8th floor erection, exterior facade" },
    readinessFact: 55,
    readinessDeclared: 58,
    legalStatus: "GUARANTEE",
    legalTexts: { ru: "Гарантия АО «КЖК» №KZ-2026/049 (до 2027 г.)", kz: "«ҚТҚ» АҚ кепілдік шарты №KZ-2026/049 (2027 ж. дейін)", en: "KZH Guarantee Agreement No. KZ-2026/049" },
    legalDetails: {
      ru: "Включен в официальный реестр Единого оператора жилищного строительства АО «КЖК». Покупка полностью защищена законом.",
      kz: "Бірыңғай оператор «ҚТҚ» АҚ ресми тізіліміне енгізілген. Сатып алу заңмен толық қорғалған.",
      en: "Whitelisted by the Single Housing Operator KZH. Fully compliant and safe for buyers."
    },
    factors: {
      R1: { status: "NONE", weight: 35, evidence: { ru: "Гарантия КЖК действует (0 баллов).", kz: "ҚТҚ кепілдігі бар (0 ұпай).", en: "KZH Guarantee active (0 pts)." } },
      R2: { status: "NONE", weight: 25, evidence: { ru: "Серых схем нет, оформление по ДДУ.", kz: "Сұр сызбалар жоқ, ҮҚШ арқылы.", en: "No grey schemes, standard contract." } },
      R3: { status: "CONFIRMED", weight: 10, evidence: { ru: "Законная реклама с указанием номера государственной гарантии КЖК.", kz: "ҚТҚ мемлекеттік кепілдік нөмірі көрсетілген заңды жарнама.", en: "Compliant advertising disclosing valid KZH guarantee license." } },
      R4: { status: "NONE", weight: 15, evidence: { ru: "Жалоб нет.", kz: "Шағымдар жоқ.", en: "No complaints." } },
      R5: { status: "NONE", weight: 10, evidence: { ru: "Готовность соответствует графику.", kz: "Дайындық кестеге сәйкес.", en: "Readiness on schedule." } },
      R6: { status: "NONE", weight: 5, evidence: { ru: "Стройка без задержек.", kz: "Құрылыс кідіріссіз.", en: "No delays." } }
    }
  },
  {
    id: "jk-4",
    code: "STAND-1",
    coords: [49.9537, 82.5995], // Verified building 32 on Astana street
    names: { ru: "ЖК «Ульба Гарденс»", kz: "«Үлбі Гарденс» ТК", en: "Ulba Gardens" },
    developers: { ru: "ТОО «УльбаИнвестГрупп-Демо»", kz: "«ҮлбіИнвестГрупп-Демо» ЖШС", en: "UlbaInvestGroup-Demo LLP" },
    bin: "220440078123",
    contactPhone: "+7 (705) 999-00-11", // Shared umbrella contact with jk-1 and jk-5
    cadastreNumber: "05:102:078:123",
    smrLicense: "ГСЛ №007341 от 05.06.2023 (II категория)",
    landPurpose: "Строительство жилого дома переменной этажности",
    districts: { ru: "ул. Астана, 32 (Набережная Ульбы, Дворец Спорта)", kz: "Астана к-сі, 32 (Үлбі жағалауы, Спорт сарайы)", en: "32 Astana St (Ulba Embankment, Sports Palace)" },
    stages: { ru: "Монолитные работы 5-го этажа", kz: "5-қабаттың монолиттік жұмыстары", en: "5th floor monolithic works" },
    readinessFact: 40,
    readinessDeclared: 45,
    legalStatus: "IN_PROCESS",
    legalTexts: { ru: "Заявка на получение разрешения МИО на рассмотрении", kz: "ЖАО рұқсатын алу өтінімі қаралуда", en: "Akimat permit application under formal review" },
    legalDetails: {
      ru: "Пакет документов сдан в УГАСК ВКО, устраняются технические замечания. Продажи до выдачи разрешения ограничены.",
      kz: "Құжаттар ШҚО МСҚБ-ға тапсырылған, ескертулер түзетілуде. Рұқсат шыққанға дейін сату шектелген.",
      en: "Documents submitted to GASK EKR, addressing technical remarks. Sales restricted until approved."
    },
    factors: {
      R1: { status: "CONFIRMED", weight: 35, evidence: { ru: "Отказ МИО ВКО в выдаче разрешения №19-04/412; гарантия КЖК отсутствует.", kz: "ШҚО ЖАО рұқсат беруден бас тартуы №19-04/412; ҚТҚ кепілдігі жоқ.", en: "Akimat refusal No. 19-04/412; no KZH guarantee." } },
      R2: { status: "CONFIRMED", weight: 25, evidence: { ru: "Сбор первоначального взноса 30% по предварительному договору в кассу.", kz: "Алдын ала шарт бойынша кассаға 30% бастапқы жарна жинау.", en: "30% down payment deposit collected to cashier." } },
      R3: { status: "CONFIRMED", weight: 10, evidence: { ru: "Агрессивная реклама в OLX.kz и Instagram (AD-106, AD-107).", kz: "OLX.kz және Instagram желілеріндегі агрессивті жарнама.", en: "Aggressive ads on OLX.kz and Instagram." } },
      R4: { status: "CONFIRMED", weight: 15, evidence: { ru: "Коллективное обращение 14 дольщиков в e-Otinish №ЖТ-2026-089112.", kz: "e-Otinish арқылы 14 үлескердің ұжымдық шағымы.", en: "Collective petition of 14 citizens on e-Otinish." } },
      R5: { status: "CONFIRMED", weight: 10, evidence: { ru: "В рекламе заявлено 80%, по акту УГАСК — 35% (разница 45 п.п. ≥ 20 п.п.).", kz: "Жарнамада 80%, МСҚБ актісі бойынша — 35% (айырма 45 п.п.).", en: "Claimed 80%, fact 35% (45 pp discrepancy)." } },
      R6: { status: "CONFIRMED", weight: 5, evidence: { ru: "Документированный простой башенного крана и стройплощадки более 4 месяцев.", kz: "Мұнаралы кран мен құрылыс алаңының 4 айдан астам тоқтап тұруы.", en: "Documented construction standstill exceeding 4 months." } }
    } },
      R2: { status: "CONFIRMED", weight: 25, evidence: { ru: "Предварительный договор намерения с задатком 1 000 000 ₸.", kz: "1 000 000 ₸ кепілақысы бар ниет туралы алдын ала келісімшарт.", en: "Preliminary intent contract with 1,000,000 KZT deposit." } },
      R3: { status: "CONFIRMED", weight: 10, evidence: { ru: "Реклама в соцсетях без указания реквизитов разрешения.", kz: "Әлеуметтік желілерде рұқсат деректерінсіз жарнамалау.", en: "Online promotion lacking permit credentials." } },
      R4: { status: "NONE", weight: 15, evidence: { ru: "Жалоб нет.", kz: "Шағымдар жоқ.", en: "No complaints." } },
      R5: { status: "NONE", weight: 10, evidence: { ru: "Расхождение незначительное (5 п.п.).", kz: "Айырмашылық шамалы (5 п.п.).", en: "Readiness discrepancy minor (5 pp)." } },
      R6: { status: "NONE", weight: 5, evidence: { ru: "Работы ведутся.", kz: "Жұмыстар жүргізілуде.", en: "Work ongoing." } }
    }
  },
  {
    id: "jk-5",
    code: "STAND-2",
    coords: [49.9999, 82.5646], // Verified building parcel 102 on Bazhov street
    names: { ru: "ЖК «Нурлы Жол Оскемен»", kz: "«Нұрлы Жол Өскемен» ТК", en: "Nurly Zhol Oskemen" },
    developers: { ru: "ТОО «ШыгысМонолит-Демо»", kz: "«ШығысМонолит-Демо» ЖШС", en: "ShygysMonolit-Demo LLP" },
    bin: "200840033991",
    contactPhone: "+7 (705) 999-00-11", // Shared umbrella contact with jk-1 and jk-4
    cadastreNumber: "05:102:033:991",
    smrLicense: "ГСЛ №003299 от 18.08.2020 (II категория)",
    landPurpose: "Строительство МЖД (производственная зона, требуется смена ПДП)",
    districts: { ru: "ул. Бажова, 102", kz: "Бажов к-сі, 102", en: "102 Bazhov St" },
    stages: { ru: "Забивка свайного поля, нулевой цикл", kz: "Қада қағу алаңы, нөлдік цикл", en: "Pile driving, foundation stage" },
    readinessFact: 10,
    readinessDeclared: 75,
    legalStatus: "ABSENT",
    legalTexts: { ru: "Разрешение отсутствует · Выявлены серые схемы", kz: "Рұқсат жоқ · Сұр сызбалар анықталды", en: "No permit · Grey scheme identified" },
    legalDetails: {
      ru: "УГАСК ВКО вынесено предписание о запрете привлечения средств. Зафиксированы жалобы дольщиков в e-Otinish.",
      kz: "ШҚО МСҚБ қаражат тартуға тыйым салу туралы нұсқама берді. e-Otinish арқылы шағымдар тіркелді.",
      en: "GASK EKR issued prohibition notice. Citizen complaints recorded in e-Otinish."
    },
    factors: {
      R1: { status: "CONFIRMED", weight: 35, evidence: { ru: "Справка МИО ВКО: разрешение на привлечение денег дольщиков отсутствует.", kz: "ШҚО ЖАО анықтамасы: үлескерлер қаражатын тартуға рұқсат жоқ.", en: "Akimat letter: no legal permit for equity funds." } },
      R2: { status: "AI_HYPOTHESIS", weight: 25, evidence: { ru: "Гипотеза ИИ (95%): найдено «Внесите депозит 400 000 ₸». Ожидает подтверждения аналитиком!", kz: "ЖИ күдігі (95%): «400 000 ₸ депозит салыңыз». Сарапшының растауын күтуде!", en: "AI flag (95%): 'Pay 400,000 KZT deposit'. Awaiting human confirmation." } },
      R3: { status: "CONFIRMED", weight: 10, evidence: { ru: "Реклама продажи квартир в строящемся блоке Б (AD-108, AD-109).", kz: "Б блогында пәтер сату жарнамасы (AD-108, AD-109).", en: "Active promotion in block B (AD-108, AD-109)." } },
      R4: { status: "NONE", weight: 15, evidence: { ru: "Подтвержденных коллективных обращений нет.", kz: "Расталған ұжымдық шағым жоқ.", en: "No confirmed complaints." } },
      R5: { status: "CONFIRMED", weight: 10, evidence: { ru: "Заявлено 75%, подтверждено 45% (расхождение 30 п.п. ≥ 20 п.п.).", kz: "75% мәлімделген, 45% расталған (айырма 30 п.п.).", en: "Claimed 75%, confirmed 45% (30 pp discrepancy)." } },
      R6: { status: "CONFIRMED", weight: 5, evidence: { ru: "Отставание от графика строительства более чем на 6 месяцев.", kz: "Құрылыс кестесінен 6 айдан астам кешігу.", en: "Schedule delay exceeding 6 months." } }
    } },
      R2: { status: "CONFIRMED", weight: 25, evidence: { ru: "Договор уступки права требования (цессия) и оплата наличными.", kz: "Талап ету құқығын басқаға беру (цессия) шарты және қолма-қол төлем.", en: "Assignment of claim rights (cession) with cash hand-over." } },
      R3: { status: "CONFIRMED", weight: 10, evidence: { ru: "Агрессивный таргет в Instagram с обещанием сдачи через 6 месяцев.", kz: "Instagram желісінде 6 айда тапсыру уәдесімен агрессивті жарнама.", en: "Aggressive Instagram ads promising handover in 6 months." } },
      R4: { status: "CONFIRMED", weight: 15, evidence: { ru: "Зарегистрировано коллективное обращение в e-Otinish от 05.10.2026.", kz: "05.10.2026 ж. e-Otinish арқылы ұжымдық шағым тіркелді.", en: "Collective petition filed on e-Otinish on 05.10.2026." } },
      R5: { status: "AI_HYPOTHESIS", weight: 10, evidence: { ru: "ИИ выявил критическое расхождение готовности: в рекламе 75%, по факту проверки — 10% (разница 65 п.п.).", kz: "ЖИ сыни дайындық алшақтығын тапты: жарнамада 75%, іс жүзінде — 10% (65 п.п.).", en: "AI flagged critical readiness discrepancy: claimed 75%, fact 10% (65 pp)." } },
      R6: { status: "NONE", weight: 5, evidence: { ru: "Простоя нет.", kz: "Тоқтау жоқ.", en: "No stoppage." } }
    }
  },
  {
    id: "jk-6",
    code: "STAND-3",
    coords: [49.8995, 82.6025], // Verified residential parcel in KShT
    names: { ru: "ЖК «КШТ Эко Квартал»", kz: "«КШТ Эко Орамы» ТК", en: "KShT Eco Quarter" },
    developers: { ru: "ТОО «EcoStroyVKO-Демо»", kz: "«EcoStroyVKO-Демо» ЖШС", en: "EcoStroyVKO-Demo LLP" },
    bin: "230640090111",
    contactPhone: "+7 (701) 555-88-99",
    cadastreNumber: "05:102:090:111",
    smrLicense: "ГСЛ №006154 от 02.04.2022 (II категория)",
    landPurpose: "Строительство жилого комплекса (КШТ)",
    districts: { ru: "ул. Рыскулова / Казыбек би, 22 (КШТ)", kz: "Рысқұлов / Қазыбек би к-сі, 22 (КШТ)", en: "22 Ryskulov / Kazybek Bi St (KSHT)" },
    stages: { ru: "Строительство 4-го этажа", kz: "4-қабат құрылысы", en: "4th floor construction" },
    readinessFact: 35,
    readinessDeclared: 90,
    legalStatus: "IN_PROCESS",
    legalTexts: { ru: "Согласование документации в МИО ВКО", kz: "ШҚО ЖАО құжаттамасын келісу", en: "Permit alignment in Akimat" },
    legalDetails: {
      ru: "Застройщик подал заявку на разрешение. Заключение договоров бронирования проверяется жилищной инспекцией.",
      kz: "Құрылыс салушы рұқсатқа өтінім берді. Брондау шарттарын тұрғын үй инспекциясы тексеруде.",
      en: "Developer applied for permit. Booking contracts under inspection."
    },
    factors: {
      R1: { status: "NONE", weight: 35, evidence: { ru: "Документы на согласовании.", kz: "Құжаттар келісілуде.", en: "Documents under review." } },
      R2: { status: "CONFIRMED", weight: 25, evidence: { ru: "Предложение «раннего бронирования с дисконтом 10%».", kz: "«10% жеңілдікпен ерте брондау» ұсынысы.", en: "Offer for 'early booking with 10% discount'." } },
      R3: { status: "CONFIRMED", weight: 10, evidence: { ru: "Баннеры в районе КШТ.", kz: "КШТ ауданындағы көше баннерлері.", en: "Outdoor billboards in KSHT area." } },
      R4: { status: "NONE", weight: 15, evidence: { ru: "Жалоб нет.", kz: "Шағымдар жоқ.", en: "No complaints." } },
      R5: { status: "AI_HYPOTHESIS", weight: 10, evidence: { ru: "В рекламе заявлена готовность 90%, фактическая готовность — 35% (разница 55 п.п. ≥ 20 п.п.).", kz: "Жарнамада 90% мәлімделген, іс жүзінде — 35% (айырма 55 п.п.).", en: "Claimed 90%, actual 35% (55 pp discrepancy >= 20 pp)." } },
      R6: { status: "NONE", weight: 5, evidence: { ru: "Работы на площадке идут.", kz: "Жұмыстар жүруде.", en: "Works on site active." } }
    }
  },
  {
    id: "jk-7",
    code: "STAND-4",
    coords: [49.9507, 82.6318], // Verified building 72 on Kazakhstan street
    names: { ru: "ЖК «Иртыш Плаза»", kz: "«Ертіс Плаза» ТК", en: "Irtysh Plaza" },
    developers: { ru: "ТОО «OskemenDevelopment-Демо»", kz: "«OskemenDevelopment-Демо» ЖШС", en: "OskemenDevelopment-Demo LLP" },
    bin: "191240044567",
    contactPhone: "+7 (7232) 55-12-34",
    cadastreNumber: "05:102:044:567",
    smrLicense: "ГСЛ №000871 от 19.11.2016 (I категория)",
    landPurpose: "Строительство многоквартирного жилого дома с офисными помещениями",
    districts: { ru: "ул. Казахстан, 72 (Центр города)", kz: "Қазақстан к-сі, 72 (Қала орталығы)", en: "72 Kazakhstan St (City Center)" },
    stages: { ru: "Внутренняя отделка, благоустройство", kz: "Ішкі әрлеу, абаттандыру", en: "Interior finishing, landscaping" },
    readinessFact: 85,
    readinessDeclared: 85,
    legalStatus: "PERMIT",
    legalTexts: { ru: "Разрешение МИО №441 от 15.02.2026", kz: "ЖАО (әкімдік) рұқсаты №441 (15.02.2026)", en: "Akimat Permit No. 441 (15.02.2026)" },
    legalDetails: {
      ru: "Официальное разрешение акимата г. Усть-Каменогорск на привлечение средств дольщиков. Законно.",
      kz: "Өскемен қ. әкімдігінің үлескерлер қаражатын тартуға ресми рұқсаты бар. Заңды.",
      en: "Official Akimat permit granted for raising equity. Fully compliant."
    },
    factors: {
      R1: { status: "NONE", weight: 35, evidence: { ru: "Разрешение акимата №441 действительно.", kz: "№441 әкімдік рұқсаты жарамды.", en: "Akimat permit No. 441 valid." } },
      R2: { status: "NONE", weight: 25, evidence: { ru: "Все продажи только по ДДУ.", kz: "Барлық сату тек ҮҚШ бойынша.", en: "All sales via official contract." } },
      R3: { status: "CONFIRMED", weight: 10, evidence: { ru: "Реклама с обязательным указанием номера разрешения акимата.", kz: "Әкімдік рұқсатының нөмірі міндетті көрсетілген жарнама.", en: "Compliant marketing with permit license disclosed." } },
      R4: { status: "NONE", weight: 15, evidence: { ru: "Жалоб нет.", kz: "Шағымдар жоқ.", en: "No complaints." } },
      R5: { status: "NONE", weight: 10, evidence: { ru: "Готовность подтверждена (85%).", kz: "Дайындық расталды (85%).", en: "Readiness confirmed (85%)." } },
      R6: { status: "NONE", weight: 5, evidence: { ru: "Строительство на финише.", kz: "Құрылыс аяқталуда.", en: "Finishing stage." } }
    }
  },
  {
    id: "jk-8",
    code: "STAND-5",
    coords: [50.0293, 82.7385], // Verified building 15 on Yegorov in Nova Sogra
    names: { ru: "ЖК «Согра Парк»", kz: "«Согра Саябағы» ТК", en: "Sogra Park" },
    developers: { ru: "ТОО «СограДомСтрой-Демо»", kz: "«СограДомСтрой-Демо» ЖШС", en: "SograDomStroy-Demo LLP" },
    bin: "180940011234",
    contactPhone: "+7 (7232) 61-00-99",
    cadastreNumber: "05:102:011:234",
    smrLicense: "ГСЛ №000512 от 12.05.2015 (I категория)",
    landPurpose: "Эксплуатация и обслуживание многоквартирного жилого дома",
    districts: { ru: "пос. Новая Согра, ул. Егорова, 15", kz: "Жаңа Согра кенті, Егоров к-сі, 15", en: "Nova Sogra, 15 Yegorov St" },
    stages: { ru: "Завершение отделки, ввод в эксплуатацию", kz: "Әрлеуді аяқтау, пайдалануға беру", en: "Final finishing, commissioning" },
    readinessFact: 98,
    readinessDeclared: 100,
    legalStatus: "PERMIT",
    legalTexts: { ru: "Разрешение МИО №112 и акт приемки", kz: "ЖАО рұқсаты №112 және қабылдау актісі", en: "Akimat Permit No. 112 & Handover Act" },
    legalDetails: {
      ru: "Дом полностью достроен и прошел государственную комиссию. Рисков для покупателей нет.",
      kz: "Үй толық салынып бітті және мемлекеттік комиссиядан өтті. Тәуекел жоқ.",
      en: "Fully built and cleared by state inspection. Zero risk for buyers."
    },
    factors: {
      R1: { status: "NONE", weight: 35, evidence: { ru: "Дом сдан, госакт оформлен.", kz: "Үй тапсырылды, мемлекеттік акт бар.", en: "Commissioned, state act cleared." } },
      R2: { status: "NONE", weight: 25, evidence: { ru: "Серых схем нет.", kz: "Сұр сызбалар жоқ.", en: "No grey schemes." } },
      R3: { status: "NONE", weight: 10, evidence: { ru: "Реклама готового сданного жилья.", kz: "Дайын баспана жарнамасы.", en: "Ready housing promotion." } },
      R4: { status: "NONE", weight: 15, evidence: { ru: "Жалоб нет.", kz: "Шағымдар жоқ.", en: "No complaints." } },
      R5: { status: "NONE", weight: 10, evidence: { ru: "Фактическая готовность 98-100%.", kz: "Нақты дайындық 98-100%.", en: "Actual readiness 98-100%." } },
      R6: { status: "NONE", weight: 5, evidence: { ru: "Дом введен в эксплуатацию.", kz: "Үй пайдалануға берілді.", en: "Commissioned." } }
    }
  }
];

const INITIAL_ADS = [
  {
    id: "AD-101",
    complexId: "jk-1",
    source: "Krisha.kz",
    platform: "Krisha.kz",
    account: "Отдел продаж «Ertis River»",
    phone: "+7 (705) 999-00-11",
    date: "14.10.2026",
    pubDate: "14.10.2026",
    capturedAt: "14.10.2026, 11:30",
    url: "https://krisha.kz/a/show/69012345",
    rawText: "Срочно! Продажа 2-комн. квартиры в ЖК Ертіс Рівер. Требуется внести 500 000 ₸ за бронь и 20% в кассу застройщика до разрешения.",
    text: "Срочно! Продажа 2-комн. квартиры в ЖК Ертіс Рівер. Требуется внести 500 000 ₸ за бронь и 20% в кассу застройщика до разрешения.",
    triggerSpan: "внести 500 000 ₸ за бронь и 20% в кассу",
    triggers: ["депозит 500 000 ₸", "в кассу", "до разрешения"],
    proposedFactor: "R2",
    confidence: 96,
    aiHypothesis: "R2 (+25 баллов): Незаконный сбор денег до ДДУ",
    status: "CONFIRMED"
  },
  {
    id: "AD-102",
    complexId: "jk-1",
    source: "Instagram",
    platform: "Instagram",
    account: "@oskemen_invest_flat",
    phone: "+7 (705) 999-00-11",
    date: "13.10.2026",
    pubDate: "13.10.2026",
    capturedAt: "13.10.2026, 17:45",
    url: "https://instagram.com/p/DB123456",
    rawText: "Готовность объекта уже 65%! Успейте забронировать видовые квартиры по ранней цене до сдачи дома.",
    text: "Готовность объекта уже 65%! Успейте забронировать видовые квартиры по ранней цене до сдачи дома.",
    triggerSpan: "Готовность объекта уже 65%",
    triggers: ["Готовность 65%", "забронируйте"],
    proposedFactor: "R5",
    confidence: 92,
    aiHypothesis: "R5 (+10 баллов): Завышение готовности (65% vs факт 30%, разница 35 п.п.)",
    status: "AI_HYPOTHESIS"
  },
  {
    id: "AD-103",
    complexId: "jk-2",
    source: "Telegram",
    platform: "Telegram",
    account: "@ukg_nedvizhimost",
    phone: "+7 (777) 404-22-10",
    date: "12.10.2026",
    pubDate: "12.10.2026",
    capturedAt: "12.10.2026, 09:15",
    url: "https://t.me/ukg_nedvizhimost/401",
    rawText: "ЖК Сатпаев Сити Парк. Старт предзаказов! Внесите 300 000 ₸ для фиксации цены квадратного метра.",
    text: "ЖК Сатпаев Сити Парк. Старт предзаказов! Внесите 300 000 ₸ для фиксации цены квадратного метра.",
    triggerSpan: "Внесите 300 000 ₸ для фиксации цены",
    triggers: ["300 000 ₸", "фиксация цены"],
    proposedFactor: "R2",
    confidence: 94,
    aiHypothesis: "R2 (+25 баллов): Платная бронь до ДДУ",
    status: "CONFIRMED"
  },
  {
    id: "AD-104",
    complexId: "jk-2",
    source: "Instagram",
    platform: "Instagram",
    account: "@satpayev_city_demo",
    phone: "+7 (777) 404-22-10",
    date: "12.10.2026",
    pubDate: "12.10.2026",
    capturedAt: "12.10.2026, 14:00",
    url: "https://instagram.com/p/DB776655",
    rawText: "Новый современный квартал на КШТ! Скоро старт официальных продаж во II квартале 2028 года.",
    text: "Новый современный квартал на КШТ! Скоро старт официальных продаж во II квартале 2028 года.",
    triggerSpan: "Скоро старт официальных продаж",
    triggers: ["старт продаж"],
    proposedFactor: "R3",
    confidence: 88,
    aiHypothesis: "R3 (+10 баллов): Реклама до разрешения",
    status: "CONFIRMED"
  },
  {
    id: "AD-105",
    complexId: "jk-3",
    source: "Krisha.kz",
    platform: "Krisha.kz",
    account: "Отдел продаж «AltaiBuild»",
    phone: "+7 (7232) 70-05-05",
    date: "14.10.2026",
    pubDate: "14.10.2026",
    capturedAt: "14.10.2026, 14:20",
    url: "https://krisha.kz/a/show/69088812",
    rawText: "Продажа 1-комн. квартир с гарантией АО «КЖК» №KZ-2026/049. Ипотека Отбасы банк 7-20-25.",
    text: "Продажа 1-комн. квартир с гарантией АО «КЖК» №KZ-2026/049. Ипотека Отбасы банк 7-20-25.",
    triggerSpan: "гарантией АО «КЖК» №KZ-2026/049",
    triggers: ["Гарантия КЖК", "Отбасы банк"],
    proposedFactor: "R3",
    confidence: 99,
    aiHypothesis: "R3 (Законно): Номер гарантии КЖК подтвержден",
    status: "VERIFIED_OK"
  },
  {
    id: "AD-106",
    complexId: "jk-4",
    source: "OLX.kz",
    platform: "OLX.kz",
    account: "Риелторский центр «Восток»",
    phone: "+7 (705) 999-00-11", // Collision phone!
    date: "11.10.2026",
    pubDate: "11.10.2026",
    capturedAt: "11.10.2026, 11:00",
    url: "https://olx.kz/d/obyavlenie/ID444555.html",
    rawText: "ЖК Ульба Гарденс на Астане 32. Внесите ПВ 30% в кассу застройщика по предварительному договору.",
    text: "ЖК Ульба Гарденс на Астане 32. Внесите ПВ 30% в кассу застройщика по предварительному договору.",
    triggerSpan: "Внесите ПВ 30% в кассу",
    triggers: ["ПВ 30% в кассу", "предварительный договор"],
    proposedFactor: "R2",
    confidence: 93,
    aiHypothesis: "R2 (+25 баллов): Взнос до разрешения",
    status: "CONFIRMED"
  },
  {
    id: "AD-107",
    complexId: "jk-4",
    source: "Instagram",
    platform: "Instagram",
    account: "@ulba_gardens_demo",
    phone: "+7 (705) 999-00-11", // Collision phone!
    date: "11.10.2026",
    pubDate: "11.10.2026",
    capturedAt: "11.10.2026, 16:10",
    url: "https://instagram.com/p/DB987654",
    rawText: "Квартиры с видом на Ульбу! Задаток 1 000 000 ₸ для заключения соглашения о резервировании.",
    text: "Квартиры с видом на Ульбу! Задаток 1 000 000 ₸ для заключения соглашения о резервировании.",
    triggerSpan: "Задаток 1 000 000 ₸ для заключения соглашения",
    triggers: ["задаток 1 000 000 ₸", "соглашение о резервировании"],
    proposedFactor: "R2",
    confidence: 95,
    aiHypothesis: "R2 (+25 баллов): Задаток по бронированию",
    status: "CONFIRMED"
  },
  {
    id: "AD-108",
    complexId: "jk-5",
    source: "Telegram",
    platform: "Telegram",
    account: "@shygys_flats",
    phone: "+7 (705) 999-00-11", // Collision phone!
    date: "10.10.2026",
    pubDate: "10.10.2026",
    capturedAt: "10.10.2026, 12:00",
    url: "https://t.me/shygys_flats/108",
    rawText: "ЖК Нурлы Жол на Бажова! Внесите депозит 400 000 ₸ для бронирования квартиры по стартовой стоимости.",
    text: "ЖК Нурлы Жол на Бажова! Внесите депозит 400 000 ₸ для бронирования квартиры по стартовой стоимости.",
    triggerSpan: "депозит 400 000 ₸ для бронирования",
    triggers: ["депозит 400 000 ₸", "бронирование"],
    proposedFactor: "R2",
    confidence: 95,
    aiHypothesis: "R2 (+25 баллов): Депозит при отсутствии разрешения",
    status: "CONFIRMED"
  },
  {
    id: "AD-109",
    complexId: "jk-5",
    source: "Instagram",
    platform: "Instagram",
    account: "@shygys_monolit_demo",
    phone: "+7 (705) 999-00-11", // Collision phone!
    date: "09.10.2026",
    pubDate: "09.10.2026",
    capturedAt: "09.10.2026, 18:30",
    url: "https://instagram.com/p/DB332211",
    rawText: "Готовность уже 75%! Покупайте 2-комнатные квартиры со скидкой 10% напрямую без посредников.",
    text: "Готовность уже 75%! Покупайте 2-комнатные квартиры со скидкой 10% напрямую без посредников.",
    triggerSpan: "Готовность уже 75%",
    triggers: ["Готовность 75%"],
    proposedFactor: "R5",
    confidence: 93,
    aiHypothesis: "R5 (+10 баллов): Завышение готовности (75% vs факт 10%, разница 65 п.п.)",
    status: "AI_HYPOTHESIS"
  },
  {
    id: "AD-110",
    complexId: "jk-6",
    source: "Krisha.kz",
    platform: "Krisha.kz",
    account: "Отдел продаж КШТ",
    phone: "+7 (701) 555-88-99",
    date: "08.10.2026",
    pubDate: "08.10.2026",
    capturedAt: "08.10.2026, 10:00",
    url: "https://krisha.kz/a/show/69011022",
    rawText: "Эко Квартал на Рыскулова. Готовность дома 90% (по факту проверки ГАСК — 35%). Рассрочка.",
    text: "Эко Квартал на Рыскулова. Готовность дома 90% (по факту проверки ГАСК — 35%). Рассрочка.",
    triggerSpan: "Готовность дома 90%",
    triggers: ["Готовность 90%", "рассрочка"],
    proposedFactor: "R5",
    confidence: 91,
    aiHypothesis: "R5 (+10 баллов): Разница готовности 55 п.п. ≥ 20 п.п.",
    status: "AI_HYPOTHESIS"
  },
  {
    id: "AD-111",
    complexId: "jk-7",
    source: "Krisha.kz",
    platform: "Krisha.kz",
    account: "ТОО «OskemenDevelopment»",
    phone: "+7 (7232) 55-12-34",
    date: "07.10.2026",
    pubDate: "07.10.2026",
    capturedAt: "07.10.2026, 15:40",
    url: "https://krisha.kz/a/show/69055443",
    rawText: "ЖК Иртыш Плаза. Официальное разрешение акимата №441. Безопасная покупка по договорам ДДУ.",
    text: "ЖК Иртыш Плаза. Официальное разрешение акимата №441. Безопасная покупка по договорам ДДУ.",
    triggerSpan: "Официальное разрешение акимата №441",
    triggers: ["Разрешение №441", "Договор ДДУ"],
    proposedFactor: "R3",
    confidence: 98,
    aiHypothesis: "R3 (Законно): Разрешение МИО действует",
    status: "VERIFIED_OK"
  },
  {
    id: "AD-112",
    complexId: "jk-8",
    source: "Krisha.kz",
    platform: "Krisha.kz",
    account: "Застройщик «СограДомСтрой»",
    phone: "+7 (7232) 61-00-99",
    date: "06.10.2026",
    pubDate: "06.10.2026",
    capturedAt: "06.10.2026, 11:20",
    url: "https://krisha.kz/a/show/69022110",
    rawText: "Готовое жилье в Согре! Дом введен в эксплуатацию, ключи в день сделки, госакт оформлен.",
    text: "Готовое жилье в Согре! Дом введен в эксплуатацию, ключи в день сделки, госакт оформлен.",
    triggerSpan: "Дом введен в эксплуатацию, ключи в день сделки",
    triggers: ["Дом сдан", "Госакт"],
    proposedFactor: "R3",
    confidence: 97,
    aiHypothesis: "0 баллов: Введено в эксплуатацию, рисков нет",
    status: "VERIFIED_OK"
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
    ru: "⚠️ Требует проверки (0 б.)",
    kz: "⚠️ Тексеруді талап етеді (0 ұпай)",
    en: "⚠️ Requires Verification (0 pts)"
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
    matchedValid: "ЖК «Алтай Премиум Резиденс» (Договор гарантии №KZ-2026/049)",
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
    matchedValid: "ЖК «Иртыш Плаза» (№441) и ЖК «Согра Парк» (№112)",
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
    matchedValid: "ЖК «Алтай Премиум Резиденс», ЖК «Иртыш Плаза» (зарегистрированы)",
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
    matchedValid: "Предписание №04-12/881 о запрете привлечения средств по объектам jk-1 и jk-5",
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
    matchedValid: "ЖК «Нурлы Жол» (обращение №ЖТ-2026-00918 от 05.10.2026)",
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
    matchedValid: "Иск УГАСК ВКО о приостановлении привлечения средств по объекту jk-5",
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
