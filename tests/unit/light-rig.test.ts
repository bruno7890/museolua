import { describe, expect, it } from "vitest";
import { createLightRig } from "../../src/scene/light-rig.ts";
import { PALETTE } from "../../src/scene/palette.ts";

const giro = (rig: { group: { children: { rotation: { y: number } }[] } }) =>
  rig.group.children.map((c) => c.rotation.y);

describe("luces de fiesta", () => {
  it("hay una luz por cada neón de la paleta", () => {
    const rig = createLightRig(PALETTE.neon);
    expect(rig.group.children).toHaveLength(PALETTE.neon.length);
    rig.dispose();
  });

  it("las luces giran con el tiempo", () => {
    const rig = createLightRig(PALETTE.neon);
    const antes = giro(rig);
    rig.update(0.5);
    expect(giro(rig)).not.toEqual(antes);
    rig.dispose();
  });

  it("se quedan quietas si el sistema pide movimiento reducido", () => {
    const rig = createLightRig(PALETTE.neon);
    rig.setReducedMotion(true);
    const antes = giro(rig);
    rig.update(2);
    expect(giro(rig)).toEqual(antes);
    rig.dispose();
  });

  it("no usan luces reales: son capas translúcidas (barato en el móvil)", () => {
    const rig = createLightRig(PALETTE.neon);
    let luces = 0;
    rig.group.traverse((o) => {
      if ((o as { isLight?: boolean }).isLight) luces++;
    });
    expect(luces).toBe(0);
    rig.dispose();
  });
});
