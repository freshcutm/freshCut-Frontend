export function realDurationMinutes(name: string, rawMinutes: number): number {
  const n = (name || '').toLowerCase();
  const map: Record<string, number> = {
    // Cortes y combinados
    'corte clásico': 45,
    'corte clasico': 45,
    'corte y barba': 60,
    'corte + barba': 60,
    'corte premium': 60,
    'kings cut': 60,
    // Barba
    'arreglo de barba': 30,
    'afeitado clásico': 30,
    'afeitado clasico': 30,
    // Cejas y faciales
    'perfilado cejas': 15,
    'depilación facial': 20,
    'depilacion facial': 20,
    // Lavado y tratamientos
    'lavado y masaje': 20,
    'tratamiento capilar': 45,
    // Color
    'coloración': 90,
    'coloracion': 90,
    'mechas': 120,
  };
  const hit = Object.keys(map).find(k => n.includes(k));
  if (hit) return map[hit];
  // Fallback realista: mínimos y máximos razonables
  const m = Number(rawMinutes) || 30;
  if (m < 15) return 20;
  if (m > 180) return 120;
  return m;
}