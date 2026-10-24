import type { DecorationCatalog, SiteConfig, StationCatalog } from "../../src/content/types.ts";

// Catálogo de referencia válido: diez estaciones (8 audio, 2 vídeo), seis decoraciones (alfombra y cinco paneles).
// Distribución 3/3/2/2 (D-09); vídeos en muros distintos (estaciones 04 y 09).

const HEX64 = "0".repeat(64);

export function siteFixture(): SiteConfig {
  return {
    schemaVersion: 1,
    title: "Museo de Lua",
    ornament: { src: "media/branding/ornament.svg", alt: "", placeholder: true },
    theme: { purple: "#C7B5E8", salmon: "#F2AA9B", lavender: "#F8F5FC", plum: "#30263D", grayWarm: "#D5CFD5" },
    entry: { label: "Entrar al museo", transitionMs: 1000, reducedTransitionMs: 150 },
    access: { algorithm: "SHA-256", salt: "museo-de-lua-demo", verifier: HEX64, informalNotice: "Barrera informal." },
    speech: {
      lang: "es",
      fallbackLangs: ["es-EC", "es-419"],
      rate: 0.95,
      pitch: 1,
      volume: 0.7,
      startTimeoutMs: 4000,
      maxUtteranceMs: 60000,
      baseEndTimeoutMs: 2000,
      msPerCharacter: 80,
    },
    welcome: { touchText: "Toca un cuadro para verlo.", desktopText: "Haz clic en un cuadro para verlo." },
    navigation: {
      walkSpeed: 60,
      lookSensitivity: 0.0035,
      approachRate: 6,
      approachDistance: 50,
      eyeHeight: 0,
      fov: 65,
      collisionRadius: 12,
      pitchLimitDegrees: 35,
    },
    quality: { defaultProfile: "standard" },
  };
}

type StationSeed = [id: string, wall: "left" | "right" | "front" | "back", position: number, width: number, type: "audio" | "video"];

const SEEDS: StationSeed[] = [
  ["estacion-01", "left", 200, 35, "audio"],
  ["estacion-02", "left", 50, 20, "audio"],
  ["estacion-03", "left", -160, 28, "audio"],
  ["estacion-04", "right", 125, 26, "video"],
  ["estacion-05", "right", -50, 50, "audio"],
  ["estacion-06", "right", 200, 21, "audio"],
  ["estacion-07", "front", -80, 47, "audio"],
  ["estacion-08", "front", 0, 36, "audio"],
  ["estacion-09", "back", 0, 42, "video"],
  ["estacion-10", "back", -170, 25, "audio"],
];

export function stationsFixture(): StationCatalog {
  return {
    schemaVersion: 1,
    stations: SEEDS.map(([id, wall, position, width, type], i) => {
      const n = String(i + 1).padStart(2, "0");
      const isVideo = type === "video";
      return {
        id,
        order: i + 1,
        enabled: true,
        type,
        title: `Obra de demostración ${n}`,
        description: "Marcador de demostración.",
        credit: "Generado localmente para pruebas",
        placeholder: true,
        image: { src: `media/images/${n}.png`, alt: `Marcador ${n}`, width: 1024, height: 1024 },
        narration: { mode: "browser", text: `Introducción de demostración ${n}.`, policy: "first-visit" },
        media: isVideo
          ? { src: `media/video/${n}.mp4`, mime: "video/mp4", durationSeconds: 10 }
          : { src: `media/audio/${n}.wav`, mime: "audio/wav", durationSeconds: 6 },
        placement: { wall, position, width, centerY: 0 },
      };
    }),
  };
}

export function decorationsFixture(): DecorationCatalog {
  return {
    schemaVersion: 1,
    decorations: [
      {
        id: "decor-rug-entry",
        enabled: true,
        kind: "floor-image",
        image: { src: "media/decor/rug-entry.png", alt: "Alfombra de entrada", credit: "Marcador local", placeholder: true },
        transform: { position: [-80, -39.9, 180], rotationDegrees: [-90, 0, 0], size: [120, 70] },
        fit: "contain",
        interactive: false,
      },
      decorWall("decor-gon-left-01", "left", -20, 24),
      decorWall("decor-gon-left-02", "left", -120, 24),
      decorWall("decor-gon-right-01", "right", -170, 24),
      decorWall("decor-gon-right-02", "right", 60, 24),
      decorWall("decor-gon-left-03", "left", -60, 24),
    ],
  };
}

function decorWall(id: string, wall: "left" | "right", position: number, width: number) {
  return {
    id,
    enabled: true,
    kind: "wall-image" as const,
    image: { src: `media/decor/${id.replace("decor-", "")}.png`, alt: "Ilustración decorativa", credit: "Marcador local", placeholder: true },
    placement: { wall, position, width, centerY: 20 },
    fit: "contain" as const,
    interactive: false as const,
  };
}

/** Rutas que existen en public/ para el catálogo de referencia. */
export function existingPathsFixture(): Set<string> {
  const paths = new Set<string>(["config/site.json", "data/stations.json", "data/decorations.json", "media/branding/ornament.svg"]);
  for (const s of stationsFixture().stations) {
    paths.add(s.image.src);
    paths.add(s.media.src);
  }
  for (const d of decorationsFixture().decorations) paths.add(d.image.src);
  return paths;
}
