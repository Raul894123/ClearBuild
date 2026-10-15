// Centralized Data for SAQ QURYLYS / ClearBuild
// 100% Accurate Parcel Coordinates for Ust-Kamenogorsk

const RAW_COMPLEXES = [
  {
    id: "jk-1",
    code: "CASE-B",
    coords: [49.9440, 82.6302], // Verified parcel 17 on Permitin street / Strelka
    names: { ru: "ЖК «Ертіс Рівер Тауэрс»", kz: "«Ертіс Рівер Тауэрс» ТК", en: "Ertis River Towers" },
    developers: { ru: "ТОО «ВостокСтройИнвест-Демо»", kz: "«ВостокСтройИнвест-Демо» ЖШС", en: "VostokStroyInvest-Demo LLP" },
    bin: "240540099102",
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
      R2: { status: "CONFIRMED", weight: 25, evidence: { ru: "Реклама AD-103: «Бронирование 150 000 ₸ с фиксацией цены квадратного метра».", kz: "AD-103 жарнамасы: «Шаршы метр бағасын бекітумен 150 000 ₸ брондау».", en: "Ad AD-103: '150,000 KZT booking to fix price per square meter'." } },
      R3: { status: "CONFIRMED", weight: 10, evidence: { ru: "Реклама в Telegram-канале @ukg_nedvizhimost.", kz: "@ukg_nedvizhimost Telegram арнасындағы жарнама.", en: "Classified promotion in @ukg_nedvizhimost Telegram channel." } },
      R4: { status: "NONE", weight: 15, evidence: { ru: "Жалоб нет.", kz: "Шағымдар жоқ.", en: "No complaints." } },
      R5: { status: "NONE", weight: 10, evidence: { ru: "Расхождение в пределах нормы (5 п.п.).", kz: "Айырмашылық шектен аспайды (5 п.п.).", en: "Readiness delta within normal margin (5 pp)." } },
      R6: { status: "NONE", weight: 5, evidence: { ru: "Работы ведутся активно.", kz: "Жұмыс жүріп жатыр.", en: "Work in active progress." } }
    }
  },
  {
    id: "jk-3",
    code: "CASE-C",
    coords: [49.9296, 82.6138], // Verified residential parcel on Zhibek Zholy 14 (north of road, off traffic lanes)
    names: { ru: "ЖК «Алтай Премиум Резиденс»", kz: "«Алтай Премиум Резиденс» ТК", en: "Altai Premium Residence" },
    developers: { ru: "ТОО «AltaiBuildGroup-Демо»", kz: "«AltaiBuildGroup-Демо» ЖШС", en: "AltaiBuildGroup-Demo LLP" },
    bin: "210340012891",
    districts: { ru: "ул. Жибек Жолы, 14", kz: "Жібек Жолы к-сі, 14", en: "14 Zhibek Zholy St" },
    stages: { ru: "Возведение 8-го этажа, фасадные работы", kz: "8-қабатты тұрғызу, қасбет жұмыстары", en: "8th floor erection, exterior facade" },
    readinessFact: 55,
    readinessDeclared: 58,
    legalStatus: "GUARANTEE",
    legalTexts: { ru: "Гарантия АО «КЖК» №KZ-2026-089 (до 2027 г.)", kz: "«ҚТҚ» АҚ кепілдік шарты №KZ-2026-089 (2027 ж. дейін)", en: "KZH Guarantee Agreement No. KZ-2026-089" },
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
    coords: [49.9537, 82.5995], // Verified building 32 on Astana street along the Ulba embankment
    names: { ru: "ЖК «Ульба Гарденс»", kz: "«Үлбі Гарденс» ТК", en: "Ulba Gardens" },
    developers: { ru: "ТОО «УльбаИнвестГрупп-Демо»", kz: "«ҮлбіИнвестГрупп-Демо» ЖШС", en: "UlbaInvestGroup-Demo LLP" },
    bin: "220440078123",
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
      R1: { status: "NONE", weight: 35, evidence: { ru: "Заявка на проверке в акимате.", kz: "Әкімдікте өтінім тексерілуде.", en: "Permit under review." } },
      R2: { status: "CONFIRMED", weight: 25, evidence: { ru: "Предварительный договор намерения с задатком 300 000 ₸.", kz: "300 000 ₸ кепілақысы бар ниет туралы алдын ала келісімшарт.", en: "Preliminary intent contract with 300,000 KZT deposit." } },
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
    districts: { ru: "ул. Бажова, 102", kz: "Бажов к-сі, 102", en: "102 Bazhov St" },
    stages: { ru: "Забивка свайного поля, нулевой цикл", kz: "Қада қағу алаңы, нөлдік цикл", en: "Pile driving, foundation stage" },
    readinessFact: 10,
    readinessDeclared: 25,
    legalStatus: "ABSENT",
    legalTexts: { ru: "Разрешение отсутствует · Выявлены серые схемы", kz: "Рұқсат жоқ · Сұр сызбалар анықталды", en: "No permit · Grey scheme identified" },
    legalDetails: {
      ru: "УГАСК ВКО вынесено предписание о запрете привлечения средств. Зафиксированы жалобы дольщиков в e-Otinish.",
      kz: "ШҚО МСҚБ қаражат тартуға тыйым салу туралы нұсқама берді. e-Otinish арқылы шағымдар тіркелді.",
      en: "GASK EKR issued prohibition notice. Citizen complaints recorded in e-Otinish."
    },
    factors: {
      R1: { status: "CONFIRMED", weight: 35, evidence: { ru: "Отсутствует разрешение акимата и гарантия КЖК.", kz: "Әкімдік рұқсаты да, ҚТҚ кепілдігі де жоқ.", en: "No Akimat permit and no KZH guarantee." } },
      R2: { status: "CONFIRMED", weight: 25, evidence: { ru: "Договор уступки права требования (цессия) и оплата наличными.", kz: "Талап ету құқығын басқаға беру (цессия) шарты және қолма-қол төлем.", en: "Assignment of claim rights (cession) with cash hand-over." } },
      R3: { status: "CONFIRMED", weight: 10, evidence: { ru: "Агрессивный таргет в Instagram с обещанием сдачи через 6 месяцев.", kz: "Instagram желісінде 6 айда тапсыру уәдесімен агрессивті жарнама.", en: "Aggressive Instagram ads promising handover in 6 months." } },
      R4: { status: "CONFIRMED", weight: 5, evidence: { ru: "Зарегистрировано коллективное обращение в e-Otinish от 05.10.2026.", kz: "05.10.2026 ж. e-Otinish арқылы ұжымдық шағым тіркелді.", en: "Collective petition filed on e-Otinish on 05.10.2026." } },
      R5: { status: "NONE", weight: 10, evidence: { ru: "Разница 15 п.п. (порог 20 п.п. не превышен).", kz: "Айырма 15 п.п. (20 п.п. шегінен аспаған).", en: "Difference 15 pp (threshold 20 pp not exceeded)." } },
      R6: { status: "NONE", weight: 5, evidence: { ru: "Простоя нет.", kz: "Тоқтау жоқ.", en: "No stoppage." } }
    }
  },
  {
    id: "jk-6",
    code: "STAND-3",
    coords: [49.8995, 82.6025], // Verified residential parcel in KShT (Ryskulov / Kazybek bi)
    names: { ru: "ЖК «КШТ Эко Квартал»", kz: "«КШТ Эко Орамы» ТК", en: "KShT Eco Quarter" },
    developers: { ru: "ТОО «EcoStroyVKO-Демо»", kz: "«EcoStroyVKO-Демо» ЖШС", en: "EcoStroyVKO-Demo LLP" },
    bin: "230640090111",
    districts: { ru: "ул. Рыскулова / Казыбек би, 22 (КШТ)", kz: "Рысқұлов / Қазыбек би к-сі, 22 (КШТ)", en: "22 Ryskulov / Kazybek Bi St (KSHT)" },
    stages: { ru: "Строительство 4-го этажа", kz: "4-қабат құрылысы", en: "4th floor construction" },
    readinessFact: 35,
    readinessDeclared: 35,
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
      R5: { status: "NONE", weight: 10, evidence: { ru: "Готовность совпадает (35%).", kz: "Дайындық сәйкес (35%).", en: "Readiness matches (35%)." } },
      R6: { status: "NONE", weight: 5, evidence: { ru: "Работы на площадке идут.", kz: "Жұмыстар жүруде.", en: "Works on site active." } }
    }
  },
  {
    id: "jk-7",
    code: "STAND-4",
    coords: [49.9507, 82.6318], // Verified building 72 on Kazakhstan street (City Center)
    names: { ru: "ЖК «Иртыш Плаза»", kz: "«Ертіс Плаза» ТК", en: "Irtysh Plaza" },
    developers: { ru: "ТОО «OskemenDevelopment-Демо»", kz: "«OskemenDevelopment-Демо» ЖШС", en: "OskemenDevelopment-Demo LLP" },
    bin: "191240044567",
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
    coords: [50.0293, 82.7385], // Verified building 15 on Yegorov / Mendeleyev in Nova Sogra near TMK
    names: { ru: "ЖК «Согра Парк»", kz: "«Согра Саябағы» ТК", en: "Sogra Park" },
    developers: { ru: "ТОО «СограДомСтрой-Демо»", kz: "«СограДомСтрой-Демо» ЖШС", en: "SograDomStroy-Demo LLP" },
    bin: "180940011234",
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
  { id: "AD-101", complexId: "jk-1", source: "Krisha.kz", date: "14.10.2026", capturedAt: "14.10.2026, 11:30", url: "https://krisha.kz/a/show/69012345", rawText: "Срочно! Продажа 2-комн. квартиры в ЖК Ертіс Рівер. Требуется внести 500 000 ₸ за бронь и 20% в кассу застройщика до разрешения.", triggerSpan: "внести 500 000 ₸ за бронь и 20% в кассу", triggers: ["депозит 500 000 ₸", "в кассу", "до разрешения"], aiHypothesis: "R2 (+25 баллов): Незаконный сбор денег до ДДУ", status: "CONFIRMED" },
  { id: "AD-102", complexId: "jk-1", source: "Instagram", date: "13.10.2026", capturedAt: "13.10.2026, 17:45", url: "https://instagram.com/p/DB123456", rawText: "Элитное жилье на набережной! Забронируйте квартиру по ранней цене прямо сейчас в отделе продаж.", triggerSpan: "Забронируйте квартиру по ранней цене", triggers: ["забронируйте", "ранняя цена"], aiHypothesis: "R3 (+10 баллов): Реклама без гарантии", status: "CONFIRMED" },
  { id: "AD-103", complexId: "jk-2", source: "Telegram", date: "12.10.2026", capturedAt: "12.10.2026, 09:15", url: "https://t.me/ukg_nedvizhimost/401", rawText: "ЖК Сатпаев Сити Парк. Старт предзаказов! Внесите 150 000 ₸ для фиксации цены квадратного метра.", triggerSpan: "Внесите 150 000 ₸ для фиксации цены", triggers: ["150 000 ₸", "фиксация цены"], aiHypothesis: "R2 (+25 баллов): Платная бронь", status: "CONFIRMED" },
  { id: "AD-104", complexId: "jk-3", source: "Krisha.kz", date: "14.10.2026", capturedAt: "14.10.2026, 14:20", url: "https://krisha.kz/a/show/69088812", rawText: "Продажа 1-комн. квартир с гарантией АО «КЖК» №KZ-2026-089. Ипотека Отбасы банк 7-20-25.", triggerSpan: "гарантией АО «КЖК» №KZ-2026-089", triggers: ["Гарантия КЖК", "Отбасы банк"], aiHypothesis: "R3 (Законно): Лицензия подтверждена", status: "VERIFIED_OK" },
  { id: "AD-105", complexId: "jk-4", source: "Instagram", date: "11.10.2026", capturedAt: "11.10.2026, 16:10", url: "https://instagram.com/p/DB987654", rawText: "ЖК Ульба Гарденс на Астане 32. Заключаем предварительные соглашения с задатком 300 000 тенге.", triggerSpan: "предварительные соглашения с задатком 300 000 тенге", triggers: ["предварительное соглашение", "задаток 300 000"], aiHypothesis: "R2 (+15 баллов): Соглашение о намерениях", status: "CONFIRMED" },
  { id: "AD-106", complexId: "jk-5", source: "OLX.kz", date: "10.10.2026", capturedAt: "10.10.2026, 12:00", url: "https://olx.kz/d/obyavlenie/ID777666.html", rawText: "Переуступка квартиры в ЖК Нурлы Жол! Оплата только наличными в офисе продаж, скидка 15%.", triggerSpan: "Переуступка квартиры в ЖК Нурлы Жол! Оплата только наличными", triggers: ["переуступка", "только наличными"], aiHypothesis: "R2 (+25 баллов): Цессия в обход ДДУ", status: "CONFIRMED" },
  { id: "AD-107", complexId: "jk-5", source: "Instagram", date: "09.10.2026", capturedAt: "09.10.2026, 18:30", url: "https://instagram.com/p/DB332211", rawText: "Успейте купить! Квартиры в рассрочку от застройщика без банка на ул. Бажова.", triggerSpan: "рассрочку от застройщика без банка", triggers: ["рассрочка без банка"], aiHypothesis: "R3 (+10 баллов): Несанкционированная реклама", status: "CONFIRMED" },
  { id: "AD-108", complexId: "jk-6", source: "Баннер", date: "08.10.2026", capturedAt: "08.10.2026, 10:00", url: "https://clearbuild.kz/evidence/banner-ksht-22.jpg", rawText: "Эко Квартал на Рыскулова. Раннее бронирование квартир с дисконтом 10%.", triggerSpan: "Раннее бронирование квартир с дисконтом 10%", triggers: ["раннее бронирование", "дисконт"], aiHypothesis: "R2 (+25 баллов): Привлечение средств", status: "CONFIRMED" },
  { id: "AD-109", complexId: "jk-7", source: "Krisha.kz", date: "07.10.2026", capturedAt: "07.10.2026, 15:40", url: "https://krisha.kz/a/show/69055443", rawText: "ЖК Иртыш Плаза. Разрешение акимата №441. Безопасная покупка по договорам ДДУ.", triggerSpan: "Разрешение акимата №441", triggers: ["Разрешение №441", "Договор ДДУ"], aiHypothesis: "R3 (Законно): Разрешение МИО действует", status: "VERIFIED_OK" },
  { id: "AD-110", complexId: "jk-8", source: "Крыша", date: "06.10.2026", capturedAt: "06.10.2026, 11:20", url: "https://krisha.kz/a/show/69022110", rawText: "Готовое жилье в Согре! Дом сдан, ключи в день сделки, госакт оформлен.", triggerSpan: "Дом сдан, ключи в день сделки", triggers: ["Дом сдан", "Госакт"], aiHypothesis: "0 баллов: Введено в эксплуатацию", status: "VERIFIED_OK" },
  { id: "AD-111", complexId: "jk-1", source: "OLX.kz", date: "05.10.2026", capturedAt: "05.10.2026, 13:00", url: "https://olx.kz/d/obyavlenie/ID888999.html", rawText: "Инвестируйте на нулевом цикле! Доходность 30% годовых при вступлении в жилищный кооператив.", triggerSpan: "вступлении в жилищный кооператив", triggers: ["жилищный кооператив", "инвестируйте"], aiHypothesis: "R2 (+25 баллов): Серая схема через ЖСК", status: "PENDING" },
];

// Ensure all ad objects have complete field aliases (text, rawText, date, pubDate, platform, source)
INITIAL_ADS.forEach(a => {
  a.text = a.text || a.rawText || '';
  a.rawText = a.rawText || a.text || '';
  a.pubDate = a.pubDate || a.date || a.capturedAt || '14.10.2026';
  a.date = a.date || a.pubDate || a.capturedAt || '14.10.2026';
  a.capturedAt = a.capturedAt || a.date || a.pubDate || '14.10.2026, 12:00';
  a.platform = a.platform || a.source || 'Krisha.kz';
  a.source = a.source || a.platform || 'Krisha.kz';
  a.url = a.url || '#';
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
    ru: "✅ ЗАКОННОЕ СТРОИТЕЛЬСТВО: Правовое основание проверено (действующая гарантия КЖК / разрешение МИО / дом сдан). Оформляйте сделку только через официальный ДДУ с регистрацией в Казреестре.",
    kz: "✅ ЗАҢДЫ ҚҰРЫЛЫС: Заңды негіз тексерілген (қолданыстағы ҚТҚ кепілдігі / ЖАО рұқсаты / үй пайдалануға берілген). Мәмілені тек Қазреестрде тіркелетін ресми ҮҚШ арқылы жасаңыз.",
    en: "✅ COMPLIANT CONSTRUCTION: Legal authority verified (active KZH guarantee / Akimat permit / commissioned). Sign transactions only through official contracts registered in Kazreestr."
  }
};

const FACTOR_INFO = {
  R1: { weight: 35, ru: "Отсутствие правового основания на привлечение средств дольщиков", kz: "Үлескерлер қаражатын тартуға заңды негіздің болмауы", en: "Absence of legal grounds for raising citizen funds" },
  R2: { weight: 25, ru: "Прямое предложение внести деньги до заключения официального ДДУ", kz: "Ресми ҮҚШ жасалғанға дейін ақша салу туралы тікелей ұсыныс", en: "Direct demand for money prior to official contract" },
  R3: { weight: 10, ru: "Реклама строящегося жилья до ввода в эксплуатацию", kz: "Пайдалануға берілгенге дейін салынып жатқан баспананы жарнамалау", en: "Advertising housing under construction prior to handover" },
  R4: { weight: 15, ru: "Наличие подтвержденных жалоб и обращений граждан", kz: "Азаматтардың расталған шағымдары мен өтініштері", en: "Confirmed citizen complaints in e-Otinish" },
  R5: { weight: 10, ru: "Расхождение заявленной и фактической готовности (≥20 п.п.)", kz: "Мәлімделген және нақты дайындықтың алшақтығы (≥20 п.п.)", en: "Discrepancy in declared vs verified readiness (≥20 pp)" },
  R6: { weight: 5,  ru: "Приостановка строительных работ на площадке (простой)", kz: "Алаңда құрылыс жұмыстарының тоқтатылуы (бос тұру)", en: "Work stoppage on the construction site" }
};

// Factor status localization (replaces robotic AI_HYPOTHESIS with human-friendly plain language)
const FACTOR_STATUS_LABELS = {
  CONFIRMED: {
    ru: "✅ Подтверждён (+вес)",
    kz: "✅ Расталды (+ұпай)",
    en: "✅ Confirmed (+pts)"
  },
  AI_HYPOTHESIS: {
    ru: "🤖 Подозрение ИИ (0 б. до проверки)",
    kz: "🤖 ЖИ анықтаған күдік (0 ұпай)",
    en: "🤖 AI Flagged (0 pts until verified)"
  },
  UNVERIFIED: {
    ru: "⚠️ Нужна проверка (0 б.)",
    kz: "⚠️ Тексеруді талап етеді (0 ұпай)",
    en: "⚠️ Verification Needed (0 pts)"
  },
  NONE: {
    ru: "⚪ Не выявлено (0 б.)",
    kz: "⚪ Анықталған жоқ (0 ұпай)",
    en: "⚪ Not Detected (0 pts)"
  }
};

function getFactorStatusLabel(status, lang = 'ru') {
  const item = FACTOR_STATUS_LABELS[status];
  if (!item) return status;
  return item[lang] || item['ru'] || status;
}

// 11 Official State Registries of the Republic of Kazakhstan
const STATE_REGISTRIES_RK = [
  {
    id: "REG-01",
    code: "KZH-GUARANTEE",
    name: {
      ru: "Реестр гарантийных договоров АО «КЖК»",
      kz: "«ҚТҚ» АҚ кепілдік шарттарының тізілімі",
      en: "KZH Single Housing Operator Guarantee Registry"
    },
    authority: {
      ru: "АО «Казахстанская Жилищная Компания» (Единый оператор)",
      kz: "«Қазақстан Тұрғын үй Компаниясы» АҚ (Бірыңғай оператор)",
      en: "Kazakhstan Housing Company JSC"
    },
    lawArticle: "Ст. 7 Закона РК о долевом участии (Гарантия Единого оператора)",
    status: "ONLINE",
    statusText: { ru: "Интегрировано · 100% сверка", kz: "Біріктірілген · 100% салыстыру", en: "Integrated · 100% matched" },
    recordsCount: 8,
    matchedValid: "ЖК «Алтай Премиум Резиденс» (№KZ-2026-089)",
    lastSync: "15.10.2026, 09:15",
    url: "https://khc.kz"
  },
  {
    id: "REG-02",
    code: "MIO-PERMITS",
    name: {
      ru: "Реестр разрешений МИО ВКО на привлечение денег",
      kz: "ШҚО ЖАО ақша тартуға рұқсаттарының тізілімі",
      en: "East Kazakhstan Akimat Developer Permits Registry"
    },
    authority: {
      ru: "ГУ «Отдел архитектуры и градостроительства г. Усть-Каменогорска» / МИО ВКО",
      kz: "«Өскемен қаласының сәулет және қала құрылысы бөлімі» ММ",
      en: "Ust-Kamenogorsk Urban Architecture Dept / Akimat"
    },
    lawArticle: "Ст. 8 и ст. 18 Закона РК (Разрешения акимата: участие БВУ / каркас)",
    status: "ONLINE",
    statusText: { ru: "Интегрировано · Постановления акимата", kz: "Біріктірілген · Әкімдік қаулылары", en: "Integrated · Akimat decrees" },
    recordsCount: 8,
    matchedValid: "ЖК «Иртыш Плаза» (№441), ЖК «Согра Парк» (№112)",
    lastSync: "15.10.2026, 09:20",
    url: "https://gov.kz/memleket/entities/akimvko"
  },
  {
    id: "REG-03",
    code: "KAZREESTR-DDU",
    name: {
      ru: "ИС «Казреестр» (Единая база договоров ДДУ)",
      kz: "«Қазреестр» АЖ (ҮҚШ шарттарының бірыңғай базасы)",
      en: "Kazreestr State Shared-Construction Contract Base"
    },
    authority: {
      ru: "Комитет по делам строительства и ЖКХ МПС РК",
      kz: "ҚР ӨСМ Құрылыс және ТҮКШ істері комитеті",
      en: "Committee for Construction and Housing of the RK"
    },
    lawArticle: "Ст. 11 Закона РК (Обязательная государственная регистрация договоров ДДУ)",
    status: "ONLINE",
    statusText: { ru: "Интегрировано · Сверка выписок ДДУ", kz: "Біріктірілген · ҮҚШ үзінділерін салыстыру", en: "Integrated · DDU Verification" },
    recordsCount: 8,
    matchedValid: "Электронные выписки активны для объектов Зелёной зоны",
    lastSync: "15.10.2026, 08:50",
    url: "https://kazreestr.gov.kz"
  },
  {
    id: "REG-04",
    code: "UGASK-INSPECTIONS",
    name: {
      ru: "Портал государственного контроля УГАСК ВКО",
      kz: "ШҚО МСҚБ мемлекеттік бақылау порталы",
      en: "GASK Architectural Control State Registry"
    },
    authority: {
      ru: "ГУ «Управление государственного архитектурно-строительного контроля ВКО»",
      kz: "«Шығыс Қазақстан облысының мемлекеттік сәулет-құрылыс бақылауы басқармасы» ММ",
      en: "GASK Inspection Administration of EKR"
    },
    lawArticle: "Ст. 144 Предпринимательского кодекса РК (Проверки и предписания)",
    status: "ONLINE",
    statusText: { ru: "Интегрировано · Акты мониторинга №114", kz: "Біріктірілген · №114 мониторинг актілері", en: "Integrated · Monitoring acts" },
    recordsCount: 8,
    matchedValid: "Зафиксировано предписание по ЖК «Ертіс Рівер Тауэрс» и «Нурлы Жол»",
    lastSync: "15.10.2026, 09:45",
    url: "https://gov.kz/memleket/entities/vko-gask"
  },
  {
    id: "REG-05",
    code: "E-OTINISH-PETITIONS",
    name: {
      ru: "Единая платформа обращений граждан «e-Otinish»",
      kz: "«e-Өтініш» азаматтардың өтініштерінің бірыңғай платформасы",
      en: "e-Otinish Citizen Petition & Complaint Gateway"
    },
    authority: {
      ru: "Генеральная Прокуратура РК / МЦРИАП РК",
      kz: "ҚР Бас прокуратурасы / ҚР ЦДИАӨМ",
      en: "General Prosecutor's Office of the RK"
    },
    lawArticle: "АППК РК (Автоматическая детекция фактора R4: коллективные жалобы)",
    status: "ONLINE",
    statusText: { ru: "Интегрировано · Мониторинг обращений", kz: "Біріктірілген · Өтініштерді бақылау", en: "Integrated · Complaints tracking" },
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
    url: "https://aisgzk.kz"
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
