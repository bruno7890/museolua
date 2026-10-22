// Marcos de estación: cada cuadro es una imagen en un muro, con borde morado.
// Las texturas se cargan bajo demanda; si fallan, el marco queda con color neutro (EC-11).

import * as THREE from "three";
import type { Station } from "../content/types.ts";
import { OFFSET_BORDER, OFFSET_IMAGE, heightFor, placeOnWall } from "./wall-placement.ts";
import { COLORS } from "./room.ts";

export interface StationFrame {
  stationId: string;
  station: Station;
  /** Malla seleccionable (solo la imagen; el borde no es seleccionable). */
  mesh: THREE.Mesh;
  loadState: "pending" | "loaded" | "failed";
}

export interface FramesHandle {
  frames: StationFrame[];
  pickables: THREE.Object3D[];
  dispose(): void;
}

const PLACEHOLDER = 0xf8f5fc;

export function buildStationFrames(
  stations: readonly Station[],
  baseUrl: string,
  onLoaded: () => void = () => {},
  loader: THREE.TextureLoader = new THREE.TextureLoader(),
): FramesHandle {
  const frames: StationFrame[] = [];
  const textures: THREE.Texture[] = [];
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  for (const s of stations) {
    if (!s.enabled) continue;
    const w = s.placement.width;
    const h = heightFor(w, s.image.width, s.image.height);

    const borderGeo = new THREE.PlaneGeometry(w + 3, h + 3);
    const borderMat = new THREE.MeshBasicMaterial({ color: COLORS.wall });
    const border = new THREE.Mesh(borderGeo, borderMat);
    placeOnWall(border, s.placement.wall, s.placement.position, s.placement.centerY, OFFSET_BORDER);

    const imgGeo = new THREE.PlaneGeometry(w, h);
    const imgMat = new THREE.MeshBasicMaterial({ color: PLACEHOLDER, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(imgGeo, imgMat);
    mesh.name = `frame:${s.id}`;
    mesh.userData = { stationId: s.id };
    placeOnWall(mesh, s.placement.wall, s.placement.position, s.placement.centerY, OFFSET_IMAGE);

    geometries.push(borderGeo, imgGeo);
    materials.push(borderMat, imgMat);

    const frame: StationFrame = { stationId: s.id, station: s, mesh, loadState: "pending" };
    frames.push(frame);

    const url = new URL(s.image.src, baseUrl).href;
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 2;
        textures.push(tex);
        imgMat.map = tex;
        imgMat.color.set(0xffffff);
        imgMat.needsUpdate = true;
        frame.loadState = "loaded";
        onLoaded();
      },
      undefined,
      () => {
        frame.loadState = "failed";
        imgMat.color.set(COLORS.floor); // neutro: el cuadro existe, la imagen no
        onLoaded();
      },
    );

    // El borde se añade al grupo a través de userData para que la escena lo recoja.
    mesh.userData.border = border;
  }

  return {
    frames,
    pickables: frames.map((f) => f.mesh),
    dispose() {
      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
      for (const t of textures) t.dispose();
    },
  };
}

/** Añade al grupo las mallas de marco y borde (el borde no es seleccionable). */
export function addFramesToGroup(group: THREE.Group, handle: FramesHandle): void {
  for (const f of handle.frames) {
    group.add(f.mesh);
    const border = f.mesh.userData.border as THREE.Object3D | undefined;
    if (border) group.add(border);
  }
}
