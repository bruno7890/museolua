import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { buildRoom } from "../../src/scene/room.ts";

/** Cargador que no descarga nada: entrega una textura con dimensiones conocidas. */
class FakeLoader extends THREE.TextureLoader {
  override load(
    _url: string,
    onLoad?: (data: THREE.Texture<HTMLImageElement>) => void,
  ): THREE.Texture<HTMLImageElement> {
    const texture = new THREE.Texture<HTMLImageElement>();
    texture.image = { width: 1024, height: 908 } as unknown as HTMLImageElement;
    onLoad?.(texture);
    return texture;
  }
}

const TECHO = { src: "media/room/techo.jpg", width: 1024, height: 908 };

describe("techo de la sala", () => {
  it("sin imagen, el techo es solo un plano de color", () => {
    const room = buildRoom();
    expect(room.group.getObjectByName("techo-imagen")).toBeUndefined();
    room.dispose();
  });

  it("con imagen, se coloca sobre el techo y la cubre entera", () => {
    const room = buildRoom({ ceilingImage: TECHO, baseUrl: "https://ejemplo.test/" }, new FakeLoader());
    const techo = room.group.getObjectByName("techo-imagen") as THREE.Mesh | undefined;
    expect(techo).toBeInstanceOf(THREE.Mesh);

    const geo = techo!.geometry as THREE.PlaneGeometry;
    // Cubre el techo (420 × 500) sin dejar huecos, aunque recorte por los lados.
    expect(geo.parameters.width).toBeGreaterThanOrEqual(420);
    expect(geo.parameters.height).toBeGreaterThanOrEqual(500);

    // Está a la altura del techo, sin verse a través del suelo.
    expect(techo!.position.y).toBeGreaterThan(40);
    expect((techo!.material as THREE.MeshBasicMaterial).map).toBeInstanceOf(THREE.Texture);
    room.dispose();
  });
});
