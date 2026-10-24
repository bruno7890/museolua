import { describe, expect, it } from "vitest";
import { validateDecorations } from "../../src/content/validate.ts";
import { decorationsFixture, existingPathsFixture, stationsFixture } from "../fixtures/catalog.ts";

const demo = { mode: "demo" as const, existingPaths: existingPathsFixture() };
const stationPlacements = stationsFixture().stations.map((s) => s.placement);

function codes(input: unknown): string[] {
  return validateDecorations(input, demo, stationPlacements).issues.map((i) => i.code);
}

describe("validateDecorations", () => {
  it("acepta alfombra y cinco paneles de referencia", () => {
    expect(validateDecorations(decorationsFixture(), demo).issues).toEqual([]);
  });

  it("exige exactamente seis decoraciones (alfombra y cinco paneles)", () => {
    const catalog = decorationsFixture();
    catalog.decorations.pop();
    expect(codes(catalog)).toContain("count");
  });

  it("rechaza un panel colocado fuera de la esquina de la sala", () => {
    const catalog = decorationsFixture();
    catalog.decorations[1]!.placement = { wall: "left", position: -240, width: 24, centerY: 20 };
    expect(codes(catalog)).toContain("bounds");
  });

  it("nunca permite decoraciones interactivas", () => {
    const catalog = decorationsFixture();
    (catalog.decorations[1] as { interactive: boolean }).interactive = true;
    expect(codes(catalog)).toContain("interactive");
  });

  it("un panel no puede solaparse con una estación del mismo muro", () => {
    const catalog = decorationsFixture();
    // estacion-02 está en left, posición 50, ancho 20; el panel se coloca encima.
    catalog.decorations[1]!.placement = { wall: "left", position: 55, width: 24, centerY: 20 };
    expect(codes(catalog)).toContain("overlap");
  });

  it("valida que la alfombra tenga tamaño positivo y ángulos finitos", () => {
    const catalog = decorationsFixture();
    catalog.decorations[0]!.transform = { position: [0, 0, 0], rotationDegrees: [Number.NaN, 0, 0], size: [0, 70] };
    const found = codes(catalog);
    expect(found).toContain("number");
  });
});
