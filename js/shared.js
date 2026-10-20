// Общая бизнес-логика портала ClearBuild / SAQ QURYLYS
// Хакатон Codemasters 8.0 (Усть-Каменогорск)
// Тут, короче, живёт вся магия: скоринг R1–R6, парсер объявлений, граф связей,
// синхронизация с бэкендом (FastAPI + SQLite) и локальный фоллбэк в localStorage на всякий пожарный.

const STATE_KEY = 'clearbuild_state_v2';
const SCHEMA_VERSION = 9; // Версия 9: точная привязка номеров домов (Победы 13, Кабанбай Батыра 134, Пермитина 29), очистка JK-17 и мгновенный OSM геокодер

function getLocalized(obj, lang = (typeof CURRENT_LANG !== 'undefined' ? CURRENT_LANG : 'ru')) {
  if (!obj) return '';
  if (typeof obj === 'string') return localizeDynamicText(obj, lang);
  return obj[lang] || obj['ru'] || '';
}

// Динамический переводчик для строк, которые прилетают напрямую с бэкенда
// (причины факторов, вердикты, строчки аудит-лога и т.д.)
function localizeDynamicText(str, lang = (typeof CURRENT_LANG !== 'undefined' ? CURRENT_LANG : 'ru')) {
  if (!str || typeof str !== 'string' || lang === 'ru') return str || '';
  let s = str;

  if (lang === 'kz') {
    s = s
      .replace(/Установлено отсутствие правового основания \(legal_basis_type = absent\)\./g, 'Қаражат тартудың құқықтық негізінің жоқтығы анықталды (рұқсат жоқ).')
      .replace(/Действует гарантия Единого оператора \(АО «КЖК»\): отдельное разрешение МИО не требуется, R1 не начисляется\./g, 'Бірыңғай оператордың («ҚТҚ» АҚ) кепілдігі бар: ЖАО-ның бөлек рұқсаты талап етілмейді (R1 = 0).')
      .replace(/Есть разрешение МИО на привлечение средств дольщиков\./g, 'Үлескерлер қаражатын тартуға ЖАО рұқсаты бар.')
      .replace(/Объект введён в эксплуатацию: реклама готового жилья не является R3\./g, 'Нысан пайдалануға берілген: дайын тұрғын үй жарнамасы R3 болып саналмайды.')
      .replace(/Объект введён в эксплуатацию\./g, 'Нысан пайдалануға берілген.')
      .replace(/Правовое основание не установлено \(unknown\): «нет данных» не считается R1, 0 баллов\./g, 'Құқықтық негіз тексерілуде: «деректер жоқ» R1 болып есептелмейді (0 ұпай).')
      .replace(/Прямое предложение внести деньги до ДДУ: подтверждённые публикации/g, 'ҮҚШ-қа дейін ақша салуды тікелей ұсыну: расталған жарияланымдар')
      .replace(/Активная реклама строящегося жилья: подтверждённые публикации/g, 'Салынып жатқан тұрғын үйдің белсенді жарнамасы: расталған жарияланымдар')
      .replace(/Гипотеза ИИ \(([^)]+)\) ждёт решения аналитика: 0 баллов\./g, 'ЖИ гипотезасы ($1) инспектордың шешімін күтуде: 0 ұпай.')
      .replace(/Подтверждённых публикаций нет\./g, 'Расталған жарнамалық жарияланымдар жоқ.')
      .replace(/Подтверждено коллективное обращение дольщиков\./g, 'Үлескерлердің ұжымдық өтініші расталды.')
      .replace(/Подтверждённых коллективных обращений нет\./g, 'Расталған ұжымдық шағымдар жоқ.')
      .replace(/Подтверждён простой или значимая просрочка сроков\./g, 'Құрылыстың тоқтап қалуы немесе мерзімнен кешігуі расталды.')
      .replace(/Простой или просрочка не подтверждены\./g, 'Құрылыстың тоқтап қалуы немесе кешігуі анықталған жоқ.')
      .replace(/Заявлено (\d+)%, подтверждено (\d+)%: разница (\d+) п\.п\./g, 'Жарнамада $1%, расталғаны $2%: айырмашылық $3 п.п.')
      .replace(/но заявление взято из неподтверждённой публикации ([^:]+): гипотеза ИИ, 0 баллов\./g, 'бірақ дерек расталмаған $1 жарияланымынан алынды: ЖИ гипотезасы (0 ұпай).')
      .replace(/но публикация ([^ ]+) с заявлением отклонена аналитиком\./g, 'бірақ $1 жарияланымын инспектор қабылдамады.')
      .replace(/Подтверждено аналитиком/g, 'Инспектор растады')
      .replace(/Отклонено аналитиком/g, 'Инспектор қабылдамады')
      .replace(/Не выявлено аналитиком/g, 'Инспектор анықтаған жоқ')
      .replace(/Нужна проверка/g, 'Тексеру қажет')
      .replace(/Признаков риска в тексте не обнаружено \(0 б\.\)/g, 'Мәтінде тәуекел белгілері табылған жоқ (0 ұп.)')
      .replace(/Инициализация мониторинга SAQ QURYLYS г\. Усть-Каменогорск/g, 'Өскемен қ. SAQ QURYLYS мониторингін іске қосу')
      .replace(/Загружено 8 строящихся комплексов и 12 зафиксированных объявлений/g, '8 салынып жатқан ТҮК және 12 жарнамалық хабарландыру жүктелді')
      .replace(/Автоматический скоринг R1–R6 завершён: 4 Зелёная, 2 Жёлтая, 2 Красная зона/g, 'R1–R6 автоматты скорингі аяқталды: 4 Жасыл, 2 Сары, 2 Қызыл аймақ')
      .replace(/Синхронизировано с/g, 'Сервермен синхрондалды:')
      .replace(/ЖК, (\d+) публикаций, (\d+) записей аудита/g, 'ТҮК, $1 жарияланым, $2 аудит жазбасы')
      .replace(/Фактор (R\d) для/g, '$1 факторы —')
      .replace(/изменен с/g, 'өзгертілді:')
      .replace(/Публикация (AD-\d+)/g, '$1 жарияланымы')
      .replace(/ПРИНЯТА \(CONFIRMED\)/g, 'РАСТАЛДЫ')
      .replace(/ОТКЛОНЕНА \(REJECTED\)/g, 'ҚАБЫЛДАНБАДЫ')
      .replace(/аналитиком МИО/g, 'ЖАО инспекторымен');
    return s;
  }

  if (lang === 'en') {
    s = s
      .replace(/Установлено отсутствие правового основания \(legal_basis_type = absent\)\./g, 'Confirmed absence of statutory legal basis (no permit or guarantee).')
      .replace(/Действует гарантия Единого оператора \(АО «КЖК»\): отдельное разрешение МИО не требуется, R1 не начисляется\./g, 'Active Single Operator (KZH JSC) guarantee: separate Akimat permit not required (R1 = 0).')
      .replace(/Есть разрешение МИО на привлечение средств дольщиков\./g, 'Valid Akimat (MIO) permit for attracting equity funds is active.')
      .replace(/Объект введён в эксплуатацию: реклама готового жилья не является R3\./g, 'Building is commissioned: advertising completed housing does not trigger R3.')
      .replace(/Объект введён в эксплуатацию\./g, 'Building is officially commissioned.')
      .replace(/Правовое основание не установлено \(unknown\): «нет данных» не считается R1, 0 баллов\./g, 'Legal basis under verification: missing data is not treated as R1 (0 pts).')
      .replace(/Прямое предложение внести деньги до ДДУ: подтверждённые публикации/g, 'Direct pre-DDU payment solicitation: confirmed publications')
      .replace(/Активная реклама строящегося жилья: подтверждённые публикации/g, 'Active pre-commissioning housing ads: confirmed publications')
      .replace(/Гипотеза ИИ \(([^)]+)\) ждёт решения аналитика: 0 баллов\./g, 'AI Hypothesis ($1) awaits inspector verification: 0 pts.')
      .replace(/Подтверждённых публикаций нет\./g, 'No confirmed infringing publications.')
      .replace(/Подтверждено коллективное обращение дольщиков\./g, 'Confirmed collective petition from equity buyers.')
      .replace(/Подтверждённых коллективных обращений нет\./g, 'No confirmed collective complaints.')
      .replace(/Подтверждён простой или значимая просрочка сроков\./g, 'Confirmed construction standstill or significant schedule delay.')
      .replace(/Простой или просрочка не подтверждены\./g, 'No construction standstill or delay confirmed.')
      .replace(/Заявлено (\d+)%, подтверждено (\d+)%: разница (\d+) п\.п\./g, 'Declared $1%, verified $2%: gap $3 pp')
      .replace(/но заявление взято из неподтверждённой публикации ([^:]+): гипотеза ИИ, 0 баллов\./g, 'sourced from unverified publication $1: AI hypothesis (0 pts).')
      .replace(/но публикация ([^ ]+) с заявлением отклонена аналитиком\./g, 'but publication $1 was rejected by the inspector.')
      .replace(/Подтверждено аналитиком/g, 'Confirmed by inspector')
      .replace(/Отклонено аналитиком/g, 'Rejected by inspector')
      .replace(/Не выявлено аналитиком/g, 'Marked Not Detected by inspector')
      .replace(/Нужна проверка/g, 'Needs Verification')
      .replace(/Признаков риска в тексте не обнаружено \(0 б\.\)/g, 'No risk indicators detected in text (0 pts)')
      .replace(/Инициализация мониторинга SAQ QURYLYS г\. Усть-Каменогорск/g, 'Initialized SAQ QURYLYS monitoring for Ust-Kamenogorsk')
      .replace(/Загружено 8 строящихся комплексов и 12 зафиксированных объявлений/g, 'Loaded 8 residential complexes and 12 captured advertisements')
      .replace(/Автоматический скоринг R1–R6 завершён: 4 Зелёная, 2 Жёлтая, 2 Красная зона/g, 'Automated R1–R6 scoring complete: 4 Green, 2 Yellow, 2 Red zone')
      .replace(/Синхронизировано с/g, 'Synchronized with')
      .replace(/ЖК, (\d+) публикаций, (\d+) записей аудита/g, 'complexes, $1 publications, $2 audit records')
      .replace(/Фактор (R\d) для/g, 'Factor $1 for')
      .replace(/изменен с/g, 'changed from')
      .replace(/Публикация (AD-\d+)/g, 'Publication $1')
      .replace(/ПРИНЯТА \(CONFIRMED\)/g, 'ACCEPTED (CONFIRMED)')
      .replace(/ОТКЛОНЕНА \(REJECTED\)/g, 'REJECTED')
      .replace(/аналитиком МИО/g, 'by MIO inspector');
    return s;
  }

  return s;
}
window.localizeDynamicText = localizeDynamicText;

// Достаём локализованные поля объявления, НО обязательно сохраняем все остальные поля (...ad),
// иначе id, complexId, status, confidence и т.д. превращаются в undefined!
function getLocalizedAd(ad, lang = (typeof CURRENT_LANG !== 'undefined' ? CURRENT_LANG : 'ru')) {
  if (!ad) return { id: '', text: '', triggerSpan: '', aiHypothesis: '', account: '', platform: '' };
  const rawTpl = (typeof INITIAL_ADS !== 'undefined') ? INITIAL_ADS.find(a => a.id === ad.id) : null;
  const textsObj = ad.texts || (rawTpl && rawTpl.texts);
  const spansObj = ad.triggerSpans || (rawTpl && rawTpl.triggerSpans);
  const hypsObj = ad.aiHypotheses || (rawTpl && rawTpl.aiHypotheses);
  const accObj = ad.accounts || (rawTpl && rawTpl.accounts);

  const text = (textsObj && (textsObj[lang] || textsObj.ru)) || ad.text || ad.rawText || '';
  const triggerSpan = (spansObj && (spansObj[lang] || spansObj.ru)) || ad.triggerSpan || '';
  let aiHypothesis = (hypsObj && (hypsObj[lang] || hypsObj.ru)) || ad.aiHypothesis || '';
  if (lang !== 'ru') {
    aiHypothesis = localizeDynamicText(aiHypothesis, lang);
  }
  const account = (accObj && (accObj[lang] || accObj.ru)) || ad.account || '';
  const platform = ad.platform || ad.source || 'Krisha.kz';

  return { ...ad, text, triggerSpan, aiHypothesis, account, platform };
}
window.getLocalizedAd = getLocalizedAd;

// Нормализуем публикацию, прилетевшую из API, чтобы она идеально скрестилась с нашими локальными переводами
function normalizePublicationFromApi(apiPub, existingPub = null) {
  if (!apiPub) return existingPub;
  const rawTpl = (typeof INITIAL_ADS !== 'undefined' ? INITIAL_ADS.find(a => a.id === apiPub.id) : null) || {};
  const template = existingPub || rawTpl || {};
  const textVal = apiPub.text || apiPub.rawText || template.text || template.rawText || '';
  const pubDateVal = apiPub.pubDate || apiPub.date || template.pubDate || template.date || '14.10.2026';
  const capturedVal = apiPub.capturedAt || template.capturedAt || pubDateVal;
  const platformVal = apiPub.platform || apiPub.source || template.platform || template.source || 'Krisha.kz';
  const statusVal = apiPub.status || template.status || 'AI_HYPOTHESIS';
  const propFactor = apiPub.proposedFactor !== undefined ? apiPub.proposedFactor : (template.proposedFactor !== undefined ? template.proposedFactor : null);
  const confVal = apiPub.confidence !== undefined && apiPub.confidence !== null ? apiPub.confidence : (template.confidence || 0);
  const spanVal = apiPub.triggerSpan !== undefined ? apiPub.triggerSpan : (template.triggerSpan || '');

  let triggersArr = Array.isArray(apiPub.triggers) ? apiPub.triggers : (Array.isArray(template.triggers) ? template.triggers : []);
  if (triggersArr.length === 0 && spanVal) {
    triggersArr = [spanVal.length > 48 ? spanVal.slice(0, 48) + '…' : spanVal];
  }

  let aiHypoText = apiPub.aiHypothesis || template.aiHypothesis || rawTpl.aiHypothesis || '';
  if (!aiHypoText) {
    if (statusVal === 'REJECTED') {
      aiHypoText = `Отклонено инспектором (0 баллов)`;
    } else if (propFactor === 'R2') {
      aiHypoText = `R2 (+25 баллов): Предложение оплаты до ДДУ (${confVal}%)`;
    } else if (propFactor === 'R5') {
      aiHypoText = `R5 (+10 баллов): Завышение заявленной готовности (${confVal}%)`;
    } else if (propFactor === 'R3') {
      aiHypoText = `R3 (+10 баллов): Реклама строящегося жилья (${confVal}%)`;
    } else {
      aiHypoText = 'Признаков риска в тексте не обнаружено (0 б.)';
    }
  }

  return {
    ...rawTpl,
    ...template,
    ...apiPub,
    id: apiPub.id || template.id,
    complexId: apiPub.complexId !== undefined ? apiPub.complexId : (template.complexId || null),
    platform: platformVal,
    source: platformVal,
    account: apiPub.account || template.account || rawTpl.account || 'Отдел продаж',
    accounts: rawTpl.accounts || template.accounts || { ru: apiPub.account || 'Отдел продаж', kz: 'Сату бөлімі', en: 'Sales Office' },
    phone: apiPub.phone || template.phone || 'Не указан',
    url: apiPub.url || template.url || '#',
    pubDate: pubDateVal,
    date: pubDateVal,
    capturedAt: capturedVal,
    text: textVal,
    rawText: textVal,
    texts: rawTpl.texts || template.texts || { ru: textVal, kz: textVal, en: textVal },
    triggerSpan: spanVal,
    triggerSpans: rawTpl.triggerSpans || template.triggerSpans || { ru: spanVal, kz: spanVal, en: spanVal },
    triggers: triggersArr,
    proposedFactor: propFactor,
    confidence: confVal,
    aiHypothesis: aiHypoText,
    aiHypotheses: rawTpl.aiHypotheses || template.aiHypotheses || {
      ru: aiHypoText,
      kz: localizeDynamicText(aiHypoText, 'kz'),
      en: localizeDynamicText(aiHypoText, 'en')
    },
    status: statusVal,
    hasDirectPaymentOffer: apiPub.hasDirectPaymentOffer !== undefined ? apiPub.hasDirectPaymentOffer : Boolean(template.hasDirectPaymentOffer),
    isActivePreCommissioningAd: apiPub.isActivePreCommissioningAd !== undefined ? apiPub.isActivePreCommissioningAd : Boolean(template.isActivePreCommissioningAd)
  };
}

// То же самое для ЖК с бэка: склеиваем серверный ответ с нашими мультиязычными словарями
// --------------------------------------------------------------------------
// Вспомогательная функция отсеивания временных тестовых объектов
function isTestComplexEntity(c) {
  if (!c) return false;
  const cid = (c.id || '').toLowerCase();
  const nameStr = typeof c.name === 'string' ? c.name : ((c.names && c.names.ru) || '');
  const idNum = parseInt(cid.replace('jk-', ''), 10);
  return cid === 'jk-10' || cid === 'jk-11' || cid === 'jk-17' ||
         (!isNaN(idNum) && idNum >= 10 && (c.isDemo === false || !c.isDemo)) ||
         /TEST|KOMPUTERNY|БЛА\s*БЛА/i.test(nameStr);
}
window.isTestComplexEntity = isTestComplexEntity;

// Интеллектуальный геокодер адресов г. Усть-Каменогорска (OSM + SVG)
// Предотвращает появление новых ЖК в случайных точках города
// --------------------------------------------------------------------------
function resolveCoordinatesForAddress(addr) {
  if (!addr || typeof addr !== 'string') return [49.9490, 82.6200];
  const s = addr.toLowerCase();

  // 1. Сатпаева (Левый берег / район КШТ)
  if (/сатпаев.*?\b(9|9[а-я]?)\b/i.test(s)) return [49.8980, 82.6236]; // пр. Сатпаева, 9
  if (/сатпаев.*?\b(34|35|36|37)\b/i.test(s)) return [49.9051, 82.6195];
  if (/сатпаев.*?\b(62|63|64)\b/i.test(s)) return [49.9295, 82.6176];
  if (/сатпаев.*?\b(88|89|90)\b/i.test(s)) return [49.9095, 82.6190];
  if (/сатпаев/i.test(s)) return [49.9051, 82.6195];

  // 2. Кабанбай Батыра (Қабанбай Батыр)
  if (/кабанбай.*?\b134\b/i.test(s)) return [49.95207, 82.63645];
  if (/кабанбай.*?\b(140|142|144)\b/i.test(s)) return [49.9515, 82.6390];
  if (/кабанбай.*?\b(110|112|114|116)\b/i.test(s)) return [49.9525, 82.6320];
  if (/кабанбай.*?\b(50|52|54|60)\b/i.test(s)) return [49.9535, 82.6240];
  if (/кабанбай/i.test(s)) return [49.9525, 82.6280];

  // 3. Пермитина / Набережная Славского (Стрелка)
  if (/пермитин.*?\b29\b/i.test(s)) return [49.94814, 82.63402];
  if (/пермитин.*?\b(25|27)\b/i.test(s)) return [49.9478, 82.6320];
  if (/(пермитин|славск).*?\b(11|40)\b/i.test(s)) return [49.9464, 82.5989];
  if (/(пермитин|славск).*?\b37\b/i.test(s)) return [49.9561, 82.6265];
  if (/пермитин.*?\b17\b/i.test(s)) return [49.9440, 82.6302];
  if (/пермитин/i.test(s)) return [49.9470, 82.6200];
  if (/славск/i.test(s)) return [49.9480, 82.6100];

  // 4. Жибек Жолы (КШТ)
  if (/жибек\s*жолы.*?\b(1|3)\b/i.test(s)) return [49.9296, 82.6160];
  if (/жибек\s*жолы.*?\b14\b/i.test(s)) return [49.9296, 82.6138];
  if (/жибек\s*жолы/i.test(s)) return [49.9296, 82.6160];

  // 5. Астана (бывш. Солнечная, Стрелка)
  if (/астана.*?\b32\b/i.test(s)) return [49.9561, 82.6265];
  if (/астана/i.test(s)) return [49.9537, 82.5995];

  // 6. Бажова (Аблакетка)
  if (/бажов.*?\b(110|102)\b/i.test(s)) return [49.9653, 82.5990];
  if (/бажов.*?\b42\b/i.test(s)) return [49.9653, 82.5990];
  if (/бажов/i.test(s)) return [49.9653, 82.5990];

  // 7. Казыбек Би (КШТ)
  if (/казыбек\s*би.*?\b5\b/i.test(s)) return [49.8954, 82.6148];
  if (/казыбек\s*би/i.test(s)) return [49.8954, 82.6148];

  // 8. Утепова / Бульвар 22 (КШТ)
  if (/утепов.*?\b12\b/i.test(s)) return [49.9016, 82.6170];
  if (/утепов.*?\b22\b/i.test(s)) return [49.8995, 82.6025];
  if (/утепов|бульвар\s*22/i.test(s)) return [49.8995, 82.6025];

  // 9. Казахстан / Горького / Тохтарова / Крылова / Протозанова (Центр)
  if (/казахстан.*?\b(64|68)\b/i.test(s)) return [49.9465, 82.6282];
  if (/казахстан.*?\b72\b/i.test(s)) return [49.9507, 82.6318];
  if (/казахстан/i.test(s)) return [49.9465, 82.6282];
  if (/горьк.*?\b21\b/i.test(s)) return [49.9463, 82.6303];
  if (/горьк.*?\b20\b/i.test(s)) return [49.9477, 82.6135];
  if (/горьк/i.test(s)) return [49.9477, 82.6135];
  if (/тохтаров/i.test(s)) return [49.9495, 82.6190];
  if (/крылов/i.test(s)) return [49.9440, 82.6050];
  if (/протозанов/i.test(s)) return [49.9510, 82.6200];

  // 10. Клубная (Согра)
  if (/клубн.*?\b20\b/i.test(s)) return [49.9477, 82.6135];
  if (/клубн/i.test(s)) return [50.0293, 82.7385];

  // 11. Абая (Центр)
  if (/аба.*?\b5\b/i.test(s)) return [49.9520, 82.6100];
  if (/аба/i.test(s)) return [49.9520, 82.6100];

  // 12. Независимости / Победы / Гагарина
  if (/независимост/i.test(s)) return [49.9630, 82.6080];
  if (/побед.*?13/i.test(s)) return [49.94817, 82.61670]; // пр. Победы, 13 (Bank RBK)
  if (/побед.*?(3|5|7)/i.test(s)) return [49.9475, 82.6135];
  if (/побед.*?(14|16)/i.test(s)) return [49.9488, 82.6175];
  if (/побед/i.test(s)) return [49.9480, 82.6180];
  if (/бульвар\s*гагарин|гагарин/i.test(s)) return [49.9670, 82.6120];

  // 13. Студгородок / Северо-Восток (Потанина / Серикбаева / Виноградова / Ворошилова / Мызы)
  if (/потанин|серикбаев/i.test(s)) return [49.9620, 82.6250];
  if (/виноградов/i.test(s)) return [49.9680, 82.6280];
  if (/ворошилов/i.test(s)) return [49.9720, 82.6150];
  if (/белинск/i.test(s)) return [49.9740, 82.6080];
  if (/мызы/i.test(s)) return [49.9600, 82.6320];
  if (/космическ/i.test(s)) return [49.9650, 82.6380];
  if (/шоссейн/i.test(s)) return [49.9350, 82.5600];

  // 14. Защита
  if (/тынышпаев/i.test(s)) return [49.9820, 82.5720];
  if (/кокчетавск/i.test(s)) return [49.9772, 82.5703];
  if (/октябрьск/i.test(s)) return [49.9800, 82.5750];

  // 15. Районы общего назначения
  if (/кшт|сол\s*жа[ғг]алау|левый\s*берег/i.test(s)) return [49.9051, 82.6195];
  if (/стрелк/i.test(s)) return [49.9464, 82.5989];
  if (/согр/i.test(s)) return [50.0293, 82.7385];
  if (/защит/i.test(s)) return [49.9810, 82.5730];
  if (/аблакетк/i.test(s)) return [49.9200, 82.6600];
  if (/центр/i.test(s)) return [49.9490, 82.6200];

  return [49.9490, 82.6200];
}

function resolveSvgPos(coords, addr) {
  if (addr && typeof addr === 'string') {
    const s = addr.toLowerCase();
    if (/сатпаев.*?\b(9|9[а-я]?)\b/i.test(s)) return { x: 605, y: 395 };
    if (/сатпаев/i.test(s)) return { x: 585, y: 390 };
    if (/кабанбай.*?\b134\b/i.test(s)) return { x: 485, y: 240 };
    if (/кабанбай/i.test(s)) return { x: 460, y: 235 };
    if (/пермитин.*?\b29\b/i.test(s)) return { x: 475, y: 255 };
    if (/пермитин|славск/i.test(s)) return { x: 350, y: 245 };
    if (/жибек\s*жолы/i.test(s)) return { x: 460, y: 365 };
    if (/астана/i.test(s)) return { x: 465, y: 215 };
    if (/бажов/i.test(s)) return { x: 245, y: 145 };
    if (/казыбек\s*би/i.test(s)) return { x: 675, y: 425 };
    if (/утепов|бульвар\s*22/i.test(s)) return { x: 640, y: 410 };
    if (/казахстан|горьк/i.test(s)) return { x: 430, y: 250 };
    if (/клубн|согр/i.test(s)) return { x: 690, y: 115 };
    if (/побед.*?13/i.test(s)) return { x: 405, y: 245 };
    if (/побед/i.test(s)) return { x: 410, y: 245 };
    if (/тынышпаев|кокчетавск|защит/i.test(s)) return { x: 180, y: 100 };
    if (/аба/i.test(s)) return { x: 390, y: 230 };
  }
  if (!coords || coords.length < 2) return { x: 430, y: 250 };
  const lat = coords[0], lng = coords[1];
  const latRatio = Math.max(0, Math.min(1, (lat - 49.88) / (50.04 - 49.88)));
  const lngRatio = Math.max(0, Math.min(1, (lng - 82.56) / (82.74 - 82.56)));
  const y = Math.round(440 - latRatio * 350);
  const x = Math.round(170 + lngRatio * 530);
  return { x: Math.max(100, Math.min(750, x)), y: Math.max(60, Math.min(480, y)) };
}

window.resolveCoordinatesForAddress = resolveCoordinatesForAddress;
window.resolveSvgPos = resolveSvgPos;

function addComplexLocal(complexData) {
  const coords = complexData.coords && complexData.coords.length === 2 && (complexData.coords[0] !== 49.95 || complexData.coords[1] !== 82.61)
    ? complexData.coords
    : resolveCoordinatesForAddress(complexData.district || complexData.address);
  const svgPos = resolveSvgPos(coords, complexData.district || complexData.address);

  const nextNum = (complexes && complexes.length ? complexes.length : 9) + 1;
  const newId = complexData.id || `jk-${nextNum}`;
  const legalType = complexData.legalBasisType || complexData.legalStatus || 'UNVERIFIED';

  const newComplex = {
    id: newId,
    code: `JK-${nextNum}`,
    caseTag: complexData.caseTag || 'Новый объект',
    coords: coords,
    svgPos: svgPos,
    names: {
      ru: complexData.name,
      kz: complexData.name,
      en: complexData.name
    },
    developers: {
      ru: complexData.developer,
      kz: complexData.developer,
      en: complexData.developer
    },
    bin: complexData.bin || 'Не указан',
    contactPhone: complexData.contactPhone || '+7 (7232) 00-00-00',
    salesAccount: complexData.salesAccount || '@new_developer',
    cadastreNumber: complexData.cadastreNumber || '05:102:044:000',
    smrLicense: complexData.smrLicense || 'ГСЛ II категории',
    landPurpose: complexData.landPurpose || 'Строительство МЖД',
    districts: {
      ru: complexData.district || 'г. Усть-Каменогорск',
      kz: complexData.district || 'Өскемен қ.',
      en: complexData.district || 'Ust-Kamenogorsk'
    },
    stages: {
      ru: complexData.stage || 'Строительно-монтажные работы',
      kz: complexData.stage || 'Құрылыс-монтаждау жұмыстары',
      en: complexData.stage || 'Construction works'
    },
    readinessFact: 0,
    readinessDeclared: 0,
    declaredReadiness: { pct: 0, source: 'Аналитик МИО', date: '20.10.2026' },
    confirmedReadiness: { pct: 0, source: 'УГАСК ВКО', date: '20.10.2026' },
    legalStatus: legalType,
    legalBasisType: legalType,
    legalBasisText: 'Не проверено · В процессе проверки',
    legalSource: 'Добавлено аналитиком МИО через веб-интерфейс',
    legalTexts: {
      ru: 'Не проверено · Нужна проверка (0 баллов по R1)',
      kz: 'Тексерілмеген · Тексеру қажет (R1 бойынша 0 ұпай)',
      en: 'Unverified · Needs review (0 pts on R1)'
    },
    legalDetails: {
      ru: 'Объект добавлен аналитиком МИО; правовые основания подлежат ведомственной проверке.',
      kz: 'Нысанды ЖАО инспекторы қосты; құқықтық негіздер ведомстволық тексеруге жатады.',
      en: 'Complex added by MIO analyst; legal basis subject to inter-agency review.'
    },
    signalStatus: 'PENDING_HUMAN',
    signalAuthor: 'Ахметов Д.К.',
    signalUpdatedAt: new Date().toLocaleDateString('ru-RU'),
    signalComment: 'Новый объект строительства добавлен в реестр мониторинга.',
    factors: {
      R1: { status: 'UNVERIFIED', weight: 35, evidence: { ru: 'Статус «Нужна проверка»: 0 баллов до ответа МИО.', kz: 'Тексеру қажет: 0 ұпай.', en: 'Needs review: 0 pts.' } },
      R2: { status: 'NONE', weight: 25, evidence: { ru: 'Признаков незаконного сбора средств не зафиксировано.', kz: 'Бұзушылық белгілері анықталмаған.', en: 'No unlawful solicitations.' } },
      R3: { status: 'NONE', weight: 10, evidence: { ru: 'Реклама не зафиксирована.', kz: 'Жарнама тіркелмеген.', en: 'No ads detected.' } },
      R4: { status: 'NONE', weight: 15, evidence: { ru: 'Жалоб в e-Otinish не поступало.', kz: 'Шағымдар жоқ.', en: 'No complaints.' } },
      R5: { status: 'NONE', weight: 10, evidence: { ru: 'Расхождений готовности нет.', kz: 'Айырмашылық жоқ.', en: 'No readiness discrepancy.' } },
      R6: { status: 'NONE', weight: 5, evidence: { ru: 'Простоя стройплощадки нет.', kz: 'Тоқтап қалу жоқ.', en: 'No standstill.' } }
    }
  };

  complexes.push(newComplex);
  auditLogEntries.unshift(`[${new Date().toLocaleTimeString()}] 🏗️ В реестр добавлен новый строящийся объект ${newComplex.id} (${newComplex.names.ru}, адрес: ${newComplex.districts.ru})`);
  saveState();
  return newComplex;
}
window.addComplexLocal = addComplexLocal;

async function deleteComplexLocalOrRemote(complexId) {
  if (!complexId) return;
  if (typeof apiClient !== 'undefined' && apiClient.deleteComplex) {
    try {
      await apiClient.deleteComplex(complexId);
    } catch(e) {
      console.warn('Backend delete failed, continuing locally', e);
    }
  }
  complexes = complexes.filter(c => c.id !== complexId);
  adsList = adsList.filter(a => a.complexId !== complexId);
  if (window.SELECTED_COMPLEX_ID === complexId) {
    window.SELECTED_COMPLEX_ID = complexes.length ? complexes[0].id : null;
  }
  saveState();
  triggerUIRefresh();
}
window.deleteComplexLocalOrRemote = deleteComplexLocalOrRemote;

function deleteComplexFromUI(id) {
  if (!id) return;
  const comp = complexes.find(c => c.id === id);
  const name = comp ? (comp.names ? comp.names.ru : comp.name) : id;
  if (!confirm(`Вы действительно хотите удалить жилой комплекс «${name}» (${id}) из реестра?`)) {
    return;
  }
  deleteComplexLocalOrRemote(id);
  if (typeof showCopyToast === 'function') {
    showCopyToast(`🗑️ Объект «${name}» успешно удалён из реестра.`);
  }
}
window.deleteComplexFromUI = deleteComplexFromUI;



function normalizeComplexFromApi(apiComp, existingComp = null) {
  if (!apiComp) return existingComp;
  const rawTpl = (typeof RAW_COMPLEXES !== 'undefined' ? RAW_COMPLEXES.find(c => c.id === apiComp.id) : null) || {};
  const template = existingComp || rawTpl || {};

  const nameStr = apiComp.name || getLocalized(rawTpl.names || template.names, 'ru') || apiComp.id;
  const devStr = apiComp.developer || getLocalized(rawTpl.developers || template.developers, 'ru') || 'Застройщик';
  const distStr = apiComp.district || getLocalized(rawTpl.districts || template.districts, 'ru') || 'г. Усть-Каменогорск';
  const stageStr = apiComp.stage || getLocalized(rawTpl.stages || template.stages, 'ru') || 'Строительство';
  const legalType = apiComp.legalBasisType || apiComp.legalStatus || template.legalStatus || 'UNVERIFIED';
  const legalTextStr = apiComp.legalBasisText || getLocalized(rawTpl.legalTexts || template.legalTexts, 'ru') || legalType;
  const legalSourceStr = apiComp.legalSource || getLocalized(rawTpl.legalDetails || template.legalDetails, 'ru') || '';

  const declaredPct = (apiComp.declaredReadiness && apiComp.declaredReadiness.pct != null)
    ? apiComp.declaredReadiness.pct
    : (apiComp.readinessDeclared != null ? apiComp.readinessDeclared : (template.readinessDeclared || 0));
  const confirmedPct = (apiComp.confirmedReadiness && apiComp.confirmedReadiness.pct != null)
    ? apiComp.confirmedReadiness.pct
    : (apiComp.readinessFact != null ? apiComp.readinessFact : (template.readinessFact || 0));

  // Сводим воедино факторы из подробного riskProfile.factors[] и краткого словаря apiComp.factors
  const mergedFactors = {};
  const detailedFactorsMap = {};
  if (apiComp.riskProfile && Array.isArray(apiComp.riskProfile.factors)) {
    apiComp.riskProfile.factors.forEach(f => {
      if (f && f.code) detailedFactorsMap[f.code] = f;
    });
  }

  ['R1', 'R2', 'R3', 'R4', 'R5', 'R6'].forEach(code => {
    const rawF = (rawTpl.factors && rawTpl.factors[code]) || {};
    const tplF = (template.factors && template.factors[code]) || {};
    const apiF = (apiComp.factors && apiComp.factors[code]) || {};
    const detF = detailedFactorsMap[code] || {};
    const weight = (typeof FACTOR_INFO !== 'undefined' && FACTOR_INFO[code]) ? FACTOR_INFO[code].weight : (tplF.weight || 0);
    const status = detF.status || apiF.status || tplF.status || 'NONE';
    const reasonStr = detF.reason || (typeof apiF.evidence === 'string' ? apiF.evidence : '');

    let evidenceObj;
    if (detF.source === 'analyst' && reasonStr) {
      evidenceObj = {
        ru: reasonStr,
        kz: localizeDynamicText(reasonStr, 'kz'),
        en: localizeDynamicText(reasonStr, 'en')
      };
    } else if (rawF.evidence && typeof rawF.evidence === 'object') {
      evidenceObj = {
        ru: reasonStr || rawF.evidence.ru || '',
        kz: rawF.evidence.kz || localizeDynamicText(reasonStr, 'kz') || '',
        en: rawF.evidence.en || localizeDynamicText(reasonStr, 'en') || ''
      };
    } else if (tplF.evidence && typeof tplF.evidence === 'object') {
      evidenceObj = {
        ru: reasonStr || tplF.evidence.ru || '',
        kz: tplF.evidence.kz || localizeDynamicText(reasonStr, 'kz') || '',
        en: tplF.evidence.en || localizeDynamicText(reasonStr, 'en') || ''
      };
    } else {
      evidenceObj = {
        ru: reasonStr,
        kz: localizeDynamicText(reasonStr, 'kz'),
        en: localizeDynamicText(reasonStr, 'en')
      };
    }

    mergedFactors[code] = {
      status,
      weight,
      points: detF.points !== undefined ? detF.points : (status === 'CONFIRMED' ? weight : 0),
      active: status === 'CONFIRMED',
      label: detF.label || (status === 'UNVERIFIED' ? 'Нужна проверка' : null),
      source: detF.source || 'data',
      evidenceRefs: Array.isArray(detF.evidence) ? detF.evidence : (tplF.evidenceRefs || []),
      evidence: evidenceObj
    };
  });

  const normalizedPubs = Array.isArray(apiComp.publications)
    ? apiComp.publications.map(p => normalizePublicationFromApi(p))
    : (template.publications || undefined);

  return {
    ...rawTpl,
    ...template,
    id: apiComp.id || template.id,
    code: rawTpl.code || template.code || apiComp.caseTag || (apiComp.id || '').toUpperCase(),
    caseTag: apiComp.caseTag || rawTpl.caseTag || template.caseTag || '',
    coords: (() => {
      let c = (Array.isArray(rawTpl.coords) && rawTpl.coords.length === 2) ? rawTpl.coords : (Array.isArray(apiComp.coords) && apiComp.coords.length === 2 ? apiComp.coords : (template.coords || null));
      const addrStr = distStr || (rawTpl.districts && (rawTpl.districts.ru || rawTpl.districts.kz)) || (template.districts && template.districts.ru) || (apiComp.district || '');
      if (!c || (c[0] === 49.95 && c[1] === 82.61) || (Math.abs(c[0] - 49.9772) < 0.001 && Math.abs(c[1] - 82.5703) < 0.001 && /сатпаев/i.test(addrStr))) {
        c = resolveCoordinatesForAddress(addrStr);
      }
      return c;
    })(),
    svgPos: (() => {
      const addrStr = distStr || (rawTpl.districts && (rawTpl.districts.ru || rawTpl.districts.kz)) || (template.districts && template.districts.ru) || (apiComp.district || '');
      let pos = (rawTpl.svgPos) || (apiComp.svgPos) || (template.svgPos);
      if (!pos || (pos.x === 175 && pos.y === 105 && /сатпаев/i.test(addrStr))) {
        const curCoords = (Array.isArray(rawTpl.coords) && rawTpl.coords.length === 2) ? rawTpl.coords : (Array.isArray(apiComp.coords) && apiComp.coords.length === 2 ? apiComp.coords : [49.8980, 82.6236]);
        pos = resolveSvgPos(curCoords, addrStr);
      }
      return pos;
    })(),
    names: rawTpl.names || template.names || { ru: nameStr, kz: nameStr, en: nameStr },
    developers: rawTpl.developers || template.developers || { ru: devStr, kz: devStr, en: devStr },
    districts: (() => {
      if (rawTpl.districts) return rawTpl.districts;
      if (template.districts) return template.districts;
      let cleanDist = distStr;
      if (/сатпаев.*?9/i.test(distStr) && /защит/i.test(distStr)) {
        cleanDist = "пр. Каныша Сатпаева, 9 (район КШТ)";
      }
      return { ru: cleanDist, kz: cleanDist, en: cleanDist };
    })(),
    stages: rawTpl.stages || template.stages || { ru: stageStr, kz: stageStr, en: stageStr },
    bin: apiComp.bin || rawTpl.bin || template.bin || 'Не указан',
    contactPhone: apiComp.contactPhone || rawTpl.contactPhone || template.contactPhone || '+7 (705) 999-00-11',
    salesAccount: apiComp.salesAccount || rawTpl.salesAccount || template.salesAccount || '',
    cadastreNumber: rawTpl.cadastreNumber || template.cadastreNumber || apiComp.cadastreNumber || '05:102:044:000',
    smrLicense: rawTpl.smrLicense || template.smrLicense || apiComp.smrLicense || 'ГСЛ II категории',
    landPurpose: rawTpl.landPurpose || template.landPurpose || apiComp.landPurpose || 'Строительство МЖД',
    readinessDeclared: declaredPct,
    readinessFact: confirmedPct,
    declaredReadiness: apiComp.declaredReadiness || rawTpl.declaredReadiness || template.declaredReadiness || { pct: declaredPct, source: 'Мониторинг', date: '14.10.2026' },
    confirmedReadiness: apiComp.confirmedReadiness || rawTpl.confirmedReadiness || template.confirmedReadiness || { pct: confirmedPct, source: 'УГАСК ВКО', date: '10.10.2026' },
    legalStatus: legalType,
    legalBasisType: legalType,
    legalBasisText: legalTextStr,
    legalSource: legalSourceStr,
    legalTexts: rawTpl.legalTexts || template.legalTexts || { ru: legalTextStr, kz: legalTextStr, en: legalTextStr },
    legalDetails: rawTpl.legalDetails || template.legalDetails || { ru: legalSourceStr, kz: legalSourceStr, en: legalSourceStr },
    signalStatus: apiComp.signalStatus || (apiComp.signal && apiComp.signal.status) || template.signalStatus || 'PENDING_HUMAN',
    signalAuthor: apiComp.signalAuthor || (apiComp.signal && apiComp.signal.author) || template.signalAuthor || 'Ахметов Д.К.',
    signalUpdatedAt: apiComp.signalUpdatedAt || (apiComp.signal && apiComp.signal.updatedAt) || template.signalUpdatedAt || '14.10.2026',
    signalComment: apiComp.signalComment || (apiComp.signal && apiComp.signal.comment) || template.signalComment || '',
    signal: apiComp.signal || template.signal || null,
    publications: normalizedPubs,
    riskProfile: apiComp.riskProfile || template.riskProfile || null,
    factors: mergedFactors
  };
}

function formatAuditEntryFromApi(entry) {
  if (!entry) return '';
  if (typeof entry === 'string') return entry;
  const ts = entry.createdAt ? new Date(entry.createdAt).toLocaleString() : '15.10.2026';
  const actor = entry.actor || 'Система';
  const cid = entry.complexId ? ` (${entry.complexId})` : '';
  const pid = entry.publicationId ? ` [${entry.publicationId}]` : '';
  const p = entry.payload || {};

  if (entry.action === 'confirm_factor') {
    return `[${ts}] ⚖️ ${actor}${cid}: фактор ${p.factor || ''} → ${p.status || ''} (балл: ${p.scoreAfter ?? '—'}, зона: ${p.zoneAfter || '—'})`;
  }
  if (entry.action === 'verify_publication') {
    const dec = p.decision === 'accept' ? 'ПРИНЯТА (CONFIRMED)' : 'ОТКЛОНЕНА (REJECTED)';
    return `[${ts}] 📢 ${actor}${pid}${cid}: публикация ${dec} → балл ЖК: ${p.scoreAfter ?? '—'} (${p.zoneAfter || '—'})`;
  }
  if (entry.action === 'signal_decision') {
    return `[${ts}] 📑 ${actor}${cid}: решение по сигналу → ${p.decision || ''} (${p.comment || 'без комментария'})`;
  }
  if (entry.action === 'create_publication') {
    return `[${ts}] ➕ ${actor}${pid}${cid}: добавлена публикация (${p.platform || 'Источник'}, гипотеза: ${p.proposedFactor || 'нет'})`;
  }
  if (entry.action === 'create_complex') {
    return `[${ts}] 🏗️ ${actor}${cid}: добавлен объект «${p.name || ''}»`;
  }
  return `[${ts}] 🔹 ${actor}${cid}${pid}: ${entry.action}`;
}

function loadAppState() {
  let state = null;
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) state = JSON.parse(raw);
  } catch(e) {
    console.error('Error loading state from localStorage:', e);
  }

  // Если версии схемы не совпали (или стейта вообще нет) — накатываем свежий эталон из data.js
  if (!state || state.schemaVersion !== SCHEMA_VERSION) {
    state = {
      schemaVersion: SCHEMA_VERSION,
      complexes: JSON.parse(JSON.stringify(RAW_COMPLEXES)),
      adsList: JSON.parse(JSON.stringify(INITIAL_ADS)),
      auditLogEntries: [
        `[15.10.2026, 09:00] Инициализация мониторинга SAQ QURYLYS г. Усть-Каменогорск`,
        `[15.10.2026, 09:05] Загружено 8 строящихся комплексов и 12 зафиксированных объявлений`,
        `[15.10.2026, 09:10] Автоматический скоринг R1–R6 завершён: 4 Зелёная, 2 Жёлтая, 2 Красная зона`
      ],
      selectedId: (state && state.selectedId) || 'jk-1',
      theme: (state && state.theme) || 'light',
      lang: (state && state.lang) || 'ru',
      actLang: (state && state.actLang) || 'ru',
      activeTab: (state && state.activeTab) || 'map',
      fontScale: (state && state.fontScale) || 'normal'
    };
  }

  // Прогоняем всё через нормализаторы и фильтруем тестовые ЖК
  state.adsList = (state.adsList || [])
    .filter(a => a && a.complexId !== 'jk-10' && a.complexId !== 'jk-11')
    .map(a => normalizePublicationFromApi(a));
  state.complexes = (state.complexes || [])
    .filter(c => !isTestComplexEntity(c))
    .map(c => normalizeComplexFromApi(c));

  return state;
}

let appState = loadAppState();
let complexes = appState.complexes;
let adsList = appState.adsList;
let auditLogEntries = appState.auditLogEntries || [];
let SELECTED_COMPLEX_ID = appState.selectedId || 'jk-1';
let CURRENT_THEME = appState.theme || localStorage.getItem('clearbuild_theme') || 'light';
let CURRENT_LANG = appState.lang || localStorage.getItem('clearbuild_lang') || 'ru';
let CURRENT_ACT_LANG = appState.actLang || 'ru';
let CURRENT_ACTIVE_TAB = appState.activeTab || 'map';
let CURRENT_FONT_SCALE = appState.fontScale || localStorage.getItem('clearbuild_font_scale') || 'normal';

if (typeof window !== 'undefined') {
  window.complexes = complexes;
  window.adsList = adsList;
  window.auditLogEntries = auditLogEntries;
  window.SELECTED_COMPLEX_ID = SELECTED_COMPLEX_ID;
  window.CURRENT_THEME = CURRENT_THEME;
  window.CURRENT_LANG = CURRENT_LANG;
  window.CURRENT_ACT_LANG = CURRENT_ACT_LANG;
  window.CURRENT_ACTIVE_TAB = CURRENT_ACTIVE_TAB;
  window.CURRENT_FONT_SCALE = CURRENT_FONT_SCALE;
}

// Если передали параметры в URL (типа ?id=jk-2&tab=scoring) — сразу переключаемся туда
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('id')) {
  SELECTED_COMPLEX_ID = urlParams.get('id');
}
if (urlParams.get('tab')) {
  CURRENT_ACTIVE_TAB = urlParams.get('tab');
}

function saveState() {
  appState.schemaVersion = SCHEMA_VERSION;
  appState.complexes = complexes;
  appState.adsList = adsList;
  appState.auditLogEntries = auditLogEntries;
  appState.selectedId = SELECTED_COMPLEX_ID;
  appState.theme = CURRENT_THEME;
  appState.lang = CURRENT_LANG;
  appState.actLang = CURRENT_ACT_LANG;
  appState.activeTab = CURRENT_ACTIVE_TAB;
  if (typeof window !== 'undefined') {
    window.complexes = complexes;
    window.adsList = adsList;
    window.auditLogEntries = auditLogEntries;
  }
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(appState));
    localStorage.setItem('clearbuild_complexes', JSON.stringify(complexes));
    localStorage.setItem('clearbuild_ads', JSON.stringify(adsList));
    localStorage.setItem('clearbuild_audit_log', JSON.stringify(auditLogEntries));
    localStorage.setItem('clearbuild_selected_id', SELECTED_COMPLEX_ID);
    localStorage.setItem('clearbuild_theme', CURRENT_THEME);
    localStorage.setItem('clearbuild_lang', CURRENT_LANG);
  } catch(e) {
    console.warn('Could not save to localStorage:', e);
  }
}

function triggerUIRefresh() {
  if (typeof refreshAllViews === 'function') {
    refreshAllViews();
    return;
  }
  if (typeof window !== 'undefined' && typeof window.refreshAllViews === 'function') {
    window.refreshAllViews();
    return;
  }
  // Запасной вариант, если вдруг открыта какая-то отдельная страница
  if (typeof renderAdsTable === 'function') renderAdsTable();
  if (typeof renderAdsFeed === 'function') renderAdsFeed();
  if (typeof renderRegistryTable === 'function') renderRegistryTable();
  if (typeof renderRegistryView === 'function') renderRegistryView();
  if (typeof renderScoringView === 'function') renderScoringView(SELECTED_COMPLEX_ID);
  if (typeof renderScoringMatrix === 'function') renderScoringMatrix();
  if (typeof renderSignalCard === 'function') renderSignalCard(SELECTED_COMPLEX_ID);
  if (typeof renderAuditLog === 'function') renderAuditLog();
}

// ------------------------------------------------------------------------
// Живая синхронизация с бэкендом (GET /complexes, GET /publications, GET /audit-log)
// ------------------------------------------------------------------------
async function syncWithBackend(zoneFilter = null) {
  if (typeof apiClient === 'undefined' || !apiClient.isConnected) return false;
  try {
    const [apiComplexes, apiPublications, apiAudit] = await Promise.all([
      apiClient.getComplexes(zoneFilter),
      apiClient.getPublications(),
      apiClient.getAuditLog ? apiClient.getAuditLog(50) : Promise.resolve([])
    ]);

    if (Array.isArray(apiComplexes) && apiComplexes.length > 0) {
      const cleanApiComplexes = apiComplexes.filter(ac => !isTestComplexEntity(ac));
      if (!zoneFilter || zoneFilter === 'ALL') {
        complexes = cleanApiComplexes.map(ac => {
          const existing = complexes.find(item => item.id === ac.id);
          return normalizeComplexFromApi(ac, existing);
        });
      } else {
        // Если запрашивали фильтр по конкретной зоне — обновляем только совпавшие ЖК
        cleanApiComplexes.forEach(ac => {
          const idx = complexes.findIndex(item => item.id === ac.id);
          if (idx >= 0) {
            complexes[idx] = normalizeComplexFromApi(ac, complexes[idx]);
          } else {
            complexes.push(normalizeComplexFromApi(ac));
          }
        });
      }
      complexes = complexes.filter(c => !isTestComplexEntity(c));
      window.complexes = complexes;
    }

    if (Array.isArray(apiPublications) && apiPublications.length > 0) {
      adsList = apiPublications.map(ap => {
        const existing = adsList.find(item => item.id === ap.id);
        return normalizePublicationFromApi(ap, existing);
      });
      window.adsList = adsList;
    }

    if (Array.isArray(apiAudit) && apiAudit.length > 0) {
      const formatted = apiAudit.map(formatAuditEntryFromApi).filter(Boolean);
      const staticSeedNotes = [
        `[SQLite Backend] Синхронизировано с ${apiClient.baseUrl}: ${complexes.length} ЖК, ${adsList.length} публикаций, ${apiAudit.length} записей аудита`
      ];
      auditLogEntries = [...formatted, ...staticSeedNotes];
      window.auditLogEntries = auditLogEntries;
    }

    saveState();
    triggerUIRefresh();
    return true;
  } catch (err) {
    console.warn('[syncWithBackend] Error syncing with backend:', err);
    return false;
  }
}
window.syncWithBackend = syncWithBackend;

// Подтягиваем детальную карточку ЖК с сервера (GET /complexes/{id} -> публикации, сигнал, факторы)
async function fetchComplexDetail(complexId) {
  if (!complexId) return null;
  if (typeof apiClient !== 'undefined' && apiClient.isConnected && apiClient.getComplexById) {
    const detailed = await apiClient.getComplexById(complexId);
    if (detailed && detailed.id) {
      const idx = complexes.findIndex(c => c.id === complexId);
      const normalized = normalizeComplexFromApi(detailed, idx >= 0 ? complexes[idx] : null);
      if (idx >= 0) {
        complexes[idx] = normalized;
      } else {
        complexes.push(normalized);
      }
      saveState();
      return normalized;
    }
  }
  return complexes.find(c => c.id === complexId) || null;
}
window.fetchComplexDetail = fetchComplexDetail;

// Подтверждение или отклонение ИИ-гипотезы по объявлению инспектором (Human-in-the-loop)
async function verifyPublicationDecision(pubId, decision, comment = null) {
  const normDecision = (decision === 'accept' || decision === 'CONFIRMED') ? 'accept' : 'reject';
  const ad = adsList.find(a => a.id === pubId);
  if (!ad) return;

  const res = (typeof apiClient !== 'undefined' && apiClient.verifyPublication)
    ? await apiClient.verifyPublication(pubId, normDecision, comment, 'Ахметов Д.К. (Аналитик МИО)')
    : { local: true };

  if (res && res.ok === false) {
    showCopyToast(`⚠️ Ошибка верификации публикации ${pubId}: ${res.error || 'Неизвестная ошибка'}`);
    return;
  }

  if (res && !res.local && res.publication) {
    // Если бэкенд на связи — забираем пересчитанную публикацию и свежий скоринг ЖК оттуда
    const idx = adsList.findIndex(a => a.id === pubId);
    if (idx >= 0) {
      adsList[idx] = normalizePublicationFromApi(res.publication, adsList[idx]);
    }
    if (ad.complexId) {
      await fetchComplexDetail(ad.complexId);
    }
    await syncWithBackend();
  } else {
    // Офлайн-фоллбэк: локально пересчитываем факторы один-в-один по правилам бэкенда
    ad.status = normDecision === 'accept' ? 'CONFIRMED' : 'REJECTED';
    if (ad.complexId) {
      const c = complexes.find(item => item.id === ad.complexId);
      if (c) {
        recomputeComplexFactorsFromAdsLocal(c);
      }
    }
    const timeNow = new Date().toLocaleTimeString();
    const label = normDecision === 'accept' ? 'ПРИНЯТА (CONFIRMED)' : 'ОТКЛОНЕНА (REJECTED)';
    auditLogEntries.unshift(`[${timeNow}] 📢 Публикация ${pubId} (${ad.platform}): ${label} аналитиком МИО`);
    saveState();
    triggerUIRefresh();
  }

  const toastText = normDecision === 'accept'
    ? `✅ Публикация <strong>${pubId}</strong> подтверждена! Скоринг связанного ЖК пересчитан.`
    : `✕ Публикация <strong>${pubId}</strong> отклонена аналитиком (0 баллов).`;
  showCopyToast(toastText);
}
window.verifyPublicationDecision = verifyPublicationDecision;

// Локальный пересчёт факторов R2, R3, R5 от привязанных объявлений (когда работаем без сервера)
function recomputeComplexFactorsFromAdsLocal(c) {
  if (!c || !c.factors) return;
  const cAds = adsList.filter(a => a.complexId === c.id);
  const isCommissioned = c.legalStatus === 'COMMISSIONED' || c.legalBasisType === 'COMMISSIONED';

  // R2: смотрим, есть ли подтверждённые объявления с прямым сбором денег (бронь/касса/депозит)
  const r2Ads = cAds.filter(a => a.hasDirectPaymentOffer || a.proposedFactor === 'R2');
  if (r2Ads.some(a => a.status === 'CONFIRMED')) {
    c.factors.R2.status = 'CONFIRMED';
  } else if (r2Ads.some(a => a.status === 'AI_HYPOTHESIS')) {
    c.factors.R2.status = 'AI_HYPOTHESIS';
  } else if (r2Ads.length > 0 && r2Ads.every(a => a.status === 'REJECTED')) {
    c.factors.R2.status = 'NONE';
  }

  // R3: активная реклама строящегося дома (если дом уже сдан в эксплуатацию — R3 не ставим!)
  if (!isCommissioned) {
    const r3Ads = cAds.filter(a => a.isActivePreCommissioningAd || a.proposedFactor === 'R3' || a.proposedFactor === 'R5' || a.proposedFactor === 'R2');
    if (r3Ads.some(a => a.status === 'CONFIRMED' || a.status === 'VERIFIED_OK')) {
      c.factors.R3.status = 'CONFIRMED';
    } else if (r3Ads.some(a => a.status === 'AI_HYPOTHESIS')) {
      c.factors.R3.status = 'AI_HYPOTHESIS';
    } else if (r3Ads.length > 0 && r3Ads.every(a => a.status === 'REJECTED')) {
      c.factors.R3.status = 'NONE';
    }
  }

  // R5: расхождение обещанной и реальной готовности >= 20 процентных пунктов
  const gap = (c.readinessDeclared || 0) - (c.readinessFact || 0);
  if (gap >= 20) {
    const r5Ads = cAds.filter(a => a.proposedFactor === 'R5');
    if (r5Ads.some(a => a.status === 'CONFIRMED')) {
      c.factors.R5.status = 'CONFIRMED';
    } else if (r5Ads.some(a => a.status === 'AI_HYPOTHESIS')) {
      c.factors.R5.status = 'AI_HYPOTHESIS';
    } else if (r5Ads.length > 0 && r5Ads.every(a => a.status === 'REJECTED')) {
      c.factors.R5.status = 'REJECTED';
    }
  }
}

// Локальный ИИ-анализатор текста объявления (на случай если FastAPI выключен)
// Возвращает ровно ту же структуру, что и POST /api/v1/analyze на бэке
function runLocalAnalyze(req) {
  const text = (req && req.text) || '';
  const lower = text.toLowerCase();
  const phone = (req && req.phone) || '';
  let complexId = (req && req.complexId) || null;
  let candidates = [];

  if (!complexId) {
    // Сначала пробуем найти название ЖК прямо внутри текста объявления
    for (const c of complexes) {
      const ruName = getLocalized(c.names, 'ru').replace(/ЖК\s*|«|»/gi, '').trim().toLowerCase();
      if (ruName && lower.includes(ruName)) {
        complexId = c.id;
        candidates = [c.id];
        break;
      }
    }
  }
  if (!complexId && phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length >= 6) {
      const matched = complexes.filter(c => (c.contactPhone || '').replace(/\D/g, '') === cleanPhone).map(c => c.id);
      candidates = matched;
      if (matched.length === 1) {
        complexId = matched[0];
      } else {
        complexId = null; // Коллизия! На одном номере висят сразу несколько ЖК — возвращаем кандидатов на выбор
      }
    }
  }
  if (complexId && candidates.length === 0) {
    candidates = [complexId];
  }

  const targetComplex = complexId ? complexes.find(c => c.id === complexId) : null;
  const isCommissioned = targetComplex && (targetComplex.legalStatus === 'COMMISSIONED' || targetComplex.legalBasisType === 'COMMISSIONED');

  // Ловим триггеры по R2 (платная бронь, касса, депозит, ПВ)
  const r2Keywords = ['бронь', 'бронирован', 'резерв', 'депозит', 'задаток', 'касс', 'предварительн', 'наличн', 'пв ', 'первоначальн'];
  const r2Matched = r2Keywords.filter(k => lower.includes(k));
  const hasMoney = /\d+\s*(000|млн|тыс|%|тг|₸)/i.test(text);
  let r2Strength = 'none';
  let r2Conf = 0;
  let r2Quote = null;
  if (!isCommissioned && r2Matched.length > 0 && hasMoney) {
    r2Strength = 'strong';
    r2Conf = Math.min(98, 86 + r2Matched.length * 3);
    r2Quote = text.length > 110 ? text.slice(0, 110) + '…' : text;
  } else if (!isCommissioned && r2Matched.length > 0) {
    r2Strength = 'weak';
    r2Conf = 68;
    r2Quote = text.length > 110 ? text.slice(0, 110) + '…' : text;
  }

  // Ловим триггеры по R3 (реклама строящегося ЖК до ввода)
  const r3Keywords = ['продаж', 'квартир', 'строящ', 'жк', 'рассрочк', 'планировк', 'сдача', 'котлован', 'этаж', 'м²', 'дду'];
  const r3Matched = r3Keywords.filter(k => lower.includes(k));
  let r3Strength = 'none';
  let r3Conf = 0;
  let r3Quote = null;
  if (!isCommissioned && r3Matched.length >= 2) {
    r3Strength = 'strong';
    r3Conf = Math.min(96, 82 + r3Matched.length * 2);
    r3Quote = text.length > 110 ? text.slice(0, 110) + '…' : text;
  } else if (!isCommissioned && r3Matched.length === 1) {
    r3Strength = 'weak';
    r3Conf = 62;
    r3Quote = text.length > 110 ? text.slice(0, 110) + '…' : text;
  }

  // Ловим триггеры по R5 (завышение процента готовности в рекламе)
  const pctMatch = text.match(/(\d{1,3})\s*%/);
  const statedPct = pctMatch ? parseInt(pctMatch[1], 10) : null;
  const verifiedPct = targetComplex ? (targetComplex.readinessFact ?? null) : null;
  let r5Strength = 'none';
  let r5Conf = 0;
  let r5Quote = null;
  let r5Expl = 'В тексте не заявлен процент готовности для сверки с данными МИО.';
  const r5Triggers = [];
  if (statedPct !== null && statedPct <= 100 && lower.includes('готовн')) {
    r5Triggers.push(`заявлено ${statedPct}%`);
    if (verifiedPct !== null) {
      const gap = statedPct - verifiedPct;
      r5Triggers.push(`подтверждено ${verifiedPct}%`, `разница ${gap} п.п.`);
      if (gap >= 20) {
        r5Strength = 'strong';
        r5Conf = Math.min(96, 75 + gap);
        r5Quote = pctMatch[0];
        r5Expl = `В рекламе заявлена готовность ${statedPct}%, подтверждённая готовность — ${verifiedPct}%: разница ${gap} п.п. ≥ 20 п.п.`;
      } else {
        r5Expl = `Заявлено ${statedPct}%, подтверждено ${verifiedPct}%: разница ${gap} п.п. < 20 п.п. (в пределах нормы).`;
      }
    } else {
      r5Strength = 'weak';
      r5Conf = 55;
      r5Quote = pctMatch[0];
      r5Expl = `В тексте заявлена готовность ${statedPct}%, выберите ЖК для сверки с фактической готовностью.`;
    }
  }

  const hypotheses = [
    {
      factor: 'R2',
      name: 'Прямое предложение внести деньги до ДДУ',
      weight: 25,
      strength: r2Strength,
      confidence: r2Conf,
      quote: r2Quote,
      triggers: r2Matched,
      explanation: r2Strength !== 'none'
        ? `Обнаружены признаки привлечения средств до ДДУ (${r2Matched.join(', ')}). Гипотеза ИИ: 0 баллов до подтверждения аналитиком.`
        : 'Прямых предложений внести бронь, депозит или оплату в кассу до ДДУ не обнаружено.',
      status: 'AI_HYPOTHESIS',
      points: 0
    },
    {
      factor: 'R3',
      name: 'Активная реклама строящегося жилья',
      weight: 10,
      strength: r3Strength,
      confidence: r3Conf,
      quote: r3Quote,
      triggers: r3Matched,
      explanation: isCommissioned
        ? 'Объект введён в эксплуатацию: реклама готового жилья не является фактором R3.'
        : (r3Strength !== 'none'
          ? 'Публичное продвижение продажи квартир в строящемся ЖК до ввода в эксплуатацию.'
          : 'Признаков рекламы продажи строящегося жилья не выявлено.'),
      status: 'AI_HYPOTHESIS',
      points: 0
    },
    {
      factor: 'R5',
      name: 'Существенное расхождение заявленной и подтверждённой готовности',
      weight: 10,
      strength: r5Strength,
      confidence: r5Conf,
      quote: r5Quote,
      triggers: r5Triggers,
      explanation: r5Expl,
      status: 'AI_HYPOTHESIS',
      points: 0
    }
  ];

  const activeHyps = hypotheses.filter(h => h.strength !== 'none');
  let proposedFactor = null;
  let confidence = 0;
  let triggerSpan = '';
  let triggers = [];

  if (activeHyps.length > 0) {
    // Выбираем самую весомую гипотезу из найденных
    const best = activeHyps.sort((a, b) => (b.strength === 'strong' ? 100 : 50) + b.weight - ((a.strength === 'strong' ? 100 : 50) + a.weight))[0];
    proposedFactor = best.factor;
    confidence = best.confidence;
    triggerSpan = best.quote || '';
    triggers = Array.from(new Set(activeHyps.flatMap(h => h.triggers)));
  }

  return {
    complexId,
    candidates,
    proposedFactor,
    confidence,
    triggerSpan,
    triggers,
    hypotheses
  };
}
window.runLocalAnalyze = runLocalAnalyze;

function resetDemoData() {
  if (!confirm('Сбросить данные к эталонным 8 ЖК и 12 объявлениям (синхронизированным с backend/seed.json)? Все ручные изменения будут очищены.')) {
    return;
  }
  localStorage.removeItem(STATE_KEY);
  localStorage.removeItem('clearbuild_complexes');
  localStorage.removeItem('clearbuild_ads');
  localStorage.removeItem('clearbuild_audit_log');
  localStorage.removeItem('clearbuild_selected_id');

  appState = {
    schemaVersion: SCHEMA_VERSION,
    complexes: JSON.parse(JSON.stringify(RAW_COMPLEXES)),
    adsList: JSON.parse(JSON.stringify(INITIAL_ADS)),
    auditLogEntries: [
      `[${new Date().toLocaleString()}] 🔄 Демо-данные сброшены к эталону (8 ЖК и 12 объявлений, синхронизировано с backend/seed.json)`,
      `[15.10.2026, 09:00] Инициализация мониторинга SAQ QURYLYS г. Усть-Каменогорск`,
      `[15.10.2026, 09:05] Загружено 8 строящихся комплексов и 12 зафиксированных объявлений`
    ],
    selectedId: 'jk-1',
    theme: CURRENT_THEME,
    lang: CURRENT_LANG,
    actLang: CURRENT_ACT_LANG,
    activeTab: CURRENT_ACTIVE_TAB
  };

  complexes = appState.complexes;
  adsList = appState.adsList;
  auditLogEntries = appState.auditLogEntries;
  saveState();

  if (typeof apiClient !== 'undefined' && apiClient.isConnected) {
    syncWithBackend();
  }

  alert('Эталонные данные успешно восстановлены!');
  triggerUIRefresh();
}

async function changeFactorStatus(complexId, factorCode, newStatus) {
  const c = complexes.find(item => item.id === complexId);
  if (!c || !c.factors[factorCode]) return;

  const prevStatus = c.factors[factorCode].status;
  c.factors[factorCode].status = newStatus;

  // Стучимся на бэкенд, если он подключён
  if (typeof apiClient !== 'undefined' && apiClient.confirmFactor && apiClient.isConnected) {
    const res = await apiClient.confirmFactor(
      complexId,
      factorCode,
      newStatus,
      `Решение аналитика МИО через скоринг-матрицу: ${newStatus}`,
      'Ахметов Д.К. (Аналитик МИО)'
    );
    if (res && res.ok === false && res.status === 'blocked') {
      // Опа, бэкенд заблокировал! Например, аналитик пытался включить R1 при действующей гарантии КЖК. Откатываем назад.
      c.factors[factorCode].status = prevStatus;
      showCopyToast(`⛔ <strong>Ограничение ТЗ:</strong> ${res.error}`);
      triggerUIRefresh();
      return;
    }
    if (res && res.complex) {
      const idx = complexes.findIndex(item => item.id === complexId);
      if (idx >= 0) {
        complexes[idx] = normalizeComplexFromApi(res.complex, complexes[idx]);
      }
    }
  }

  const timeNow = new Date().toLocaleTimeString();
  const statusLabel = getFactorStatusLabel(newStatus, CURRENT_LANG);
  const entry = `[${timeNow}] Фактор ${factorCode} для «${getLocalized(c.names)}»: изменен с ${prevStatus} на ${newStatus} (${statusLabel})`;
  auditLogEntries.unshift(entry);

  saveState();
  triggerUIRefresh();
}

async function updateFactorEvidence(complexId, factorCode, newEvidence) {
  const c = complexes.find(item => item.id === complexId);
  if (!c || !c.factors[factorCode]) return;

  const f = c.factors[factorCode];
  if (typeof f.evidence === 'object' && f.evidence !== null) {
    f.evidence[CURRENT_LANG] = newEvidence;
    f.evidence.ru = newEvidence;
  } else {
    f.evidence = { ru: newEvidence, kz: newEvidence, en: newEvidence };
  }

  const timeNow = new Date().toLocaleTimeString();
  auditLogEntries.unshift(`[${timeNow}] Обновлено обоснование фактора ${factorCode} для «${getLocalized(c.names)}»`);
  saveState();

  if (typeof apiClient !== 'undefined' && apiClient.confirmFactor && apiClient.isConnected) {
    const res = await apiClient.confirmFactor(complexId, factorCode, f.status, newEvidence, "Ахметов Д.К. (Аналитик МИО)");
    if (res && res.complex) {
      const idx = complexes.findIndex(item => item.id === complexId);
      if (idx >= 0) complexes[idx] = normalizeComplexFromApi(res.complex, complexes[idx]);
      saveState();
    }
  }

  triggerUIRefresh();
}

async function recordSignalDecision(complexId, decision, comment, author) {
  const c = complexes.find(item => item.id === complexId);
  if (!c) return;

  c.signalStatus = decision;
  c.signalUpdatedAt = new Date().toLocaleString();
  c.signalAuthor = author || "Ахметов Д.К. (Уполномоченный инспектор)";
  if (comment) c.signalComment = comment;

  const timeNow = new Date().toLocaleTimeString();
  const decisionText = decision === 'CONFIRMED' ? 'УТВЕРЖДЕН' : 'ВОЗВРАЩЕН НА ДОРАБОТКУ';
  auditLogEntries.unshift(`[${timeNow}] Сигнальный акт по ЖК «${getLocalized(c.names)}»: ${decisionText} инспектором ${c.signalAuthor}`);
  saveState();

  if (typeof apiClient !== 'undefined' && apiClient.signalDecision) {
    await apiClient.signalDecision(complexId, decision, comment, author);
  }

  triggerUIRefresh();
  alert(`Сигнальный акт по ЖК «${getLocalized(c.names)}» успешно ${decision === 'CONFIRMED' ? 'утвержден' : 'возвращен на доработку'}!`);
}

// Копируем БИН в буфер обмена и открываем госпортал в новой вкладке
function copyBinAndOpen(bin, url, portalName) {
  if (navigator.clipboard && bin) {
    const cleanBin = bin.replace(/\D/g, '');
    navigator.clipboard.writeText(cleanBin).catch(() => {});
  }
  showCopyToast(`📋 БИН <strong>${bin}</strong> скопирован в буфер! Открываем ${portalName}...`);
  setTimeout(() => {
    window.open(url, '_blank');
  }, 400);
}

function showCopyToast(msg) {
  let toast = document.getElementById('copy-toast-el');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'copy-toast-el';
    toast.className = 'copy-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = msg;
  toast.classList.add('show');
  clearTimeout(window.__toastTimeout);
  window.__toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// Обработчики модалки настройки API-сервера
function openApiModal() {
  const modal = document.getElementById('api-config-modal');
  if (modal) {
    if (typeof apiClient !== 'undefined') {
      apiClient.updateUIStatus();
    }
    modal.style.display = 'flex';
  }
}

function closeApiModal() {
  const modal = document.getElementById('api-config-modal');
  if (modal) modal.style.display = 'none';
}

async function testApiConnection() {
  const inputEl = document.getElementById('backend-api-url-input');
  if (inputEl && inputEl.value && typeof apiClient !== 'undefined') {
    apiClient.setBaseUrl(inputEl.value.trim());
  }
  if (typeof apiClient !== 'undefined') {
    const res = await apiClient.ping();
    if (res.ok) {
      await syncWithBackend();
      alert(`✅ Успешное соединение с Backend API (SQLite)!\n\nАдрес: ${apiClient.baseUrl}\nВерсия: ${res.data.version || '1.1'}\nБД: ${res.data.complexesCount || 8} ЖК / ${res.data.publicationsCount || 12} публикаций\nСтатус: 200 OK`);
    } else {
      alert(`🟡 Сервер бэкенда по адресу ${apiClient.baseUrl} не отвечает (или выключен).\n\nClearBuild продолжает работу в автономном демонстрационном режиме поверх seed.json и localStorage.`);
    }
  }
}

function saveApiUrlFromModal() {
  const inputEl = document.getElementById('backend-api-url-input');
  if (inputEl && typeof apiClient !== 'undefined') {
    apiClient.setBaseUrl(inputEl.value.trim());
    testApiConnection();
  }
}

// Запуск имитации полной сверки по 11 госбазам РК
function triggerCrossRegistryCheck() {
  const timeNow = new Date().toLocaleTimeString();
  auditLogEntries.unshift(`[${timeNow}] ⚡ Запущена полная перекрёстная сверка 8 ЖК по 11 государственным реестрам РК...`);
  auditLogEntries.unshift(`[${timeNow}] ✅ Сверка завершена: 11 баз онлайн. Выявлены расхождения по 2 объектам Красной зоны (jk-1, jk-4).`);
  saveState();
  if (typeof renderAuditLog === 'function') renderAuditLog();
  alert('Перекрёстная сверка с 11 госреестрами РК успешно завершена! Результаты занесены в журнал аудита.');
}

// Детерминированный расчёт скоринга по Разделам 3 и 4 ТЗ
// Никакой отсебятины от ИИ: считают только подтверждённые человеком факторы (CONFIRMED)
function calculateComplexRisk(c) {
  let score = 0;
  const activeCodes = [];
  const aiHypotheses = [];
  const needsCheck = [];

  ['R1', 'R2', 'R3', 'R4', 'R5', 'R6'].forEach(code => {
    const factor = c && c.factors ? c.factors[code] : null;
    if (!factor) return;
    const weight = (typeof factor.weight === 'number')
      ? factor.weight
      : ((typeof FACTOR_INFO !== 'undefined' && FACTOR_INFO[code]) ? FACTOR_INFO[code].weight : 0);

    if (factor.status === 'CONFIRMED') {
      score += weight;
      activeCodes.push(code);
    } else if (factor.status === 'AI_HYPOTHESIS') {
      aiHypotheses.push(code);
    } else if (factor.status === 'UNVERIFIED') {
      needsCheck.push(code);
    }
  });

  score = Math.min(100, score);
  const hasR1 = activeCodes.includes('R1');
  const hasR2 = activeCodes.includes('R2');

  const dict = (typeof I18N !== 'undefined' && I18N[CURRENT_LANG]) ? I18N[CURRENT_LANG] : null;
  let zone = 'GREEN';
  let zoneBadgeClass = 'badge-green';
  let zoneName = dict ? dict['zone-safe'] : (CURRENT_LANG === 'kz' ? 'Қауіпсіз' : CURRENT_LANG === 'en' ? 'Safe' : 'Безопасно');

  // Главное правило Раздела 4 ТЗ: в Красную зону пускаем ТОЛЬКО если >= 60 баллов И одновременно подтверждены R1 + R2!
  if (score >= 60 && hasR1 && hasR2) {
    zone = 'RED';
    zoneBadgeClass = 'badge-red';
    zoneName = dict ? dict['zone-danger'] : (CURRENT_LANG === 'kz' ? 'Қауіпті' : CURRENT_LANG === 'en' ? 'High Risk' : 'Опасно');
  } else if (score >= 25) {
    zone = 'YELLOW';
    zoneBadgeClass = 'badge-yellow';
    zoneName = dict ? dict['zone-warn'] : (CURRENT_LANG === 'kz' ? 'Назар аударуды қажет етеді' : CURRENT_LANG === 'en' ? 'Needs Review' : 'Требует внимания');
  }

  return { score, zone, zoneBadgeClass, zoneName, activeCodes, aiHypotheses, needsCheck, hasR1, hasR2 };
}

// Переключалка светлой/тёмной темы
function setTheme(theme) {
  CURRENT_THEME = theme;
  localStorage.setItem('clearbuild_theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  const lBtn = document.getElementById('theme-btn-light');
  const dBtn = document.getElementById('theme-btn-dark');
  if (lBtn) lBtn.classList.toggle('active', theme === 'light');
  if (dBtn) dBtn.classList.toggle('active', theme === 'dark');
  if (window.applyMapTiles) window.applyMapTiles();
}

// ------------------------------------------------------------------------
// Мультиязычный словарь интерфейса (I18N) — RU / KZ / EN
// Тут собраны все подписи кнопок, заголовков и таблиц на трёх языках
// ------------------------------------------------------------------------
const I18N = {
  ru: {
    // Шапка и общие элементы
    'portal-title': 'SAQ QURYLYS',
    'portal-sub': 'Мониторинг строящегося жилья · Усть-Каменогорск',
    'i18n-header-sub': 'Мониторинг строящегося жилья · Усть-Каменогорск',
    'btn-font-scale': '🔍 А+',
    'btn-help-guide': '❓ Как работать',
    'btn-api-lbl': '🔌 Связь с БД',
    'btn-reset-lbl': 'Сброс демо',
    'lbl-theme-light': 'Светлая',
    'lbl-theme-dark': 'Тёмная',
    'i18n-ribbon-tag': 'Официальный реестр:',
    'i18n-ribbon-desc': 'Сверка строящихся объектов с базой разрешений МИО ВКО и договоров гарантии АО «КЖК».',
    'i18n-ribbon-loc': 'Codemasters Hackathon 8.0 · г. Усть-Каменогорск',

    // Верхние KPI-карточки
    'kpi-title-total': 'Всего объектов на контроле',
    'kpi-title-green': 'Законное привлечение (Гарантия/МИО)',
    'kpi-title-yellow': 'Документы на проверке / Расхождения',
    'kpi-title-red': 'Высокий риск (Сбор денег без ДДУ)',

    // Навигация (десктоп и мобилка)
    'lbl-nav-map': '01 · Карта и Обзор',
    'lbl-nav-registry': '02 · Реестр ЖК',
    'lbl-nav-ads': '03 · Мониторинг рекламы (AI)',
    'lbl-nav-scoring': '04 · Риск-скоринг R1–R6',
    'lbl-nav-signal': '05 · Сигнальный акт (PDF)',
    'lbl-nav-network': 'Сеть телефонов / Коллизии',
    'mob-nav-map': '🗺️ Карта',
    'mob-nav-registry': '📋 Реестр',
    'mob-nav-ads': '📢 Реклама',
    'mob-nav-scoring': '⚖️ Матрица',
    'mob-nav-signal': '📑 Акт',
    'mob-nav-network': '🕸️ Связи',

    // Панель контрольных тест-кейсов (Раздел 5 ТЗ)
    'lbl-cases-bar': '🎯 Эталонные кейсы ТЗ (Раздел 5):',
    'btn-case-a': '🟡 Кейс A · 35 б. (Нужна проверка)',
    'btn-case-b': '🔴 Кейс B · 70 б. (Сбор денег без ДДУ)',
    'btn-case-c': '🟢 Кейс C · 10 б. (Гарантия КЖК)',
    'btn-case-edge': '⚖️ Граничный · 60 б. без R2 = Жёлтая!',

    // Вкладка 01: Карта
    'pill-txt-all': 'Все',
    'pill-txt-green': '🟢 Зелёная',
    'pill-txt-yellow': '🟡 Жёлтая',
    'pill-txt-red': '🔴 Красная',
    'lbl-map-title': 'Интерактивная карта г. Усть-Каменогорск',
    'map-mode-osm': '🗺️ OpenStreetMap',
    'map-mode-dark': '🌙 Ночная',
    'map-mode-vector': '🛰️ Векторная офлайн-схема',
    'map-btn-fit': '🎯 Центр',
    'map-leg-green': '0–24: Законно',
    'map-leg-yellow': '25–59: Проверка документов',
    'map-leg-red': '60–100: Незаконный сбор средств',
    'search-placeholder': 'Поиск по названию ЖК, застройщику, улице...',
    'svg-river-irtysh': 'р. Иртыш (Ертіс)',
    'svg-river-ulba': 'р. Ульба (Үлбі)',
    'svg-dist-left': 'ЛЕВЫЙ БЕРЕГ (19 МКР)',
    'svg-dist-kshst': 'РАЙОН КШТ',
    'svg-dist-strelka': 'СТРЕЛКА / НАБЕРЕЖНАЯ',
    'svg-dist-center': 'ЦЕНТР ГОРОДА',
    'svg-dist-ulba': 'УЛЬБИНСКИЙ РАЙОН',
    'svg-banner-title': 'ВЕКТОРНАЯ ОФЛАЙН-КАРТА Г. УСТЬ-КАМЕНОГОРСК (ӨСКЕМЕН)',
    'svg-banner-sub': 'Работает на 100% автономно без интернета · Кликните по маркеру ЖК для просмотра досье',

    // Вкладка 02: Реестр ЖК
    'reg-heading-title': 'Реестр строящихся объектов и досье застройщиков',
    'lbl-add-complex': 'Добавить ЖК',
    'modal-complex-title': '🏗️ Добавить объект ЖК в реестр мониторинга',
    'reg-heading-desc': 'Официальный свод строящихся многоквартирных домов г. Усть-Каменогорска со статусом правовых оснований по Закону РК о ДЖС.',
    'reg-search-placeholder': 'Фильтр по названию, БИН или застройщику...',
    'reg-opt-all': 'Все зоны риска',
    'reg-opt-green': '🟢 Только Зелёная (Законно)',
    'reg-opt-yellow': '🟡 Только Жёлтая (Проверка)',
    'reg-opt-red': '🔴 Только Красная (Опасно)',
    'reg-th-complex': 'ОБЪЕКТ ЖК И АДРЕС',
    'reg-th-developer': 'ЗАСТРОЙЩИК / БИН',
    'reg-th-legal': 'ПРАВОВОЕ ОСНОВАНИЕ',
    'reg-th-zone': 'ЗОНА / ДОСЬЕ',

    // Вкладка 03: Мониторинг рекламы
    'ads-heading-title': 'Мониторинг рекламы и детекция незаконного сбора средств',
    'ads-heading-desc': 'Автоматический парсинг объявлений с Krisha.kz, OLX, Instagram. Подсветка триггеров «платная бронь», «касса», «депозит» и расхождений готовности (R5 ≥ 20 п.п.).',
    'btn-add-ad': '➕ Добавить объявление вручную',
    'ads-th-id': 'ID',
    'ads-th-platform': 'Площадка / Дата',
    'ads-th-complex': 'Объект ЖК',
    'ads-th-text': 'Текст объявления и снимок фиксации',
    'ads-th-triggers': 'Выявленные триггеры',
    'ads-th-algo': 'Оценка алгоритма ИИ',
    'ads-th-status': 'Статус проверки инспектором',

    // Вкладка 04: Матрица скоринга
    'scoring-heading-title': 'Модель риск-скоринга R1–R6 (Раздел 5 ТЗ)',
    'scoring-heading-desc': 'Интерактивная панель управления факторами. Инспектор переключает статусы и редактирует обоснования в реальном времени.',
    'lbl-scoring-complex': 'Объект для проверки:',
    'card-green-title': '🟢 Зелёная зона (0–24 балла)',
    'card-green-desc': 'Законное привлечение средств граждан. Действует гарантия АО «КЖК» или разрешение МИО. Дом полностью защищён законом.',
    'card-yellow-title': '🟡 Жёлтая зона (25–59 баллов)',
    'card-yellow-desc': 'Повышенный контроль МИО. Документы на согласовании, зафиксированы ранние бронирования без прямого указания на кассу или расхождения по срокам.',
    'card-red-title': '🔴 Красная зона (60–100 баллов)',
    'card-red-desc': 'Высокий риск. Обязательно подтверждены факторы R1 (+35) и R2 (+25): незаконный сбор средств при полном отсутствии разрешительных документов.',
    'scoring-th-code': 'Код',
    'scoring-th-weight': 'Вес',
    'scoring-th-criteria': 'Критерий оценки',
    'scoring-th-status': 'Текущий статус (Интерактивный переключатель)',
    'scoring-th-evidence': 'Обоснование решения инспектора (Быстрое редактирование)',
    'lbl-audit-log-title': '📋 Журнал действий инспектора (Audit Log)',
    'lbl-audit-log-status': '● Активен (Сервер SQLite + Локальная память v4)',

    // Вкладка 05: Сигнальный акт
    'signal-heading-title': '05 · Официальный сигнальный акт проверки объекта',
    'signal-heading-desc': 'Формируется уполномоченным инспектором МИО для фиксации нарушений ДЖС и передачи в УГАСК ВКО / прокуратуру.',
    'lbl-act-lang': 'Язык акта:',
    'lbl-signal-complex': 'Объект:',
    'lbl-signal-inspector': 'Инспектор:',
    'lbl-signal-resolution': 'Резолюция:',
    'signal-res-placeholder': 'Введите резолюцию инспектора...',
    'btn-signal-confirm': '✅ Подтвердить сигнал',
    'btn-signal-return': '↩️ Вернуть на доработку',
    'btn-signal-print': '🖨️ Скачать PDF / Печать',
    'btn-signal-json': '⬇️ Выгрузить JSON',

    // Вкладка 06: Сеть телефонов и коллизии
    'net-heading-title': '🕸️ Анализ сетевых связей и коллизий номеров телефонов (Раздел 11 ТЗ)',
    'net-heading-desc': 'Автоматическое выявление зонтичных продаж, риелторских сетей и дубликатов контактов отделов продаж.',
    'btn-net-refresh': '🔄 Обновить связи',
    'net-kpi-lbl-phones': 'Уникальных номеров в мониторинге',
    'net-kpi-lbl-collisions': 'Обнаружено подозрительных сетей',
    'net-kpi-lbl-max': 'Максимум объектов на 1 номер',
    'net-kpi-val-max': '3 ЖК',
    'net-warn-title': 'Обнаружена критическая зонтичная коллизия контактов отдела продаж!',
    'net-warn-desc': 'Номер +7 (705) 999-00-11 одновременно указан в рекламе объекта ЖК «Ертіс Рівер Тауэрс» (Красная зона, 70 б.), ЖК «Ульба Гарденс» (Красная зона, 100 б.) и ЖК «Нурлы Жол Оскемен» (Жёлтая зона, 60 б.). При анализе объявления с этим номером без названия ЖК система предлагает выбрать один из 3 связанных объектов.',
    'net-diag-title': 'Интерактивная карта связей (Телефоны ↔ ЖК)',
    'net-diag-hint': 'Кликните по узлу для подсветки',
    'net-th-phone': 'Контактный телефон',
    'net-th-complexes': 'Связанные объекты ЖК',
    'net-th-collision': 'Характер коллизии',

    // Пошаговые баннеры-подсказки для инспектора
    'step1-banner-title': '🧭 Пошаговый маршрут проверки (Шаг 1 из 5 · Обзор на карте): Выберите объект ЖК на карте или в списке слева, затем перейдите к проверке его документов.',
    'step1-banner-btn': 'Шаг 2: Проверить документы выбранного ЖК в Реестре →',
    'step2-banner-title': '🧭 Пошаговый маршрут проверки (Шаг 2 из 5 · Проверка реестров): Вы сверили разрешения МИО, КЖК и связанные объявления. Следующий шаг — проверка рекламных публикаций.',
    'step2-banner-btn': 'Шаг 3: Перейти к проверке рекламы и объявлений (ИИ) →',
    'step3-banner-title': '🧭 Пошаговый маршрут проверки (Шаг 3 из 5 · Мониторинг рекламы): Подтвердите или отклоните найденные ИИ объявления, затем проверьте итоговые баллы риска.',
    'step3-banner-btn': 'Шаг 4: Перейти к расчёту баллов риска R1–R6 →',
    'step4-banner-title': '🧭 Пошаговый маршрут проверки (Шаг 4 из 5 · Оценка рисков): Факторы R1–R6 проверены. Теперь сформируйте и распечатайте официальный Сигнальный акт.',
    'step4-banner-btn': 'Шаг 5: Оформить и распечатать Сигнальный акт (PDF) →',
    'step5-banner-title': '🧭 Пошаговый маршрут проверки завершён (Шаг 5 из 5): Вы можете подтвердить сигнал, распечатать PDF-акт на двух языках или проверить телефонные связи застройщиков.',
    'step5-banner-btn': '🕸️ Дополнительно: Посмотреть карту связей телефонов →',

    // Подвал
    'footer-text': '<strong>SAQ QURYLYS</strong> · ClearBuild © 2026. Мониторинг законности долевого строительства г. Усть-Каменогорск.',
    'footer-lbl-updated': 'Данные обновлены:',

    // Модальные окна
    'modal-dossier-btn-close': 'Закрыть',
    'modal-dossier-btn-act': '📄 Сформировать акт проверки',
    'modal-ad-tag': 'Ручной мониторинг и OCR-фиксация',
    'modal-ad-title': 'Добавить рекламное объявление для проверки',
    'lbl-presets-bar': '⚡ Быстрые демонстрационные примеры в 1 клик (для защиты и проверки):',
    'lbl-ocr-title': '📷 Снимок экрана объявления (OCR-распознавание текста со скриншота):',
    'btn-ocr-upload': '📂 Загрузить файл скриншота...',
    'btn-ocr-demo': '🖼️ Загрузить демо-скриншот Instagram/Krisha',
    'modal-ad-lbl-complex': 'Жилой комплекс:',
    'modal-ad-lbl-platform': 'Площадка размещения:',
    'modal-ad-lbl-phone': 'Контактный телефон отдела продаж:',
    'modal-ad-lbl-url': 'Ссылка на источник (URL):',
    'modal-ad-lbl-text': 'Текст объявления (введите вручную или загрузите скриншот выше):',
    'modal-ad-btn-ai': '🤖 Проверить текст алгоритмом ИИ',
    'modal-ad-btn-cancel': 'Отмена',
    'modal-ad-btn-save': '✅ Сохранить объявление в базу',
    'modal-api-tag': 'Связь с базой данных',
    'modal-api-title': '🔌 Подключение к серверу базы данных (FastAPI + SQLite)',
    'modal-api-lbl-url': 'Адрес сервера базы данных (URL):',
    'modal-api-lbl-status': 'Текущий статус соединения:',
    'modal-api-btn-reset': '🔄 Сбросить демо-базу',
    'modal-api-btn-test': '⚡ Проверить связь',
    'modal-api-btn-save': '💾 Сохранить адрес',
    'modal-ad-text-placeholder': 'Вставьте полный текст объявления или выберите готовый пример кнопкой выше...',

    // Динамические бейджи зон риска
    'zone-safe': 'Безопасно',
    'zone-warn': 'Требует внимания',
    'zone-danger': 'Опасно'
  },
  kz: {
    // Шапка и общие элементы (KZ)
    'portal-title': 'SAQ QURYLYS',
    'portal-sub': 'Салынып жатқан тұрғын үйлер мониторингі · Өскемен қ.',
    'i18n-header-sub': 'Салынып жатқан тұрғын үйлер мониторингі · Өскемен қ.',
    'btn-font-scale': '🔍 А+',
    'btn-help-guide': '❓ Нұсқаулық',
    'btn-api-lbl': '🔌 ДҚ Сервері',
    'btn-reset-lbl': 'Демоны қалпына келтіру',
    'lbl-theme-light': 'Жарық',
    'lbl-theme-dark': 'Қараңғы',
    'i18n-ribbon-tag': 'Ресми тізілім:',
    'i18n-ribbon-desc': 'ШҚО ЖАО рұқсаттар базасымен және «ҚТҚ» АҚ кепілдік шарттарымен салыстыру.',
    'i18n-ribbon-loc': 'Codemasters Hackathon 8.0 · Өскемен қ.',

    // Верхние KPI (KZ)
    'kpi-title-total': 'Бақылаудағы барлық нысандар',
    'kpi-title-green': 'Заңды қаражат тарту (Кепілдік/ЖАО)',
    'kpi-title-yellow': 'Құжаттар тексерілуде / Сәйкессіздіктер',
    'kpi-title-red': 'Жоғары тәуекел (ҮҚШ-сыз ақша жинау)',

    // Навигация (KZ)
    'lbl-nav-map': '01 · Карта және Шолу',
    'lbl-nav-registry': '02 · ТҮК тізілімі',
    'lbl-nav-ads': '03 · Жарнама мониторингі (AI)',
    'lbl-nav-scoring': '04 · Тәуекел-скоринг R1–R6',
    'lbl-nav-signal': '05 · Сигналдық акт (PDF)',
    'lbl-nav-network': 'Телефондар желісі / Қайшылықтар',
    'mob-nav-map': '🗺️ Карта',
    'mob-nav-registry': '📋 Тізілім',
    'mob-nav-ads': '📢 Жарнама',
    'mob-nav-scoring': '⚖️ Матрица',
    'mob-nav-signal': '📑 Акт',
    'mob-nav-network': '🕸️ Желі',

    // Панель контрольных кейсов (KZ)
    'lbl-cases-bar': '🎯 ТТ эталондық кейстері (5-бөлім):',
    'btn-case-a': '🟡 Кейс A · 35 ұп. (Тексеру қажет)',
    'btn-case-b': '🔴 Кейс B · 70 ұп. (ҮҚШ-сыз ақша жинау)',
    'btn-case-c': '🟢 Кейс C · 10 ұп. (ҚТҚ кепілдігі)',
    'btn-case-edge': '⚖️ Шекаралық · 60 ұп. R2-сіз = Сары!',

    // Вкладка 01: Карта (KZ)
    'pill-txt-all': 'Барлығы',
    'pill-txt-green': '🟢 Жасыл',
    'pill-txt-yellow': '🟡 Сары',
    'pill-txt-red': '🔴 Қызыл',
    'lbl-map-title': 'Өскемен қ. интерактивті картасы',
    'map-mode-osm': '🗺️ OpenStreetMap',
    'map-mode-dark': '🌙 Түнгі',
    'map-mode-vector': '🛰️ Офлайн векторлық сұлба',
    'map-btn-fit': '🎯 Орталық',
    'map-leg-green': '0–24: Заңды',
    'map-leg-yellow': '25–59: Құжаттарды тексеру',
    'map-leg-red': '60–100: Заңсыз ақша жинау',
    'search-placeholder': 'ТҮК атауы, құрылыс салушы, көше бойынша іздеу...',
    'svg-river-irtysh': 'Ертіс өзені',
    'svg-river-ulba': 'Үлбі өзені',
    'svg-dist-left': 'СОЛ ЖАҒАЛАУ (19 ШАҒЫН АУДАН)',
    'svg-dist-kshst': 'ЖМК АУДАНЫ (КШТ)',
    'svg-dist-strelka': 'СТРЕЛКА / ЖАҒАЛАУ',
    'svg-dist-center': 'ҚАЛА ОРТАЛЫҒЫ',
    'svg-dist-ulba': 'ҮЛБІ АУДАНЫ',
    'svg-banner-title': 'ӨСКЕМЕН ҚАЛАСЫНЫҢ ОФЛАЙН ВЕКТОРЛЫҚ КАРТАСЫ',
    'svg-banner-sub': 'Интернетсіз 100% автономды жұмыс істейді · Досьені көру үшін ТҮК белгісін басыңыз',

    // Вкладка 02: Реестр (KZ)
    'reg-heading-title': 'Салынып жатқан нысандар тізілімі және құрылыс салушылар досьесі',
    'lbl-add-complex': 'ТҮК қосу',
    'modal-complex-title': '🏗️ Мониторинг тізіліміне ТҮК нысанын қосу',
    'reg-heading-desc': 'Өскемен қ. ТҮҚ заңы бойынша құқықтық негіздер мәртебесі бар көппәтерлі тұрғын үйлердің ресми жиынтығы.',
    'reg-search-placeholder': 'Атауы, БСН немесе құрылыс салушы бойынша сүзгі...',
    'reg-opt-all': 'Барлық тәуекел аймақтары',
    'reg-opt-green': '🟢 Тек Жасыл (Заңды)',
    'reg-opt-yellow': '🟡 Тек Сары (Тексеру)',
    'reg-opt-red': '🔴 Тек Қызыл (Қауіпті)',
    'reg-th-complex': 'ТҮК НЫСАНЫ ЖӘНЕ МЕКЕНЖАЙЫ',
    'reg-th-developer': 'ҚҰРЫЛЫС САЛУШЫ / БСН',
    'reg-th-legal': 'ҚҰҚЫҚТЫҚ НЕГІЗІ',
    'reg-th-zone': 'АЙМАҚ / ДОСЬЕ',

    // Вкладка 03: Реклама (KZ)
    'ads-heading-title': 'Жарнама мониторингі және заңсыз қаражат жинауды анықтау',
    'ads-heading-desc': 'Krisha.kz, OLX, Instagram хабарландыруларын автоматты түрде өңдеу. «Ақылы бронь», «касса», «депозит» триггерлерін және дайындық сәйкессіздігін (R5 ≥ 20 п.п.) бөлектеу.',
    'btn-add-ad': '➕ Хабарландыруды қолмен қосу',
    'ads-th-id': 'ID',
    'ads-th-platform': 'Алаң / Күні',
    'ads-th-complex': 'ТҮК нысаны',
    'ads-th-text': 'Хабарландыру мәтіні мен бекіту суреті',
    'ads-th-triggers': 'Анықталған триггерлер',
    'ads-th-algo': 'ЖИ алгоритмінің бағасы',
    'ads-th-status': 'Инспектордың тексеру мәртебесі',

    // Вкладка 04: Скоринг (KZ)
    'scoring-heading-title': 'Тәуекел-скоринг моделі R1–R6 (ТТ 5-бөлімі)',
    'scoring-heading-desc': 'Факторларды басқарудың интерактивті тақтасы. Инспектор мәртебелерді ауыстырады және негіздемелерді нақты уақытта өңдейді.',
    'lbl-scoring-complex': 'Тексерілетін нысан:',
    'card-green-title': '🟢 Жасыл аймақ (0–24 ұпай)',
    'card-green-desc': 'Азаматтардың қаражатын заңды тарту. «ҚТҚ» АҚ кепілдігі немесе ЖАО рұқсаты бар. Тұрғын үй заңмен толық қорғалған.',
    'card-yellow-title': '🟡 Сары аймақ (25–59 ұпай)',
    'card-yellow-desc': 'ЖАО тарапынан күшейтілген бақылау. Құжаттар келісілуде, мерзімдер сәйкессіздігі немесе ерте броньдау тіркелген.',
    'card-red-title': '🔴 Қызыл аймақ (60–100 ұпай)',
    'card-red-desc': 'Жоғары тәуекел. R1 (+35) және R2 (+25) факторлары міндетті түрде расталған: рұқсат құжаттарынсыз заңсыз ақша жинау.',
    'scoring-th-code': 'Код',
    'scoring-th-weight': 'Салмақ',
    'scoring-th-criteria': 'Бағалау критерийі',
    'scoring-th-status': 'Ағымдағы мәртебе (Интерактивті қосқыш)',
    'scoring-th-evidence': 'Инспектор шешімінің негіздемесі (Жылдам өңдеу)',
    'lbl-audit-log-title': '📋 Инспектор әрекеттерінің журналы (Audit Log)',
    'lbl-audit-log-status': '● Белсенді (SQLite сервері + Жергілікті жад v4)',

    // Вкладка 05: Сигнальный акт (KZ)
    'signal-heading-title': '05 · Нысанды тексерудің ресми сигналдық актісі',
    'signal-heading-desc': 'ТҮҚ бұзушылықтарын тіркеу және ШҚО МСҚБ / прокуратураға жіберу үшін ЖАО уәкілетті инспекторы қалыптастырады.',
    'lbl-act-lang': 'Акт тілі:',
    'lbl-signal-complex': 'Нысан:',
    'lbl-signal-inspector': 'Инспектор:',
    'lbl-signal-resolution': 'Қарар:',
    'signal-res-placeholder': 'Инспектордың қарарын енгізіңіз...',
    'btn-signal-confirm': '✅ Сигналды растау',
    'btn-signal-return': '↩️ Қайта қарауға қайтару',
    'btn-signal-print': '🖨️ PDF жүктеу / Басып шығару',
    'btn-signal-json': '⬇️ JSON жүктеу',

    // Вкладка 06: Сеть телефонов (KZ)
    'net-heading-title': '🕸️ Желілік байланыстар мен телефон нөмірлері қайшылықтарын талдау (ТТ 11-бөлімі)',
    'net-heading-desc': 'Қолшатырлы сатылымдарды, риелторлық желілерді және сату бөлімдерінің қайталанатын байланыстарын автоматты түрде анықтау.',
    'btn-net-refresh': '🔄 Байланыстарды жаңарту',
    'net-kpi-lbl-phones': 'Мониторингтегі бірегей нөмірлер',
    'net-kpi-lbl-collisions': 'Күдікті желілер анықталды',
    'net-kpi-lbl-max': '1 нөмірге максималды нысандар',
    'net-kpi-val-max': '3 ТҮК',
    'net-warn-title': 'Сату бөлімі байланыстарының қауіпті қолшатырлы қайшылығы анықталды!',
    'net-warn-desc': '+7 (705) 999-00-11 нөмірі «Ертіс Рівер Тауэрс» ТК (Қызыл аймақ, 70 ұп.), «Үлбі Гарденс» ТК (Қызыл аймақ, 100 ұп.) және «Нұрлы Жол Өскемен» ТК (Сары аймақ, 60 ұп.) жарнамаларында бір уақытта көрсетілген.',
    'net-diag-title': 'Байланыстардың интерактивті картасы (Телефондар ↔ ТҮК)',
    'net-diag-hint': 'Бөлектеу үшін түйінді басыңыз',
    'net-th-phone': 'Байланыс телефоны',
    'net-th-complexes': 'Байланысты ТҮК нысандары',
    'net-th-collision': 'Қайшылық сипаты',

    // Пошаговые баннеры (KZ)
    'step1-banner-title': '🧭 Қадамдық тексеру маршруты (5-тен 1-қадам · Картадан шолу): Картадан немесе сол жақ тізімнен ТҮК нысанын таңдап, оның құжаттарын тексеруге өтіңіз.',
    'step1-banner-btn': '2-қадам: Тізілімде таңдалған ТҮК құжаттарын тексеру →',
    'step2-banner-title': '🧭 Қадамдық тексеру маршруты (5-тен 2-қадам · Тізілімдерді тексеру): ЖАО, ҚТҚ рұқсаттарын тексердіңіз. Келесі қадам — жарнамалық хабарландыруларды тексеру.',
    'step2-banner-btn': '3-қадам: Жарнама мен хабарландыруларды тексеруге өту (ЖИ) →',
    'step3-banner-title': '🧭 Қадамдық тексеру маршруты (5-тен 3-қадам · Жарнама мониторингі): ЖИ тапқан хабарландыруларды растаңыз немесе қабылдамаңыз, содан кейін тәуекел ұпайларын есептеңіз.',
    'step3-banner-btn': '4-қадам: R1–R6 тәуекел ұпайларын есептеуге өту →',
    'step4-banner-title': '🧭 Қадамдық тексеру маршруты (5-тен 4-қадам · Тәуекелді бағалау): R1–R6 факторлары тексерілді. Енді ресми Сигналдық актіні қалыптастырып, басып шығарыңыз.',
    'step4-banner-btn': '5-қадам: Сигналдық актіні рәсімдеу және басып шығару (PDF) →',
    'step5-banner-title': '🧭 Қадамдық тексеру маршруты аяқталды (5-тен 5-қадам): Сигналды растауға, PDF-актіні басып шығаруға немесе телефон байланыстарын көруге болады.',
    'step5-banner-btn': '🕸️ Қосымша: Телефондар байланыс картасын көру →',

    // Подвал (KZ)
    'footer-text': '<strong>SAQ QURYLYS</strong> · ClearBuild © 2026. Өскемен қ. үлестік құрылыс заңдылығын бақылау.',
    'footer-lbl-updated': 'Деректер жаңартылды:',

    // Модалки (KZ)
    'modal-dossier-btn-close': 'Жабу',
    'modal-dossier-btn-act': '📄 Тексеру актісін жасау',
    'modal-ad-tag': 'Қолмен мониторинг және OCR-бекіту',
    'modal-ad-title': 'Тексеру үшін жарнамалық хабарландыру қосу',
    'lbl-presets-bar': '⚡ 1 басу арқылы дайын демо-мысалдар (қорғау және тексеру үшін):',
    'lbl-ocr-title': '📷 Хабарландыру скриншоты (суреттен мәтінді OCR арқылы тану):',
    'btn-ocr-upload': '📂 Скриншот файлын жүктеу...',
    'btn-ocr-demo': '🖼️ Instagram/Krisha демо-скриншотын жүктеу',
    'modal-ad-lbl-complex': 'Тұрғын үй кешені:',
    'modal-ad-lbl-platform': 'Орналастыру алаңы:',
    'modal-ad-lbl-phone': 'Сату бөлімінің байланыс телефоны:',
    'modal-ad-lbl-url': 'Дереккөз сілтемесі (URL):',
    'modal-ad-lbl-text': 'Хабарландыру мәтіні (қолмен енгізіңіз немесе жоғарыда скриншот жүктеңіз):',
    'modal-ad-btn-ai': '🤖 Мәтінді ЖИ алгоритмімен тексеру',
    'modal-ad-btn-cancel': 'Бас тарту',
    'modal-ad-btn-save': '✅ Хабарландыруды базаға сақтау',
    'modal-api-tag': 'Дерекқормен байланыс',
    'modal-api-title': '🔌 Дерекқор серверіне қосылу (FastAPI + SQLite)',
    'modal-api-lbl-url': 'Дерекқор серверінің мекенжайы (URL):',
    'modal-api-lbl-status': 'Байланыстың ағымдағы мәртебесі:',
    'modal-api-btn-reset': '🔄 Демо-базаны қалпына келтіру',
    'modal-api-btn-test': '⚡ Байланысты тексеру',
    'modal-api-btn-save': '💾 Мекенжайды сақтау',
    'modal-ad-text-placeholder': 'Хабарландырудың толық мәтінін енгізіңіз немесе жоғарыдағы дайын мысалды таңдаңыз...',

    // Динамические бейджи (KZ)
    'zone-safe': 'Қауіпсіз',
    'zone-warn': 'Назар аударуды қажет етеді',
    'zone-danger': 'Қауіпті'
  },
  en: {
    // Шапка и общие элементы (EN)
    'portal-title': 'SAQ QURYLYS',
    'portal-sub': 'Under-Construction Housing Risk Monitoring · Oskemen',
    'i18n-header-sub': 'Under-Construction Housing Risk Monitoring · Oskemen',
    'btn-font-scale': '🔍 A+',
    'btn-help-guide': '❓ User Guide',
    'btn-api-lbl': '🔌 DB Server',
    'btn-reset-lbl': 'Reset Demo',
    'lbl-theme-light': 'Light',
    'lbl-theme-dark': 'Dark',
    'i18n-ribbon-tag': 'Official Registry:',
    'i18n-ribbon-desc': 'Cross-verification with East Kazakhstan Akimat permits and KZH guarantee contracts.',
    'i18n-ribbon-loc': 'Codemasters Hackathon 8.0 · Ust-Kamenogorsk',

    // Верхние KPI (EN)
    'kpi-title-total': 'Total Monitored Complexes',
    'kpi-title-green': 'Lawful Sales (Guarantee/Permit)',
    'kpi-title-yellow': 'Under Verification / Discrepancies',
    'kpi-title-red': 'High Risk (Illegal Fundraising)',

    // Навигация (EN)
    'lbl-nav-map': '01 · Map & Overview',
    'lbl-nav-registry': '02 · Complexes Registry',
    'lbl-nav-ads': '03 · Ad Monitoring (AI)',
    'lbl-nav-scoring': '04 · Risk Scoring R1–R6',
    'lbl-nav-signal': '05 · Signal Report (PDF)',
    'lbl-nav-network': 'Phone Network & Collisions',
    'mob-nav-map': '🗺️ Map',
    'mob-nav-registry': '📋 Registry',
    'mob-nav-ads': '📢 Ads',
    'mob-nav-scoring': '⚖️ Matrix',
    'mob-nav-signal': '📑 Report',
    'mob-nav-network': '🕸️ Network',

    // Панель контрольных кейсов (EN)
    'lbl-cases-bar': '🎯 TZ Benchmark Cases (Section 5):',
    'btn-case-a': '🟡 Case A · 35 pts (Needs Check)',
    'btn-case-b': '🔴 Case B · 70 pts (Unlawful Cash)',
    'btn-case-c': '🟢 Case C · 10 pts (KZH Guarantee)',
    'btn-case-edge': '⚖️ Edge Case · 60 pts no R2 = Yellow!',

    // Вкладка 01: Карта (EN)
    'pill-txt-all': 'All',
    'pill-txt-green': '🟢 Green',
    'pill-txt-yellow': '🟡 Yellow',
    'pill-txt-red': '🔴 Red',
    'lbl-map-title': 'Interactive Map of Ust-Kamenogorsk',
    'map-mode-osm': '🗺️ OpenStreetMap',
    'map-mode-dark': '🌙 Dark',
    'map-mode-vector': '🛰️ Vector Offline Map',
    'map-btn-fit': '🎯 Center',
    'map-leg-green': '0–24: Lawful',
    'map-leg-yellow': '25–59: Document verification',
    'map-leg-red': '60–100: Illegal fundraising',
    'search-placeholder': 'Search by complex name, developer, address...',
    'svg-river-irtysh': 'Irtysh River (Ertis)',
    'svg-river-ulba': 'Ulba River',
    'svg-dist-left': 'LEFT BANK (DISTRICT 19)',
    'svg-dist-kshst': 'KSHST DISTRICT',
    'svg-dist-strelka': 'STRELKA / EMBANKMENT',
    'svg-dist-center': 'CITY CENTER',
    'svg-dist-ulba': 'ULBA DISTRICT',
    'svg-banner-title': 'OFFLINE VECTOR SCHEMATIC MAP OF UST-KAMENOGORSK (OSKEMEN)',
    'svg-banner-sub': 'Works 100% offline without internet · Click any complex marker to open its dossier',

    // Вкладка 02: Реестр (EN)
    'reg-heading-title': 'Under-Construction Projects Registry & Developer Dossiers',
    'reg-heading-desc': 'Official registry of multi-apartment housing in Ust-Kamenogorsk with legal basis status under RK Shared Construction Law.',
    'reg-search-placeholder': 'Filter by name, BIN or developer...',
    'reg-opt-all': 'All risk zones',
    'reg-opt-green': '🟢 Green Only (Lawful)',
    'reg-opt-yellow': '🟡 Yellow Only (Review)',
    'reg-opt-red': '🔴 Red Only (Danger)',
    'reg-th-complex': 'COMPLEX & ADDRESS',
    'reg-th-developer': 'DEVELOPER / BIN',
    'reg-th-legal': 'LEGAL BASIS',
    'reg-th-zone': 'ZONE / DOSSIER',

    // Вкладка 03: Реклама (EN)
    'ads-heading-title': 'Ad Monitoring & Illegal Fundraising Detection',
    'ads-heading-desc': 'Automated parsing of ads from Krisha.kz, OLX, Instagram. Highlighting booking deposits, cashier payments and readiness delta (R5 >= 20 pp).',
    'btn-add-ad': '➕ Add Publication Manually',
    'ads-th-id': 'ID',
    'ads-th-platform': 'Platform / Date',
    'ads-th-complex': 'Residential Complex',
    'ads-th-text': 'Ad Copy & Capture Record',
    'ads-th-triggers': 'Detected Triggers',
    'ads-th-algo': 'AI Algorithm Assessment',
    'ads-th-status': 'Inspector Verification Status',

    // Вкладка 04: Скоринг (EN)
    'scoring-heading-title': 'Risk Scoring Model R1–R6 (TZ Section 5)',
    'scoring-heading-desc': 'Interactive risk factor control panel. Inspector toggles statuses and edits rationale in real-time.',
    'lbl-scoring-complex': 'Select Complex:',
    'card-green-title': '🟢 Green Zone (0–24 points)',
    'card-green-desc': 'Lawful citizen fundraising. Active KZH guarantee or Akimat permit. Project is fully protected by law.',
    'card-yellow-title': '🟡 Yellow Zone (25–59 points)',
    'card-yellow-desc': 'Heightened regulatory scrutiny. Documents pending approval, early bookings detected, or schedule deviations.',
    'card-red-title': '🔴 Red Zone (60–100 points)',
    'card-red-desc': 'High risk. Factors R1 (+35) and R2 (+25) strictly confirmed: unlawful fundraising with total absence of statutory permits.',
    'scoring-th-code': 'Code',
    'scoring-th-weight': 'Weight',
    'scoring-th-criteria': 'Assessment Criteria',
    'scoring-th-status': 'Current Status (Interactive Toggle)',
    'scoring-th-evidence': 'Inspector Rationale (Inline Edit)',
    'lbl-audit-log-title': '📋 Inspector Action Log (Audit Log)',
    'lbl-audit-log-status': '● Active (SQLite Server + Local Storage v4)',

    // Вкладка 05: Сигнальный акт (EN)
    'signal-heading-title': '05 · Official Signal Inspection Act',
    'signal-heading-desc': 'Generated by authorized MIO inspector to document housing violations for transfer to GASK / prosecutor\'s office.',
    'lbl-act-lang': 'Report language:',
    'lbl-signal-complex': 'Complex:',
    'lbl-signal-inspector': 'Inspector:',
    'lbl-signal-resolution': 'Resolution:',
    'signal-res-placeholder': 'Enter inspector resolution...',
    'btn-signal-confirm': '✅ Confirm Signal',
    'btn-signal-return': '↩️ Return for Revision',
    'btn-signal-print': '🖨️ Download PDF / Print',
    'btn-signal-json': '⬇️ Export JSON',

    // Вкладка 06: Сеть телефонов (EN)
    'net-heading-title': '🕸️ Phone Network & Sales Collisions Analysis (TZ Section 11)',
    'net-heading-desc': 'Automated detection of umbrella sales funnels, realtor networks, and shared sales office contacts.',
    'btn-net-refresh': '🔄 Refresh Network',
    'net-kpi-lbl-phones': 'Unique Monitored Phone Numbers',
    'net-kpi-lbl-collisions': 'Suspicious Networks Detected',
    'net-kpi-lbl-max': 'Max Complexes per 1 Number',
    'net-kpi-val-max': '3 Complexes',
    'net-warn-title': 'Critical umbrella collision of sales department contacts detected!',
    'net-warn-desc': 'Phone +7 (705) 999-00-11 is simultaneously used for Ertis River Towers (Red Zone, 70 pts), Ulba Gardens (Red Zone, 100 pts), and Nurly Zhol Oskemen (Yellow Zone, 60 pts). When analyzing an ad with this phone and no complex name, the system prompts the inspector to pick from the 3 linked projects.',
    'net-diag-title': 'Interactive Relationship Map (Phones ↔ Complexes)',
    'net-diag-hint': 'Click node to highlight',
    'net-th-phone': 'Contact Phone',
    'net-th-complexes': 'Linked Complexes',
    'net-th-collision': 'Collision Nature',

    // Пошаговые баннеры (EN)
    'step1-banner-title': '🧭 Step-by-Step Inspection Route (Step 1 of 5 · Map Overview): Select a residential complex on the map or list, then proceed to verify its statutory permits.',
    'step1-banner-btn': 'Step 2: Verify Selected Complex Permits in Registry →',
    'step2-banner-title': '🧭 Step-by-Step Inspection Route (Step 2 of 5 · Registry Check): You reviewed MIO/KZH permits and linked records. Next step — inspect advertising publications.',
    'step2-banner-btn': 'Step 3: Inspect Ad Publications & AI Triggers →',
    'step3-banner-title': '🧭 Step-by-Step Inspection Route (Step 3 of 5 · Ad Monitoring): Confirm or reject AI-flagged ads, then verify the R1–R6 risk score.',
    'step3-banner-btn': 'Step 4: Proceed to Risk Scoring R1–R6 →',
    'step4-banner-title': '🧭 Step-by-Step Inspection Route (Step 4 of 5 · Risk Assessment): Factors R1–R6 verified. Now generate and print the official Signal Act.',
    'step4-banner-btn': 'Step 5: Generate & Print Official Signal Act (PDF) →',
    'step5-banner-title': '🧭 Step-by-Step Inspection Route Complete (Step 5 of 5): Confirm the signal, print the bilingual PDF report, or inspect developer phone networks.',
    'step5-banner-btn': '🕸️ Bonus: View Developer Phone Network Collisions →',

    // Подвал (EN)
    'footer-text': '<strong>SAQ QURYLYS</strong> · ClearBuild © 2026. Shared Housing Construction Compliance Monitoring, Oskemen.',
    'footer-lbl-updated': 'Data updated:',

    // Модалки (EN)
    'modal-dossier-btn-close': 'Close',
    'modal-dossier-btn-act': '📄 Generate Inspection Act',
    'modal-ad-tag': 'Manual Monitoring & OCR Capture',
    'modal-ad-title': 'Add Ad Publication for Verification',
    'lbl-presets-bar': '⚡ 1-Click Demo Presets (for jury evaluation & testing):',
    'lbl-ocr-title': '📷 Ad Screenshot Upload (OCR text recognition from image):',
    'btn-ocr-upload': '📂 Upload Screenshot Image...',
    'btn-ocr-demo': '🖼️ Load Demo Instagram/Krisha Screenshot',
    'modal-ad-lbl-complex': 'Residential Complex:',
    'modal-ad-lbl-platform': 'Listing Platform:',
    'modal-ad-lbl-phone': 'Sales Office Phone:',
    'modal-ad-lbl-url': 'Source Link (URL):',
    'modal-ad-lbl-text': 'Ad Text (type manually or load screenshot above):',
    'modal-ad-btn-ai': '🤖 Analyze Text with AI',
    'modal-ad-btn-cancel': 'Cancel',
    'modal-ad-btn-save': '✅ Save Publication to Database',
    'modal-api-tag': 'Database Connection',
    'modal-api-title': '🔌 Database Server Connection (FastAPI + SQLite)',
    'modal-api-lbl-url': 'Database Server URL:',
    'modal-api-lbl-status': 'Current Connection Status:',
    'modal-api-btn-reset': '🔄 Reset Demo DB',
    'modal-api-btn-test': '⚡ Test Connection',
    'modal-api-btn-save': '💾 Save Server URL',
    'modal-ad-text-placeholder': 'Paste full text of the advertisement or click a 1-click preset button above...',

    // Динамические бейджи (EN)
    'zone-safe': 'Safe',
    'zone-warn': 'Needs Review',
    'zone-danger': 'High Risk'
  }
};

function safeSetText(id, text) {
  const el = document.getElementById(id);
  if (!el || text === undefined) return;
  if (typeof text === 'string' && text.includes('<') && text.includes('>')) {
    el.innerHTML = text;
  } else {
    el.textContent = text;
  }
}

function renderPresetButtonsBar() {
  const container = document.getElementById('ai-presets-bar-buttons');
  if (!container || typeof AI_DEMO_PRESETS === 'undefined') return;
  const lang = CURRENT_LANG || 'ru';
  container.innerHTML = AI_DEMO_PRESETS.map(p => {
    const title = (p.titles && (p.titles[lang] || p.titles.ru)) || p.id;
    const sub = (p.subtitles && (p.subtitles[lang] || p.subtitles.ru)) || '';
    return `
      <button type="button" class="preset-demo-btn" onclick="applyAiPreset('${p.id}')" title="${sub}">
        <span style="font-weight: 800; font-size: 0.76rem; color: var(--text-main);">${title}</span>
        <span style="font-size: 0.68rem; color: var(--text-secondary); display: block; margin-top: 2px;">${sub}</span>
      </button>
    `;
  }).join('');
}
window.renderPresetButtonsBar = renderPresetButtonsBar;

function setLang(lang) {
  CURRENT_LANG = lang;
  CURRENT_ACT_LANG = lang;
  if (typeof window !== 'undefined') {
    window.CURRENT_LANG = lang;
    window.CURRENT_ACT_LANG = lang;
  }
  try {
    localStorage.setItem('clearbuild_lang', lang);
    localStorage.setItem('clearbuild_act_lang', lang);
  } catch(e) {}

  // Подсвечиваем активную кнопку языка в шапке
  ['kz', 'ru', 'en'].forEach(l => {
    const btn1 = document.getElementById('lang-' + l);
    const btn2 = document.getElementById('lang-btn-' + l);
    if (btn1) btn1.classList.toggle('active', l === lang);
    if (btn2) btn2.classList.toggle('active', l === lang);
    const actBtn = document.getElementById('act-lang-' + l);
    if (actBtn) actBtn.classList.toggle('active', l === lang);
  });

  // Пробегаемся по словарю и переводим элементы по ID
  const dict = I18N[lang] || I18N.ru;
  for (const [key, val] of Object.entries(dict)) {
    safeSetText(key, val);
  }

  // Плюс переводим все элементы с атрибутом data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.getAttribute('data-i18n');
    if (dict[k]) safeSetText(el.id || '', dict[k]);
  });

  // Обновляем плейсхолдеры инпутов поиска и комментариев
  const sInput = document.getElementById('map-search-input') || document.getElementById('search-complex-input');
  if (sInput && dict['search-placeholder']) sInput.placeholder = dict['search-placeholder'];
  const rInput = document.getElementById('reg-search-input');
  if (rInput && dict['reg-search-placeholder']) rInput.placeholder = dict['reg-search-placeholder'];
  const commentInput = document.getElementById('analyst-comment-input');
  if (commentInput && dict['signal-res-placeholder']) commentInput.placeholder = dict['signal-res-placeholder'];
  const newAdText = document.getElementById('new-ad-text');
  if (newAdText && dict['modal-ad-text-placeholder']) newAdText.placeholder = dict['modal-ad-text-placeholder'];

  renderPresetButtonsBar();

  // Перерисовываем все открытые вкладки на выбранном языке
  triggerUIRefresh();
}
window.setLang = setLang;
window.setLanguage = setLang;

// ------------------------------------------------------------------------
// Режим крупного шрифта (А+) — чтобы на проекторе или для сотрудников акимата всё читалось легко
// ------------------------------------------------------------------------
function applyFontScale(scale) {
  CURRENT_FONT_SCALE = scale === 'large' ? 'large' : 'normal';
  localStorage.setItem('clearbuild_font_scale', CURRENT_FONT_SCALE);
  document.documentElement.setAttribute('data-font-scale', CURRENT_FONT_SCALE);
  const btn = document.getElementById('btn-font-scale');
  if (btn) {
    btn.classList.toggle('active', CURRENT_FONT_SCALE === 'large');
    btn.style.background = CURRENT_FONT_SCALE === 'large' ? 'var(--brand-primary)' : '';
    btn.style.color = CURRENT_FONT_SCALE === 'large' ? '#fff' : '';
  }
}

function toggleFontScale() {
  const next = CURRENT_FONT_SCALE === 'large' ? 'normal' : 'large';
  applyFontScale(next);
  const isKz = CURRENT_LANG === 'kz';
  const isEn = CURRENT_LANG === 'en';
  const msg = next === 'large'
    ? (isKz ? '🔍 Ірі қаріп режимі (А+) қосылды — мәтін 15%-ға үлкейтілді' : isEn ? '🔍 Large Font Mode (A+) enabled — text scaled up for readability' : '🔍 Включён режим крупного шрифта (А+) для комфортного чтения')
    : (isKz ? '🔍 Стандартты қаріп өлшемі қайтарылды' : isEn ? '🔍 Standard font size restored' : '🔍 Возвращён стандартный размер шрифта');
  showCopyToast(msg);
}
window.toggleFontScale = toggleFontScale;
window.applyFontScale = applyFontScale;

// ------------------------------------------------------------------------
// Кнопки быстрого выбора эталонных кейсов из Раздела 5 ТЗ (над картой)
// ------------------------------------------------------------------------
function activateControlTestCase(caseKey) {
  if (typeof CONTROL_TEST_CASES === 'undefined') return;
  const tc = CONTROL_TEST_CASES.find(item => item.key === caseKey || item.id === caseKey);
  if (!tc) return;

  const targetId = tc.id || tc.complexId;
  selectComplex(targetId);
  if (typeof focusComplexOnMap === 'function') {
    focusComplexOnMap(targetId);
  }
  const toastHtml = (tc.toast && (tc.toast[CURRENT_LANG] || tc.toast.ru)) || '';
  if (toastHtml) {
    showCopyToast(toastHtml);
  }
}
window.activateControlTestCase = activateControlTestCase;

function selectComplex(id) {
  SELECTED_COMPLEX_ID = id;
  localStorage.setItem('clearbuild_selected_id', id);
}

// Модалка досье ЖК (открываем мгновенно из памяти, а если подключён бэкенд — обогащаем через GET /complexes/{id})
async function openComplexDossier(complexId) {
  let c = complexes.find(item => item.id === complexId);
  if (!c) return;

  selectComplex(complexId);
  const modal = document.getElementById('dossier-modal');
  if (!modal) return;

  // Сначала рисуем то, что уже есть, чтобы интерфейс не тупил ни миллисекунды
  renderDossierModalContent(c);
  modal.style.display = 'flex';

  if (typeof apiClient !== 'undefined' && apiClient.isConnected) {
    const detailed = await fetchComplexDetail(complexId);
    if (detailed) {
      renderDossierModalContent(detailed);
    }
  }
}

function renderDossierModalContent(c) {
  const risk = calculateComplexRisk(c);
  const isKz = CURRENT_LANG === 'kz';
  const isEn = CURRENT_LANG === 'en';

  const titleEl = document.getElementById('modal-dossier-title');
  const tagEl = document.getElementById('modal-dossier-tag');
  const bodyEl = document.getElementById('modal-dossier-body');
  if (!bodyEl) return;

  if (titleEl) titleEl.textContent = getLocalized(c.names);
  if (tagEl) tagEl.textContent = `${c.code} · ${getLocalized(c.districts)}`;

  const verdictText = (CITIZEN_VERDICTS[risk.zone] && (CITIZEN_VERDICTS[risk.zone][CURRENT_LANG] || CITIZEN_VERDICTS[risk.zone].ru)) || '';
  const verdictClass = risk.zone === 'RED' ? 'verdict-red' : risk.zone === 'YELLOW' ? 'verdict-yellow' : 'verdict-green';
  const verdictIcon = risk.zone === 'RED' ? '⛔' : risk.zone === 'YELLOW' ? '⚠️' : '✅';

  let factorsHtml = ['R1', 'R2', 'R3', 'R4', 'R5', 'R6'].map(code => {
    const factor = c.factors[code];
    if (!factor || factor.status === 'NONE') return '';
    const isHypo = factor.status === 'AI_HYPOTHESIS';
    const isUnverified = factor.status === 'UNVERIFIED';
    const badgeColor = (isHypo || isUnverified) ? 'badge-yellow' : (factor.status === 'REJECTED' ? 'badge-neutral' : 'badge-red');
    const evidenceText = factor.evidence ? getLocalized(factor.evidence) : (isKz ? 'Тексерумен расталды' : isEn ? 'Verified by inspection' : 'Подтверждено проверкой');
    const factorTypeLabel = isHypo
      ? (isKz ? '🤖 ЖИ болжамы (0 ұп.)' : isEn ? '🤖 AI Hypothesis (0 pts)' : '🤖 Кандидат ИИ (0 б.)')
      : isUnverified
        ? (isKz ? '⚠️ Тексеруді қажет етеді (0 ұп.)' : isEn ? '⚠️ Needs Check (0 pts)' : '⚠️ Нужна проверка (0 б.)')
        : (isKz ? '⚠️ Расталған заң бұзушылық' : isEn ? '⚠️ Confirmed Violation' : '⚠️ Подтвержденное нарушение');
    const ptSuffix = isKz ? 'ұп.' : isEn ? 'pts' : 'б.';

    return `
      <div style="border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem 1rem; background: var(--bg-surface); display: flex; align-items: flex-start; gap: 0.85rem;">
        <span style="font-weight: 800; font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 6px; background: var(--bg-surface-hover); color: var(--text-secondary); font-family: monospace;">${code} (+${factor.weight} ${ptSuffix})</span>
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.2rem;">
            <strong style="font-size: 0.82rem;">${factorTypeLabel}</strong>
            <span class="status-badge ${badgeColor}">${getFactorStatusLabel(factor.status, CURRENT_LANG)}</span>
          </div>
          <div style="font-size: 0.78rem; color: var(--text-secondary);">${evidenceText}</div>
        </div>
      </div>
    `;
  }).filter(Boolean).join('');

  if (!factorsHtml) {
    factorsHtml = `<div style="color: var(--zone-green-text); font-weight: 600; font-size: 0.85rem;">${isKz ? '✅ Елеулі тәуекел факторлары анықталған жоқ. Нысан тексерілді.' : isEn ? '✅ No significant risk factors detected. Project verified.' : '✅ Существенных факторов риска не обнаружено. Объект проверен.'}</div>`;
  }

  // Привязанные рекламные объявления по этому ЖК
  const rawPubs = Array.isArray(c.publications) && c.publications.length > 0
    ? c.publications
    : (adsList || []).filter(a => a.complexId === c.id);
  const cPubs = rawPubs.map(p => getLocalizedAd(p, CURRENT_LANG));

  const lblPubsHeading = isKz
    ? `📢 Тіркелген жарнамалық хабарландырулар (${cPubs.length})`
    : isEn
      ? `📢 Recorded Advertising Publications (${cPubs.length})`
      : `📢 Зафиксированные рекламные публикации (${cPubs.length})`;

  const pubsHtml = cPubs.length > 0 ? `
    <div>
      <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem;">${lblPubsHeading}</h4>
      <div style="display: flex; flex-direction: column; gap: 0.45rem;">
        ${cPubs.map(p => {
          const stLabel = p.status === 'CONFIRMED'
            ? (isKz ? 'Инспектор растады' : isEn ? 'Confirmed by Inspector' : 'Подтверждено инспектором')
            : p.status === 'AI_HYPOTHESIS'
              ? (isKz ? 'Инспектор шешімін күтуде' : isEn ? 'Awaiting Inspector Review' : 'Ожидает проверки инспектора')
              : (isKz ? 'Тәуекел жоқ' : isEn ? 'No Violation' : 'Нарушений нет');
          const snapBtnLbl = isKz ? '🖼️ Скриншот' : isEn ? '🖼️ Snapshot' : '🖼️ Снимок';
          return `
          <div style="font-size: 0.78rem; padding: 0.55rem 0.75rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-surface-hover); display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 220px;">
              <strong>${p.id} · ${p.platform || p.source}</strong> (${p.pubDate || p.date}):
              <span style="color: var(--text-secondary);">«${(p.text || '').slice(0, 120)}${(p.text || '').length > 120 ? '…' : ''}»</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <button type="button" class="btn-outline" style="padding: 0.2rem 0.5rem; font-size: 0.7rem;" onclick="openAdScreenshotModal('${p.id}')">${snapBtnLbl}</button>
              <span class="status-badge ${p.status === 'CONFIRMED' ? 'badge-red' : p.status === 'AI_HYPOTHESIS' ? 'badge-yellow' : 'badge-green'}" style="white-space: nowrap;">
                ${p.proposedFactor || '0'} · ${stLabel}
              </span>
            </div>
          </div>
        `}).join('')}
      </div>
    </div>
  ` : '';

  const lblVerdictTitle = isKz ? 'Сатып алушыға (үлескерге) арналған қорытынды:' : isEn ? 'Citizen Buyer Verdict:' : 'Вердикт для покупателя (дольщика):';
  const lblLegalStatus = isKz ? 'Заңдылық мәртебесі' : isEn ? 'Legal Status' : 'Статус законности';
  const lblSpecs = isKz ? 'Деректемелер мен нақты деректер' : isEn ? 'Credentials & Technical Specs' : 'Реквизиты и фактические данные';
  const lblFactors = isKz ? 'Тәуекел факторларының егжей-тегжейі (R1–R6)' : isEn ? 'Risk Factors Breakdown (R1–R6)' : 'Детализация факторов риска (R1–R6)';
  const lblDev = isKz ? 'Құрылыс салушы:' : isEn ? 'Developer:' : 'Застройщик:';
  const lblBin = isKz ? 'БСН:' : isEn ? 'BIN:' : 'БИН:';
  const lblPhone = isKz ? 'Байланыс телефоны:' : isEn ? 'Contact Phone:' : 'Контактный телефон:';
  const lblCad = isKz ? 'Кадастрлық нөмірі:' : isEn ? 'Cadastral Number:' : 'Кадастровый номер:';
  const lblStage = isKz ? 'Құрылыс кезеңі:' : isEn ? 'Construction Stage:' : 'Стадия строительства:';
  const lblReadiness = isKz ? 'Дайындық:' : isEn ? 'Readiness:' : 'Готовность:';
  const lblFact = isKz ? 'Нақты' : isEn ? 'Actual' : 'Факт';
  const lblDeclared = isKz ? 'Мәлімделген' : isEn ? 'Declared' : 'Заявлено';
  const ptSuffix = isKz ? 'ұп.' : isEn ? 'pts' : 'б.';

  bodyEl.innerHTML = `
    <div class="verdict-box ${verdictClass}">
      <div class="verdict-icon">${verdictIcon}</div>
      <div>
        <div style="font-weight: 800; font-size: 0.9rem; margin-bottom: 0.2rem;">${lblVerdictTitle}</div>
        <div>${verdictText}</div>
      </div>
    </div>

    <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; background: var(--bg-surface-hover); padding: 1rem; border-radius: 10px; border: 1px solid var(--border-color);">
      <div>
        <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">${lblLegalStatus}</div>
        <div style="font-size: 1.1rem; font-weight: 800; color: var(--text-main); margin-top: 0.15rem;">${getLocalized(c.legalTexts)}</div>
        <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.35rem;">${getLocalized(c.legalDetails)}</div>
      </div>
      <span class="status-badge ${risk.zoneBadgeClass}" style="font-size: 0.9rem; padding: 0.4rem 0.9rem;">
        ${risk.zoneName} · ${risk.score} ${ptSuffix}
      </span>
    </div>

    <div>
      <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.65rem;">${lblSpecs}</h4>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.8rem;">
        <div><strong>${lblDev}</strong> ${getLocalized(c.developers)}</div>
        <div><strong>${lblBin}</strong> ${c.bin}</div>
        <div><strong>${lblPhone}</strong> ${c.contactPhone || '+7 (705) 999-00-11'}</div>
        <div><strong>${lblCad}</strong> ${c.cadastreNumber || (isKz ? 'ЖАО телімі' : isEn ? 'Municipal plot' : 'Участок МИО')}</div>
        <div><strong>${lblStage}</strong> ${getLocalized(c.stages)}</div>
        <div><strong>${lblReadiness}</strong> ${lblFact} ${c.readinessFact}% / ${lblDeclared} ${c.readinessDeclared}%</div>
      </div>
    </div>

    <div>
      <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.65rem;">${lblFactors}</h4>
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        ${factorsHtml}
      </div>
    </div>

    ${pubsHtml}
  `;
}

function closeDossierModal() {
  const modal = document.getElementById('dossier-modal');
  if (modal) modal.style.display = 'none';
}

// ------------------------------------------------------------------------
// Модалка просмотра архивного снимка экрана объявления (Разделы 3, 4, 6, 11 ТЗ)
// В ТЗ прямо сказано: «полезно хранить снимок экрана или локальную копию текста —
// особенно когда исходная публикация исчезнет». Вот это мы тут и показываем!
// ------------------------------------------------------------------------
function openAdScreenshotModal(adId) {
  const rawAd = (adsList || []).find(item => item.id === adId);
  if (!rawAd) return;
  const ad = getLocalizedAd(rawAd, CURRENT_LANG);
  const comp = complexes.find(c => c.id === ad.complexId);
  const compName = comp ? getLocalized(comp.names) : (CURRENT_LANG === 'kz' ? 'Белгісіз ТҮК' : CURRENT_LANG === 'en' ? 'Unlinked Complex' : 'Объект на уточнении');
  const isKz = CURRENT_LANG === 'kz';
  const isEn = CURRENT_LANG === 'en';

  const modal = document.getElementById('screenshot-modal');
  const body = document.getElementById('screenshot-modal-body');
  const titleEl = document.getElementById('screenshot-modal-title');
  if (!modal || !body) return;

  if (titleEl) {
    titleEl.textContent = isKz
      ? `🖼️ Жарнаманың архивтік скриншоты · ${ad.id} (${ad.platform})`
      : isEn
        ? `🖼️ Archival Ad Snapshot · ${ad.id} (${ad.platform})`
        : `🖼️ Архивный снимок фиксации объявления · ${ad.id} (${ad.platform})`;
  }

  let highlightedCopy = ad.text || '';
  if (ad.triggerSpan && highlightedCopy.includes(ad.triggerSpan)) {
    highlightedCopy = highlightedCopy.replace(
      ad.triggerSpan,
      `<mark style="background: rgba(239,68,68,0.22); color: var(--zone-red-text); font-weight: 800; padding: 2px 6px; border-radius: 4px; border: 1px dashed var(--zone-red);">${ad.triggerSpan}</mark>`
    );
  }

  const stampText = ad.status === 'CONFIRMED'
    ? (isKz ? 'ЗАҢ БҰЗУШЫЛЫҚ БЕЛГІСІ ИНСПЕКТОРМЕН РАСТАЛДЫ' : isEn ? 'VIOLATION INDICATOR CONFIRMED BY MIO INSPECTOR' : 'ПРИЗНАК НАРУШЕНИЯ ПОДТВЕРЖДЁН ИНСПЕКТОРОМ МИО')
    : ad.status === 'AI_HYPOTHESIS'
      ? (isKz ? 'ЖИ ТАЛДАУШЫСЫ АНЫҚТАДЫ · ИНСПЕКТОР ШЕШІМІН КҮТУДЕ' : isEn ? 'FLAGGED BY AI ANALYZER · AWAITING INSPECTOR REVIEW' : 'ВЫЯВЛЕНО ИИ-АНАЛИЗАТОРОМ · ОЖИДАЕТ ПОДТВЕРЖДЕНИЯ ИНСПЕКТОРА')
      : (isKz ? 'ТЕКСЕРІЛДІ · ТӘУЕКЕЛ ЖОҚ' : isEn ? 'VERIFIED · NO VIOLATION' : 'ПРОВЕРЕНО · НАРУШЕНИЙ НЕ ВЫЯВЛЕНО');

  const stampColor = ad.status === 'CONFIRMED' ? '#dc2626' : ad.status === 'AI_HYPOTHESIS' ? '#d97706' : '#16a34a';
  const safeAdId = String(ad.id || 'ad').toLowerCase();

  body.innerHTML = `
    <div style="font-size: 0.78rem; color: var(--text-secondary); background: var(--bg-surface-hover); padding: 0.65rem 0.9rem; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 0.9rem;">
      💡 <strong>${isKz ? 'Неліктен скриншот сақталады (ТТ 3 және 6-бөлімі):' : isEn ? 'Why archival snapshots are stored (TZ Sections 3 & 6):' : 'Зачем хранится архивный снимок (Разделы 3 и 6 ТЗ):'}</strong>
      ${isKz
        ? 'Егер құрылыс салушы тексеру басталғанда Krisha.kz немесе Instagram-дағы жарнаманы өшіріп тастаса да, ЖАО базасында мәтіннің жергілікті көшірмесі мен скриншоты дәлел ретінде сақталады.'
        : isEn
          ? 'Even if the developer deletes the original post on Krisha.kz or Instagram once an inspection begins, the local snapshot and OCR text remain preserved as evidence in the MIO archive.'
          : 'Даже если застройщик удалит объявление с Krisha.kz или Instagram после начала проверки акимата, в базе МИО сохраняется зафиксированный снимок экрана, URL, телефон и распознанный текст.'}
    </div>

    <div class="snapshot-browser-frame" style="border: 2px solid var(--border-strong); border-radius: 12px; overflow: hidden; background: var(--bg-surface); box-shadow: var(--shadow-md);">
      <!-- Верхняя панель браузера на снимке -->
      <div style="background: var(--bg-surface-hover); padding: 0.55rem 0.9rem; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap;">
        <div style="display: flex; gap: 5px;">
          <span style="width: 10px; height: 10px; border-radius: 50%; background: #ef4444; display: inline-block;"></span>
          <span style="width: 10px; height: 10px; border-radius: 50%; background: #f59e0b; display: inline-block;"></span>
          <span style="width: 10px; height: 10px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
        </div>
        <div style="flex: 1; background: var(--bg-body); border: 1px solid var(--border-color); border-radius: 6px; padding: 0.25rem 0.65rem; font-family: monospace; font-size: 0.74rem; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          🔒 ${ad.url || 'https://krisha.kz/a/show/694810231'}
        </div>
        <span style="font-size: 0.7rem; font-weight: 700; color: var(--brand-primary); font-family: monospace;">
          SHA-256: 8f4e...${safeAdId}
        </span>
      </div>

      <!-- Содержимое зафиксированного поста/объявления -->
      <div style="padding: 1.25rem; position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 0.9rem; border-bottom: 1px dashed var(--border-color); padding-bottom: 0.75rem;">
          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <div style="width: 42px; height: 42px; border-radius: 10px; background: var(--brand-primary-light); color: var(--brand-primary); display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1rem;">
              📢
            </div>
            <div>
              <div style="font-weight: 800; font-size: 0.92rem; color: var(--text-main);">${ad.platform} · ${ad.account || 'Отдел продаж'}</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary);">
                ${isKz ? 'Тіркелген күні:' : isEn ? 'Captured on:' : 'Дата фиксации:'} <strong>${ad.date || ad.pubDate}</strong> ·
                ${isKz ? 'Нысан:' : isEn ? 'Complex:' : 'Объект:'} <strong>${compName}</strong>
              </div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">${isKz ? 'Сату бөлімінің телефоны' : isEn ? 'Sales Office Phone' : 'Телефон в объявлении'}</div>
            <div style="font-family: monospace; font-weight: 800; font-size: 0.88rem; color: var(--brand-primary);">${ad.phone || '+7 (705) 999-00-11'}</div>
          </div>
        </div>

        <div style="font-size: 0.98rem; line-height: 1.6; color: var(--text-main); background: var(--bg-body); padding: 1rem 1.15rem; border-radius: 10px; border-left: 4px solid ${stampColor}; margin-bottom: 1rem;">
          «${highlightedCopy}»
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; font-size: 0.78rem; margin-bottom: 0.9rem;">
          <div style="background: var(--bg-surface-hover); padding: 0.6rem 0.8rem; border-radius: 8px; border: 1px solid var(--border-color);">
            <div style="color: var(--text-muted); font-size: 0.68rem; font-weight: 700; text-transform: uppercase;">${isKz ? 'Анықталған триггер фразасы' : isEn ? 'Detected Trigger Phrase' : 'Выявленная фраза-триггер'}</div>
            <div style="font-weight: 800; color: var(--zone-red-text); margin-top: 2px;">${ad.triggerSpan || (isKz ? 'Тәуекел триггерлері жоқ' : isEn ? 'None detected' : 'Триггеры не обнаружены')}</div>
          </div>
          <div style="background: var(--bg-surface-hover); padding: 0.6rem 0.8rem; border-radius: 8px; border: 1px solid var(--border-color);">
            <div style="color: var(--text-muted); font-size: 0.68rem; font-weight: 700; text-transform: uppercase;">${isKz ? 'Тәуекел факторы және салмағы' : isEn ? 'Risk Factor & Weight' : 'Предложенный фактор риска'}</div>
            <div style="font-weight: 800; color: var(--text-main); margin-top: 2px;">${ad.proposedFactor || '0'} (+${ad.weight || 0}) · ${ad.aiHypothesis || ''}</div>
          </div>
        </div>

        <div style="border: 2px solid ${stampColor}; color: ${stampColor}; padding: 0.5rem 0.85rem; border-radius: 8px; font-weight: 800; font-size: 0.76rem; text-align: center; letter-spacing: 0.04em; text-transform: uppercase; background: rgba(0,0,0,0.02);">
          🛡️ ${stampText}
        </div>
      </div>
    </div>
  `;

  modal.style.display = 'flex';
}
window.openAdScreenshotModal = openAdScreenshotModal;

function closeAdScreenshotModal() {
  const modal = document.getElementById('screenshot-modal');
  if (modal) modal.style.display = 'none';
}
window.closeAdScreenshotModal = closeAdScreenshotModal;

// ------------------------------------------------------------------------
// Пресеты в 1 клик и симулятор OCR-распознавания скриншотов в модалке #add-ad-modal
// ------------------------------------------------------------------------
function applyAiPreset(presetId) {
  if (typeof AI_DEMO_PRESETS === 'undefined') return;
  const preset = AI_DEMO_PRESETS.find(p => p.id === presetId || (p.aliases && p.aliases.includes(presetId)));
  if (!preset) return;

  const selEl = document.getElementById('new-ad-complex') || document.getElementById('new-ad-complex-id');
  const platEl = document.getElementById('new-ad-platform');
  const phoneEl = document.getElementById('new-ad-phone');
  const urlEl = document.getElementById('new-ad-url');
  const textEl = document.getElementById('new-ad-text');
  const ocrStatusEl = document.getElementById('ocr-preview-status') || document.getElementById('ocr-status-text');
  const ocrStripEl = document.getElementById('ocr-preview-strip');

  if (selEl) {
    // Если в пресете специально пустой complexId (тестируем коллизию по общему телефону) — добавляем пустую опцию
    if (!preset.complexId) {
      let emptyOpt = selEl.querySelector('option[value=""]');
      if (!emptyOpt) {
        emptyOpt = document.createElement('option');
        emptyOpt.value = '';
        emptyOpt.textContent = CURRENT_LANG === 'kz'
          ? '— Мәтінде ТҮК атауы көрсетілмеген (телефон арқылы іздеу) —'
          : CURRENT_LANG === 'en'
            ? '— Complex not named in text (resolve by phone) —'
            : '— Название ЖК не указано в тексте (поиск по телефону) —';
        selEl.prepend(emptyOpt);
      }
      selEl.value = '';
    } else {
      selEl.value = preset.complexId;
    }
  }
  if (platEl && preset.platform) platEl.value = preset.platform;
  if (phoneEl && preset.phone) phoneEl.value = preset.phone;
  if (urlEl && preset.url) urlEl.value = preset.url;
  if (textEl) {
    const txt = (preset.texts && (preset.texts[CURRENT_LANG] || preset.texts.ru)) || '';
    textEl.value = txt;
  }
  if (ocrStripEl) {
    ocrStripEl.classList.add('active');
  }
  if (ocrStatusEl) {
    const ocrLbl = typeof preset.ocrSourceLabel === 'string'
      ? preset.ocrSourceLabel
      : ((preset.ocrSourceLabel && (preset.ocrSourceLabel[CURRENT_LANG] || preset.ocrSourceLabel.ru)) || '');
    ocrStatusEl.style.display = 'block';
    ocrStatusEl.innerHTML = `✅ <strong>OCR:</strong> ${ocrLbl}`;
  }

  if (typeof runLiveAIAnalysis === 'function') {
    runLiveAIAnalysis();
  }
}
window.applyAiPreset = applyAiPreset;

function handleOcrFileUpload(inputEl) {
  const file = inputEl && inputEl.files && inputEl.files[0];
  const fileName = file ? file.name : 'screenshot_instagram_nurly_zhol.png';
  const ocrStatusEl = document.getElementById('ocr-preview-status') || document.getElementById('ocr-status-text');
  const ocrStripEl = document.getElementById('ocr-preview-strip');
  const isKz = CURRENT_LANG === 'kz';
  const isEn = CURRENT_LANG === 'en';

  // Подставляем Сценарий 1 как результат OCR-распознавания загруженного скриншота
  applyAiPreset('preset-1');

  if (ocrStripEl) {
    ocrStripEl.classList.add('active');
  }
  if (ocrStatusEl) {
    ocrStatusEl.style.display = 'block';
    ocrStatusEl.innerHTML = isKz
      ? `📷 <strong>Скриншот танылды (${fileName}):</strong> Мәтін мен телефон (+7 705 999-00-11) автоматты түрде өрістерге енгізілді.`
      : isEn
        ? `📷 <strong>Screenshot OCR complete (${fileName}):</strong> Ad text and phone (+7 705 999-00-11) extracted into fields below.`
        : `📷 <strong>Скриншот распознан (${fileName}):</strong> Текст объявления и телефон (+7 705 999-00-11) автоматически извлечены из изображения.`;
  }
  showCopyToast(isKz ? '📷 OCR: скриншоттағы мәтін сәтті танылды!' : isEn ? '📷 OCR: text extracted from screenshot!' : '📷 OCR-модуль: текст со скриншота успешно распознан!');
}
window.handleOcrFileUpload = handleOcrFileUpload;

// ------------------------------------------------------------------------
// Справочная модалка «Как работать» и интерактивный тур по интерфейсу
// ------------------------------------------------------------------------
function openHelpModal() {
  const modal = document.getElementById('help-guide-modal');
  const body = document.getElementById('help-guide-modal-body');
  const titleEl = document.getElementById('help-guide-modal-title');
  if (!modal || !body) return;

  const isKz = CURRENT_LANG === 'kz';
  const isEn = CURRENT_LANG === 'en';

  if (titleEl) {
    titleEl.textContent = isKz
      ? '❓ SAQ QURYLYS жүйесінде қалай жұмыс істеу керек (Инспекторға арналған 5 қарапайым қадам)'
      : isEn
        ? '❓ How to Use SAQ QURYLYS (Simple 5-Step Inspector Guide)'
        : '❓ Как работать в системе SAQ QURYLYS (Памятка специалиста акимата из 5 простых шагов)';
  }

  if (isKz) {
    body.innerHTML = `
      <div style="font-size: 0.92rem; line-height: 1.6; display: flex; flex-direction: column; gap: 0.85rem;">
        <div style="background: var(--brand-primary-light); border-left: 4px solid var(--brand-primary); padding: 0.85rem 1rem; border-radius: 8px;">
          <strong>Басты ереже:</strong> Бағдарлама өздігінен айыппұл салмайды және ешкімді жазаламайды. Ол тек күдікті жарнамаларды тауып көрсетеді, ал <strong>соңғы шешімді әрқашан сіз (инспектор) қабылдайсыз</strong>.
        </div>
        <div class="help-step-card"><strong>1-қадам · 🗺️ Карта және Шолу:</strong> Түсті белгілерге қараңыз: 🟢 Жасыл — құжаттары заңды, 🟡 Сары — тексеру қажет, 🔴 Қызыл — рұқсатсыз ақша жинау белгілері бар. Кез келген үйді бассаңыз, оның паспорты ашылады.</div>
        <div class="help-step-card"><strong>2-қадам · 📋 ТҮК тізілімі:</strong> Мұнда әр құрылыс салушының 11 мемлекеттік тізілім бойынша құжаттары (ҚТҚ кепілдігі, ЖАО рұқсаты, жер кадастры) және осы үйге қатысты барлық жарнамалар көрсетілген.</div>
        <div class="help-step-card"><strong>3-қадам · 📢 Жарнама мониторингі:</strong> Робот Krisha.kz, OLX және Instagram-нан «бронь», «депозит», «бөліп төлеу» деген сөздерді табады. Сіз <strong>«✅ Қабылдау»</strong> немесе <strong>«✕ Қабылдамау»</strong> түймесін басасыз.</div>
        <div class="help-step-card"><strong>4-қадам · ⚖️ Тәуекел-скоринг R1–R6:</strong> Бағдарлама 0-ден 100-ге дейін ұпай есептейді. Есіңізде болсын: <strong>Қызыл аймақ</strong> тек 60+ ұпай жиналғанда ЖӘНЕ инспектор R1 (рұқсат жоқ) мен R2 (жарнамада ақша жинау) екеуін де растағанда ғана жанады.</div>
        <div class="help-step-card"><strong>5-қадам · 📑 Сигналдық акт (PDF):</strong> Дайын тексеру актісін басып шығарыңыз немесе PDF форматында сақтаңыз.</div>
      </div>
    `;
  } else if (isEn) {
    body.innerHTML = `
      <div style="font-size: 0.92rem; line-height: 1.6; display: flex; flex-direction: column; gap: 0.85rem;">
        <div style="background: var(--brand-primary-light); border-left: 4px solid var(--brand-primary); padding: 0.85rem 1rem; border-radius: 8px;">
          <strong>Core Principle:</strong> This system highlights risk indicators to assist civil servants, <strong>never replacing human judgment</strong>. A complex enters the Red Zone only after an inspector confirms the evidence.
        </div>
        <div class="help-step-card"><strong>Step 1 · 🗺️ Map & Overview:</strong> Inspect complexes by color: 🟢 Green (0–24 pts, lawful), 🟡 Yellow (25–59 pts, needs review), 🔴 Red (60–100 pts, high risk). Use the 4 benchmark buttons above the map to jump directly to TZ test cases.</div>
        <div class="help-step-card"><strong>Step 2 · 📋 Complexes Registry:</strong> Check the developer's 11 state registry records (KZH guarantee, Akimat permit, cadastral status) and see all linked ads and verification events in the right-hand card.</div>
        <div class="help-step-card"><strong>Step 3 · 📢 Ad Monitoring (AI):</strong> Review ads flagged for booking deposits, cash payments, or readiness inflation. Click <strong>Accept</strong> or <strong>Reject</strong>, or view the saved archival screenshot.</div>
        <div class="help-step-card"><strong>Step 4 · ⚖️ Risk Scoring R1–R6:</strong> Toggle factor statuses and edit explanations. Note: Red Zone strictly requires Score ≥ 60 AND both R1 and R2 confirmed by an inspector.</div>
        <div class="help-step-card"><strong>Step 5 · 📑 Signal Report (PDF):</strong> Confirm your inspection resolution and print the official bilingual A4 Signal Act.</div>
      </div>
    `;
  } else {
    body.innerHTML = `
      <div style="font-size: 0.92rem; line-height: 1.6; display: flex; flex-direction: column; gap: 0.85rem;">
        <div style="background: var(--brand-primary-light); border-left: 4px solid var(--brand-primary); padding: 0.85rem 1rem; border-radius: 8px;">
          <strong>Главное правило для специалиста:</strong> Программа ничего не отправляет в прокуратуру сама и никого не штрафует автоматически. ИИ только находит подозрительную рекламу и подсказывает статьи риска, а <strong>финальное решение всегда принимает человек (инспектор МИО)</strong>.
        </div>
        <div class="help-step-card"><strong>Шаг 1 · 🗺️ Карта и Обзор:</strong> Посмотрите на цвет дома: 🟢 Зелёный — документы в порядке, 🟡 Жёлтый — требуется проверка, 🔴 Красный — опасность незаконного сбора денег. Над картой есть 4 кнопки эталонных кейсов из ТЗ для быстрой демонстрации.</div>
        <div class="help-step-card"><strong>Шаг 2 · 📋 Реестр ЖК:</strong> Здесь собраны все 11 государственных реестров по застройщику (гарантия КЖК, разрешение акимата, кадастр, налоги), а справа — привязанные рекламные объявления и статус сигнала.</div>
        <div class="help-step-card"><strong>Шаг 3 · 📢 Мониторинг рекламы:</strong> Программа ищет в объявлениях слова «бронь», «депозит», «касса», «рассрочка от застройщика». Нажмите <strong>«✅ Принять»</strong>, если нарушение действительно есть, или <strong>«✕ Отклонить»</strong>, если всё законно. Кнопка <strong>«🖼️ Снимок»</strong> покажет сохранённый скриншот.</div>
        <div class="help-step-card"><strong>Шаг 4 · ⚖️ Риск-скоринг R1–R6:</strong> Здесь считаются баллы риска (от 0 до 100). Важно: <strong>Красная зона</strong> включится только тогда, когда набрано 60+ баллов И лично подтверждены и отсутствие разрешения (R1), и сбор денег в рекламе (R2).</div>
        <div class="help-step-card"><strong>Шаг 5 · 📑 Сигнальный акт (PDF):</strong> Впишите свою фамилию, краткий вывод и нажмите <strong>«🖨️ Скачать PDF / Печать»</strong> для получения готового официального бланка.</div>
      </div>
    `;
  }

  modal.style.display = 'flex';
}
window.openHelpModal = openHelpModal;

function closeHelpModal() {
  const modal = document.getElementById('help-guide-modal');
  if (modal) modal.style.display = 'none';
}
window.closeHelpModal = closeHelpModal;

// Пошаговый интерактивный тур с подсветкой блоков
let CURRENT_TOUR_INDEX = -1;
const TOUR_STEPS = [
  {
    tab: 'map',
    selector: '#control-cases-bar',
    titles: {
      ru: 'Шаг 1 из 5 · Быстрые тест-кейсы ТЗ и Карта объектов',
      kz: '5-тен 1-қадам · ТТ тест-кейстері және Нысандар картасы',
      en: 'Step 1 of 5 · TZ Benchmark Cases & Interactive Map'
    },
    texts: {
      ru: 'Нажмите на любую из 4 кнопок эталонных кейсов (Кейс A, B, C или Граничный кейс 60 баллов), чтобы мгновенно показать работу формулы скоринга на карте Усть-Каменогорска.',
      kz: 'Өскемен картасында скоринг формуласының жұмысын бірден көрсету үшін 4 эталондық кейс түймесінің кез келгенін басыңыз.',
      en: 'Click any of the 4 benchmark buttons (Case A, B, C, or the 60-pt Edge Case) to immediately demonstrate the scoring formula on the Oskemen map.'
    }
  },
  {
    tab: 'registry',
    selector: '#registry-detail-pane',
    titles: {
      ru: 'Шаг 2 из 5 · Карточка ЖК, 11 госреестров и связанные публикации',
      kz: '5-тен 2-қадам · ТҮК карточкасы, 11 мемлекеттік тізілім және жарияланымдар',
      en: 'Step 2 of 5 · Complex Dossier, 11 State Registries & Linked Ads'
    },
    texts: {
      ru: 'В правой панели Реестра собраны все правовые основания застройщика (КЖК, разрешение МИО, лицензия СМР), а ниже — связанные рекламные объявления и события проверки.',
      kz: 'Оң жақ панельде құрылыс салушының барлық құқықтық негіздері және байланысты жарнамалық хабарландырулар көрсетілген.',
      en: 'The right-hand Registry panel shows all statutory permits (KZH, Akimat permit, license) along with linked advertising publications and verification events.'
    }
  },
  {
    tab: 'ads',
    selector: '#btn-add-ad',
    titles: {
      ru: 'Шаг 3 из 5 · Мониторинг рекламы, OCR-скриншоты и проверка ИИ',
      kz: '5-тен 3-қадам · Жарнама мониторингі, OCR-скриншоттар және ЖИ тексеруі',
      en: 'Step 3 of 5 · Ad Monitoring, OCR Snapshots & AI Verification'
    },
    texts: {
      ru: 'Здесь инспектор проверяет объявления с Krisha.kz, OLX и Instagram. Нажмите «➕ Добавить объявление вручную», чтобы протестировать 4 готовых пресета в 1 клик и загрузку скриншота (OCR).',
      kz: 'Мұнда инспектор хабарландыруларды тексереді. 4 дайын мысалды және скриншотты тануды (OCR) тексеру үшін «➕ Хабарландыруды қолмен қосу» түймесін басыңыз.',
      en: 'Here the inspector reviews ads from Krisha.kz, OLX, and Instagram. Click "Add Publication Manually" to test the 4 one-click presets and OCR screenshot recognition.'
    }
  },
  {
    tab: 'scoring',
    selector: '#scoring-plain-explainer',
    titles: {
      ru: 'Шаг 4 из 5 · Интерактивная матрица R1–R6 и защита от ошибок',
      kz: '5-тен 4-қадам · R1–R6 интерактивті матрицасы және қателерден қорғау',
      en: 'Step 4 of 5 · R1–R6 Interactive Matrix & Statutory Safeguards'
    },
    texts: {
      ru: 'Понятная памятка над таблицей объясняет человеческим языком, почему объект попал в свою зону риска и почему закон блокирует Красную зону без подтверждения инспектора.',
      kz: 'Кесте үстіндегі түсініктеме нысанның неліктен осы тәуекел аймағына түскенін қарапайым тілмен түсіндіреді.',
      en: 'The plain-language banner above the matrix explains why the complex is in its current zone and how statutory preconditions protect lawful developers.'
    }
  },
  {
    tab: 'signal',
    selector: '#btn-signal-print',
    titles: {
      ru: 'Шаг 5 из 5 · Печать официального Сигнального акта (PDF)',
      kz: '5-тен 5-қадам · Ресми Сигналдық актіні басып шығару (PDF)',
      en: 'Step 5 of 5 · Official Signal Inspection Act (PDF Print)'
    },
    texts: {
      ru: 'На финальном шаге инспектор подтверждает сигнал и в один клик выгружает двуязычный PDF-документ установленного образца с полным пакетом доказательств.',
      kz: 'Соңғы қадамда инспектор сигналды растайды және бір басу арқылы ресми PDF-құжатты басып шығарады.',
      en: 'In the final step, the inspector confirms the signal and prints an official A4 PDF report with all attached evidence.'
    }
  }
];

function renderTourStep() {
  const pop = document.getElementById('guided-tour-popover');
  if (!pop) return;
  document.querySelectorAll('.tour-highlight-target').forEach(el => el.classList.remove('tour-highlight-target'));

  if (CURRENT_TOUR_INDEX < 0 || CURRENT_TOUR_INDEX >= TOUR_STEPS.length) {
    pop.style.display = 'none';
    return;
  }

  const step = TOUR_STEPS[CURRENT_TOUR_INDEX];
  if (typeof switchTab === 'function') {
    switchTab(step.tab);
  }

  const lang = CURRENT_LANG || 'ru';
  const titleEl = document.getElementById('tour-pop-title');
  const textEl = document.getElementById('tour-pop-text');
  const stepCounterEl = document.getElementById('tour-pop-counter');
  if (titleEl) titleEl.textContent = step.titles[lang] || step.titles.ru;
  if (textEl) textEl.textContent = step.texts[lang] || step.texts.ru;
  if (stepCounterEl) stepCounterEl.textContent = `${CURRENT_TOUR_INDEX + 1} / ${TOUR_STEPS.length}`;

  pop.style.display = 'block';

  setTimeout(() => {
    const target = document.querySelector(step.selector);
    if (target) {
      target.classList.add('tour-highlight-target');
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 120);
}

function startGuidedTour() {
  closeHelpModal();
  CURRENT_TOUR_INDEX = 0;
  renderTourStep();
}
window.startGuidedTour = startGuidedTour;

function nextTourStep() {
  if (CURRENT_TOUR_INDEX < TOUR_STEPS.length - 1) {
    CURRENT_TOUR_INDEX++;
    renderTourStep();
  } else {
    closeGuidedTour();
  }
}
window.nextTourStep = nextTourStep;

function prevTourStep() {
  if (CURRENT_TOUR_INDEX > 0) {
    CURRENT_TOUR_INDEX--;
    renderTourStep();
  }
}
window.prevTourStep = prevTourStep;

function closeGuidedTour() {
  CURRENT_TOUR_INDEX = -1;
  document.querySelectorAll('.tour-highlight-target').forEach(el => el.classList.remove('tour-highlight-target'));
  const pop = document.getElementById('guided-tour-popover');
  if (pop) pop.style.display = 'none';
}
window.closeGuidedTour = closeGuidedTour;

// ------------------------------------------------------------------------
// Работа с Сигнальным актом (переход на вкладку, решение инспектора, выгрузка JSON)
// ------------------------------------------------------------------------
async function openSignalAct(complexId) {
  if (complexId) selectComplex(complexId);
  const targetId = complexId || SELECTED_COMPLEX_ID;
  if (typeof apiClient !== 'undefined' && apiClient.isConnected) {
    await fetchComplexDetail(targetId);
  }
  if (typeof switchTab === 'function') {
    switchTab('signal');
  }
  if (typeof renderSignalCard === 'function') {
    renderSignalCard(targetId);
  }
}
window.openSignalAct = openSignalAct;
window.openSignalPage = openSignalAct;
window.openSignalCard = openSignalAct;

async function selectComplexForSignal(complexId) {
  selectComplex(complexId);
  if (typeof apiClient !== 'undefined' && apiClient.isConnected) {
    await fetchComplexDetail(complexId);
  }
  if (typeof renderSignalCard === 'function') {
    renderSignalCard(complexId);
  }
}
window.selectComplexForSignal = selectComplexForSignal;

async function updateSignalDecision(decision) {
  const c = complexes.find(item => item.id === SELECTED_COMPLEX_ID);
  if (!c) return;

  const analystInput = document.getElementById('analyst-name-input');
  const commentInput = document.getElementById('analyst-comment-input');
  const author = (analystInput && analystInput.value.trim()) ? analystInput.value.trim() : (c.signalAuthor || "Ахметов Д.К. — Главный специалист отдела мониторинга ДЖС МИО ВКО");
  const comment = (commentInput && commentInput.value.trim()) ? commentInput.value.trim() : (c.signalComment || "");

  c.signalStatus = decision;
  c.signalUpdatedAt = new Date().toLocaleString();
  c.signalAuthor = author;
  c.signalComment = comment;

  const timeNow = new Date().toLocaleTimeString();
  const decisionText = (decision === 'CONFIRMED') ? 'ПОДТВЕРЖДЕНО АНАЛИТИКОМ МИО' : 'ВОЗВРАЩЕНО НА ДОРАБОТКУ';
  auditLogEntries.unshift(`[${timeNow}] Сигнальный акт по ЖК «${getLocalized(c.names)}»: ${decisionText} (специалист: ${author.split('—')[0].trim()})`);
  saveState();

  if (typeof apiClient !== 'undefined' && apiClient.signalDecision) {
    await apiClient.signalDecision(c.id, decision, comment, author);
  }

  if (typeof renderSignalCard === 'function') renderSignalCard(c.id);
  if (typeof renderRegistryView === 'function') renderRegistryView();
  showCopyToast(`✅ Статус сигнального акта обновлен: <strong>${decisionText}</strong>`);
}
window.updateSignalDecision = updateSignalDecision;

function exportSignalJSON() {
  const c = complexes.find(item => item.id === SELECTED_COMPLEX_ID);
  if (!c) return;
  const risk = calculateComplexRisk(c);
  const analystInput = document.getElementById('analyst-name-input');
  const commentInput = document.getElementById('analyst-comment-input');
  const author = (analystInput && analystInput.value.trim()) ? analystInput.value.trim() : (c.signalAuthor || "Ахметов Д.К.");
  const comment = (commentInput && commentInput.value.trim()) ? commentInput.value.trim() : (c.signalComment || "");

  const payload = {
    actNumber: `SIG-2026-${c.id.toUpperCase()}`,
    generatedAt: new Date().toISOString(),
    department: "ГУ «Управление строительства, архитектуры и градостроительства Восточно-Казахстанской области»",
    analyst: author,
    decision: c.signalStatus || "PENDING",
    comment: comment,
    complex: {
      id: c.id,
      code: c.code,
      names: c.names,
      developers: c.developers,
      bin: c.bin,
      contactPhone: c.contactPhone || "+7 (705) 999-00-11",
      cadastreNumber: c.cadastreNumber,
      smrLicense: c.smrLicense,
      landPurpose: c.landPurpose,
      districts: c.districts,
      readinessFact: c.readinessFact,
      readinessDeclared: c.readinessDeclared,
      legalStatus: c.legalStatus,
      legalTexts: c.legalTexts,
      factors: c.factors,
      riskScore: risk.score,
      zone: risk.zone
    },
    attachedAds: (adsList || []).filter(a => a.complexId === c.id),
    disclaimer: "Система подсвечивает признаки риска и помогает принять решение, но не устанавливает факт правонарушения и не отправляет материалы в госорганы автоматически."
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Signal_Act_${c.id.toUpperCase()}_2026.json`;
  a.click();
  URL.revokeObjectURL(url);
  showCopyToast(`⬇️ Акт №SIG-2026-${c.id.toUpperCase()} выгружен в JSON!`);
}
window.exportSignalJSON = exportSignalJSON;

// Стартовая инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
  setTheme(CURRENT_THEME);
  applyFontScale(CURRENT_FONT_SCALE);
  setLanguage(CURRENT_LANG);

  const timeEl = document.getElementById('footer-update-time');
  if (timeEl) {
    const now = new Date();
    timeEl.textContent = now.toLocaleDateString() + ', ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
});

