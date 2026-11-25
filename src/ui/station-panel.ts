// Panel de estación: diálogo accesible con imagen o vídeo, texto siempre visible y controles de reproducción.
// Todo el contenido de catálogo se escribe con textContent (nunca innerHTML).

import type { Station } from "../content/types.ts";
import type { PlaybackSnapshot } from "../media/playback-coordinator.ts";

export interface StationPanelOptions {
  baseUrl: string;
  onPlay: () => void;
  onReplay: () => void;
  onToggleMute: () => void;
  onExpand: () => void;
  onClose: () => void;
  videoElement: HTMLVideoElement;
  resetVideo: () => void;
}

export interface StationPanel {
  open(station: Station, snapshot: PlaybackSnapshot): void;
  close(): void;
  isOpen(): boolean;
  render(snapshot: PlaybackSnapshot): void;
  stationId(): string | null;
  dispose(): void;
}

const PHASE_LABEL: Record<PlaybackSnapshot["phase"], string> = {
  idle: "",
  narrating: "Escuchando la introducción…",
  ready: "Listo para escuchar o reproducir.",
  loading: "Cargando el audio…",
  playing: "Reproduciendo.",
  paused: "En pausa.",
  error: "Hubo un problema con el archivo.",
};

export function createStationPanel(root: HTMLElement, opts: StationPanelOptions): StationPanel {
  const $ = <T extends HTMLElement>(id: string) => root.ownerDocument.getElementById(id) as T;
  const title = $<HTMLHeadingElement>("station-title");
  const image = $<HTMLImageElement>("station-image");
  const video = opts.videoElement;
  const status = $<HTMLParagraphElement>("station-status");
  const text = $<HTMLParagraphElement>("station-text");
  const error = $<HTMLParagraphElement>("station-error");
  const playBtn = $<HTMLButtonElement>("station-play");
  const replayBtn = $<HTMLButtonElement>("station-replay");
  const muteBtn = $<HTMLButtonElement>("station-mute");
  const expandBtn = $<HTMLButtonElement>("station-expand");
  const closeBtn = $<HTMLButtonElement>("station-close");

  let current: Station | null = null;
  let lastFocus: HTMLElement | null = null;

  const onKey = (e: KeyboardEvent) => {
    if (!current) return;
    if (e.key === "Escape") {
      e.preventDefault();
      opts.onClose();
      return;
    }
    if (e.key === "Tab") {
      // Mantiene el foco dentro del diálogo.
      const items = [...root.querySelectorAll<HTMLElement>("button:not([hidden]):not([disabled]), video[controls]")];
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const active = root.ownerDocument.activeElement;
      if (e.shiftKey && (active === first || active === title)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  playBtn.addEventListener("click", () => opts.onPlay());
  replayBtn.addEventListener("click", () => opts.onReplay());
  muteBtn.addEventListener("click", () => opts.onToggleMute());
  expandBtn.addEventListener("click", () => opts.onExpand());
  closeBtn.addEventListener("click", () => opts.onClose());
  root.addEventListener("keydown", onKey);

  const clearTracks = () => {
    for (const track of [...video.querySelectorAll("track")]) track.remove();
  };

  const panel: StationPanel = {
    open(station, snapshot) {
      current = station;
      lastFocus = root.ownerDocument.activeElement as HTMLElement | null;
      opts.resetVideo();
      title.textContent = station.title;
      const isVideo = station.type === "video";
      image.hidden = isVideo;
      video.hidden = !isVideo;
      expandBtn.hidden = !isVideo;
      clearTracks();
      if (isVideo) {
        video.poster = new URL(station.image.src, opts.baseUrl).href;
        video.setAttribute("controls", "");
        // Subtítulos opcionales: solo si el catálogo los declara (FR-040).
        if (station.captions) {
          const track = root.ownerDocument.createElement("track");
          track.kind = "captions";
          track.src = new URL(station.captions.src, opts.baseUrl).href;
          track.srclang = station.captions.lang;
          track.label = "Subtítulos";
          track.default = true;
          video.append(track);
        }
      } else {
        video.removeAttribute("controls");
      }
      image.src = new URL(station.image.src, opts.baseUrl).href;
      image.alt = station.image.alt;
      text.textContent = station.narration.text;
      root.hidden = false;
      panel.render(snapshot);
      title.focus();
    },

    close() {
      if (!current) return;
      current = null;
      root.hidden = true;
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
      lastFocus = null;
    },

    isOpen() {
      return current !== null;
    },

    stationId() {
      return current?.id ?? null;
    },

    render(snapshot) {
      if (!current) return;
      const narrating = snapshot.phase === "narrating";
      status.textContent = PHASE_LABEL[snapshot.phase];
      const loading = snapshot.phase === "loading";
      playBtn.disabled = narrating || loading;
      playBtn.textContent = snapshot.phase === "playing" ? "Pausar" : loading ? "Cargando…" : "Reproducir";
      playBtn.setAttribute("aria-busy", String(loading));
      replayBtn.disabled = false;
      muteBtn.textContent = snapshot.muted ? "Activar sonido" : "Silenciar";
      muteBtn.setAttribute("aria-pressed", String(snapshot.muted));
      error.hidden = snapshot.errorMessage === null;
      error.textContent = snapshot.errorMessage ?? "";
      playBtn.setAttribute("aria-label", snapshot.phase === "error" ? "Reintentar reproducción" : playBtn.textContent);
    },

    dispose() {
      root.removeEventListener("keydown", onKey);
    },
  };

  return panel;
}
