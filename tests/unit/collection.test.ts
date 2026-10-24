// Colección completa: la sala y el catálogo 2D muestran las mismas diez estaciones
// y la decoración nunca es seleccionable (T068, FR-021, FR-022, FR-024, US3-A1–A3).

import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { buildStationFrames } from "../../src/scene/station-frames.ts";
import { buildDecor } from "../../src/scene/decor.ts";
import { decorationsFixture, stationsFixture } from "../fixtures/catalog.ts";

/** Cargador que no descarga nada: la prueba solo mira la estructura de la escena. */
class FakeLoader extends THREE.TextureLoader {
  override load(
    _url: string,
    onLoad?: (data: THREE.Texture<HTMLImageElement>) => void,
    _onProgress?: (event: ProgressEvent) => void,
    _onError?: (err: unknown) => void,
  ): THREE.Texture<HTMLImageElement> {
    const texture = new THREE.Texture<HTMLImageElement>();
    texture.image = { width: 1024, height: 1024 } as unknown as HTMLImageElement;
    onLoad?.(texture);
    return texture;
  }
}

const BASE = "https://ejemplo.test/";

describe("colección de la sala", () => {
  const stations = stationsFixture().stations;

  it("la sala tiene un marco por estación habilitada", () => {
    const handle = buildStationFrames(stations, BASE, () => {}, new FakeLoader());
    expect(handle.frames).toHaveLength(10);
    expect(handle.frames.map((f) => f.stationId)).toEqual(stations.map((s) => s.id));
    handle.dispose();
  });

  it("los dos vídeos están en muros distintos", () => {
    const videos = stations.filter((s) => s.type === "video");
    expect(videos).toHaveLength(2);
    expect(videos[0]!.placement.wall).not.toBe(videos[1]!.placement.wall);
  });

  it("la distribución de cuadros es 3/3/2/2", () => {
    const count = { left: 0, right: 0, front: 0, back: 0 };
    for (const s of stations) count[s.placement.wall]++;
    expect(count).toEqual({ left: 3, right: 3, front: 2, back: 2 });
  });

  it("cada cuadro tiene molduras alrededor de la imagen", () => {
    const frames = buildStationFrames(stations, BASE, () => {}, new FakeLoader());
    for (const f of frames.frames) {
      const borde = f.mesh.userData.border as THREE.Group;
      expect(borde, f.stationId).toBeInstanceOf(THREE.Group);
      // Moldura exterior y acento interior: dos capas por encima de la imagen.
      expect(borde.children, f.stationId).toHaveLength(2);
      const anchoImagen = (f.mesh.geometry as THREE.PlaneGeometry).parameters.width;
      for (const capa of borde.children as THREE.Mesh[]) {
        expect((capa.geometry as THREE.PlaneGeometry).parameters.width, f.stationId).toBeGreaterThan(anchoImagen);
      }
    }
    frames.dispose();
  });

  it("solo los marcos de estación son seleccionables", () => {
    const frames = buildStationFrames(stations, BASE, () => {}, new FakeLoader());
    const decor = buildDecor(decorationsFixture().decorations, BASE, new FakeLoader());

    // Todo lo seleccionable lleva un stationId: la decoración no.
    for (const pickable of frames.pickables) {
      expect(typeof pickable.userData["stationId"]).toBe("string");
    }
    const decorIds = decor.group.children.map((c) => c.userData["decorationId"]);
    expect(decorIds.filter((id) => id !== undefined)).toHaveLength(5);
    for (const child of decor.group.children) {
      expect(child.userData["stationId"]).toBeUndefined();
      expect(child.userData["interactive"]).toBe(false);
    }

    frames.dispose();
    decor.dispose();
  });
});
