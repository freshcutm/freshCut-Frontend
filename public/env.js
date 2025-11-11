// Runtime environment config injected via index.html
// This file is served from /env.js thanks to angular.json assets config
window.__env = window.__env || {};

// URL base del backend (incluye "/api") para producción
// Cambia esta URL si mueves el backend
window.__env.API_BASE_URL = 'https://freshcut-back.onrender.com/api';

// URL del módulo de IA (si no se define, se construye desde API_BASE_URL)
window.__env.API_AI_URL = 'https://freshcut-back.onrender.com/api/ai';