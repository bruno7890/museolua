// Joystick virtual: convierte el desplazamiento del pulgar en un vector [-1, 1].
// y positivo = avanzar (hacia arriba en pantalla). Zona muerta configurable.

export interface StickVector {
  x: number;
  y: number;
}

export function joystickVector(dx: number, dy: number, radius: number, deadZone = 0.12): StickVector {
  if (radius <= 0) return { x: 0, y: 0 };
  let x = dx / radius;
  let y = -dy / radius;
  const mag = Math.hypot(x, y);
  if (mag > 1) {
    x /= mag;
    y /= mag;
  }
  if (Math.hypot(x, y) < deadZone) return { x: 0, y: 0 };
  return { x, y };
}
