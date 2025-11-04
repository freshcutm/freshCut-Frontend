// Prompts optimizados (ES) para recomendaciones de cortes
export const BASE_PROMPT_ES = `Mantén el rostro original del usuario sin modificar rasgos faciales (ojos, nariz, boca, mandíbula, pómulos). Modifica únicamente el cabello.
Usa estilo foto realista con iluminación natural y texturas de pelo reales. Respeta proporciones del rostro y evita apariencia plástica o de caricatura.
Proporciona recomendaciones modernas y favorecedoras de corte según su tipo de pelo y forma de rostro. Ofrece variación útil entre opciones.
No inventes accesorios ni alteres edad, color de piel o fondo. Si falta información, explica supuestos claros.`;

export const NEGATIVE_PROMPT_ES = `cambiar rasgos faciales, deformaciones, ojos/nariz/boca alterados, piel plástica, filtros excesivos,
caricatura/anime/cartoon, exageración de contornos, maquillaje pesado no solicitado, accesorios ajenos (gafas, piercings),
cambios de edad o color de piel, fondos surrealistas, duplicación de partes, arte texto-a-imagen no realista`;

export const STYLES_ES: Record<string, string> = {
  low_fade: 'Estilo: Low Fade (degradado bajo, laterales muy limpios, transición sutil).',
  mid_fade: 'Estilo: Mid Fade (degradado medio versátil; laterales definidos, coronilla equilibrada).',
  pompadour: 'Estilo: Pompadour (volumen arriba, laterales recogidos, acabado natural).',
  buzz_cut: 'Estilo: Buzz Cut (muy corto y uniforme; líneas limpias, mantenimiento mínimo).',
  undercut: 'Estilo: Undercut (laterales cortos desconectados y parte superior con textura).'
};