// Matemática pura de desplazamiento: límites de sala y obstáculos (paneles y cuadros).
// Unidades de escena de la referencia (contracts/runtime-modules.md).

export interface Bounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface Rect {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

/** Interior de la sala: muros de la referencia en x ∈ [-369, 49] y z ∈ [-229, 269]. */
export const ROOM_BOUNDS: Bounds = { minX: -369, maxX: 49, minZ: -229, maxZ: 269 };

function blockedByObstacle(x: number, z: number, radius: number, obstacles: readonly Rect[]): boolean {
  for (const o of obstacles) {
    if (x > o.minX - radius && x < o.maxX + radius && z > o.minZ - radius && z < o.maxZ + radius) return true;
  }
  return false;
}

/**
 * Avanza un paso. Si el movimiento completo está bloqueado intenta deslizar
 * por cada eje por separado, de modo que no se atraviesan muros ni obstáculos.
 */
export function stepPosition(
  pos: { x: number; z: number },
  dir: { x: number; z: number },
  speed: number,
  dt: number,
  bounds: Bounds,
  radius: number,
  obstacles: readonly Rect[],
): { x: number; z: number } {
  const len = Math.hypot(dir.x, dir.z);
  if (len === 0) return { x: pos.x, z: pos.z };
  const d = speed * dt;
  const nx = dir.x / len;
  const nz = dir.z / len;

  // Subdivide el desplazamiento para que un paso grande no atraviese obstáculos finos.
  const maxSub = Math.max(0.25, radius / 4);
  const subs = Math.min(64, Math.max(1, Math.ceil(d / maxSub)));
  const sd = d / subs;

  let p = { x: pos.x, z: pos.z };
  for (let i = 0; i < subs; i++) p = moveOnce(p, nx * sd, nz * sd, bounds, radius, obstacles);
  return p;
}

function moveOnce(
  pos: { x: number; z: number },
  dx: number,
  dz: number,
  bounds: Bounds,
  radius: number,
  obstacles: readonly Rect[],
): { x: number; z: number } {
  // Recorta al interior de la sala para llegar hasta el muro en lugar de frenar antes.
  const cx = (v: number) => Math.min(bounds.maxX - radius, Math.max(bounds.minX + radius, v));
  const cz = (v: number) => Math.min(bounds.maxZ - radius, Math.max(bounds.minZ + radius, v));

  const full = { x: cx(pos.x + dx), z: cz(pos.z + dz) };
  if (!blockedByObstacle(full.x, full.z, radius, obstacles)) return full;

  const onlyX = { x: cx(pos.x + dx), z: pos.z };
  if (!blockedByObstacle(onlyX.x, onlyX.z, radius, obstacles)) return onlyX;

  const onlyZ = { x: pos.x, z: cz(pos.z + dz) };
  if (!blockedByObstacle(onlyZ.x, onlyZ.z, radius, obstacles)) return onlyZ;

  return pos;
}
