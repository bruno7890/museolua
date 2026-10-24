// Decoración independiente: alfombra de entrada y paneles laterales.
// No es seleccionable, no tiene narración ni reproductor (FR-024, US3-A3).

import * as THREE from "three";
import type { Decoration } from "../content/types.ts";
import { OFFSET_BORDER, OFFSET_IMAGE, heightFor, placeOnWall } from "./wall-placement.ts";

const MOLDURA = 3; // mismo ancho que la moldura de los cuadros (station-frames.ts)
const MOLDURA_COLOR = 0x30263d; // ciruela de la paleta

export interface DecorHandle {
  group: THREE.Group;
  dispose(): void;
}

export function buildDecor(
  decorations: readonly Decoration[],
  baseUrl: string,
  loader: THREE.TextureLoader = new THREE.TextureLoader(),
): DecorHandle {
  const group = new THREE.Group();
  group.name = "decor";
  const textures: THREE.Texture[] = [];

  for (const d of decorations) {
    if (!d.enabled) continue;

    if (d.kind === "floor-image" && d.transform) {
      const [w, h] = d.transform.size;
      const geo = new THREE.PlaneGeometry(w, h);
      // polygonOffset evita el parpadeo con el suelo (FR-024).
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.name = d.id;
      mesh.userData = { decorationId: d.id, interactive: false };
      const [px, py, pz] = d.transform.position;
      const [rx, ry, rz] = d.transform.rotationDegrees.map(THREE.MathUtils.degToRad) as [number, number, number];
      mesh.position.set(px, py, pz);
      mesh.rotation.set(rx, ry, rz);
      group.add(mesh);
      loadTexture(baseUrl, d.image.src, mat, mesh, geo, textures, loader);
    } else if (d.kind === "wall-image" && d.placement) {
      const { wall, position, width, centerY } = d.placement;
      const geo = new THREE.PlaneGeometry(width, width * 1.5);
      const mat = new THREE.MeshBasicMaterial({ color: 0xc7b5e8, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.name = d.id;
      mesh.userData = { decorationId: d.id, interactive: false };
      placeOnWall(mesh, wall, position, centerY, OFFSET_IMAGE);
      // Moldura de galería detrás del panel, con la misma paleta que los cuadros.
      const moldura = new THREE.Mesh(
        new THREE.PlaneGeometry(width + MOLDURA * 2, width * 1.5 + MOLDURA * 2),
        new THREE.MeshBasicMaterial({ color: MOLDURA_COLOR }),
      );
      moldura.name = `moldura:${d.id}`;
      moldura.userData = { interactive: false };
      placeOnWall(moldura, wall, position, centerY, OFFSET_BORDER);
      group.add(moldura, mesh);
      loadTexture(baseUrl, d.image.src, mat, mesh, geo, textures, loader, width, moldura);
    }
  }

  return {
    group,
    dispose() {
      // Recorre el grupo: los paneles pueden tener geometría reemplazada al cargar la textura.
      group.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (o.material as THREE.Material).dispose();
        }
      });
      for (const t of textures) t.dispose();
    },
  };
}

function loadTexture(
  baseUrl: string,
  src: string,
  mat: THREE.MeshBasicMaterial,
  mesh: THREE.Mesh,
  geo: THREE.PlaneGeometry,
  textures: THREE.Texture[],
  loader: THREE.TextureLoader,
  wallWidth?: number,
  moldura?: THREE.Mesh,
): void {
  loader.load(
    new URL(src, baseUrl).href,
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      textures.push(tex);
      mat.map = tex;
      mat.needsUpdate = true;
      if (wallWidth !== undefined) {
        // Paneles: conserva la proporción real de la ilustración; la moldura la sigue.
        const img = tex.image as { width?: number; height?: number } | undefined;
        if (img && img.width && img.height) {
          const h = heightFor(wallWidth, img.width, img.height);
          geo.dispose();
          mesh.geometry = new THREE.PlaneGeometry(wallWidth, h);
          if (moldura) {
            moldura.geometry.dispose();
            moldura.geometry = new THREE.PlaneGeometry(wallWidth + MOLDURA * 2, h + MOLDURA * 2);
          }
        }
      }
    },
    undefined,
    () => {
      mat.color.set(0xd5cfd5); // placeholder neutro si falta la imagen
    },
  );
}
