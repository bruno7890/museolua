import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { DecorationCatalog } from "../../src/content/types.ts";

// Contenido real de la sala: los paneles laterales ya no son marcadores.
const PUBLIC = path.resolve("public");
const decorations = JSON.parse(readFileSync(path.join(PUBLIC, "data/decorations.json"), "utf8")) as DecorationCatalog;

describe("paneles laterales con ilustraciones", () => {
  const paneles = decorations.decorations.filter((d) => d.kind === "wall-image");

  it("hay cuatro paneles y todos usan una ilustración, no un marcador", () => {
    expect(paneles).toHaveLength(4);
    for (const d of paneles) {
      expect(d.image.placeholder, d.id).toBe(false);
    }
  });

  it("cada panel apunta a un archivo que existe en public/", () => {
    for (const d of paneles) {
      expect(existsSync(path.join(PUBLIC, d.image.src)), d.image.src).toBe(true);
    }
  });

  it("cada panel tiene una descripción accesible propia", () => {
    for (const d of paneles) {
      expect(d.image.alt.length, d.id).toBeGreaterThan(10);
      expect(d.image.alt, d.id).not.toMatch(/marcador/i);
    }
  });
});
