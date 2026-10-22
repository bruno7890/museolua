// Genera el verificador de la clave informal para config/site.json.
// Uso: npm run hash:key -- --key "mi clave" --salt "museo-de-lua-v1"
// La clave NO se escribe en ningún archivo; solo se imprime el verificador.

import { computeVerifier, normalizeAccessKey } from "../src/access/access-gate.ts";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const key = arg("key");
const salt = arg("salt");
if (!key || !salt) {
  console.error('Uso: npm run hash:key -- --key "clave" --salt "sal"');
  process.exit(1);
}

const normalized = normalizeAccessKey(key);
if (normalized.length === 0) {
  console.error("La clave no puede estar vacía tras normalizar.");
  process.exit(1);
}

const verifier = await computeVerifier(normalized, salt);
console.log(JSON.stringify({ algorithm: "SHA-256", salt, verifier }, null, 2));
