// Sala de la referencia (lrusso/3DArtMuseum): suelo, techo y cuatro muros con sus coordenadas.
// Materiales sin iluminación (MeshBasicMaterial) para mantener el coste bajo en móviles.

import * as THREE from "three";
import { WALL_COORD } from "./approach.ts";
import type { Rect } from "../controls/navigation.ts";

export interface RoomParts {
  group: THREE.Group;
  dispose(): void;
}

const FLOOR_Y = -40;
const CEIL_Y = 47;
const WALL_HEIGHT = 90;
const WALL_CENTER_Y = 5;
const WALL_LENGTH = 600;
const EPS = 0.5; // separación para evitar parpadeo con objetos pegados al muro

export const COLORS = {
  floor: 0xd5cfd5, // gris cálido
  wall: 0xc7b5e8, // morado claro
  ceiling: 0xf8f5fc, // blanco lavanda
} as const;

export function buildRoom(): RoomParts {
  const group = new THREE.Group();
  group.name = "room";

  const floorMat = new THREE.MeshBasicMaterial({ color: COLORS.floor, side: THREE.DoubleSide });
  const ceilMat = new THREE.MeshBasicMaterial({ color: COLORS.ceiling, side: THREE.DoubleSide });
  const wallMat = new THREE.MeshBasicMaterial({ color: COLORS.wall, side: THREE.DoubleSide });

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(420, 500), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set((WALL_COORD.left + WALL_COORD.right) / 2, FLOOR_Y, (WALL_COORD.front + WALL_COORD.back) / 2);

  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(420, 500), ceilMat);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set((WALL_COORD.left + WALL_COORD.right) / 2, CEIL_Y, (WALL_COORD.front + WALL_COORD.back) / 2);

  // Muros: mismas posiciones que la referencia. Frente y fondo girados sobre el eje Y.
  const walls: THREE.Mesh[] = [];
  const addWall = (x: number, z: number, rotY: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(WALL_LENGTH, WALL_HEIGHT), wallMat);
    m.position.set(x, WALL_CENTER_Y, z);
    m.rotation.y = rotY;
    walls.push(m);
  };
  addWall(WALL_COORD.left, 0, Math.PI / 2);
  addWall(WALL_COORD.right, 0, Math.PI / 2);
  addWall(-150, WALL_COORD.front, 0);
  addWall(-150, WALL_COORD.back, 0);

  group.add(floor, ceil, ...walls);

  return {
    group,
    dispose() {
      for (const m of [floor, ceil, ...walls]) m.geometry.dispose();
      floorMat.dispose();
      ceilMat.dispose();
      wallMat.dispose();
    },
  };
}

/** Obstáculos para la colisión: no hay mobiliario en el MVP; los cuadros se añaden por separado. */
export function roomObstacles(): Rect[] {
  return [];
}

export { EPS };
