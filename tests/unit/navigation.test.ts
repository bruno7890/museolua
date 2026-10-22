import { describe, expect, it } from "vitest";
import { ROOM_BOUNDS, stepPosition, type Rect } from "../../src/controls/navigation.ts";

const RADIUS = 12;

describe("stepPosition", () => {
  it("no mueve si la dirección es cero", () => {
    expect(stepPosition({ x: 0, z: 0 }, { x: 0, z: 0 }, 60, 0.1, ROOM_BOUNDS, RADIUS, [])).toEqual({ x: 0, z: 0 });
  });

  it("avanza velocidad × dt en la dirección indicada", () => {
    const p = stepPosition({ x: 0, z: 0 }, { x: 0, z: -1 }, 60, 0.5, ROOM_BOUNDS, RADIUS, []);
    expect(p.x).toBeCloseTo(0, 6);
    expect(p.z).toBeCloseTo(-30, 6);
  });

  it("normaliza la diagonal para que no sea más rápida", () => {
    const p = stepPosition({ x: 0, z: 0 }, { x: 1, z: 1 }, 10, 1, ROOM_BOUNDS, RADIUS, []);
    expect(Math.hypot(p.x, p.z)).toBeCloseTo(10, 6);
  });

  it("llega hasta el muro sin atravesarlo, descontando el radio", () => {
    const p = stepPosition({ x: 30, z: 0 }, { x: 1, z: 0 }, 600, 1, ROOM_BOUNDS, RADIUS, []);
    expect(p.x).toBeCloseTo(ROOM_BOUNDS.maxX - RADIUS, 6);
  });

  it("no atraviesa un obstáculo y se desliza junto a él", () => {
    const panel: Rect = { minX: -10, maxX: 10, minZ: 20, maxZ: 40 };
    // Avanza hacia +z contra el obstáculo; debe frenar antes de entrar.
    const p = stepPosition({ x: 0, z: 0 }, { x: 0, z: 1 }, 600, 1, ROOM_BOUNDS, RADIUS, [panel]);
    expect(p.z).toBeLessThan(panel.minZ - RADIUS + 1e-9);
  });

  it("permite deslizarse en diagonal cuando solo una componente está bloqueada", () => {
    const panel: Rect = { minX: -10, maxX: 10, minZ: 20, maxZ: 40 };
    const p = stepPosition({ x: 0, z: 0 }, { x: 1, z: 1 }, 60, 0.5, ROOM_BOUNDS, RADIUS, [panel]);
    expect(p.x).toBeGreaterThan(0);
  });
});
