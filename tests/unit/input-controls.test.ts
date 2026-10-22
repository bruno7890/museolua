import { describe, expect, it } from "vitest";
import { joystickVector } from "../../src/controls/joystick.ts";
import { createGesture, isTapGesture, updateGesture } from "../../src/controls/pointer-look.ts";

describe("joystickVector", () => {
  it("el centro produce cero", () => {
    expect(joystickVector(0, 0, 56)).toEqual({ x: 0, y: 0 });
  });

  it("dentro de la zona muerta (12 %) produce cero", () => {
    expect(joystickVector(5, 0, 56)).toEqual({ x: 0, y: 0 });
  });

  it("fuera del radio se recorta a magnitud 1; arriba es avance (y positivo)", () => {
    const v = joystickVector(0, -200, 56);
    expect(v.x).toBeCloseTo(0, 6);
    expect(v.y).toBeCloseTo(1, 6);
  });

  it("la magnitud nunca supera 1, también en diagonal", () => {
    const v = joystickVector(300, 300, 56);
    expect(Math.hypot(v.x, v.y)).toBeLessThanOrEqual(1 + 1e-9);
  });
});

describe("gestos de puntero", () => {
  it("un toque sin movimiento es tap", () => {
    const g = createGesture(100, 100);
    updateGesture(g, 101, 102);
    expect(isTapGesture(g)).toBe(true);
  });

  it("superar 8 px convierte el gesto en arrastre", () => {
    const g = createGesture(100, 100);
    updateGesture(g, 120, 100);
    expect(isTapGesture(g)).toBe(false);
  });

  it("un arrastre que vuelve al origen nunca se convierte en tap", () => {
    const g = createGesture(100, 100);
    updateGesture(g, 130, 100);
    updateGesture(g, 100, 100);
    expect(isTapGesture(g)).toBe(false);
  });

  it("devuelve el incremento desde el último punto para girar", () => {
    const g = createGesture(100, 100);
    const d = updateGesture(g, 110, 95);
    expect(d).toEqual({ dx: 10, dy: -5 });
  });
});
