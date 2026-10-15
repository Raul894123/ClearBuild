// ClearBuild (SAQ QURYLYS) — Unified API Client
// Codemasters Hackathon 8.0 (г. Усть-Каменогорск)
// Поддерживает подключение к FastAPI бэкенду и полностью автономную работу (Seed / localStorage)

(function(global) {
  'use strict';

  const DEFAULT_API_URL = 'http://localhost:8000/api/v1';

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

    async ping() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(`${this.baseUrl}/health`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          this.isConnected = true;
          this.lastPing = new Date();
          this.backendInfo = data;
          this.updateUIStatus();
          return { ok: true, data };
        }
      } catch (e) {
        // Server unreachable or CORS blocked
      }
      this.isConnected = false;
      this.backendInfo = null;
      this.updateUIStatus();
      return { ok: false };
    },

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
          dotEl.title = '🟢 Подключён к Backend API (200 OK)';
        }
        if (badgeEl) {
          badgeEl.className = 'status-badge badge-green';
          badgeEl.innerHTML = '🟢 Подключён к Backend API';
        }
        if (textEl) {
          textEl.textContent = `Сервер отвечает на ${this.baseUrl}/health. Данные синхронизируются в реальном времени.`;
        }
      } else {
        if (dotEl) {
          dotEl.className = 'status-dot dot-yellow';
          dotEl.title = '🟡 Ожидание Backend-сервера (Демо-данные из seed.json)';
        }
        if (badgeEl) {
          badgeEl.className = 'status-badge badge-yellow';
          badgeEl.innerHTML = '🟡 Ожидание Backend-сервера (Демо-режим)';
        }
        if (textEl) {
          textEl.textContent = `Бэкенд по адресу ${this.baseUrl} не обнаружен. Включен автономный клиентский режим на базе seed.json и localStorage.`;
        }
      }
    },

    async getComplexes() {
      if (this.isConnected) {
        try {
          const res = await fetch(`${this.baseUrl}/complexes`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) return data;
          }
        } catch (e) {
          console.warn('[apiClient] Fetch complexes failed, fallback to memory', e);
        }
      }
      return (typeof complexes !== 'undefined' && complexes) ? complexes : [];
    },

    async getPublications() {
      if (this.isConnected) {
        try {
          const res = await fetch(`${this.baseUrl}/publications`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) return data;
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
          console.warn('[apiClient] AI analyze on backend failed, running local AI', e);
        }
      }
      return null; // Will trigger client-side AI analysis fallback
    },

    async confirmFactor(complexId, factorCode, status, evidence, analyst) {
      if (this.isConnected) {
        try {
          const res = await fetch(`${this.baseUrl}/complexes/${complexId}/confirm-factor`, {
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
          const res = await fetch(`${this.baseUrl}/complexes/${complexId}/signal-decision`, {
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
    }
  };

  global.apiClient = apiClient;

  // Background ping on load
  if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
      apiClient.ping();
    });
  }
})(typeof window !== 'undefined' ? window : this);
