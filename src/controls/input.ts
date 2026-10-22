// Entrada del usuario: teclado, arrastre para mirar, toque para elegir y joystick virtual.
// Los controles de la interfaz llevan data-ui y nunca mueven la cámara (FR-006).

import { createGesture, isTapGesture, isUiTarget, updateGesture, type Gesture } from "./pointer-look.ts";
import { joystickVector, type StickVector } from "./joystick.ts";

export interface InputSnapshot {
  /** Movimiento combinado (teclado + joystick), y hacia delante, en [-1, 1]. */
  move: StickVector;
  /** Incremento de mirada desde el último fotograma, en píxeles. */
  look: { dx: number; dy: number };
}

export interface InputOptions {
  /** Elemento donde se mira y se toca la sala. */
  surface: HTMLElement;
  /** Zona del joystick; se crea dentro de `host`. */
  host: HTMLElement;
  onTap: (clientX: number, clientY: number) => void;
  /** Devuelve true cuando la entrada de recorrido debe ignorarse (paneles abiertos). */
  isBlocked: () => boolean;
  stickRadius?: number;
}

export interface InputController {
  snapshot(): InputSnapshot;
  reset(): void;
  dispose(): void;
}

const KEY_MAP: Record<string, { x: number; y: number }> = {
  KeyW: { x: 0, y: 1 },
  ArrowUp: { x: 0, y: 1 },
  KeyS: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: -1 },
  KeyA: { x: -1, y: 0 },
  ArrowLeft: { x: -1, y: 0 },
  KeyD: { x: 1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

function isEditable(t: EventTarget | null): boolean {
  return t instanceof HTMLElement && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));
}

export function createInputController(opts: InputOptions): InputController {
  const keys = new Set<string>();
  const looks = new Map<number, Gesture>();
  let stick: StickVector = { x: 0, y: 0 };
  let stickPointer: number | null = null;
  let stickCenter = { x: 0, y: 0 };
  let lookAccum = { dx: 0, dy: 0 };
  const radius = opts.stickRadius ?? 56;

  // Zona visual del joystick (inferior izquierda). Sin teclado; accesible por pointer.
  const zone = document.createElement("div");
  zone.className = "stick";
  zone.dataset.ui = "true";
  zone.setAttribute("aria-hidden", "true");
  const knob = document.createElement("div");
  knob.className = "stick__knob";
  zone.append(knob);
  opts.host.append(zone);

  const onKeyDown = (e: KeyboardEvent) => {
    if (isEditable(e.target) || opts.isBlocked()) return;
    if (KEY_MAP[e.code]) {
      keys.add(e.code);
      e.preventDefault();
    }
  };
  const onKeyUp = (e: KeyboardEvent) => keys.delete(e.code);

  const onPointerDown = (e: PointerEvent) => {
    if (opts.isBlocked()) return;
    if (isUiTarget(e.target as Element | null)) return;
    surfaceLooks(e);
  };

  function surfaceLooks(e: PointerEvent) {
    opts.surface.setPointerCapture?.(e.pointerId);
    looks.set(e.pointerId, createGesture(e.clientX, e.clientY));
  }

  const onPointerMove = (e: PointerEvent) => {
    const g = looks.get(e.pointerId);
    if (!g) return;
    const d = updateGesture(g, e.clientX, e.clientY);
    lookAccum = { dx: lookAccum.dx + d.dx, dy: lookAccum.dy + d.dy };
  };

  const onPointerUp = (e: PointerEvent) => {
    const g = looks.get(e.pointerId);
    if (!g) return;
    looks.delete(e.pointerId);
    if (isTapGesture(g) && !opts.isBlocked()) opts.onTap(e.clientX, e.clientY);
  };

  const onPointerCancel = (e: PointerEvent) => looks.delete(e.pointerId);

  const onStickDown = (e: PointerEvent) => {
    if (opts.isBlocked()) return;
    e.preventDefault();
    stickPointer = e.pointerId;
    zone.setPointerCapture?.(e.pointerId);
    const r = zone.getBoundingClientRect();
    stickCenter = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    applyStick(e);
  };

  const applyStick = (e: PointerEvent) => {
    stick = joystickVector(e.clientX - stickCenter.x, e.clientY - stickCenter.y, radius);
    const k = Math.min(radius, Math.hypot(e.clientX - stickCenter.x, e.clientY - stickCenter.y));
    const ang = Math.atan2(e.clientY - stickCenter.y, e.clientX - stickCenter.x);
    knob.style.transform = `translate(${Math.cos(ang) * k}px, ${Math.sin(ang) * k}px)`;
  };

  const onStickMove = (e: PointerEvent) => {
    if (e.pointerId === stickPointer) applyStick(e);
  };

  const releaseStick = () => {
    stickPointer = null;
    stick = { x: 0, y: 0 };
    knob.style.transform = "";
  };
  const onStickUp = (e: PointerEvent) => {
    if (e.pointerId === stickPointer) releaseStick();
  };

  const reset = () => {
    keys.clear();
    looks.clear();
    releaseStick();
    lookAccum = { dx: 0, dy: 0 };
  };
  const onVisibility = () => {
    if (document.hidden) reset();
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", reset);
  document.addEventListener("visibilitychange", onVisibility);
  opts.surface.addEventListener("pointerdown", onPointerDown);
  opts.surface.addEventListener("pointermove", onPointerMove);
  opts.surface.addEventListener("pointerup", onPointerUp);
  opts.surface.addEventListener("pointercancel", onPointerCancel);
  zone.addEventListener("pointerdown", onStickDown);
  zone.addEventListener("pointermove", onStickMove);
  zone.addEventListener("pointerup", onStickUp);
  zone.addEventListener("pointercancel", onStickUp);

  return {
    snapshot() {
      let kx = 0;
      let ky = 0;
      for (const k of keys) {
        const m = KEY_MAP[k]!;
        kx += m.x;
        ky += m.y;
      }
      const combined = { x: kx + stick.x, y: ky + stick.y };
      const mag = Math.hypot(combined.x, combined.y);
      const move = mag > 1 ? { x: combined.x / mag, y: combined.y / mag } : combined;
      const look = lookAccum;
      lookAccum = { dx: 0, dy: 0 };
      return { move, look };
    },
    reset,
    dispose() {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", onVisibility);
      zone.remove();
    },
  };
}
