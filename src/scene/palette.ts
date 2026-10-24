// Paleta de la sala: oscura, con neones fuertes (elección del propietario, 2026-10).
// El texto claro cumple contraste ≥ 4,5:1 sobre el fondo y sobre la pared.

const NEON = ["#FF2FB9", "#23E5FF", "#FFE94A"] as const;

export const PALETTE = {
  background: "#0B0716",
  wall: "#1B1033",
  ceiling: "#0B0716",
  floor: "#221833",
  text: "#F3EEFF",
  neon: NEON,
  /** Neón que corresponde a una pieza por su índice: van rotando. */
  neonAt(index: number): string {
    return NEON[((index % NEON.length) + NEON.length) % NEON.length]!;
  },
} as const;

/** Colores de la sala que usan el suelo, los muros y el techo. */
export const COLORS = {
  floor: PALETTE.floor,
  wall: PALETTE.wall,
  ceiling: PALETTE.ceiling,
} as const;
