// Distingue un toque de un arrastre. Un arrastre que vuelve al origen NO es un toque:
// una vez superado el umbral, el gesto queda marcado como movimiento.

export const TAP_THRESHOLD_PX = 8;

export interface Gesture {
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  moved: boolean;
}

export function createGesture(x: number, y: number): Gesture {
  return { startX: x, startY: y, lastX: x, lastY: y, moved: false };
}

/** Actualiza el gesto y devuelve el incremento desde el último punto (para girar la cámara). */
export function updateGesture(g: Gesture, x: number, y: number): { dx: number; dy: number } {
  const dx = x - g.lastX;
  const dy = y - g.lastY;
  if (!g.moved && Math.hypot(x - g.startX, y - g.startY) > TAP_THRESHOLD_PX) g.moved = true;
  g.lastX = x;
  g.lastY = y;
  return { dx, dy };
}

export function isTapGesture(g: Gesture): boolean {
  return !g.moved;
}

/** Los controles de la interfaz (marcados con data-ui) no deben mover la cámara ni seleccionar cuadros. */
export function isUiTarget(target: { closest?: (selector: string) => unknown } | null): boolean {
  return Boolean(target?.closest?.("[data-ui]"));
}
