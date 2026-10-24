// Luces de fiesta: haces de color que giran desde el techo.
// No son focos reales (la sala no usa iluminación para ahorrar en el móvil): son
// capas translúcidas que tiñen lo que cruzan. Con movimiento reducido se quedan quietas.

import * as THREE from "three";

export interface LightRig {
  group: THREE.Group;
  /** true si las luces están quietas por movimiento reducido. */
  readonly reducedMotion: boolean;
  update(dt: number): void;
  setReducedMotion(value: boolean): void;
  dispose(): void;
}

const RADIO = 130; // distancia de cada haz al centro de la sala
const ALTO = 90; // del techo al suelo
const ALTURA_CENTRO = 3.5;
const OPACIDAD = 0.16;

export function createLightRig(colors: readonly string[]): LightRig {
  const group = new THREE.Group();
  group.name = "luces";
  const geometries: THREE.PlaneGeometry[] = [];
  const materials: THREE.MeshBasicMaterial[] = [];
  const velocidades: number[] = [];
  let reducido = false;

  colors.forEach((color, i) => {
    const brazo = new THREE.Group();
    // Cada haz arranca en un ángulo distinto y gira a su ritmo.
    brazo.rotation.y = (i / Math.max(1, colors.length)) * Math.PI * 2;
    const geo = new THREE.PlaneGeometry(9, ALTO);
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: OPACIDAD,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const haz = new THREE.Mesh(geo, mat);
    haz.position.set(0, ALTURA_CENTRO, -RADIO);
    brazo.add(haz);
    group.add(brazo);

    geometries.push(geo);
    materials.push(mat);
    velocidades.push(i % 2 === 0 ? 0.38 : -0.3);
  });

  return {
    group,
    get reducedMotion() {
      return reducido;
    },
    update(dt) {
      if (reducido) return;
      group.children.forEach((brazo, i) => {
        brazo.rotation.y += velocidades[i]! * dt;
      });
    },
    setReducedMotion(value) {
      reducido = value;
    },
    dispose() {
      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
    },
  };
}
