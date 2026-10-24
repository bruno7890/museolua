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
const MOLDURA = 3; // ancho de la moldura exterior, en unidades de la sala
const MOLDURA_COLOR = 0x30263d; // ciruela de la paleta
const ACENTO = 1.5; // franja salmón entre la moldura y la imagen
const ACENTO_COLOR = 0xf2aa9b; // salmón de la paleta

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

    // Molduras de galería: capa exterior morada y acento salmón justo alrededor de la imagen.
    const molduraGeo = new THREE.PlaneGeometry(w + MOLDURA * 2, h + MOLDURA * 2);
    const molduraMat = new THREE.MeshBasicMaterial({ color: MOLDURA_COLOR });
    const molduraExterior = new THREE.Mesh(molduraGeo, molduraMat);
    const acentoGeo = new THREE.PlaneGeometry(w + ACENTO * 2, h + ACENTO * 2);
    const acentoMat = new THREE.MeshBasicMaterial({ color: ACENTO_COLOR });
    const acento = new THREE.Mesh(acentoGeo, acentoMat);
    const border = new THREE.Group();
    border.name = `moldura:${s.id}`;
    placeOnWall(molduraExterior, s.placement.wall, s.placement.position, s.placement.centerY, OFFSET_BORDER);
    placeOnWall(acento, s.placement.wall, s.placement.position, s.placement.centerY, OFFSET_BORDER + 0.1);
    border.add(molduraExterior, acento);

    const imgGeo = new THREE.PlaneGeometry(w, h);
    const imgMat = new THREE.MeshBasicMaterial({ color: PLACEHOLDER, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(imgGeo, imgMat);
    mesh.name = `frame:${s.id}`;
    mesh.userData = { stationId: s.id };
    placeOnWall(mesh, s.placement.wall, s.placement.position, s.placement.centerY, OFFSET_IMAGE);

    geometries.push(molduraGeo, acentoGeo, imgGeo);
    materials.push(molduraMat, acentoMat, imgMat);

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
