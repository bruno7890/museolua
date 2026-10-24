// Tipos de los catálogos JSON. Contrato: specs/001-museo-de-lua/contracts/content-catalogs.md

export type Wall = "left" | "right" | "front" | "back";
export type StationType = "audio" | "video";
export type MediaMime = "audio/mpeg" | "audio/wav" | "video/mp4";

export interface SiteConfig {
  schemaVersion: 1;
  title: string;
  ornament: { src: string; alt: string; placeholder: boolean };
  theme: { purple: string; salmon: string; lavender: string; plum: string; grayWarm: string };
  entry: { label: string; transitionMs: number; reducedTransitionMs: number };
  access: { algorithm: "SHA-256"; salt: string; verifier: string; informalNotice: string };
  speech: {
    preferredVoiceName?: string;
    lang: "es";
    fallbackLangs: string[];
    rate: number;
    pitch: number;
    volume: number;
    startTimeoutMs: number;
    maxUtteranceMs: number;
    baseEndTimeoutMs: number;
    msPerCharacter: number;
  };
  welcome: { touchText: string; desktopText: string; speechTouch?: string; speechDesktop?: string };
  navigation: {
    walkSpeed: number;
    lookSensitivity: number;
    approachRate: number;
    approachDistance: number;
    eyeHeight: number;
    fov: number;
    collisionRadius: number;
    pitchLimitDegrees: number;
  };
  quality: { defaultProfile: "standard" | "reduced" };
}

export interface StationPlacement {
  wall: Wall;
  position: number;
  width: number;
  centerY: number;
}

export interface Station {
  id: string;
  order: number;
  enabled: boolean;
  type: StationType;
  title: string;
  description: string;
  credit: string;
  placeholder: boolean;
  image: { src: string; alt: string; width: number; height: number };
  narration: { mode: "browser"; text: string; speechText?: string; policy: "first-visit" };
  media: { src: string; mime: MediaMime; durationSeconds?: number; poster?: string };
  captions?: { src: string; lang: string };
  placement: StationPlacement;
}

export interface StationCatalog {
  schemaVersion: 1;
  stations: Station[];
}

export interface Decoration {
  id: string;
  enabled: boolean;
  kind: "floor-image" | "wall-image";
  image: { src: string; alt: string; credit: string; placeholder: boolean };
  placement?: { wall: "left" | "right"; position: number; width: number; centerY: number };
  transform?: { position: [number, number, number]; rotationDegrees: [number, number, number]; size: [number, number] };
  fit: "contain" | "cover";
  interactive: false;
}

export interface DecorationCatalog {
  schemaVersion: 1;
  decorations: Decoration[];
}

export interface ValidationIssue {
  file: string;
  path: string;
  code: string;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  issues: ValidationIssue[];
}

export interface ValidateOptions {
  mode: "demo" | "publish";
  /** Rutas relativas a public/ que existen en disco. */
  existingPaths: ReadonlySet<string>;
}
