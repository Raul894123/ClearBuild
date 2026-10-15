// ClearBuild (SAQ QURYLYS) — ES Module API Client
// Codemasters Hackathon 8.0 (г. Усть-Каменогорск)

const DEFAULT_API_URL = 'http://localhost:8000/api/v1';

export class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl || (typeof localStorage !== 'undefined' && localStorage.getItem('clearbuild_api_url')) || DEFAULT_API_URL;
    this.isConnected = false;
    this.lastPing = null;
    this.backendInfo = null;
  }

  setBaseUrl(url) {
    if (!url) url = DEFAULT_API_URL;
    this.baseUrl = url.replace(/\/+$/, '');
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('clearbuild_api_url', this.baseUrl);
    }
  }

  async ping() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${this.baseUrl}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        this.isConnected = true;
        this.lastPing = new Date();
        this.backendInfo = await res.json();
        return { ok: true, data: this.backendInfo };
      }
    } catch (e) {}
    this.isConnected = false;
    return { ok: false };
  }

  async getComplexes(fallback = []) {
    if (this.isConnected) {
      try {
        const res = await fetch(`${this.baseUrl}/complexes`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) return data;
        }
      } catch (e) {}
    }
    return fallback;
  }

  async getPublications(fallback = []) {
    if (this.isConnected) {
      try {
        const res = await fetch(`${this.baseUrl}/publications`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) return data;
        }
      } catch (e) {}
    }
    return fallback;
  }

  async addPublication(pubData) {
    if (this.isConnected) {
      try {
        const res = await fetch(`${this.baseUrl}/publications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pubData)
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    return { status: 'success', local: true, publication: pubData };
  }

  async addComplex(complexData) {
    if (this.isConnected) {
      try {
        const res = await fetch(`${this.baseUrl}/complexes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(complexData)
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    return { status: 'success', local: true, complex: complexData };
  }

  async analyze(analyzeReq) {
    if (this.isConnected) {
      try {
        const res = await fetch(`${this.baseUrl}/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(analyzeReq)
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    return null;
  }

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
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    return { status: 'success', local: true };
  }

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
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    return { status: 'success', local: true };
  }
}

export const apiClient = new ApiClient();
export default apiClient;
