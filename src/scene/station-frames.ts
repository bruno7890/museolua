// Marcos de estación: cada cuadro es una imagen en un muro, con molduras de galería.
// Si la estación tiene pantalla de fondo (`backdrop`), la portada se ve encima de esa imagen,
// más pequeña y centrada, como una pantalla dentro de la sala.
// Las texturas se cargan bajo demanda; si fallan, el marco queda con color neutro (EC-11).

import * as THREE from "three";
import type { Station } from "../content/types.ts";
import { OFFSET_BORDER, OFFSET_IMAGE, heightFor, placeOnWall } from "./wall-placement.ts";
import { COLORS } from "./room.ts";

export interface StationFrame {
  stationId: string;
  station: Station;
  /** Malla seleccionable: la portada (con pantalla de fondo, la portada encima de ella). */
  mesh: THREE.Mesh;
  /** Pantalla de fondo, si la estación la tiene. También es seleccionable. */
  backdrop: THREE.Mesh | undefined;
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
const COVER_SCALE = 0.6; // la portada ocupa el 60 % del ancho de la pantalla de fondo

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
    const conPantalla = s.backdrop !== undefined;
    // Altura del conjunto: la pantalla de fondo si la hay; si no, la propia portada.
    const alto = conPantalla ? heightFor(w, s.backdrop!.width, s.backdrop!.height) : heightFor(w, s.image.width, s.image.height);
    const anchoPortada = conPantalla ? w * COVER_SCALE : w;
    const altoPortada = heightFor(anchoPortada, s.image.width, s.image.height);

    // Molduras de galería: capa exterior morada y acento salmón alrededor del conjunto.
    const molduraGeo = new THREE.PlaneGeometry(w + MOLDURA * 2, alto + MOLDURA * 2);
    const molduraMat = new THREE.MeshBasicMaterial({ color: MOLDURA_COLOR });
    const molduraExterior = new THREE.Mesh(molduraGeo, molduraMat);
    const acentoGeo = new THREE.PlaneGeometry(w + ACENTO * 2, alto + ACENTO * 2);
    const acentoMat = new THREE.MeshBasicMaterial({ color: ACENTO_COLOR });
    const acento = new THREE.Mesh(acentoGeo, acentoMat);
    const border = new THREE.Group();
    border.name = `moldura:${s.id}`;
    placeOnWall(molduraExterior, s.placement.wall, s.placement.position, s.placement.centerY, OFFSET_BORDER);
    placeOnWall(acento, s.placement.wall, s.placement.position, s.placement.centerY, OFFSET_BORDER + 0.1);
    border.add(molduraExterior, acento);
    geometries.push(molduraGeo, acentoGeo);
    materials.push(molduraMat, acentoMat);

    // Pantalla de fondo: a todo el ancho del conjunto, detrás de la portada.
    let backdrop: THREE.Mesh | undefined;
    if (conPantalla) {
      const fondoGeo = new THREE.PlaneGeometry(w, alto);
      const fondoMat = new THREE.MeshBasicMaterial({ color: PLACEHOLDER, side: THREE.DoubleSide });
      backdrop = new THREE.Mesh(fondoGeo, fondoMat);
      backdrop.name = `pantalla:${s.id}`;
      backdrop.userData = { stationId: s.id };
      placeOnWall(backdrop, s.placement.wall, s.placement.position, s.placement.centerY, OFFSET_IMAGE);
      geometries.push(fondoGeo);
      materials.push(fondoMat);
      loader.load(
        new URL(s.backdrop!.src, baseUrl).href,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          textures.push(tex);
          fondoMat.map = tex;
          fondoMat.color.set(0xffffff);
          fondoMat.needsUpdate = true;
        },
        undefined,
        () => {
          fondoMat.color.set(COLORS.floor); // neutro si falla la pantalla de fondo
        },
      );
    }

    // Portada: encima de la pantalla de fondo si la hay; si no, ocupa el marco.
    const imgGeo = new THREE.PlaneGeometry(anchoPortada, altoPortada);
    const imgMat = new THREE.MeshBasicMaterial({ color: PLACEHOLDER, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(imgGeo, imgMat);
    mesh.name = `frame:${s.id}`;
    mesh.userData = { stationId: s.id };
    placeOnWall(mesh, s.placement.wall, s.placement.position, s.placement.centerY, conPantalla ? OFFSET_IMAGE + 0.3 : OFFSET_IMAGE);
    geometries.push(imgGeo);
    materials.push(imgMat);

    const frame: StationFrame = { stationId: s.id, station: s, mesh, backdrop, loadState: "pending" };
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
    pickables: frames.flatMap((f) => (f.backdrop ? [f.mesh, f.backdrop] : [f.mesh])),
    dispose() {
      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
      for (const t of textures) t.dispose();
    },
  };
}

/** Añade al grupo las mallas de marco, pantalla de fondo y borde (el borde no es seleccionable). */
export function addFramesToGroup(group: THREE.Group, handle: FramesHandle): void {
  for (const f of handle.frames) {
    group.add(f.mesh);
    if (f.backdrop) group.add(f.backdrop);
    const border = f.mesh.userData.border as THREE.Object3D | undefined;
    if (border) group.add(border);
  }
}
