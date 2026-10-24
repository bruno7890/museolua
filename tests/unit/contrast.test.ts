import { describe, expect, it } from "vitest";

// Contraste WCAG 2 de la interfaz (tema oscuro con neones). Los fondos con transparencia
// se mezclan con lo que tienen debajo, en el peor caso. La paleta de la sala 3D se prueba
// en scene-palette.test.ts.

const lum = (hex: string): number => {
  const canales = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = canales.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
};

function mezcla(frente: string, fondo: string, alfa: number): string {
  const f = [1, 3, 5].map((i) => parseInt(frente.slice(i, i + 2), 16));
  const b = [1, 3, 5].map((i) => parseInt(fondo.slice(i, i + 2), 16));
  return "#" + f.map((v, i) => Math.round(v * alfa + b[i]! * (1 - alfa)).toString(16).padStart(2, "0")).join("");
}

function contraste(a: string, b: string): number {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const BG = "#0b0716";
const SURFACE = "#1b1033";
const TEXT = "#f3eeff";
const MAGENTA = "#ff2fb9";
const CYAN = "#23e5ff";
const ON_NEON = "#0b0716";

describe("contraste de la interfaz (WCAG 2 AA, texto normal ≥ 4,5:1)", () => {
  it("texto claro sobre el fondo y sobre los paneles", () => {
    expect(contraste(TEXT, BG)).toBeGreaterThanOrEqual(4.5);
    expect(contraste(TEXT, SURFACE)).toBeGreaterThanOrEqual(4.5);
  });

  it("barra y ayuda del museo sobre la escena, en el peor caso de color", () => {
    for (const color of [MAGENTA, CYAN, "#ffe94a", "#2a1b4d"]) {
      expect(contraste(TEXT, mezcla(BG, color, 0.92))).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("botones de neón: letra oscura, nunca blanca", () => {
    expect(contraste(ON_NEON, MAGENTA)).toBeGreaterThanOrEqual(4.5);
    expect(contraste(ON_NEON, CYAN)).toBeGreaterThanOrEqual(4.5);
    // La letra blanca sobre magenta no llegaría: por eso no se usa.
    expect(contraste("#ffffff", MAGENTA)).toBeLessThan(4.5);
  });

  it("mensajes de error sobre su fondo oscuro", () => {
    expect(contraste(TEXT, "#4a1030")).toBeGreaterThanOrEqual(4.5);
  });
});
