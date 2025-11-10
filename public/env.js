// Runtime environment config injected via index.html
// This file is served from /env.js thanks to angular.json assets config
window.__env = window.__env || {};
// Point to local backend default port 8080
window.__env.API_AI_URL = 'http://localhost:8080/api/ai';