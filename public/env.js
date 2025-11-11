// Runtime environment config injected via index.html
// This file is served from /env.js thanks to angular.json assets config
window.__env = window.__env || {};

// URL base del backend (incluye "/api") para producción
// Usamos ruta relativa para que Vercel proxyé a Render via vercel.json
window.__env.API_BASE_URL = '/api';

// URL del módulo de IA (si no se define, se construye desde API_BASE_URL)
window.__env.API_AI_URL = '/api/ai';