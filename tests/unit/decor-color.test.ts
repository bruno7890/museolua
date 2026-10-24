import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { buildDecor } from "../../src/scene/decor.ts";
import { buildStationFrames } from "../../src/scene/station-frames.ts";
import { decorationsFixture, stationsFixture } from "../fixtures/catalog.ts";

const BASE = "https://ejemplo.test/";

/** Cargador que entrega una textura con dimensiones conocidas, sin descargar nada. */
class FakeLoader extends THREE.TextureLoader {
  override load(
    _url: string,
    onLoad?: (data: THREE.Texture<HTMLImageElement>) => void,
  ): THREE.Texture<HTMLImageElement> {
    const texture = new THREE.Texture<HTMLImageElement>();
    texture.image = { width: 1024, height: 1024 } as unknown as HTMLImageElement;
    onLoad?.(texture);
    return texture;
  }
}

/** Color con el que se multiplica la textura: blanco = la ilustración se ve tal cual. */
function tinte(mesh: THREE.Mesh): number {
  return (mesh.material as THREE.MeshBasicMaterial).color.getHex();
}

describe("las ilustraciones no se tiñen con la pared", () => {
  it("los paneles decorativos muestran su imagen sin tinte cuando carga", () => {
    const decor = buildDecor(decorationsFixture().decorations, BASE, new FakeLoader());
    const conImagen = decor.group.children.filter(
      (c) => (c as THREE.Mesh).isMesh && c.userData["decorationId"] !== undefined,
    ) as THREE.Mesh[];
    expect(conImagen.length).toBeGreaterThan(0);
    for (const m of conImagen) {
      expect(tinte(m), m.name).toBe(0xffffff);
    }
    decor.dispose();
  });

  it("los cuadros de estación ya se veían sin tinte (referencia)", () => {
    const frames = buildStationFrames(stationsFixture().stations, BASE, () => {}, new FakeLoader());
    for (const f of frames.frames) {
      expect(tinte(f.mesh), f.stationId).toBe(0xffffff);
    }
    frames.dispose();
  });
});
