import { existsSync, readFileSync, statSync } from "node:fs";
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

  it("cada panel cae dentro de la sala (no más allá de una esquina)", () => {
    // Límites interiores: la pared frontal y la trasera recortan los laterales.
    const ROOM = { left: -369, right: 49, front: -229, back: 269 };
    for (const d of paneles) {
      const { wall, position, width } = d.placement!;
      const h = width / 2;
      const dentro = position - h >= ROOM.front && position + h <= ROOM.back;
      expect(dentro, `${d.id} en ${wall} ${position}`).toBe(true);
    }
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

  it("cada audio tiene su archivo real y duración actualizada", () => {
    for (const s of audio) {
      const mediaPath = path.join(PUBLIC, s.media.src);
      expect(existsSync(mediaPath), s.media.src).toBe(true);
      expect(statSync(mediaPath).size, s.media.src).toBeGreaterThan(500_000);
      expect(s.media.durationSeconds, s.id).toBeGreaterThan(30);
    }
  });

  it("cada vídeo tiene su portada real correspondiente", () => {
    for (const [id, nombre] of [
      ["estacion-04", "video4.jpg"],
      ["estacion-09", "video9.jpg"],
    ]) {
      const station = stations.stations.find((s) => s.id === id)!;
      expect(station.image.src, id).toBe(`media/images/${nombre}`);
      expect(station.image.alt.length, id).toBeGreaterThan(10);
      expect(existsSync(path.join(PUBLIC, station.image.src)), station.image.src).toBe(true);
    }
  });

  it("cada vídeo tiene su archivo real, duración actualizada y no está marcado como marcador", () => {
    for (const s of stations.stations.filter((x) => x.type === "video")) {
      const mediaPath = path.join(PUBLIC, s.media.src);
      expect(existsSync(mediaPath), s.media.src).toBe(true);
      expect(statSync(mediaPath).size, s.media.src).toBeGreaterThan(1_000_000);
      expect(s.media.durationSeconds, s.id).toBeGreaterThan(15);
      expect(s.placeholder, s.id).toBe(false);
    }
  });

  it("documenta la autoría confirmada de los medios reales que se publicarán", () => {
    const ids = [
      "estacion-04",
      "estacion-05",
      "estacion-06",
      "estacion-07",
      "estacion-08",
      "estacion-09",
      "estacion-10",
    ];

    for (const id of ids) {
      const station = stations.stations.find((item) => item.id === id)!;
      expect(station.credit, id).toBe("Obra original de la propietaria del museo");
    }
  });
});
