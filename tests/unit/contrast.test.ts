import { describe, expect, it } from "vitest";

// Contraste WCAG 2 (relación de luminancias). Los colores de fondo con transparencia
// se mezclan con el fondo que tienen debajo, en el peor caso de la escena.

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

const PLUM = "#30263d";
const LAVENDER = "#f8f5fc";
const VIOLET = "#654397";
const WHITE = "#ffffff";

describe("contraste de la paleta (WCAG 2 AA, texto normal ≥ 4.5:1)", () => {
  it("texto principal sobre la entrada, con sus degradados", () => {
    expect(contraste(PLUM, LAVENDER)).toBeGreaterThanOrEqual(4.5);
    expect(contraste(PLUM, mezcla("#c7b5e8", LAVENDER, 0.55))).toBeGreaterThanOrEqual(4.5);
    expect(contraste(PLUM, mezcla("#f2aa9b", LAVENDER, 0.5))).toBeGreaterThanOrEqual(4.5);
  });

  it("barra y ayuda del museo sobre la escena, en el peor caso de color", () => {
    for (const color of ["#654397", "#c7b5e8", "#f2aa9b", "#d5cfd5"]) {
      expect(contraste(PLUM, mezcla(LAVENDER, color, 0.9))).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("botones principales con texto blanco", () => {
    expect(contraste(WHITE, VIOLET)).toBeGreaterThanOrEqual(4.5);
    expect(contraste(WHITE, "#7e57b5")).toBeGreaterThanOrEqual(4.5);
  });

  it("mensajes de error sobre su fondo", () => {
    expect(contraste(PLUM, "#fbe3dc")).toBeGreaterThanOrEqual(4.5);
  });
});
