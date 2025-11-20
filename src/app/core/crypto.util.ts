// Utilidades criptográficas del frontend
// Provee hashing SHA-256 usando Web Crypto API y devuelve en hex

export async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(input);
  // Web Crypto está disponible en navegadores modernos; si no, lanza error claro
  const subtle: SubtleCrypto | undefined = (typeof window !== 'undefined' && (window.crypto?.subtle)) || undefined;
  if (!subtle) throw new Error('Crypto no disponible en este navegador');

  const digest = await subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(digest);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}