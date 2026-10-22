// Única autoridad sonora de la visita: bienvenida, narración, canción y vídeo nunca suenan a la vez.
// Cada acción incrementa un token; los callbacks de una acción anterior se descartan.
// Contrato: specs/001-museo-de-lua/contracts/runtime-modules.md (PlaybackCoordinator)

import type { Station } from "../content/types.ts";
import type { SessionStore } from "../app/session-store.ts";
import type { SpeechFailReason } from "./speech-controller.ts";

export type PlaybackPhase = "idle" | "narrating" | "ready" | "loading" | "playing" | "paused" | "error";

export interface SpeechHandlers {
  onStart?: () => void;
  onEnd: () => void;
  onFail: (reason: SpeechFailReason) => void;
}

export interface SpeechLike {
  speakText(text: string, handlers: SpeechHandlers): unknown;
  cancel(): void;
  refreshVoices(): void;
}

export interface MediaHandle {
  readonly kind: "audio" | "video";
  play(): Promise<void>;
  pause(): void;
  setMuted(muted: boolean): void;
  setVolume(v: number): void;
  seek(seconds: number): void;
  currentTime(): number;
  duration(): number | null;
  onEnded(cb: () => void): void;
  onError(cb: (message: string) => void): void;
  dispose(): void;
}

export interface PlaybackSnapshot {
  activeStationId: string | null;
  phase: PlaybackPhase;
  muted: boolean;
  positionSeconds: number;
  durationSeconds: number | null;
  errorMessage: string | null;
  canRetry: boolean;
  introductionPresented: boolean;
}

export interface CoordinatorDeps {
  speech: SpeechLike;
  stations: readonly Station[];
  session: SessionStore;
  createMedia: (station: Station) => MediaHandle;
}

export interface PlaybackCoordinator {
  readonly state: PlaybackSnapshot;
  subscribe(listener: (s: PlaybackSnapshot) => void): () => void;
  select(stationId: string, opts: { fromGesture: boolean }): void;
  /** `automatic`: lo dispara la llegada a un cuadro; nunca interrumpe una reproducción del visitante. */
  playIntroduction(opts?: { automatic?: boolean }): void;
  restartIntroduction(): void;
  togglePlay(): Promise<void>;
  close(): void;
  setMuted(muted: boolean): void;
  seek(seconds: number): void;
  setVolume(v: number): void;
  onVisibilityHidden(): void;
  dispose(): void;
}

const MSG_TEXT_ONLY = "No se pudo leer en voz alta. Puedes leer el texto.";
const MSG_PLAY_FAILED = "No se pudo reproducir. Puedes reintentar.";
const MSG_MEDIA_ERROR = "No se pudo cargar el archivo. Puedes reintentar.";

export function createPlaybackCoordinator(deps: CoordinatorDeps): PlaybackCoordinator {
  const byId = new Map(deps.stations.map((s) => [s.id, s] as const));
  const media = new Map<string, MediaHandle>();
  const listeners = new Set<(s: PlaybackSnapshot) => void>();

  let activeId: string | null = null;
  let phase: PlaybackPhase = "idle";
  let playPending = false;
  let token = 0;
  let muted = deps.session.read().muted;
  let errorMessage: string | null = null;
  let canRetry = false;

  const active = (): Station | undefined => (activeId ? byId.get(activeId) : undefined);

  const isPresented = (id: string) => deps.session.read().presentedStations.includes(id);
  const markPresented = (id: string) => {
    const current = deps.session.read().presentedStations;
    if (!current.includes(id)) deps.session.write({ presentedStations: [...current, id] });
  };

  const snapshot = (): PlaybackSnapshot => {
    const h = activeId ? media.get(activeId) : undefined;
    return {
      activeStationId: activeId,
      phase,
      muted,
      positionSeconds: h ? h.currentTime() : 0,
      durationSeconds: h ? h.duration() : null,
      errorMessage,
      canRetry,
      introductionPresented: activeId ? isPresented(activeId) : false,
    };
  };

  const emit = () => {
    const s = snapshot();
    for (const l of listeners) l(s);
  };

  const getMedia = (station: Station): MediaHandle => {
    const existing = media.get(station.id);
    if (existing) return existing;
    const handle = deps.createMedia(station);
    handle.setMuted(muted);
    handle.onEnded(() => {
      if (activeId !== station.id) return; // final obsoleto
      phase = "ready";
      emit();
    });
    handle.onError(() => {
      if (activeId !== station.id) return;
      phase = "error";
      errorMessage = MSG_MEDIA_ERROR;
      canRetry = true;
      emit();
    });
    media.set(station.id, handle);
    return handle;
  };

  /** Detiene todo lo audible y invalida callbacks en vuelo. */
  const stopAll = () => {
    token++;
    deps.speech.cancel();
    const h = activeId ? media.get(activeId) : undefined;
    if (h) h.pause();
  };

  const playIntroductionInternal = () => {
    const station = active();
    if (!station) return;
    const t = ++token;
    deps.speech.cancel();
    media.get(station.id)?.pause();
    errorMessage = null;
    canRetry = false;

    const text = station.narration.speechText ?? station.narration.text;
    if (text.trim().length === 0 || muted) {
      // Sin texto o en silencio: se muestra el texto y se habilita el contenido.
      markPresented(station.id);
      phase = "ready";
      emit();
      return;
    }

    phase = "narrating";
    emit();
    deps.speech.speakText(text, {
      // Solo actúan mientras se narra: un evento tardío no debe pisar la carga o la reproducción.
      onEnd: () => {
        if (t !== token || phase !== "narrating") return;
        markPresented(station.id);
        phase = "ready";
        emit();
      },
      onFail: () => {
        if (t !== token || phase !== "narrating") return;
        phase = "ready";
        errorMessage = MSG_TEXT_ONLY;
        emit();
      },
    });
  };

  const coordinator: PlaybackCoordinator = {
    get state() {
      return snapshot();
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    select(stationId) {
      const station = byId.get(stationId);
      if (!station) return;
      // Pausa lo anterior conservando su posición y cancela la voz en curso.
      stopAll();
      activeId = stationId;
      phase = "ready";
      errorMessage = null;
      canRetry = false;
      emit();
    },

    playIntroduction(opts = {}) {
      if (opts.automatic) {
        // No se fuerza la introducción de una estación ya presentada (US2-A2).
        if (activeId && isPresented(activeId)) return;
        // Una reproducción pedida por la visita no se interrumpe.
        if (phase === "playing" || playPending) return;
      }
      playIntroductionInternal();
    },

    restartIntroduction() {
      playIntroductionInternal();
    },

    async togglePlay() {
      const station = active();
      if (!station) return;
      if (phase === "narrating") return; // Play se deshabilita durante la narración
      if (phase === "loading") return; // ya se está cargando: no se repite play()

      const handle = getMedia(station);
      if (phase === "playing") {
        handle.pause();
        phase = "paused";
        emit();
        return;
      }

      const t = token;
      deps.speech.cancel(); // nunca voz y medio a la vez
      playPending = true;
      phase = "loading";
      emit();
      try {
        await handle.play();
      } catch {
        if (t !== token || activeId !== station.id) return;
        phase = "error";
        errorMessage = MSG_PLAY_FAILED;
        canRetry = true;
        emit();
        return;
      } finally {
        playPending = false;
      }
      if (t !== token || activeId !== station.id) {
        handle.pause(); // respuesta tardía: no debe sonar
        return;
      }
      phase = "playing";
      errorMessage = null;
      canRetry = false;
      emit();
    },

    close() {
      stopAll();
      activeId = null;
      phase = "idle";
      errorMessage = null;
      canRetry = false;
      emit();
    },

    setMuted(value) {
      muted = value;
      deps.session.write({ muted: value });
      for (const h of media.values()) h.setMuted(value);
      if (value) {
        const station = active();
        const wasNarrating = phase === "narrating";
        token++;
        deps.speech.cancel();
        if (station && wasNarrating) {
          // Silencio durante la narración: el texto queda visible y la estación cuenta como presentada.
          markPresented(station.id);
          phase = "ready";
        }
      }
      emit();
    },

    seek(seconds) {
      const h = activeId ? media.get(activeId) : undefined;
      h?.seek(seconds);
      emit();
    },

    setVolume(v) {
      for (const h of media.values()) h.setVolume(v);
    },

    onVisibilityHidden() {
      stopAll();
      if (phase === "playing" || phase === "narrating") phase = "paused";
      emit();
    },

    dispose() {
      token++;
      deps.speech.cancel();
      for (const h of media.values()) h.dispose();
      media.clear();
      listeners.clear();
    },
  };

  return coordinator;
}
