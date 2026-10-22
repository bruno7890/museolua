import { describe, expect, it } from "vitest";
import { validateStations } from "../../src/content/validate.ts";
import { existingPathsFixture, stationsFixture } from "../fixtures/catalog.ts";
import type { Station } from "../../src/content/types.ts";

const demo = { mode: "demo" as const, existingPaths: existingPathsFixture() };

function withStations(mutate: (stations: Station[]) => void) {
  const catalog = stationsFixture();
  mutate(catalog.stations);
  return catalog;
}

function codes(input: unknown, opts = demo): string[] {
  return validateStations(input, opts).issues.map((i) => i.code);
}

describe("validateStations", () => {
  it("acepta el catálogo de referencia de diez estaciones", () => {
    const result = validateStations(stationsFixture(), demo);
    expect(result.issues).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("exige exactamente diez registros", () => {
    const catalog = withStations((s) => s.pop());
    expect(codes(catalog)).toContain("count");
  });

  it("rechaza identificadores duplicados", () => {
    const catalog = withStations((s) => {
      s[1]!.id = "estacion-01";
    });
    expect(codes(catalog)).toContain("duplicate-id");
  });

  it("rechaza orden repetido o fuera de 1..10", () => {
    const catalog = withStations((s) => {
      s[1]!.order = 1;
    });
    expect(codes(catalog)).toContain("order");
  });

  it("exige la distribución 3/3/2/2 por muro", () => {
    const catalog = withStations((s) => {
      // Mueve una estación de la pared izquierda a la derecha: 2 izquierda, 4 derecha.
      s[2]!.placement = { ...s[2]!.placement, wall: "right", position: 300 };
    });
    expect(codes(catalog)).toContain("distribution");
  });

  it("no permite dos vídeos en el mismo muro", () => {
    const catalog = withStations((s) => {
      // estacion-09 (back) pasa a right, junto a estacion-04 (vídeo, right).
      s[8]!.placement = { wall: "right", position: -300, width: 42, centerY: 0 };
    });
    expect(codes(catalog)).toContain("video-wall");
  });

  it("un vídeo exige mime video/mp4", () => {
    const catalog = withStations((s) => {
      s[3]!.media = { src: "media/video/04.mp4", mime: "audio/wav" };
    });
    expect(codes(catalog)).toContain("mime");
  });

  it("un audio no admite mime de vídeo", () => {
    const catalog = withStations((s) => {
      s[0]!.media = { src: "media/audio/01.wav", mime: "video/mp4" };
    });
    expect(codes(catalog)).toContain("mime");
  });

  it("rechaza rutas peligrosas o absolutas", () => {
    for (const bad of ["../secret.png", "https://example.com/a.png", "//cdn/a.png", "/media/images/01.png"]) {
      const catalog = withStations((s) => {
        s[0]!.image.src = bad;
      });
      expect(codes(catalog), bad).toContain("path-forbidden");
    }
  });

  it("rechaza una ruta relativa válida pero inexistente aunque esté en modo demo", () => {
    const catalog = stationsFixture();
    const result = validateStations(catalog, { mode: "demo", existingPaths: new Set() });
    expect(result.issues.map((i) => i.code)).toContain("missing-file");
  });

  it("limita el texto de narración a 600 caracteres", () => {
    const catalog = withStations((s) => {
      s[0]!.narration.text = "a".repeat(601);
    });
    expect(codes(catalog)).toContain("text-length");
  });

  it("detecta solapamiento en el mismo muro con el margen de 8 unidades", () => {
    const catalog = withStations((s) => {
      // estacion-02 (left, 50, w20) y estacion-01 (left, 200, w35); se mueve 02 a 200.
      s[1]!.placement = { ...s[1]!.placement, position: 200 };
    });
    expect(codes(catalog)).toContain("overlap");
  });

  it("rechaza números no finitos", () => {
    const catalog = withStations((s) => {
      s[0]!.image.width = Number.NaN;
    });
    expect(codes(catalog)).toContain("number");
  });

  it("rechaza tamaños no positivos", () => {
    const catalog = withStations((s) => {
      s[0]!.placement.width = 0;
    });
    expect(codes(catalog)).toContain("number");
  });

  it("rechaza subtítulos en una estación de audio", () => {
    const catalog = withStations((s) => {
      s[0]!.captions = { src: "media/captions/01.vtt", lang: "es" };
    });
    expect(codes(catalog)).toContain("captions-type");
  });

  it("rechaza una entrada que no es un objeto", () => {
    expect(codes(null)).toContain("shape");
  });
});
