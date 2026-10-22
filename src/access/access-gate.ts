// Barrera informal de acceso. No es autenticación ni protege archivos (spec §13, constitución V).
// Solo se compara un verificador SHA-256 con sal; la clave introducida no se guarda ni se registra.

import type { SiteConfig } from "../content/types.ts";
import { sha256Bytes } from "./sha256.ts";

export function normalizeAccessKey(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

/**
 * Resumen SHA-256. Usa `crypto.subtle` cuando existe (contextos seguros: HTTPS o
 * localhost) y, si no existe o falla, recurre a la implementación propia para que la
 * clave se pueda comprobar también al abrir el sitio por IP local desde el móvil.
 */
async function digestSha256(data: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> {
  if (typeof crypto !== "undefined" && typeof crypto.subtle?.digest === "function") {
    try {
      return new Uint8Array(await crypto.subtle.digest("SHA-256", data));
    } catch {
      // Se usa el respaldo: el resultado es idéntico.
    }
  }
  return sha256Bytes(data);
}

export async function computeVerifier(normalizedKey: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${normalizedKey}`);
  return toHex(await digestSha256(data));
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
