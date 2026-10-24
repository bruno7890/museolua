import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { DecorationCatalog, StationCatalog } from "../../src/content/types.ts";

// Contenido real de la sala: portadas, paneles y piso ya no son marcadores.
const PUBLIC = path.resolve("public");
const leer = <T>(ruta: string): T => JSON.parse(readFileSync(path.join(PUBLIC, ruta), "utf8")) as T;
const decorations = leer<DecorationCatalog>("data/decorations.json");
const stations = leer<StationCatalog>("data/stations.json");

describe("decoraciones con ilustraciones", () => {
  const paneles = decorations.decorations.filter((d) => d.kind === "wall-image");
  const piso = decorations.decorations.filter((d) => d.kind === "floor-image");

  it("hay cinco paneles de pared y todos usan una ilustración, no un marcador", () => {
    expect(paneles).toHaveLength(5);
    for (const d of paneles) {
      expect(d.image.placeholder, d.id).toBe(false);
    }
  });

  it("la alfombra de entrada es la ilustración del piso (145)", () => {
    expect(piso).toHaveLength(1);
    expect(piso[0]!.image.src).toBe("media/decor/piso-145.jpg");
    expect(piso[0]!.image.placeholder).toBe(false);
  });

  it("cada decoración apunta a un archivo que existe en public/", () => {
    for (const d of decorations.decorations) {
      expect(existsSync(path.join(PUBLIC, d.image.src)), d.image.src).toBe(true);
    }
  });

  it("cada decoración tiene una descripción accesible propia", () => {
    for (const d of decorations.decorations) {
      expect(d.image.alt.length, d.id).toBeGreaterThan(10);
      expect(d.image.alt, d.id).not.toMatch(/marcador/i);
    }
  });
});

describe("portadas de las estaciones", () => {
  const audio = stations.stations.filter((s) => s.type === "audio");

  it("cada estación de audio tiene su portada, sin repetir ninguna imagen", () => {
    const portadas = audio.map((s) => s.image.src);
    expect(portadas.every((src) => src.endsWith(".jpg")), portadas.join(", ")).toBe(true);
    expect(new Set(portadas).size).toBe(audio.length);
    for (const [i, src] of portadas.entries()) {
      expect(stations.stations.find((s) => s.id === audio[i]!.id)!.placeholder, audio[i]!.id).toBe(false);
      expect(existsSync(path.join(PUBLIC, src)), src).toBe(true);
    }
  });

  it("ninguna imagen se usa a la vez como portada y como decoración", () => {
    const portadas = new Set(stations.stations.map((s) => s.image.src));
    for (const d of decorations.decorations) {
      expect(portadas.has(d.image.src), d.image.src).toBe(false);
    }
  });

  it("las estaciones de vídeo siguen con su marcador", () => {
    for (const s of stations.stations.filter((x) => x.type === "video")) {
      expect(s.placeholder, s.id).toBe(true);
    }
  });
});
