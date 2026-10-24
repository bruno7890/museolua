// Validador puro de catálogos. Sin acceso a disco: recibe las rutas existentes.
// Contrato: specs/001-museo-de-lua/contracts/content-catalogs.md y runtime-modules.md

import type {
  DecorationCatalog,
  ValidateOptions,
  ValidationIssue,
  ValidationResult,
  SiteConfig,
  StationCatalog,
  StationPlacement,
  Wall,
} from "./types.ts";

const WALLS: readonly Wall[] = ["left", "right", "front", "back"];
const EXPECTED_DISTRIBUTION: Record<Wall, number> = { left: 3, right: 3, front: 2, back: 2 };
const WALL_HALF_LENGTH = 300;
const MIN_GAP = 8;
const MAX_NARRATION = 600;

type Obj = Record<string, unknown>;

class Collector {
  readonly issues: ValidationIssue[] = [];
  private readonly file: string;
  private readonly mode: ValidateOptions["mode"];
  constructor(file: string, mode: ValidateOptions["mode"]) {
    this.file = file;
    this.mode = mode;
  }
  add(path: string, code: string, message: string): void {
    this.issues.push({ file: this.file, path, code, message });
  }
  placeholder(path: string, value: unknown): void {
    if (this.mode === "publish" && value === true) {
      this.add(path, "placeholder", "Marcador pendiente: debe sustituirse o retirarse para publicar.");
    }
  }
  result(): ValidationResult {
    return { ok: this.issues.length === 0, issues: this.issues };
  }
}

function isObj(v: unknown): v is Obj {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function str(c: Collector, path: string, v: unknown, opts: { allowEmpty?: boolean; max?: number } = {}): v is string {
  if (typeof v !== "string" || (!opts.allowEmpty && v.trim().length === 0)) {
    c.add(path, "shape", "Se esperaba texto no vacío.");
    return false;
  }
  if (opts.max !== undefined && v.length > opts.max) {
    c.add(path, "text-length", `El texto supera ${opts.max} caracteres.`);
    return false;
  }
  return true;
}

function bool(c: Collector, path: string, v: unknown): v is boolean {
  if (typeof v !== "boolean") {
    c.add(path, "shape", "Se esperaba true o false.");
    return false;
  }
  return true;
}

function num(
  c: Collector,
  path: string,
  v: unknown,
  o: { positive?: boolean; min?: number; max?: number } = {},
): v is number {
  if (typeof v !== "number" || !Number.isFinite(v)) {
    c.add(path, "number", "Se esperaba un número finito.");
    return false;
  }
  if (o.positive && v <= 0) {
    c.add(path, "number", "Debe ser mayor que cero.");
    return false;
  }
  if ((o.min !== undefined && v < o.min) || (o.max !== undefined && v > o.max)) {
    c.add(path, "range", `Fuera de rango [${o.min ?? "-∞"}, ${o.max ?? "∞"}].`);
    return false;
  }
  return true;
}

function oneOf<T extends string>(c: Collector, path: string, v: unknown, allowed: readonly T[]): v is T {
  if (typeof v !== "string" || !(allowed as readonly string[]).includes(v)) {
    c.add(path, "enum", `Valor no permitido. Opciones: ${allowed.join(", ")}.`);
    return false;
  }
  return true;
}

/** Ruta relativa a public/: sin absolutas, sin ".." ni URL, y debe existir. */
function relPath(c: Collector, path: string, v: unknown, existing: ReadonlySet<string>): boolean {
  if (typeof v !== "string" || v.length === 0) {
    c.add(path, "shape", "Se esperaba una ruta.");
    return false;
  }
  const forbidden =
    v.startsWith("/") || v.includes("\\") || v.includes("://") || v.includes("//") || v.split("/").includes("..");
  if (forbidden) {
    c.add(path, "path-forbidden", "Ruta no permitida: debe ser relativa y estar dentro de public/.");
    return false;
  }
  if (!existing.has(v)) {
    c.add(path, "missing-file", `No existe el archivo «${v}».`);
    return false;
  }
  return true;
}

function schemaVersion(c: Collector, input: Obj): boolean {
  if (input.schemaVersion !== 1) {
    c.add("schemaVersion", "schema-version", "Se esperaba schemaVersion 1.");
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// config/site.json
// ---------------------------------------------------------------------------

export function validateSiteConfig(input: unknown, opts: ValidateOptions): ValidationResult {
  const c = new Collector("config/site.json", opts.mode);
  if (!isObj(input)) {
    c.add("", "shape", "Se esperaba un objeto.");
    return c.result();
  }
  schemaVersion(c, input);
  str(c, "title", input.title);

  const ornament = input.ornament;
  if (isObj(ornament)) {
    relPath(c, "ornament.src", ornament.src, opts.existingPaths);
    str(c, "ornament.alt", ornament.alt, { allowEmpty: true });
    bool(c, "ornament.placeholder", ornament.placeholder);
    c.placeholder("ornament.placeholder", ornament.placeholder);
  } else c.add("ornament", "shape", "Se esperaba un objeto.");

  if (isObj(input.theme)) {
    for (const key of ["purple", "salmon", "lavender", "plum", "grayWarm"]) {
      const v = input.theme[key];
      if (typeof v !== "string" || !/^#[0-9A-Fa-f]{6}$/.test(v)) c.add(`theme.${key}`, "color", "Color hexadecimal #RRGGBB requerido.");
    }
  } else c.add("theme", "shape", "Se esperaba un objeto.");

  if (isObj(input.entry)) {
    num(c, "entry.transitionMs", input.entry.transitionMs, { positive: true });
    num(c, "entry.reducedTransitionMs", input.entry.reducedTransitionMs, { positive: true });
  } else c.add("entry", "shape", "Se esperaba un objeto.");

  if (isObj(input.access)) {
    const v = input.access.verifier;
    if (typeof v !== "string" || !/^[0-9a-f]{64}$/.test(v)) c.add("access.verifier", "verifier", "Se esperaba un SHA-256 en hexadecimal (64 caracteres).");
    str(c, "access.salt", input.access.salt);
  } else c.add("access", "shape", "Se esperaba un objeto.");

  if (isObj(input.speech)) {
    const s = input.speech;
    if (s.lang !== "es") c.add("speech.lang", "language", "El idioma principal debe ser es.");
    if (!Array.isArray(s.fallbackLangs)) c.add("speech.fallbackLangs", "shape", "Se esperaba una lista.");
    else
      s.fallbackLangs.forEach((l, i) => {
        if (typeof l !== "string" || !/^es-[A-Za-z0-9]+$/.test(l)) c.add(`speech.fallbackLangs[${i}]`, "language", "Solo códigos es-*.");
      });
    num(c, "speech.rate", s.rate, { min: 0.5, max: 2 });
    num(c, "speech.pitch", s.pitch, { min: 0, max: 2 });
    num(c, "speech.volume", s.volume, { min: 0, max: 1 });
    num(c, "speech.startTimeoutMs", s.startTimeoutMs, { positive: true });
    num(c, "speech.maxUtteranceMs", s.maxUtteranceMs, { positive: true });
    num(c, "speech.baseEndTimeoutMs", s.baseEndTimeoutMs, { positive: true });
    num(c, "speech.msPerCharacter", s.msPerCharacter, { positive: true });
  } else c.add("speech", "shape", "Se esperaba un objeto.");

  if (isObj(input.welcome)) {
    str(c, "welcome.touchText", input.welcome.touchText, { max: MAX_NARRATION });
    str(c, "welcome.desktopText", input.welcome.desktopText, { max: MAX_NARRATION });
  } else c.add("welcome", "shape", "Se esperaba un objeto.");

  if (isObj(input.navigation)) {
    const n = input.navigation;
    num(c, "navigation.walkSpeed", n.walkSpeed, { positive: true });
    num(c, "navigation.lookSensitivity", n.lookSensitivity, { positive: true });
    num(c, "navigation.approachRate", n.approachRate, { positive: true });
    num(c, "navigation.approachDistance", n.approachDistance, { positive: true });
    num(c, "navigation.eyeHeight", n.eyeHeight);
    num(c, "navigation.fov", n.fov, { min: 30, max: 90 });
    num(c, "navigation.collisionRadius", n.collisionRadius, { positive: true });
    num(c, "navigation.pitchLimitDegrees", n.pitchLimitDegrees, { min: 0, max: 60 });
  } else c.add("navigation", "shape", "Se esperaba un objeto.");

  if (isObj(input.quality)) oneOf(c, "quality.defaultProfile", input.quality.defaultProfile, ["standard", "reduced"]);
  else c.add("quality", "shape", "Se esperaba un objeto.");

  return c.result();
}

// ---------------------------------------------------------------------------
// data/stations.json
// ---------------------------------------------------------------------------

const STATION_COUNT = 10;

export function validateStations(input: unknown, opts: ValidateOptions): ValidationResult {
  const c = new Collector("data/stations.json", opts.mode);
  if (!isObj(input) || !Array.isArray(input.stations)) {
    c.add("stations", "shape", "Se esperaba { stations: [] }.");
    return c.result();
  }
  schemaVersion(c, input);
  const list: unknown[] = input.stations;
  if (list.length !== STATION_COUNT) c.add("stations", "count", `Se esperaban ${STATION_COUNT} estaciones y hay ${list.length}.`);

  const ids = new Set<string>();
  const orders = new Set<number>();
  const placements: { index: number; id: string; type: string; placement: StationPlacement }[] = [];

  list.forEach((raw, i) => {
    const p = `stations[${i}]`;
    if (!isObj(raw)) {
      c.add(p, "shape", "Se esperaba un objeto.");
      return;
    }
    if (typeof raw.id !== "string" || !/^[a-z0-9-]+$/.test(raw.id)) c.add(`${p}.id`, "shape", "Identificador en minúsculas, dígitos o guiones.");
    else if (ids.has(raw.id)) c.add(`${p}.id`, "duplicate-id", `Identificador duplicado: ${raw.id}.`);
    else ids.add(raw.id);

    if (num(c, `${p}.order`, raw.order) && !Number.isInteger(raw.order)) c.add(`${p}.order`, "order", "Debe ser entero.");
    if (typeof raw.order === "number" && (raw.order < 1 || raw.order > STATION_COUNT || orders.has(raw.order)))
      c.add(`${p}.order`, "order", "Orden fuera de 1..10 o repetido.");
    if (typeof raw.order === "number") orders.add(raw.order);

    bool(c, `${p}.enabled`, raw.enabled);
    const type = raw.type;
    oneOf(c, `${p}.type`, type, ["audio", "video"] as const);
    str(c, `${p}.title`, raw.title, { max: 120 });
    str(c, `${p}.description`, raw.description, { allowEmpty: true, max: 600 });
    str(c, `${p}.credit`, raw.credit);
    bool(c, `${p}.placeholder`, raw.placeholder);
    c.placeholder(`${p}.placeholder`, raw.placeholder);

    if (isObj(raw.image)) {
      relPath(c, `${p}.image.src`, raw.image.src, opts.existingPaths);
      str(c, `${p}.image.alt`, raw.image.alt);
      num(c, `${p}.image.width`, raw.image.width, { positive: true });
      num(c, `${p}.image.height`, raw.image.height, { positive: true });
    } else c.add(`${p}.image`, "shape", "Se esperaba un objeto.");

    if (raw.backdrop !== undefined) {
      if (isObj(raw.backdrop)) {
        relPath(c, `${p}.backdrop.src`, raw.backdrop.src, opts.existingPaths);
        num(c, `${p}.backdrop.width`, raw.backdrop.width, { positive: true });
        num(c, `${p}.backdrop.height`, raw.backdrop.height, { positive: true });
      } else c.add(`${p}.backdrop`, "shape", "Se esperaba un objeto.");
    }

    if (isObj(raw.narration)) {
      if (raw.narration.mode !== "browser") c.add(`${p}.narration.mode`, "enum", "Debe ser browser.");
      if (typeof raw.narration.text !== "string") c.add(`${p}.narration.text`, "shape", "Se esperaba texto (puede estar vacío).");
      else if (raw.narration.text.length > MAX_NARRATION)
        c.add(`${p}.narration.text`, "text-length", `La narración supera ${MAX_NARRATION} caracteres.`);
      if (raw.narration.policy !== "first-visit") c.add(`${p}.narration.policy`, "enum", "Debe ser first-visit.");
    } else c.add(`${p}.narration`, "shape", "Se esperaba un objeto.");

    if (isObj(raw.media)) {
      relPath(c, `${p}.media.src`, raw.media.src, opts.existingPaths);
      const mime = raw.media.mime;
      const allowed = type === "video" ? ["video/mp4"] : ["audio/mpeg", "audio/wav"];
      if (typeof mime !== "string" || !allowed.includes(mime)) c.add(`${p}.media.mime`, "mime", `Para ${String(type)} se esperaba ${allowed.join(" o ")}.`);
      if (raw.media.durationSeconds !== undefined) num(c, `${p}.media.durationSeconds`, raw.media.durationSeconds, { positive: true });
      if (raw.media.poster !== undefined) relPath(c, `${p}.media.poster`, raw.media.poster, opts.existingPaths);
    } else c.add(`${p}.media`, "shape", "Se esperaba un objeto.");

    if (raw.captions !== undefined) {
      if (type !== "video") c.add(`${p}.captions`, "captions-type", "Solo las estaciones de vídeo admiten subtítulos.");
      if (isObj(raw.captions)) {
        relPath(c, `${p}.captions.src`, raw.captions.src, opts.existingPaths);
        str(c, `${p}.captions.lang`, raw.captions.lang);
      } else c.add(`${p}.captions`, "shape", "Se esperaba un objeto.");
    }

    if (isObj(raw.placement)) {
      const pl = raw.placement;
      const wall = pl.wall;
      oneOf(c, `${p}.placement.wall`, wall, WALLS);
      num(c, `${p}.placement.position`, pl.position, { min: -WALL_HALF_LENGTH, max: WALL_HALF_LENGTH });
      num(c, `${p}.placement.width`, pl.width, { positive: true });
      num(c, `${p}.placement.centerY`, pl.centerY);
      if (
        typeof wall === "string" &&
        WALLS.includes(wall as Wall) &&
        typeof pl.position === "number" &&
        typeof pl.width === "number" &&
        typeof pl.centerY === "number"
      ) {
        placements.push({
          index: i,
          id: String(raw.id),
          type: String(type),
          placement: { wall: wall as Wall, position: pl.position, width: pl.width, centerY: pl.centerY },
        });
      }
    } else c.add(`${p}.placement`, "shape", "Se esperaba un objeto.");
  });

  if (list.length === STATION_COUNT && placements.length === STATION_COUNT) {
    checkDistribution(c, placements);
    checkVideoWalls(c, placements);
    checkSpacing(c, placements);
  }
  return c.result();
}

function checkDistribution(c: Collector, items: { placement: StationPlacement }[]): void {
  const counts: Record<Wall, number> = { left: 0, right: 0, front: 0, back: 0 };
  for (const it of items) counts[it.placement.wall]++;
  for (const w of WALLS) {
    if (counts[w] !== EXPECTED_DISTRIBUTION[w]) {
      c.add("stations", "distribution", `Distribución por muro: se esperaba ${EXPECTED_DISTRIBUTION[w]} en ${w} y hay ${counts[w]}.`);
      return;
    }
  }
}

function checkVideoWalls(c: Collector, items: { index: number; type: string; placement: StationPlacement }[]): void {
  const seen = new Map<Wall, number>();
  for (const it of items) {
    if (it.type !== "video") continue;
    const w = it.placement.wall;
    if (seen.has(w)) c.add(`stations[${it.index}].placement.wall`, "video-wall", `Dos vídeos comparten el muro ${w}.`);
    else seen.set(w, it.index);
  }
}

function checkSpacing(c: Collector, items: { index: number; placement: StationPlacement }[]): void {
  for (const it of items) {
    const { position, width } = it.placement;
    if (Math.abs(position) + width / 2 > WALL_HALF_LENGTH)
      c.add(`stations[${it.index}].placement`, "bounds", "La obra queda fuera del muro.");
  }
  for (let a = 0; a < items.length; a++) {
    for (let b = a + 1; b < items.length; b++) {
      const A = items[a]!;
      const B = items[b]!;
      if (A.placement.wall !== B.placement.wall) continue;
      const need = A.placement.width / 2 + B.placement.width / 2 + MIN_GAP;
      if (Math.abs(A.placement.position - B.placement.position) < need)
        c.add(`stations[${B.index}].placement`, "overlap", `Se solapa con la estación ${A.index + 1} en el mismo muro.`);
    }
  }
}

// ---------------------------------------------------------------------------
// data/decorations.json
// ---------------------------------------------------------------------------

export function validateDecorations(
  input: unknown,
  opts: ValidateOptions,
  stationPlacements: readonly StationPlacement[] = [],
): ValidationResult {
  const c = new Collector("data/decorations.json", opts.mode);
  if (!isObj(input) || !Array.isArray(input.decorations)) {
    c.add("decorations", "shape", "Se esperaba { decorations: [] }.");
    return c.result();
  }
  schemaVersion(c, input);
  const list: unknown[] = input.decorations;
  if (list.length !== 6) c.add("decorations", "count", `Se esperaban 6 decoraciones (alfombra y cinco paneles) y hay ${list.length}.`);

  const ids = new Set<string>();
  list.forEach((raw, i) => {
    const p = `decorations[${i}]`;
    if (!isObj(raw)) {
      c.add(p, "shape", "Se esperaba un objeto.");
      return;
    }
    if (typeof raw.id !== "string") c.add(`${p}.id`, "shape", "Identificador requerido.");
    else if (ids.has(raw.id)) c.add(`${p}.id`, "duplicate-id", `Identificador duplicado: ${raw.id}.`);
    else ids.add(raw.id);

    bool(c, `${p}.enabled`, raw.enabled);
    if (raw.interactive !== false) c.add(`${p}.interactive`, "interactive", "Las decoraciones no pueden ser interactivas.");
    const kind = raw.kind;
    oneOf(c, `${p}.kind`, kind, ["floor-image", "wall-image"] as const);
    oneOf(c, `${p}.fit`, raw.fit, ["contain", "cover"] as const);

    if (isObj(raw.image)) {
      relPath(c, `${p}.image.src`, raw.image.src, opts.existingPaths);
      str(c, `${p}.image.alt`, raw.image.alt);
      str(c, `${p}.image.credit`, raw.image.credit);
      bool(c, `${p}.image.placeholder`, raw.image.placeholder);
      c.placeholder(`${p}.image.placeholder`, raw.image.placeholder);
    } else c.add(`${p}.image`, "shape", "Se esperaba un objeto.");

    if (kind === "floor-image") {
      const t = raw.transform;
      if (!isObj(t)) c.add(`${p}.transform`, "shape", "La alfombra requiere transform.");
      else {
        if (!Array.isArray(t.position) || t.position.length !== 3 || !t.position.every((v) => num(c, `${p}.transform.position`, v)))
          c.add(`${p}.transform.position`, "number", "Se esperaban tres números finitos.");
        if (!Array.isArray(t.rotationDegrees) || t.rotationDegrees.length !== 3 || !t.rotationDegrees.every((v) => num(c, `${p}.transform.rotationDegrees`, v)))
          c.add(`${p}.transform.rotationDegrees`, "number", "Se esperaban tres ángulos finitos.");
        if (!Array.isArray(t.size) || t.size.length !== 2 || !t.size.every((v) => num(c, `${p}.transform.size`, v, { positive: true })))
          c.add(`${p}.transform.size`, "number", "Se esperaban dos tamaños positivos.");
      }
    } else if (kind === "wall-image") {
      const pl = raw.placement;
      if (!isObj(pl)) c.add(`${p}.placement`, "shape", "El panel requiere placement.");
      else {
        oneOf(c, `${p}.placement.wall`, pl.wall, ["left", "right"] as const);
        num(c, `${p}.placement.position`, pl.position, { min: -WALL_HALF_LENGTH, max: WALL_HALF_LENGTH });
        num(c, `${p}.placement.width`, pl.width, { positive: true });
        num(c, `${p}.placement.centerY`, pl.centerY);
        if (pl.wall === "left" || pl.wall === "right") {
          const wall = pl.wall;
          const pos = pl.position;
          const width = pl.width;
          if (typeof pos === "number" && typeof width === "number") {
            for (const s of stationPlacements) {
              if (s.wall !== wall) continue;
              if (Math.abs(pos - s.position) < width / 2 + s.width / 2 + MIN_GAP) {
                c.add(`${p}.placement`, "overlap", `El panel se solapa con una estación del muro ${wall}.`);
                break;
              }
            }
          }
        }
      }
    }
  });
  return c.result();
}

// ---------------------------------------------------------------------------
// Conjunto completo
// ---------------------------------------------------------------------------

export interface CatalogFiles {
  site: unknown;
  stations: unknown;
  decorations: unknown;
}

export function validateAll(files: CatalogFiles, opts: ValidateOptions): ValidationResult {
  const stationsRaw = files.stations as Partial<StationCatalog> | null;
  const placements: StationPlacement[] = Array.isArray(stationsRaw?.stations)
    ? stationsRaw.stations.flatMap((s) => (isObj(s) && isObj(s.placement) ? [s.placement as unknown as StationPlacement] : []))
    : [];
  const issues = [
    ...validateSiteConfig(files.site, opts).issues,
    ...validateStations(files.stations, opts).issues,
    ...validateDecorations(files.decorations, opts, placements).issues,
  ];
  return { ok: issues.length === 0, issues };
}

export type { SiteConfig, StationCatalog, DecorationCatalog };
