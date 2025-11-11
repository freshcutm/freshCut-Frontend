// Configuración runtime de la API: lee de window.__env y hace fallback a localhost
const w = (typeof window !== 'undefined' ? (window as any) : {});

// URL base del backend (incluye "/api").
// Estrategia: 1) usa window.__env si existe; 2) si no estamos en localhost,
// usa el backend de Render; 3) fallback a localhost para desarrollo.
export const API_BASE_URL: string = (() => {
  const envUrl = w?.__env?.API_BASE_URL as string | undefined;
  if (envUrl && typeof envUrl === 'string') return envUrl;
  const isProdLike = typeof window !== 'undefined' && !!window.location && !/^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
  return isProdLike ? 'https://freshcut-back.onrender.com/api' : 'http://localhost:8080/api';
})();

// Origen del backend (sin la parte "/api") para casos donde el backend
// devuelve rutas relativas que empiezan por "/api/..."
export const API_ORIGIN: string = (() => {
  try {
    // Si es ruta relativa ("/api"), el origen es el del navegador
    if (API_BASE_URL.startsWith('/')) {
      return typeof window !== 'undefined' && window.location ? `${window.location.protocol}//${window.location.host}` : 'http://localhost:4200';
    }
    const u = new URL(API_BASE_URL);
    return `${u.protocol}//${u.host}`;
  } catch {
    // Fallback alineado con la heurística de API_BASE_URL
    const isProdLike = typeof window !== 'undefined' && !!window.location && !/^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
    return isProdLike ? 'https://freshcut-back.onrender.com' : 'http://localhost:8080';
  }
})();

// URL específica para módulo de IA: si no se define, construye desde base
export const API_AI_URL: string = w?.__env?.API_AI_URL ?? `${API_BASE_URL}/ai`;