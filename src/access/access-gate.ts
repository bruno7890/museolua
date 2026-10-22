// Barrera informal de acceso. No es autenticación ni protege archivos (spec §13, constitución V).
// Solo se compara un verificador SHA-256 con sal; la clave introducida no se guarda ni se registra.

import type { SiteConfig } from "../content/types.ts";

export function normalizeAccessKey(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export async function computeVerifier(normalizedKey: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${normalizedKey}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Comparación en tiempo constante sobre cadenas hexadecimales de igual longitud. */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function verifyAccessKey(raw: string, config: SiteConfig["access"]): Promise<boolean> {
  const normalized = normalizeAccessKey(raw);
  if (normalized.length === 0) return false;
  const computed = await computeVerifier(normalized, config.salt);
  return constantTimeEqual(computed, config.verifier);
}
