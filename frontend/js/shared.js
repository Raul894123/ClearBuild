// Shared Logic for Multi-Page ClearBuild Portal
let CURRENT_THEME = localStorage.getItem('clearbuild_theme') || 'light';
let CURRENT_LANG = localStorage.getItem('clearbuild_lang') || 'ru';
let CURRENT_ACT_LANG = 'ru';
let SELECTED_COMPLEX_ID = localStorage.getItem('clearbuild_selected_id') || 'jk-1';

// Read query params if specified (e.g. ?id=jk-2)
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('id')) {
  SELECTED_COMPLEX_ID = urlParams.get('id');
  localStorage.setItem('clearbuild_selected_id', SELECTED_COMPLEX_ID);
}

// Retrieve complexes state or initialize
let complexes = [];
try {
  const saved = localStorage.getItem('clearbuild_complexes');
  complexes = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(RAW_COMPLEXES));
} catch(e) {
  complexes = JSON.parse(JSON.stringify(RAW_COMPLEXES));
}

// Retrieve ads state or initialize
let adsList = [];
try {
  const savedAds = localStorage.getItem('clearbuild_ads');
  adsList = savedAds ? JSON.parse(savedAds) : JSON.parse(JSON.stringify(INITIAL_ADS));
} catch(e) {
  adsList = JSON.parse(JSON.stringify(INITIAL_ADS));
}

// Audit log
let auditLogEntries = [];
try {
  const savedLog = localStorage.getItem('clearbuild_audit_log');
  auditLogEntries = savedLog ? JSON.parse(savedLog) : [
    `[14.10.2026, 21:00] Инициализация мониторинга SAQ QURYLYS г. Усть-Каменогорск`,
    `[14.10.2026, 21:05] Загружено 8 строящихся комплексов и 12 зафиксированных объявлений`,
    `[14.10.2026, 21:10] Автоматический скоринг по критериям R1–R6 завершен`
  ];
} catch(e) {
  auditLogEntries = [];
}

function saveState() {
  localStorage.setItem('clearbuild_complexes', JSON.stringify(complexes));
  localStorage.setItem('clearbuild_ads', JSON.stringify(adsList));
  localStorage.setItem('clearbuild_audit_log', JSON.stringify(auditLogEntries));
  localStorage.setItem('clearbuild_selected_id', SELECTED_COMPLEX_ID);
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

// Language handling
function setLanguage(lang) {
  CURRENT_LANG = lang;
  localStorage.setItem('clearbuild_lang', lang);
  ['ru', 'kz', 'en'].forEach(l => {
    const btn = document.getElementById('lang-btn-' + l);
    if (btn) btn.classList.toggle('active', l === lang);
  });
  if (window.pageRefresh) window.pageRefresh();
}

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
            <span class="status-badge ${badgeColor}">${factor.status}</span>
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

function openSignalPage(complexId) {
  selectComplex(complexId);
  window.location.href = `signal.html?id=${complexId}`;
}

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
