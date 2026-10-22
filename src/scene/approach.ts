// Aproximación a un cuadro y límites de inclinación. Matemática pura, sin Three.js.
// Convención de yaw de Three.js: forward = (-sin(yaw), 0, -cos(yaw)).
// Valores de la referencia: izquierda yaw π/2, derecha -π/2, frente 0, fondo π.

import type { StationPlacement } from "../content/types.ts";

export interface Pose {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
}

export interface ApproachTarget {
  x: number;
  z: number;
  yaw: number;
}

/** Muros de la referencia (coordenada fija del muro). */
export const WALL_COORD = {
  left: -369,
  right: 49,
  front: -229,
  back: 269,
} as const;

export function approachTargetFor(placement: Pick<StationPlacement, "wall" | "position">, distance: number): ApproachTarget {
  const p = placement.position;
  switch (placement.wall) {
    case "left":
      return { x: WALL_COORD.left + distance, z: p, yaw: Math.PI / 2 };
    case "right":
      return { x: WALL_COORD.right - distance, z: p, yaw: -Math.PI / 2 };
    case "front":
      return { x: p, z: WALL_COORD.front + distance, yaw: 0 };
    case "back":
      return { x: p, z: WALL_COORD.back - distance, yaw: Math.PI };
  }
}

function shortestAngle(from: number, to: number): number {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/** Paso con amortiguación temporal: independiente de los FPS (decisión D-08). */
export function stepApproach(pose: Pose, target: ApproachTarget, rate: number, dt: number): Pose {
  const a = 1 - Math.exp(-rate * dt);
  const dx = target.x - pose.x;
  const dz = target.z - pose.z;
  const dyaw = shortestAngle(pose.yaw, target.yaw);
  if (Math.hypot(dx, dz) < 0.05 && Math.abs(dyaw) < 0.001) {
    return { ...pose, x: target.x, z: target.z, yaw: target.yaw };
  }
  return {
    ...pose,
    x: pose.x + dx * a,
    z: pose.z + dz * a,
    yaw: pose.yaw + dyaw * a,
  };
}

export function clampPitch(pitch: number, limitDegrees: number): number {
  const limit = (limitDegrees * Math.PI) / 180;
  return Math.max(-limit, Math.min(limit, pitch));
}
