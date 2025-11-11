// Configuración runtime de la API: lee de window.__env y hace fallback a localhost
const w = (typeof window !== 'undefined' ? (window as any) : {});

// URL base del backend (incluye "/api")
export const API_BASE_URL: string = w?.__env?.API_BASE_URL ?? 'http://localhost:8080/api';

// Origen del backend (sin la parte "/api") para casos donde el backend
// devuelve rutas relativas que empiezan por "/api/..."
export const API_ORIGIN: string = (() => {
  try {
    const u = new URL(API_BASE_URL);
    return `${u.protocol}//${u.host}`;
  } catch {
    return 'http://localhost:8080';
  }
})();

// URL específica para módulo de IA: si no se define, construye desde base
export const API_AI_URL: string = w?.__env?.API_AI_URL ?? `${API_BASE_URL}/ai`;