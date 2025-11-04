// Devuelve un path SVG (24x24) representativo del servicio
export function serviceIconPath(name: string): string {
  const n = (name || '').toLowerCase();
  // Kings Cut → corona limpia centrada
  if (n.includes('kings')) {
    // Banda inferior y picos claros
    return 'M7 13h10M7 9L9.5 6L12 9L14.5 6L17 9';
  }
  // Corte clásico → tijeras centradas
  if (n.includes('corte') && !n.includes('barba')) {
    // Estilo tipo persona simple: cabeza + hombros (sin cuello) para limpieza
    return 'M12 9 m -2.6 0 a 2.6 2.6 0 1 0 5.2 0 a 2.6 2.6 0 1 0 -5.2 0 M4 18 C8 16.2 16 16.2 20 18';
  }
  // Fade medio → silueta de persona con pelo corto (sin cuello)
  if (n.includes('fade')) {
    // Cabeza, línea de pelo corto superior y hombros relajados
    return 'M12 9 m -2.4 0 a 2.4 2.4 0 1 0 4.8 0 a 2.4 2.4 0 1 0 -4.8 0 M9 8 Q12 7.4 15 8 M4 18 C8 16.3 16 16.3 20 18';
  }
  // Barba → barba estilizada
  if (n.includes('barba') && !n.includes('corte')) {
    // Bigote + volumen de barba más reconocible
    // Bigote (línea superior) y contorno de barba con caída suave
    return 'M8.5 11c1 0.9 2.3 1.4 3.5 1.4s2.5-0.5 3.5-1.4 M7 10c0 4.6 3.3 7.4 5 7.4s5-2.8 5-7.4c-2 1.4-4 2.2-5 2.2s-3-0.8-5-2.2z';
  }
  // Corte de barba → barba + navaja
  if (n.includes('barba') && n.includes('corte')) {
    // Barba + hoja recta de navaja y mango
    return 'M7 9c0 4 3 7 5 7s5-3 5-7M6 12h8M6 14h8M6 12l-3-3';
  }
  // Mascarillas faciales → máscara clara con ojos y boca, y tiras laterales
  if (n.includes('mascar') || n.includes('facial')) {
    // Contorno más elaborado, ojos ligeramente más pequeños, puente nasal y boca curva; tiras laterales
    return 'M12 9.6 m -4.2 0 a 4.2 5.2 0 1 0 8.4 0 a 4.2 5.2 0 1 0 -8.4 0 M9 9.0 Q12 8.5 15 9.0 M11 10.2 m -1 0 a 1 1 0 1 0 2 0 a 1 1 0 1 0 -2 0 M13 10.2 m -1 0 a 1 1 0 1 0 2 0 a 1 1 0 1 0 -2 0 M12 10.9 v 0.9 M10.6 13.5 Q12 13.9 13.4 13.5 M7.0 11.2 h-1.6 M17.0 11.2 h1.6';
  }
  // Genérico → peineta simple
  return 'M7 9h10M7 12h10M8 8v8M11 8v8M14 8v8';
}

// Grosor de trazo por servicio (mejora legibilidad específica)
export function serviceIconStrokeWidth(name: string): number {
  const n = (name || '').toLowerCase();
  if (n.includes('corte') && !n.includes('barba')) return 2.1; // estilo marcado tipo persona
  if (n.includes('barba') && !n.includes('corte')) return 2.1; // contorno de barba más claro
  if (n.includes('fade')) return 2.1; // pelo corto con mayor presencia
  if (n.includes('mascar') || n.includes('facial')) return 2.1; // máscara más visible
  return 1.7;
}

// Devuelve clases Tailwind para color del icono según el servicio
export function serviceIconColor(name: string): string {
  const n = (name || '').toLowerCase();
  if (n.includes('kings')) return 'text-yellow-600 border-yellow-200';
  if (n.includes('mascar') || n.includes('facial')) return 'text-emerald-600 border-emerald-200';
  if (n.includes('afeit')) return 'text-slate-700 border-slate-200';
  if (n.includes('barba')) return 'text-orange-700 border-orange-200';
  if (n.includes('fade')) return 'text-indigo-600 border-indigo-200';
  if (n.includes('corte')) return 'text-red-600 border-red-200';
  if (n.includes('niñ')) return 'text-pink-600 border-pink-200';
  return 'text-gray-600 border-gray-200';
}

// Silueta de persona genérica (cabeza y hombros) para contexto de servicios de peluquería
// Mantener compatibilidad (no usado en nuevo set)
export function personHeadPath(): string { return ''; }

// Path extra para capas secundarias específicas (e.g., corona o tijeras adicionales)
// Elementos extra: arriba (p.ej. corona) y abajo (p.ej. tijeras pequeñas)
export function serviceTopPath(name: string): string { return ''; }

export function serviceBottomPath(name: string): string { return ''; }

// Cinta decorativa bajo la silueta (para Kings Cut y cortes)
export function serviceRibbonPath(name: string): string { return ''; }

// Transformaciones por servicio para mejorar composición con la silueta
export function serviceTransform(name: string): string { return ''; }