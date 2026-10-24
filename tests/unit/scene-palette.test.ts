import { describe, expect, it } from "vitest";
import { PALETTE } from "../../src/scene/palette.ts";

const lum = (hex: string): number => {
  const canales = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = canales.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
};

function contraste(a: string, b: string): number {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

describe("paleta de la sala", () => {
  it("la sala es oscura: pared, techo y suelo por debajo de 0,2 de luminancia", () => {
    for (const color of [PALETTE.wall, PALETTE.ceiling, PALETTE.floor]) {
      expect(lum(color), color).toBeLessThan(0.2);
    }
  });

  it("el texto claro se lee sobre el fondo y sobre la pared (≥ 4,5:1)", () => {
    expect(contraste(PALETTE.text, PALETTE.background)).toBeGreaterThanOrEqual(4.5);
    expect(contraste(PALETTE.text, PALETTE.wall)).toBeGreaterThanOrEqual(4.5);
  });

  it("los tres neones se distinguen sobre la pared (≥ 3:1)", () => {
    expect(PALETTE.neon).toHaveLength(3);
    for (const color of PALETTE.neon) {
      expect(contraste(color, PALETTE.wall), color).toBeGreaterThanOrEqual(3);
    }
  });

  it("ya no queda salmón ni lila pastel", () => {
    const valores = [PALETTE.background, PALETTE.wall, PALETTE.floor, PALETTE.ceiling, PALETTE.text, ...PALETTE.neon].map((v) => v.toLowerCase());
    for (const viejo of ["#f2aa9b", "#c7b5e8", "#f8f5fc", "#d5cfd5", "#f2aa9b"]) {
      expect(valores, viejo).not.toContain(viejo);
    }
  });

  it("permite elegir el neón de una pieza por su índice", () => {
    expect(PALETTE.neonAt(0)).toBe(PALETTE.neon[0]);
    expect(PALETTE.neonAt(3)).toBe(PALETTE.neon[0]);
    expect(PALETTE.neonAt(4)).toBe(PALETTE.neon[1]);
  });
});
