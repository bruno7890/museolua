// Comprueba el presupuesto de tamaño del sitio y de los medios.
// Uso: npm run check:budget   (tras npm run build)
//
// Reglas:
//   - carga esencial (todo el sitio salvo audio y vídeo) ≤ 5 MiB  → SC-009
//   - ningún archivo de medios supera 80 MiB                      → riesgo 3 del plan
//   - se informa del peso total del build y de los archivos mayores

import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const DIST = join(ROOT, "dist");

const MIB = 1024 * 1024;
const LIMIT_ESSENTIAL = 5 * MIB;
const LIMIT_MEDIA = 80 * MIB;

/** Carpetas excluidas de la carga esencial: se piden bajo demanda. */
const ON_DEMAND = ["media/audio/", "media/video/"];

interface Entry {
  path: string;
  size: number;
}

function listFiles(dir: string): Entry[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    const info = statSync(full);
    if (info.isDirectory()) return listFiles(full);
    return [{ path: relative(DIST, full).split(sep).join("/"), size: info.size }];
  });
}

function isOnDemand(path: string): boolean {
  return ON_DEMAND.some((prefix) => path.startsWith(prefix));
}

function human(bytes: number): string {
  if (bytes >= MIB) return `${(bytes / MIB).toFixed(2)} MiB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${bytes} B`;
}

if (!existsSync(DIST)) {
  console.error("✗ No existe dist/. Ejecuta primero: npm run build");
  process.exit(1);
}

const files = listFiles(DIST);
const total = files.reduce((sum, f) => sum + f.size, 0);
const essential = files.filter((f) => !isOnDemand(f.path));
const essentialSize = essential.reduce((sum, f) => sum + f.size, 0);
const media = files.filter((f) => isOnDemand(f.path));

let failed = false;

console.log(`Build: ${files.length} archivos, ${human(total)}`);
console.log(`Carga esencial (sin audio ni vídeo): ${human(essentialSize)} · límite ${human(LIMIT_ESSENTIAL)}`);
if (essentialSize > LIMIT_ESSENTIAL) {
  console.error(`✗ La carga esencial supera el presupuesto (${human(essentialSize - LIMIT_ESSENTIAL)} de más).`);
  failed = true;
} else {
  console.log(`✓ La carga esencial está dentro del presupuesto.`);
}

if (media.length === 0) {
  console.log("· No hay medios en el build (se cargan bajo demanda desde otra ubicación).");
} else {
  const mediaSize = media.reduce((sum, f) => sum + f.size, 0);
  console.log(`Medios bajo demanda: ${media.length} archivos, ${human(mediaSize)}`);
  for (const file of media) {
    if (file.size > LIMIT_MEDIA) {
      console.error(`✗ ${file.path} ocupa ${human(file.size)} y supera el límite de ${human(LIMIT_MEDIA)}.`);
      failed = true;
    }
  }
  const biggest = [...media].sort((a, b) => b.size - a.size).slice(0, 3);
  for (const file of biggest) console.log(`  · ${file.path} · ${human(file.size)}`);
}

const heaviest = [...files].sort((a, b) => b.size - a.size).slice(0, 5);
console.log("Archivos mayores del build:");
for (const file of heaviest) console.log(`  · ${file.path} · ${human(file.size)}`);

process.exitCode = failed ? 1 : 0;
