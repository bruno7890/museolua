// Adaptadores de HTMLAudioElement / HTMLVideoElement al contrato MediaHandle.
// El vídeo usa un único elemento compartido: cada manejador solo actúa si es el dueño actual.
// Los medios no se cargan hasta play() (preload="none", FR-019).

import type { Station } from "../content/types.ts";
import type { MediaHandle } from "./playback-coordinator.ts";

export function createAudioHandle(station: Station, baseUrl: string): MediaHandle {
  const el = new Audio();
  el.preload = "none";
  el.src = new URL(station.media.src, baseUrl).href;
  return {
    kind: "audio",
    play: () => el.play(),
    pause: () => el.pause(),
    setMuted: (m) => {
      el.muted = m;
    },
    setVolume: (v) => {
      el.volume = v;
    },
    seek: (s) => {
      el.currentTime = s;
    },
    currentTime: () => el.currentTime,
    duration: () => (Number.isFinite(el.duration) ? el.duration : null),
    onEnded: (cb) => el.addEventListener("ended", cb),
    onError: (cb) => el.addEventListener("error", () => cb("error de medio")),
    dispose: () => {
      el.pause();
      el.removeAttribute("src");
      el.load();
    },
  };
}

export interface SharedVideo {
  element: HTMLVideoElement;
  /** Estación que tiene el elemento en este momento. */
  owner: () => string | null;
  setOwner: (id: string | null) => void;
}

export function createSharedVideo(element: HTMLVideoElement): SharedVideo {
  let owner: string | null = null;
  return {
    element,
    owner: () => owner,
    setOwner: (id) => {
      owner = id;
    },
  };
}

export function createVideoHandle(station: Station, baseUrl: string, shared: SharedVideo): MediaHandle {
  const el = shared.element;
  const src = new URL(station.media.src, baseUrl).href;
  const id = station.id;
  let savedTime = 0;
  let muted = false;
  let volume = 1;
  const isOwner = () => shared.owner() === id;

  const claim = () => {
    if (isOwner()) return;
    if (shared.owner() !== null) {
      // Otro vídeo tenía el elemento: guardamos su estado implícitamente al pausarlo al cambiar.
      el.pause();
    }
    shared.setOwner(id);
    el.preload = "none";
    if (el.getAttribute("src") !== src) el.src = src;
    el.muted = muted;
    el.volume = volume;
    el.currentTime = savedTime;
  };

  return {
    kind: "video",
    async play() {
      claim();
      await el.play();
    },
    pause() {
      if (!isOwner()) return;
      savedTime = el.currentTime;
      el.pause();
    },
    setMuted(m) {
      muted = m;
      if (isOwner()) el.muted = m;
    },
    setVolume(v) {
      volume = v;
      if (isOwner()) el.volume = v;
    },
    seek(s) {
      savedTime = s;
      if (isOwner()) el.currentTime = s;
    },
    currentTime: () => (isOwner() ? el.currentTime : savedTime),
    duration: () => (isOwner() && Number.isFinite(el.duration) ? el.duration : null),
    onEnded(cb) {
      el.addEventListener("ended", () => {
        if (isOwner()) cb();
      });
    },
    onError(cb) {
      el.addEventListener("error", () => {
        if (isOwner()) cb("error de medio");
      });
    },
    dispose() {
      if (isOwner()) {
        el.pause();
        shared.setOwner(null);
      }
    },
  };
}
