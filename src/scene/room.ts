// Sala de la referencia (lrusso/3DArtMuseum): suelo, techo y cuatro muros con sus coordenadas.
// Materiales sin iluminación (MeshBasicMaterial) para mantener el coste bajo en móviles.

import * as THREE from "three";
import { WALL_COORD } from "./approach.ts";
import { COLORS } from "./palette.ts";
import type { Rect } from "../controls/navigation.ts";

export interface RoomParts {
  group: THREE.Group;
  dispose(): void;
}

export interface RoomOptions {
  baseUrl?: string;
  /** Ilustración que cubre el techo (se ve al entrar y mirar hacia arriba). */
  ceilingImage?: { src: string; width: number; height: number } | undefined;
}

const FLOOR_Y = -40;
const CEIL_Y = 47;
const CEIL_WIDTH = 420;
const CEIL_DEPTH = 500;
const WALL_HEIGHT = 90;
const WALL_CENTER_Y = 5;
const WALL_LENGTH = 600;
const EPS = 0.5; // separación para evitar parpadeo con objetos pegados al muro

export { COLORS };

export function buildRoom(
  opts: RoomOptions = {},
  loader: THREE.TextureLoader = new THREE.TextureLoader(),
): RoomParts {
  const group = new THREE.Group();
  group.name = "room";

  const extraGeometries: THREE.BufferGeometry[] = [];
  const extraMaterials: THREE.Material[] = [];
  const extraTextures: THREE.Texture[] = [];

  const floorMat = new THREE.MeshBasicMaterial({ color: COLORS.floor, side: THREE.DoubleSide });
  const ceilMat = new THREE.MeshBasicMaterial({ color: COLORS.ceiling, side: THREE.DoubleSide });
  const wallMat = new THREE.MeshBasicMaterial({ color: COLORS.wall, side: THREE.DoubleSide });

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(CEIL_WIDTH, CEIL_DEPTH), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set((WALL_COORD.left + WALL_COORD.right) / 2, FLOOR_Y, (WALL_COORD.front + WALL_COORD.back) / 2);

  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(CEIL_WIDTH, CEIL_DEPTH), ceilMat);
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

  // Ilustración del techo: cubre el techo entero (recorta por los lados si hace falta).
  if (opts.ceilingImage) {
    const { src, width: imgWidth, height: imgHeight } = opts.ceilingImage;
    // Cubre con un pelín de margen: evita costuras por redondeo en los bordes del techo.
    const cubrir = Math.max(CEIL_WIDTH / Math.max(1, imgWidth), CEIL_DEPTH / Math.max(1, imgHeight));
    const escala = cubrir * 1.001;
    const geo = new THREE.PlaneGeometry(imgWidth * escala, imgHeight * escala);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const imagen = new THREE.Mesh(geo, mat);
    imagen.name = "techo-imagen";
    imagen.rotation.x = Math.PI / 2;
    imagen.position.set((WALL_COORD.left + WALL_COORD.right) / 2, CEIL_Y - 0.2, (WALL_COORD.front + WALL_COORD.back) / 2);
    group.add(imagen);
    extraGeometries.push(geo);
    extraMaterials.push(mat);

    loader.load(
      new URL(src, opts.baseUrl ?? "/").href,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        extraTextures.push(tex);
        mat.map = tex;
        mat.needsUpdate = true;
      },
      undefined,
      () => {
        // Si falta la imagen, el techo se queda oscuro: no se ve un rectángulo blanco.
        mat.color.set(COLORS.ceiling);
      },
    );
  }

  return {
    group,
    dispose() {
      for (const m of [floor, ceil, ...walls]) m.geometry.dispose();
      floorMat.dispose();
      ceilMat.dispose();
      wallMat.dispose();
      for (const g of extraGeometries) g.dispose();
      for (const m of extraMaterials) m.dispose();
      for (const t of extraTextures) t.dispose();
    },
  };
}

/** Obstáculos para la colisión: no hay mobiliario en el MVP; los cuadros se añaden por separado. */
export function roomObstacles(): Rect[] {
  return [];
}

export { EPS };
