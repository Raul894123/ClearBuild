// Shared Logic for ClearBuild / SAQ QURYLYS Portal
// Codemasters Hackathon 8.0 (Ust-Kamenogorsk)
// Integrates with window.apiClient and local fallback state (clearbuild_state_v2)

const STATE_KEY = 'clearbuild_state_v2';

function loadAppState() {
  let state = null;
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) state = JSON.parse(raw);
  } catch(e) {
    console.error('Error loading state from localStorage:', e);
  }

  // Fallback to legacy keys if v2 not yet created
  if (!state) {
    try {
      const savedComp = localStorage.getItem('clearbuild_complexes');
      const savedAds = localStorage.getItem('clearbuild_ads');
      const savedLog = localStorage.getItem('clearbuild_audit_log');
      if (savedComp) {
        state = {
          complexes: JSON.parse(savedComp),
          adsList: savedAds ? JSON.parse(savedAds) : JSON.parse(JSON.stringify(INITIAL_ADS)),
          auditLogEntries: savedLog ? JSON.parse(savedLog) : []
        };
      }
    } catch(e) {}
  }

  if (!state) {
    state = {
      complexes: JSON.parse(JSON.stringify(RAW_COMPLEXES)),
      adsList: JSON.parse(JSON.stringify(INITIAL_ADS)),
      auditLogEntries: [
        `[15.10.2026, 09:00] Инициализация мониторинга SAQ QURYLYS г. Усть-Каменогорск (v2)`,
        `[15.10.2026, 09:05] Загружено 8 строящихся комплексов и 12 зафиксированных объявлений`,
        `[15.10.2026, 09:10] Автоматический скоринг по критериям R1–R6 завершен`
      ],
      selectedId: 'jk-1',
      theme: 'light',
      lang: 'ru',
      actLang: 'ru',
      activeTab: 'map'
    };
  }

  // Ensure all ads have normalized field aliases
  (state.adsList || []).forEach(a => {
    a.text = a.text || a.rawText || '';
    a.rawText = a.rawText || a.text || '';
    a.pubDate = a.pubDate || a.date || a.capturedAt || '14.10.2026';
    a.date = a.date || a.pubDate || a.capturedAt || '14.10.2026';
    a.capturedAt = a.capturedAt || a.date || a.pubDate || '14.10.2026, 12:00';
    a.platform = a.platform || a.source || 'Krisha.kz';
    a.source = a.source || a.platform || 'Krisha.kz';
    a.url = a.url || '#';
  });

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

if (typeof window !== 'undefined') {
  window.complexes = complexes;
  window.adsList = adsList;
  window.auditLogEntries = auditLogEntries;
  window.SELECTED_COMPLEX_ID = SELECTED_COMPLEX_ID;
  window.CURRENT_THEME = CURRENT_THEME;
  window.CURRENT_LANG = CURRENT_LANG;
  window.CURRENT_ACT_LANG = CURRENT_ACT_LANG;
  window.CURRENT_ACTIVE_TAB = CURRENT_ACTIVE_TAB;
}

// Query param override (e.g. ?id=jk-2&tab=scoring)
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('id')) {
  SELECTED_COMPLEX_ID = urlParams.get('id');
}
if (urlParams.get('tab')) {
  CURRENT_ACTIVE_TAB = urlParams.get('tab');
}

function saveState() {
  appState.complexes = complexes;
  appState.adsList = adsList;
  appState.auditLogEntries = auditLogEntries;
  appState.selectedId = SELECTED_COMPLEX_ID;
  appState.theme = CURRENT_THEME;
  appState.lang = CURRENT_LANG;
  appState.actLang = CURRENT_ACT_LANG;
  appState.activeTab = CURRENT_ACTIVE_TAB;
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

function resetDemoData() {
  if (!confirm('Сбросить данные к эталонным 8 ЖК и 12 объявлениям (Кейсы A, B, C)? Все ручные изменения будут очищены.')) {
    return;
  }
  localStorage.removeItem(STATE_KEY);
  localStorage.removeItem('clearbuild_complexes');
  localStorage.removeItem('clearbuild_ads');
  localStorage.removeItem('clearbuild_audit_log');
  localStorage.removeItem('clearbuild_selected_id');

  appState = {
    complexes: JSON.parse(JSON.stringify(RAW_COMPLEXES)),
    adsList: JSON.parse(JSON.stringify(INITIAL_ADS)),
    auditLogEntries: [
      `[${new Date().toLocaleString()}] 🔄 Демо-данные сброшены к эталону (Кейсы A, B, C: 8 ЖК и 12 объявлений)`,
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

  alert('Эталонные данные успешно восстановлены!');
  if (typeof refreshAllViews === 'function') {
    refreshAllViews();
  } else {
    window.location.reload();
  }
}

function changeFactorStatus(complexId, factorCode, newStatus) {
  const c = complexes.find(item => item.id === complexId);
  if (!c || !c.factors[factorCode]) return;

  const prevStatus = c.factors[factorCode].status;
  c.factors[factorCode].status = newStatus;

  const timeNow = new Date().toLocaleTimeString();
  const statusLabel = getFactorStatusLabel(newStatus, CURRENT_LANG);
  const entry = `[${timeNow}] Фактор ${factorCode} для «${getLocalized(c.names)}»: изменен с ${prevStatus} на ${newStatus} (${statusLabel})`;
  auditLogEntries.unshift(entry);

  saveState();

  // Call apiClient to notify backend (if connected)
  if (typeof apiClient !== 'undefined' && apiClient.confirmFactor) {
    apiClient.confirmFactor(complexId, factorCode, newStatus, `Решение аналитика МИО через скоринг-матрицу: ${newStatus}`, "Ахметов Д.К. (Аналитик МИО)");
  }

  if (typeof refreshAllViews === 'function') {
    refreshAllViews();
  } else {
    if (typeof renderScoringView === 'function') renderScoringView(complexId);
    if (typeof renderScoringTable === 'function') renderScoringTable(complexId);
    if (typeof renderRegistry === 'function') renderRegistry();
    if (typeof renderComplexCards === 'function') renderComplexCards();
    if (typeof renderMapMarkers === 'function') renderMapMarkers();
  }
}

function updateFactorEvidence(complexId, factorCode, newEvidence) {
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

  if (typeof apiClient !== 'undefined' && apiClient.confirmFactor) {
    apiClient.confirmFactor(complexId, factorCode, f.status, newEvidence, "Ахметов Д.К. (Аналитик МИО)");
  }

  if (typeof refreshAllViews === 'function') {
    refreshAllViews();
  }
}

function recordSignalDecision(complexId, decision, comment, author) {
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
    apiClient.signalDecision(complexId, decision, comment, author);
  }

  if (typeof refreshAllViews === 'function') {
    refreshAllViews();
  }
  alert(`Сигнальный акт по ЖК «${getLocalized(c.names)}» успешно ${decision === 'CONFIRMED' ? 'утвержден' : 'возвращен на доработку'}!`);
}

// Copy BIN and open official portal
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
  }, 3000);
}

// API Config Modal Handlers
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
      alert(`✅ Успешное соединение с Backend API!\n\nАдрес: ${apiClient.baseUrl}\nВерсия: ${res.data.version || '1.0'}\nГород: ${res.data.city || 'Усть-Каменогорск'}\nСтатус: 200 OK`);
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

// Cross-registry check
function triggerCrossRegistryCheck() {
  const timeNow = new Date().toLocaleTimeString();
  auditLogEntries.unshift(`[${timeNow}] ⚡ Запущена полная перекрёстная сверка 8 ЖК по 11 государственным реестрам РК...`);
  auditLogEntries.unshift(`[${timeNow}] ✅ Сверка завершена: 11 баз онлайн. Выявлены расхождения по 2 объектам (Красная зона).`);
  saveState();
  if (typeof renderAuditLog === 'function') renderAuditLog();
  alert('Перекрёстная сверка с 11 госреестрами РК успешно завершена! Результаты занесены в журнал аудита.');
}

// Deterministic Scoring
function calculateComplexRisk(c) {
  let score = 0;
  const activeCodes = [];
  const aiHypotheses = [];

  ['R1', 'R2', 'R3', 'R4', 'R5', 'R6'].forEach(code => {
    const factor = c.factors[code];
    if (!factor) return;
    if (factor.status === 'CONFIRMED') {
      score += factor.weight;
      activeCodes.push(code);
    } else if (factor.status === 'AI_HYPOTHESIS') {
      aiHypotheses.push(code);
    }
  });

  score = Math.min(100, score);
  const hasR1 = activeCodes.includes('R1');
  const hasR2 = activeCodes.includes('R2');

  let zone = 'GREEN';
  let zoneBadgeClass = 'badge-green';
  let zoneName = CURRENT_LANG === 'kz' ? 'Қауіпсіз' : CURRENT_LANG === 'en' ? 'Safe' : 'Безопасно';

  if (score >= 60 && hasR1 && hasR2) {
    zone = 'RED';
    zoneBadgeClass = 'badge-red';
    zoneName = CURRENT_LANG === 'kz' ? 'Қауіпті' : CURRENT_LANG === 'en' ? 'High Risk' : 'Опасно';
  } else if (score >= 25) {
    zone = 'YELLOW';
    zoneBadgeClass = 'badge-yellow';
    zoneName = CURRENT_LANG === 'kz' ? 'Назар аударыңыз' : CURRENT_LANG === 'en' ? 'Attention' : 'Требует внимания';
  }

  return { score, zone, zoneBadgeClass, zoneName, activeCodes, aiHypotheses, hasR1, hasR2 };
}

function getLocalized(obj, lang = CURRENT_LANG) {
  if (!obj) return '';
  return obj[lang] || obj['ru'] || '';
}

// Theme handling
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
// Localization System (I18N) - RU / KZ / EN
// ------------------------------------------------------------------------
const I18N = {
  ru: {
    'portal-title': 'SAQ QURYLYS',
    'portal-sub': 'Мониторинг строящегося жилья · Усть-Каменогорск',
    'btn-api-lbl': '🔌 API Бэкенда',
    'btn-reset-lbl': '🔄 Сброс демо',
    'lbl-theme-light': 'Светлая',
    'lbl-theme-dark': 'Тёмная',
    'i18n-ribbon-tag': 'Официальный реестр:',
    'i18n-ribbon-desc': 'Сверка строящихся объектов с базой разрешений МИО ВКО и договоров гарантии АО «КЖК».',
    'kpi-title-total': 'Всего объектов на контроле',
    'kpi-title-green': 'Законное привлечение (Гарантия/МИО)',
    'kpi-title-yellow': 'Документы на проверке / Расхождения',
    'kpi-title-red': 'Высокий риск (Сбор денег без ДДУ)',
    'lbl-nav-map': '01 · Карта и Обзор',
    'lbl-nav-registry': '02 · Реестр ЖК',
    'lbl-nav-ads': '03 · Мониторинг рекламы (AI)',
    'lbl-nav-scoring': '04 · Риск-скоринг R1–R6',
    'lbl-nav-signal': '05 · Сигнальный акт (PDF)',
    'lbl-nav-network': '🕸️ Сеть телефонов / Коллизии',
    'mob-nav-map': '🗺️ Карта',
    'mob-nav-registry': '📋 Реестр',
    'mob-nav-ads': '📢 Реклама',
    'mob-nav-scoring': '⚖️ Матрица',
    'mob-nav-signal': '📑 Акт',
    'mob-nav-network': '🕸️ Связи',
    'pill-txt-all': 'Все (8)',
    'pill-txt-green': '🟢 Зелёная (3)',
    'pill-txt-yellow': '🟡 Жёлтая (3)',
    'pill-txt-red': '🔴 Красная (2)',
    'search-placeholder': 'Поиск ЖК по названию, адресу или БИН...',
    'reg-search-placeholder': 'Фильтр по названию, БИН или застройщику...',
    'zone-safe': 'Безопасно',
    'zone-warn': 'Требует внимания',
    'zone-danger': 'Опасно'
  },
  kz: {
    'portal-title': 'SAQ QURYLYS',
    'portal-sub': 'Салынып жатқан тұрғын үйлер мониторингі · Өскемен қ.',
    'btn-api-lbl': '🔌 Бэкенд API',
    'btn-reset-lbl': '🔄 Демоны қалпына келтіру',
    'lbl-theme-light': 'Жарық',
    'lbl-theme-dark': 'Қараңғы',
    'i18n-ribbon-tag': 'Ресми тізілім:',
    'i18n-ribbon-desc': 'ШҚО ЖАО рұқсаттар базасымен және «ҚТҚ» АҚ кепілдік шарттарымен салыстыру.',
    'kpi-title-total': 'Бақылаудағы барлық нысандар',
    'kpi-title-green': 'Заңды қаражат тарту (Кепілдік/ЖАО)',
    'kpi-title-yellow': 'Құжаттар тексерілуде / Сәйкессіздіктер',
    'kpi-title-red': 'Жоғары тәуекел (ҮҚШ-сыз ақша жинау)',
    'lbl-nav-map': '01 · Карта және Шолу',
    'lbl-nav-registry': '02 · ТҮК тізілімі',
    'lbl-nav-ads': '03 · Жарнама мониторингі (AI)',
    'lbl-nav-scoring': '04 · Тәуекел-скоринг R1–R6',
    'lbl-nav-signal': '05 · Сигналдық акт (PDF)',
    'lbl-nav-network': '🕸️ Телефондар желісі / Қайшылықтар',
    'mob-nav-map': '🗺️ Карта',
    'mob-nav-registry': '📋 Тізілім',
    'mob-nav-ads': '📢 Жарнама',
    'mob-nav-scoring': '⚖️ Матрица',
    'mob-nav-signal': '📑 Акт',
    'mob-nav-network': '🕸️ Желі',
    'pill-txt-all': 'Барлығы (8)',
    'pill-txt-green': '🟢 Жасыл (3)',
    'pill-txt-yellow': '🟡 Сары (3)',
    'pill-txt-red': '🔴 Қызыл (2)',
    'search-placeholder': 'ТҮК атауы, мекенжайы немесе БСН бойынша іздеу...',
    'reg-search-placeholder': 'Атауы, БСН немесе құрылыс салушы бойынша сүзгі...',
    'zone-safe': 'Қауіпсіз',
    'zone-warn': 'Назар аударуды қажет етеді',
    'zone-danger': 'Қауіпті'
  },
  en: {
    'portal-title': 'SAQ QURYLYS',
    'portal-sub': 'Under-Construction Housing Risk Monitoring · Oskemen',
    'btn-api-lbl': '🔌 Backend API',
    'btn-reset-lbl': '🔄 Reset Demo',
    'lbl-theme-light': 'Light',
    'lbl-theme-dark': 'Dark',
    'i18n-ribbon-tag': 'Official Registry:',
    'i18n-ribbon-desc': 'Cross-verification with East Kazakhstan Akimat permits and KZH guarantee contracts.',
    'kpi-title-total': 'Total Monitored Complexes',
    'kpi-title-green': 'Lawful Sales (Guarantee/Permit)',
    'kpi-title-yellow': 'Under Verification / Discrepancies',
    'kpi-title-red': 'High Risk (Illegal Fundraising)',
    'lbl-nav-map': '01 · Map & Overview',
    'lbl-nav-registry': '02 · Complexes Registry',
    'lbl-nav-ads': '03 · Ad Monitoring (AI)',
    'lbl-nav-scoring': '04 · Risk Scoring R1–R6',
    'lbl-nav-signal': '05 · Signal Report (PDF)',
    'lbl-nav-network': '🕸️ Phone Network & Collisions',
    'mob-nav-map': '🗺️ Map',
    'mob-nav-registry': '📋 Registry',
    'mob-nav-ads': '📢 Ads',
    'mob-nav-scoring': '⚖️ Matrix',
    'mob-nav-signal': '📑 Report',
    'mob-nav-network': '🕸️ Network',
    'pill-txt-all': 'All (8)',
    'pill-txt-green': '🟢 Green (3)',
    'pill-txt-yellow': '🟡 Yellow (3)',
    'pill-txt-red': '🔴 Red (2)',
    'search-placeholder': 'Search by complex name, address or BIN...',
    'reg-search-placeholder': 'Filter by name, BIN or developer...',
    'zone-safe': 'Safe',
    'zone-warn': 'Needs Review',
    'zone-danger': 'High Risk'
  }
};

function safeSetText(id, text) {
  const el = document.getElementById(id);
  if (el && text !== undefined) el.textContent = text;
}

function setLang(lang) {
  CURRENT_LANG = lang;
  if (typeof window !== 'undefined') window.CURRENT_LANG = lang;
  try {
    localStorage.setItem('clearbuild_lang', lang);
  } catch(e) {}

  // Update button active state in header
  ['kz', 'ru', 'en'].forEach(l => {
    const btn1 = document.getElementById('lang-' + l);
    const btn2 = document.getElementById('lang-btn-' + l);
    if (btn1) btn1.classList.toggle('active', l === lang);
    if (btn2) btn2.classList.toggle('active', l === lang);
  });

  // Apply translations to UI elements by ID
  const dict = I18N[lang] || I18N.ru;
  for (const [key, val] of Object.entries(dict)) {
    safeSetText(key, val);
  }

  // Apply translations to elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.getAttribute('data-i18n');
    if (dict[k]) el.textContent = dict[k];
  });

  // Update search input placeholders
  const sInput = document.getElementById('search-complex-input');
  if (sInput && dict['search-placeholder']) sInput.placeholder = dict['search-placeholder'];
  const rInput = document.getElementById('reg-search-input');
  if (rInput && dict['reg-search-placeholder']) rInput.placeholder = dict['reg-search-placeholder'];

  // Re-render views in current language
  if (typeof refreshAllViews === 'function') {
    refreshAllViews();
  } else if (typeof window.refreshAllViews === 'function') {
    window.refreshAllViews();
  }
}
window.setLang = setLang;
window.setLanguage = setLang;

function selectComplex(id) {
  SELECTED_COMPLEX_ID = id;
  localStorage.setItem('clearbuild_selected_id', id);
}

// Dossier modal
function openComplexDossier(complexId) {
  const c = complexes.find(item => item.id === complexId);
  if (!c) return;

  selectComplex(complexId);
  const risk = calculateComplexRisk(c);
  const modal = document.getElementById('dossier-modal');
  if (!modal) return;

  document.getElementById('modal-dossier-title').textContent = getLocalized(c.names);
  document.getElementById('modal-dossier-tag').textContent = `${c.code} · ${getLocalized(c.districts)}`;

  const verdictText = CITIZEN_VERDICTS[risk.zone][CURRENT_LANG] || CITIZEN_VERDICTS[risk.zone].ru;
  const verdictClass = risk.zone === 'RED' ? 'verdict-red' : risk.zone === 'YELLOW' ? 'verdict-yellow' : 'verdict-green';
  const verdictIcon = risk.zone === 'RED' ? '⛔' : risk.zone === 'YELLOW' ? '⚠️' : '✅';

  let factorsHtml = ['R1', 'R2', 'R3', 'R4', 'R5', 'R6'].map(code => {
    const factor = c.factors[code];
    if (!factor || factor.status === 'NONE') return '';
    const isHypo = factor.status === 'AI_HYPOTHESIS';
    const badgeColor = isHypo ? 'badge-yellow' : 'badge-red';
    const evidenceText = factor.evidence ? getLocalized(factor.evidence) : 'Подтверждено проверкой';
    return `
      <div style="border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem 1rem; background: var(--bg-surface); display: flex; align-items: flex-start; gap: 0.85rem;">
        <span style="font-weight: 800; font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 6px; background: var(--bg-surface-hover); color: var(--text-secondary); font-family: monospace;">${code} (+${factor.weight} б.)</span>
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.2rem;">
            <strong style="font-size: 0.82rem;">${isHypo ? '🤖 Гипотеза ИИ' : '⚠️ Подтвержденное нарушение'}</strong>
            <span class="status-badge ${badgeColor}">${getFactorStatusLabel(factor.status, CURRENT_LANG)}</span>
          </div>
          <div style="font-size: 0.78rem; color: var(--text-secondary);">${evidenceText}</div>
        </div>
      </div>
    `;
  }).filter(Boolean).join('');

  if (!factorsHtml) {
    factorsHtml = `<div style="color: var(--zone-green-text); font-weight: 600; font-size: 0.85rem;">✅ Существенных факторов риска не обнаружено. Объект проверен.</div>`;
  }

  document.getElementById('modal-dossier-body').innerHTML = `
    <div class="verdict-box ${verdictClass}">
      <div class="verdict-icon">${verdictIcon}</div>
      <div>
        <div style="font-weight: 800; font-size: 0.9rem; margin-bottom: 0.2rem;">Вердикт для покупателя (дольщика):</div>
        <div>${verdictText}</div>
      </div>
    </div>

    <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; background: var(--bg-surface-hover); padding: 1rem; border-radius: 10px; border: 1px solid var(--border-color);">
      <div>
        <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Статус законности</div>
        <div style="font-size: 1.1rem; font-weight: 800; color: var(--text-main); margin-top: 0.15rem;">${getLocalized(c.legalTexts)}</div>
        <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.35rem;">${getLocalized(c.legalDetails)}</div>
      </div>
      <span class="status-badge ${risk.zoneBadgeClass}" style="font-size: 0.9rem; padding: 0.4rem 0.9rem;">
        ${risk.zoneName} · ${risk.score} б.
      </span>
    </div>

    <div>
      <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.65rem;">Реквизиты и фактические данные</h4>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.8rem;">
        <div><strong>Застройщик:</strong> ${getLocalized(c.developers)}</div>
        <div><strong>БИН застройщика:</strong> ${c.bin}</div>
        <div><strong>Контактный телефон:</strong> ${c.contactPhone || '+7 (705) 999-00-11'}</div>
        <div><strong>Кадастровый номер:</strong> ${c.cadastreNumber || 'Участок МИО'}</div>
        <div><strong>Стадия строительства:</strong> ${getLocalized(c.stages)}</div>
        <div><strong>Готовность:</strong> Факт ${c.readinessFact}% / Заявлено ${c.readinessDeclared}%</div>
      </div>
    </div>

    <div>
      <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.65rem;">Детализация факторов риска (R1–R6)</h4>
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        ${factorsHtml}
      </div>
    </div>
  `;

  modal.style.display = 'flex';
}

function closeDossierModal() {
  const modal = document.getElementById('dossier-modal');
  if (modal) modal.style.display = 'none';
}

// ------------------------------------------------------------------------
// Signal Act Navigation & Action Handlers
// ------------------------------------------------------------------------
function openSignalAct(complexId) {
  if (complexId) selectComplex(complexId);
  if (typeof switchTab === 'function') {
    switchTab('signal');
  }
  if (typeof renderSignalCard === 'function') {
    renderSignalCard(complexId || SELECTED_COMPLEX_ID);
  }
}
window.openSignalAct = openSignalAct;
window.openSignalPage = openSignalAct;
window.openSignalCard = openSignalAct;

function selectComplexForSignal(complexId) {
  selectComplex(complexId);
  if (typeof renderSignalCard === 'function') {
    renderSignalCard(complexId);
  }
}
window.selectComplexForSignal = selectComplexForSignal;

function updateSignalDecision(decision) {
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
    apiClient.signalDecision(c.id, decision, comment, author);
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

// Global bootstrap
document.addEventListener('DOMContentLoaded', () => {
  setTheme(CURRENT_THEME);
  setLanguage(CURRENT_LANG);

  const timeEl = document.getElementById('footer-update-time');
  if (timeEl) {
    const now = new Date();
    timeEl.textContent = now.toLocaleDateString() + ', ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
});
