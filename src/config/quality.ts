// Perfiles de calidad (FR-039). El modo reducido limita la densidad de píxeles para móviles.

export type QualityProfile = "standard" | "reduced";

export interface QualitySettings {
  pixelRatio: number;
  label: string;
}

export function qualitySettings(profile: QualityProfile, devicePixelRatio: number): QualitySettings {
  if (profile === "reduced") return { pixelRatio: 1, label: "Reducida" };
  return { pixelRatio: Math.min(devicePixelRatio || 1, 1.5), label: "Estándar" };
}
