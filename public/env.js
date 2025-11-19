// Runtime environment config injected via index.html
// This file is served from /env.js thanks to angular.json assets config
window.__env = window.__env || {};

// URL base del backend (incluye "/api") para producción
// Usamos ruta relativa para que Vercel proxyé a Render via vercel.json
;(function(){
  try {
    const host = (typeof window !== 'undefined' && window.location) ? window.location.hostname : '';
    const isLocal = /^(localhost|127\.0\.0\.1)$/i.test(host);
    window.__env.API_BASE_URL = isLocal ? 'https://freshcut-back.onrender.com/api' : '/api';
  } catch {
    window.__env.API_BASE_URL = '/api';
  }
})();

// URL del módulo de IA (si no se define, se construye desde API_BASE_URL)
;(function(){
  try {
    const base = window.__env.API_BASE_URL;
    window.__env.API_AI_URL = (typeof base === 'string' && base.startsWith('http')) ? `${base}/ai` : '/api/ai';
  } catch {
    window.__env.API_AI_URL = '/api/ai';
  }
})();