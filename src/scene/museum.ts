// Escena del museo: renderer, cámara en primera persona, bucle, selección y liberación de recursos.
// El estado de la cámara es matemática pura (approach.ts, navigation.ts); aquí solo se aplica a Three.js.

import * as THREE from "three";
import type { Decoration, SiteConfig, Station } from "../content/types.ts";
import { stepPosition, ROOM_BOUNDS, type Rect } from "../controls/navigation.ts";
import type { InputSnapshot } from "../controls/input.ts";
import { approachTargetFor, clampPitch, stepApproach, type ApproachTarget, type Pose } from "./approach.ts";
import { buildRoom, roomObstacles } from "./room.ts";
import { buildStationFrames, addFramesToGroup, type FramesHandle } from "./station-frames.ts";
import { buildDecor, type DecorHandle } from "./decor.ts";

export interface MuseumOptions {
  canvas: HTMLCanvasElement;
  site: SiteConfig;
  stations: readonly Station[];
  decorations: readonly Decoration[];
  baseUrl: string;
  pixelRatio: number;
  onFrameLoaded?: () => void;
  onContextLost?: () => void;
}

export interface Museum {
  /** Estación alcanzada por la aproximación en el último fotograma (una sola vez). */
  consumeArrival(): string | null;
  approachStation(stationId: string): boolean;
  returnToPrevious(): void;
  resetToStart(): void;
  cancelApproach(): void;
  isApproaching(): boolean;
  pick(clientX: number, clientY: number): string | null;
  setPixelRatio(ratio: number): void;
  resize(width: number, height: number): void;
  update(dt: number, input: InputSnapshot): void;
  render(): void;
  pose(): Pose;
  dispose(): void;
}

const EYE_HEIGHT_DEFAULT = 0;

export function createMuseum(opts: MuseumOptions): Museum {
  const { site } = opts;
  const nav = site.navigation;

  const renderer = new THREE.WebGLRenderer({ canvas: opts.canvas, antialias: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(opts.pixelRatio);
  renderer.setSize(opts.canvas.clientWidth || window.innerWidth, opts.canvas.clientHeight || window.innerHeight, false);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(site.theme.lavender);

  const camera = new THREE.PerspectiveCamera(nav.fov, 1, 1, 4000);
  camera.rotation.order = "YXZ";

  const room = buildRoom();
  scene.add(room.group);

  const frames: FramesHandle = buildStationFrames(opts.stations, opts.baseUrl, () => {
    dirty = true;
    opts.onFrameLoaded?.();
  });
  const frameGroup = new THREE.Group();
  frameGroup.name = "frames";
  addFramesToGroup(frameGroup, frames);
  scene.add(frameGroup);

  const decor: DecorHandle = buildDecor(opts.decorations, opts.baseUrl);
  scene.add(decor.group);

  // Estado de cámara.
  let pose: Pose = { x: 0, y: EYE_HEIGHT_DEFAULT, z: 195, yaw: 0, pitch: 0 };
  let target: ApproachTarget | null = null;
  let returnTo: Pose | null = null;
  let arrival: string | null = null;
  let approachingId: string | null = null;
  let dirty = true;
  const obstacles: Rect[] = roomObstacles();

  const onLost = (e: Event) => {
    e.preventDefault();
    opts.onContextLost?.();
  };
  opts.canvas.addEventListener("webglcontextlost", onLost, false);

  const applyCamera = () => {
    camera.position.set(pose.x, pose.y, pose.z);
    camera.rotation.set(pose.pitch, pose.yaw, 0);
  };
  applyCamera();

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  const museum: Museum = {
    consumeArrival() {
      const a = arrival;
      arrival = null;
      return a;
    },

    approachStation(stationId) {
      const frame = frames.frames.find((f) => f.stationId === stationId);
      if (!frame) return false;
      if (!approachingId) returnTo = { ...pose };
      approachingId = stationId;
      target = approachTargetFor(frame.station.placement, nav.approachDistance);
      dirty = true;
      return true;
    },

    returnToPrevious() {
      if (!returnTo) return;
      target = { x: returnTo.x, z: returnTo.z, yaw: returnTo.yaw };
      approachingId = null;
      dirty = true;
    },

    resetToStart() {
      target = null;
      approachingId = null;
      returnTo = null;
      pose = { x: 0, y: EYE_HEIGHT_DEFAULT, z: 195, yaw: 0, pitch: 0 };
      dirty = true;
    },

    cancelApproach() {
      if (target) dirty = true;
      target = null;
      approachingId = null;
      returnTo = null;
    },

    isApproaching() {
      return target !== null;
    },

    pick(clientX, clientY) {
      const rect = opts.canvas.getBoundingClientRect();
      ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObjects(frames.pickables, false)[0];
      const id = hit?.object.userData["stationId"];
      return typeof id === "string" ? id : null;
    },

    setPixelRatio(ratio) {
      renderer.setPixelRatio(ratio);
      dirty = true;
    },

    resize(width, height) {
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
      dirty = true;
    },

    update(dt, input) {
      const step = Math.min(dt, 0.05);
      const moving = Math.hypot(input.move.x, input.move.y) > 0.01;
      const looking = Math.abs(input.look.dx) + Math.abs(input.look.dy) > 0;

      if ((moving || looking) && target) {
        // El usuario recupera el control: cancela la aproximación.
        target = null;
        approachingId = null;
      }

      if (target) {
        const next = stepApproach(pose, target, nav.approachRate, step);
        const reached = next.x === target.x && next.z === target.z && next.yaw === target.yaw;
        pose = { ...next, pitch: pose.pitch };
        if (reached) {
          target = null;
          if (returnTo && approachingId === null) {
            returnTo = null;
          } else if (approachingId !== null) {
            arrival = approachingId;
          }
        }
        dirty = true;
      } else if (moving || looking) {
        const forward = { x: -Math.sin(pose.yaw), z: -Math.cos(pose.yaw) };
        const right = { x: Math.cos(pose.yaw), z: -Math.sin(pose.yaw) };
        const dir = {
          x: forward.x * input.move.y + right.x * input.move.x,
          z: forward.z * input.move.y + right.z * input.move.x,
        };
        const p = stepPosition({ x: pose.x, z: pose.z }, dir, nav.walkSpeed, step, ROOM_BOUNDS, nav.collisionRadius, obstacles);
        pose = {
          ...pose,
          x: p.x,
          z: p.z,
          yaw: pose.yaw - input.look.dx * nav.lookSensitivity,
          pitch: clampPitch(pose.pitch - input.look.dy * nav.lookSensitivity, nav.pitchLimitDegrees),
        };
        dirty = true;
      }

      if (dirty) {
        applyCamera();
      }
    },

    render() {
      if (!dirty) return;
      renderer.render(scene, camera);
      dirty = false;
    },

    pose() {
      return { ...pose };
    },

    dispose() {
      opts.canvas.removeEventListener("webglcontextlost", onLost, false);
      frames.dispose();
      decor.dispose();
      room.dispose();
      renderer.dispose();
    },
  };

  return museum;
}
