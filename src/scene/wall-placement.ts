// Colocación en muros con las coordenadas de la referencia. Compartido por cuadros y paneles.

import * as THREE from "three";
import type { Wall } from "../content/types.ts";
import { WALL_COORD } from "./approach.ts";

/** Separación desde el muro para evitar parpadeo (z-fighting). */
export const OFFSET_BORDER = 0.2;
export const OFFSET_IMAGE = 0.6;

export interface WallPose {
  x: number;
  z: number;
  rotationY: number;
  /** Vector hacia el interior de la sala (normal del muro). */
  normal: { x: number; z: number };
}

export function wallPose(wall: Wall, position: number): WallPose {
  switch (wall) {
    case "left":
      return { x: WALL_COORD.left, z: position, rotationY: Math.PI / 2, normal: { x: 1, z: 0 } };
    case "right":
      return { x: WALL_COORD.right, z: position, rotationY: -Math.PI / 2, normal: { x: -1, z: 0 } };
    case "front":
      return { x: position, z: WALL_COORD.front, rotationY: 0, normal: { x: 0, z: 1 } };
    case "back":
      return { x: position, z: WALL_COORD.back, rotationY: Math.PI, normal: { x: 0, z: -1 } };
  }
}

/** Sitúa un objeto plano sobre el muro, desplazado `offset` hacia el interior. */
export function placeOnWall(obj: THREE.Object3D, wall: Wall, position: number, centerY: number, offset: number): void {
  const p = wallPose(wall, position);
  obj.position.set(p.x + p.normal.x * offset, centerY, p.z + p.normal.z * offset);
  obj.rotation.set(0, p.rotationY, 0);
}

/** Altura de un plano de anchura dada conservando la proporción de la imagen. */
export function heightFor(width: number, imgWidth: number, imgHeight: number): number {
  if (imgWidth <= 0) return width;
  return (width * imgHeight) / imgWidth;
}
