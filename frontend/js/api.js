// ClearBuild (SAQ QURYLYS) — Единый клиент для общения с бэкендом
// Хакатон Codemasters 8.0 (г. Усть-Каменогорск)
// Короче, тут логика простая: если живой сервер на FastAPI + SQLite отвечает — работаем через него,
// а если инет отвалился или сервер спит — тихо и бесшовно падаем на локальный стейт в браузере.

(function(global) {
  'use strict';

  // По дефолту смотрим на наш задеплоенный облачный бэкенд на Render
  const DEFAULT_API_URL = 'https://clearbuild-sooq.onrender.com/api/v1';

  const apiClient = {
    baseUrl: (typeof localStorage !== 'undefined' && localStorage.getItem('clearbuild_api_url')) || DEFAULT_API_URL,
    isConnected: false,
    lastPing: null,
    backendInfo: null,

    setBaseUrl(url) {
      if (!url) url = DEFAULT_API_URL;
      this.baseUrl = url.replace(/\/+$/, '');
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('clearbuild_api_url', this.baseUrl);
      }
      this.updateUIStatus();
    },

    getBaseUrl() {
      return this.baseUrl;
    },

    // Пингуем /health (ставим таймаут 4.5 сек, потому что бесплатный Render иногда просыпается не сразу)
    async ping() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);
        const res = await fetch(`${this.baseUrl}/health`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          this.isConnected = true;
          this.lastPing = new Date();
          this.backendInfo = data;
          this.updateUIStatus();
          if (typeof global.syncWithBackend === 'function') {
            global.syncWithBackend().catch(err => console.warn('[apiClient] Background sync error:', err));
          }
          return { ok: true, data };
        }
      } catch (e) {
        // Ну, не достучались до сервера (или CORS/таймаут) — ничего страшного, едем на локальной базе
      }
      this.isConnected = false;
      this.backendInfo = null;
      this.updateUIStatus();
      return { ok: false };
    },

    // Обновляем зелёную/жёлтую точку в шапке и текст в модалке БД
    updateUIStatus() {
      const dotEl = document.getElementById('api-status-dot');
      const badgeEl = document.getElementById('api-modal-status-badge');
      const textEl = document.getElementById('api-modal-status-text');
      const inputEl = document.getElementById('backend-api-url-input');

      if (inputEl && !inputEl.value) {
        inputEl.value = this.baseUrl;
      }

      if (this.isConnected) {
        if (dotEl) {
          dotEl.className = 'status-dot dot-green';
          dotEl.title = '🟢 Подключён к Backend API (FastAPI + SQLite · 200 OK)';
        }
        if (badgeEl) {
          badgeEl.className = 'status-badge badge-green';
          badgeEl.innerHTML = '🟢 Подключён к Backend API (SQLite)';
        }
        if (textEl) {
          textEl.textContent = `Сервер отвечает на ${this.baseUrl}/health. Данные ЖК, публикаций и журнала решений синхронизированы с SQLite.`;
        }
      } else {
        if (dotEl) {
          dotEl.className = 'status-dot dot-yellow';
          dotEl.title = '🟡 Демо-режим: встроенная база (8 ЖК, 12 объявлений). Сервер не подключён.';
        }
        if (badgeEl) {
          badgeEl.className = 'status-badge badge-yellow';
          badgeEl.innerHTML = '🟡 Демо-режим (встроенная база данных)';
        }
        if (textEl) {
          textEl.textContent = `Сервер по адресу ${this.baseUrl} не подключён. Все функции работают на встроенной демо-базе (8 ЖК, 12 объявлений), изменения сохраняются в браузере.`;
        }
      }
    },

    async getComplexes(zone = null) {
      if (this.isConnected) {
        try {
          const qs = zone && zone !== 'ALL' ? `?zone=${encodeURIComponent(zone)}` : '';
          const res = await fetch(`${this.baseUrl}/complexes${qs}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) return data;
          }
        } catch (e) {
          console.warn('[apiClient] Fetch complexes failed, fallback to memory', e);
        }
      }
      const list = (typeof complexes !== 'undefined' && complexes) ? complexes : [];
      if (zone && zone !== 'ALL') {
        return list.filter(c => {
          const r = typeof calculateComplexRisk === 'function' ? calculateComplexRisk(c) : (c.riskProfile || {});
          return (r.zone || '').toUpperCase() === zone.toUpperCase();
        });
      }
      return list;
    },

    async getComplexById(complexId) {
      if (!complexId) return null;
      if (this.isConnected) {
        try {
          const res = await fetch(`${this.baseUrl}/complexes/${encodeURIComponent(complexId)}`);
          if (res.ok) {
            return await res.json();
          }
        } catch (e) {
          console.warn(`[apiClient] Fetch complex ${complexId} failed, fallback to memory`, e);
        }
      }
      const list = (typeof complexes !== 'undefined' && complexes) ? complexes : [];
      return list.find(c => c.id === complexId) || null;
    },

    async getPublications(params = {}) {
      if (this.isConnected) {
        try {
          const searchParams = new URLSearchParams();
          if (params.complex_id) searchParams.set('complex_id', params.complex_id);
          if (params.status) searchParams.set('status', params.status);
          const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
          const res = await fetch(`${this.baseUrl}/publications${qs}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) return data;
          }
        } catch (e) {
          console.warn('[apiClient] Fetch publications failed, fallback to memory', e);
        }
      }
      return (typeof adsList !== 'undefined' && adsList) ? adsList : [];
    },

    async addPublication(pubData) {
      if (this.isConnected) {
        try {
          const res = await fetch(`${this.baseUrl}/publications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pubData)
          });
          if (res.ok) {
            return await res.json();
          }
        } catch (e) {
          console.warn('[apiClient] Add publication to backend failed, saving locally', e);
        }
      }
      return { status: 'success', local: true, publication: pubData };
    },

    async verifyPublication(pubId, decision, comment = null, analyst = null) {
      if (this.isConnected) {
        try {
          const res = await fetch(`${this.baseUrl}/publications/${encodeURIComponent(pubId)}/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              decision: decision, // "accept" либо "reject"
              comment: comment || undefined,
              analyst: analyst || 'Ахметов Д.К. (Аналитик МИО)'
            })
          });
          if (res.ok) {
            return await res.json();
          } else {
            const errBody = await res.json().catch(() => ({}));
            return { ok: false, status: 'error', error: errBody.detail || `HTTP ${res.status}` };
          }
        } catch (e) {
          console.warn('[apiClient] Verify publication on backend failed, updating locally', e);
        }
      }
      return { status: 'success', local: true, decision };
    },

    async geocode(query) {
      if (!query || typeof query !== 'string' || !query.trim()) return null;
      const clean = query.trim().toLowerCase();
      if (typeof window !== 'undefined') {
        if (!window._geocodeMemoryCache) window._geocodeMemoryCache = {};
        if (window._geocodeMemoryCache[clean]) {
          return window._geocodeMemoryCache[clean];
        }
      }

      // 1. Быстрая попытка через бэкенд FastAPI (таймаут 1.2 сек)
      if (this.isConnected) {
        try {
          const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
          const toId = controller ? setTimeout(() => controller.abort(), 1200) : null;
          const res = await fetch(`${this.baseUrl}/geocode?q=${encodeURIComponent(query)}`, {
            signal: controller ? controller.signal : undefined
          });
          if (toId) clearTimeout(toId);
          if (res.ok) {
            const data = await res.json();
            if (data && data.coords) {
              if (typeof window !== 'undefined' && window._geocodeMemoryCache) window._geocodeMemoryCache[clean] = data;
              return data;
            }
          }
        } catch (_) {}
      }

      // 2. Быстрый живой запрос к OpenStreetMap Nominatim через JSONP (таймаут 1.5 сек)
      if (typeof window !== 'undefined' && typeof document !== 'undefined' && document.createElement) {
        try {
          const data = await new Promise((resolve) => {
            const cbName = 'osm_cb_' + Math.random().toString(36).substring(2);
            let qStr = query.trim();
            if (!/(усть-каменогорск|өскемен)/i.test(qStr)) {
              qStr = 'Усть-Каменогорск, ' + qStr;
            }
            const script = document.createElement('script');
            const timer = setTimeout(() => {
              cleanup();
              resolve(null);
            }, 1500);
            function cleanup() {
              clearTimeout(timer);
              if (script.parentNode) script.parentNode.removeChild(script);
              try { delete window[cbName]; } catch(_) {}
            }
            window[cbName] = function(results) {
              cleanup();
              if (Array.isArray(results) && results.length > 0) {
                const lat = parseFloat(results[0].lat);
                const lng = parseFloat(results[0].lon);
                if (lat >= 49.80 && lat <= 50.15 && lng >= 82.40 && lng <= 82.90) {
                  resolve({
                    status: 'success',
                    coords: [lat, lng],
                    lat: lat,
                    lng: lng,
                    source: 'osm_nominatim',
                    displayName: results[0].display_name
                  });
                  return;
                }
              }
              resolve(null);
            };
            script.src = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(qStr)}&format=json&countrycodes=kz&limit=1&json_callback=${cbName}`;
            script.onerror = () => { cleanup(); resolve(null); };
            document.head.appendChild(script);
          });
          if (data) {
            if (window._geocodeMemoryCache) window._geocodeMemoryCache[clean] = data;
            return data;
          }
        } catch (_) {}
      }
      return null;
    },

    async deleteComplex(complexId) {
      if (!complexId) return { status: 'error', error: 'No complexId' };
      let deletedOnServer = false;

      // Активно отправляем DELETE во все возможные адреса бэкенда (настроенный + локальный SQLite)
      const urlsToTry = [
        this.baseUrl,
        'http://localhost:8000/api/v1',
        'http://127.0.0.1:8000/api/v1'
      ];
      const uniqueUrls = [...new Set(urlsToTry.filter(Boolean))];

      for (const u of uniqueUrls) {
        try {
          const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
          const to = controller ? setTimeout(() => controller.abort(), 3500) : null;
          const res = await fetch(`${u}/complexes/${encodeURIComponent(complexId)}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json' },
            signal: controller ? controller.signal : undefined
          });
          if (to) clearTimeout(to);
          if (res.ok) {
            deletedOnServer = true;
            console.log(`[apiClient] Complex ${complexId} successfully deleted on server ${u}`);
          }
        } catch (e) {
          // Игнорируем недоступный порт, пробуем следующий
        }
      }

      return { status: 'success', serverDeleted: deletedOnServer, deleted_id: complexId };
    },

    async purgeTestComplexes() {
      if (this.isConnected) {
        try {
          const res = await fetch(`${this.baseUrl}/complexes/purge-tests`, {
            method: 'POST'
          });
          if (res.ok) {
            return await res.json();
          }
        } catch (e) {
          console.warn('[apiClient] Purge tests failed', e);
        }
      }
      return { status: 'success', local: true };
    },

    async addComplex(complexData) {
      if (this.isConnected) {
        try {
          const res = await fetch(`${this.baseUrl}/complexes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(complexData)
          });
          if (res.ok) {
            return await res.json();
          }
        } catch (e) {
          console.warn('[apiClient] Add complex to backend failed, saving locally', e);
        }
      }
      return { status: 'success', local: true, complex: complexData };
    },

    async analyze(analyzeReq) {
      if (this.isConnected) {
        try {
          const res = await fetch(`${this.baseUrl}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(analyzeReq)
          });
          if (res.ok) {
            return await res.json();
          }
        } catch (e) {
          console.warn('[apiClient] AI analyze on backend failed, running local AI fallback', e);
        }
      }
      if (typeof global.runLocalAnalyze === 'function') {
        return global.runLocalAnalyze(analyzeReq);
      }
      return null;
    },

    async confirmFactor(complexId, factorCode, status, evidence, analyst) {
      if (this.isConnected) {
        try {
          const res = await fetch(`${this.baseUrl}/complexes/${encodeURIComponent(complexId)}/confirm-factor`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              factor: factorCode,
              status: status,
              evidence: evidence,
              analyst: analyst || 'Ахметов Д.К. (Аналитик МИО)'
            })
          });
          if (res.ok) {
            return await res.json();
          } else {
            const errData = await res.json().catch(() => ({}));
            return { ok: false, status: 'blocked', error: errData.detail || `Ошибка ${res.status}` };
          }
        } catch (e) {
          console.warn('[apiClient] Confirm factor on backend failed, state updated locally', e);
        }
      }
      return { status: 'success', local: true };
    },

    async signalDecision(complexId, decision, comment, author) {
      if (this.isConnected) {
        try {
          const res = await fetch(`${this.baseUrl}/complexes/${encodeURIComponent(complexId)}/signal-decision`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              decision: decision,
              comment: comment,
              author: author || 'Ахметов Д.К.'
            })
          });
          if (res.ok) {
            return await res.json();
          }
        } catch (e) {
          console.warn('[apiClient] Signal decision on backend failed, state updated locally', e);
        }
      }
      return { status: 'success', local: true };
    },

    async getAuditLog(limit = 50) {
      if (this.isConnected) {
        try {
          const res = await fetch(`${this.baseUrl}/audit-log?limit=${encodeURIComponent(limit)}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) return data;
          }
        } catch (e) {
          console.warn('[apiClient] Fetch audit-log failed, fallback to memory', e);
        }
      }
      return (typeof auditLogEntries !== 'undefined' && auditLogEntries) ? auditLogEntries : [];
    }
  };

  global.apiClient = apiClient;

  // Проверяем, стоит ли автоматически пинговать бэкенд при открытии страницы:
  // - если локальная разработка или адрес начинается с https:// (облачный Render) — пингуем смело!
  // - а вот если сайт открыт по https, а в baseUrl почему-то записан http://localhost:8000,
  //   то без явной настройки не трогаем, чтобы Chrome не пугал табличкой доступа к локальной сети.
  function shouldAutoProbe() {
    if (typeof location === 'undefined') return false;
    const host = location.hostname || '';
    const isLocal = location.protocol === 'file:' || host === '' || host === 'localhost' || host === '127.0.0.1';
    if (isLocal) return true;
    if (apiClient.baseUrl && apiClient.baseUrl.startsWith('https://')) return true;
    try {
      return !!localStorage.getItem('clearbuild_api_url');
    } catch (e) {
      return false;
    }
  }

  // Если передали кастомный адрес бэкенда прямо в URL (?api=https://...) — подхватываем его
  try {
    const qsApi = new URLSearchParams(global.location ? global.location.search : '').get('api');
    if (qsApi) apiClient.setBaseUrl(qsApi);
  } catch (e) {}

  // При загрузке страницы тихонько пингуем сервер в фоне
  if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
      if (shouldAutoProbe()) {
        apiClient.ping();
      } else {
        apiClient.isConnected = false;
        apiClient.updateUIStatus();
      }
    });
  }
})(typeof window !== 'undefined' ? window : this);
