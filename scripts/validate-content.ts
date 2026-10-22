// Valida config/site.json, data/stations.json y data/decorations.json contra los archivos reales de public/.
// Uso: npm run validate:content            (modo demo: admite placeholders)
//      npm run validate:content -- --mode=publish   (rechaza placeholders)

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { validateAll } from "../src/content/validate.ts";

const ROOT = join(import.meta.dirname, "..", "public");

function listFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? listFiles(full) : [full];
  });
}

function readJson(rel: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(readFileSync(join(ROOT, rel), "utf8")) as unknown };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

const modeArg = process.argv.find((a) => a.startsWith("--mode="));
const mode = modeArg === "--mode=publish" ? "publish" : "demo";

const existingPaths = new Set(listFiles(ROOT).map((f) => relative(ROOT, f).split(sep).join("/")));

const site = readJson("config/site.json");
const stations = readJson("data/stations.json");
const decorations = readJson("data/decorations.json");

const parseErrors = [
  ["config/site.json", site],
  ["data/stations.json", stations],
  ["data/decorations.json", decorations],
] as const;

let failed = false;
for (const [file, r] of parseErrors) {
  if (!r.ok) {
    console.error(`✗ ${file}: JSON no válido: ${r.error}`);
    failed = true;
  }
}

if (!failed && site.ok && stations.ok && decorations.ok) {
  const result = validateAll(
    { site: site.value, stations: stations.value, decorations: decorations.value },
    { mode, existingPaths },
  );
  if (result.ok) {
    console.log(`✓ Contenido válido (modo ${mode}).`);
  } else {
    failed = true;
    console.error(`✗ ${result.issues.length} incidencia(s) (modo ${mode}):`);
    for (const i of result.issues) console.error(`  ${i.file} · ${i.path} · [${i.code}] ${i.message}`);
  }
}

process.exitCode = failed ? 1 : 0;
