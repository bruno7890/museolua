import { describe, expect, it } from "vitest";
import { approachTargetFor, clampPitch, stepApproach, type Pose } from "../../src/scene/approach.ts";

const start: Pose = { x: 0, y: 0, z: 195, yaw: 0, pitch: 0 };

describe("approachTargetFor", () => {
  it("se sitúa a la distancia indicada, mirando al muro (valores de la referencia)", () => {
    expect(approachTargetFor({ wall: "left", position: 200 }, 50)).toEqual({ x: -319, z: 200, yaw: Math.PI / 2 });
    expect(approachTargetFor({ wall: "right", position: -50 }, 50)).toEqual({ x: -1, z: -50, yaw: -Math.PI / 2 });
    expect(approachTargetFor({ wall: "front", position: -80 }, 50)).toEqual({ x: -80, z: -179, yaw: 0 });
    expect(approachTargetFor({ wall: "back", position: 0 }, 50)).toEqual({ x: 0, z: 219, yaw: Math.PI });
  });
});

describe("stepApproach", () => {
  it("converge a la meta sin pasarse", () => {
    let pose = { ...start };
    const target = { x: 0, z: 100, yaw: 0 };
    for (let i = 0; i < 600; i++) pose = stepApproach(pose, target, 6, 1 / 60);
    expect(pose.z).toBeCloseTo(100, 1);
    expect(pose.z).toBeGreaterThanOrEqual(100 - 1e-6);
  });

  it("gira por el camino corto entre ángulos (de cerca de π a cerca de -π)", () => {
    const pose = { ...start, yaw: 3.1 };
    const next = stepApproach(pose, { x: 0, z: 195, yaw: -3.1 }, 6, 1 / 60);
    // Debe aumentar hacia π, no retroceder hacia 0.
    expect(next.yaw).toBeGreaterThan(3.1);
  });

  it("no cambia la pose si ya está en la meta", () => {
    const target = { x: 0, z: 195, yaw: 0 };
    expect(stepApproach({ ...start }, target, 6, 1 / 60)).toEqual({ ...start });
  });
});

describe("clampPitch", () => {
  it("limita la inclinación al ángulo configurado", () => {
    const limit = (35 * Math.PI) / 180;
    expect(clampPitch(2, 35)).toBeCloseTo(limit, 9);
    expect(clampPitch(-2, 35)).toBeCloseTo(-limit, 9);
    expect(clampPitch(0.1, 35)).toBeCloseTo(0.1, 9);
  });
});
