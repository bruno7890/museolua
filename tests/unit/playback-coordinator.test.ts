import { describe, expect, it, vi } from "vitest";
import { createPlaybackCoordinator, type MediaHandle, type SpeechLike, type SpeechHandlers } from "../../src/media/playback-coordinator.ts";
import { createSessionStore } from "../../src/app/session-store.ts";
import { stationsFixture } from "../fixtures/catalog.ts";
import type { Station } from "../../src/content/types.ts";

class MemoryStorage implements Storage {
  private d = new Map<string, string>();
  get length() {
    return this.d.size;
  }
  clear() {
    this.d.clear();
  }
  getItem(k: string) {
    return this.d.get(k) ?? null;
  }
  key(i: number) {
    return [...this.d.keys()][i] ?? null;
  }
  removeItem(k: string) {
    this.d.delete(k);
  }
  setItem(k: string, v: string) {
    this.d.set(k, v);
  }
}

interface Utterance {
  text: string;
  handlers: SpeechHandlers;
}

interface FakeSpeech extends SpeechLike {
  utterances: Utterance[];
}

function fakeSpeech(): FakeSpeech {
  const utterances: Utterance[] = [];
  return {
    utterances,
    speakText: vi.fn((text: string, handlers: SpeechHandlers) => {
      utterances.push({ text, handlers });
      return { id: utterances.length };
    }),
    cancel: vi.fn(),
    refreshVoices: vi.fn(),
  };
}

interface FakeMedia extends MediaHandle {
  playing: boolean;
  muted: boolean;
  time: number;
  endedCb?: () => void;
  rejectNextPlay: string | undefined;
}

function fakeMedia(kind: "audio" | "video"): FakeMedia {
  const m: FakeMedia = {
    kind,
    rejectNextPlay: undefined,
    playing: false,
    muted: false,
    time: 0,
    play: vi.fn(async () => {
      if (m.rejectNextPlay) {
        const msg = m.rejectNextPlay;
        m.rejectNextPlay = undefined;
        throw new Error(msg);
      }
      m.playing = true;
    }),
    pause: vi.fn(() => {
      m.playing = false;
    }),
    setMuted: vi.fn((v: boolean) => {
      m.muted = v;
    }),
    setVolume: vi.fn(),
    seek: vi.fn((s: number) => {
      m.time = s;
    }),
    currentTime: () => m.time,
    duration: () => 6,
    onEnded: (cb) => {
      m.endedCb = cb;
    },
    onError: vi.fn(),
    dispose: vi.fn(),
  };
  return m;
}

const stations: Station[] = stationsFixture().stations;
const A = "estacion-01"; // audio
const B = "estacion-02"; // audio
const V = "estacion-04"; // vídeo
const TEXT_A = stations[0]!.narration.text;

function setup() {
  const speech = fakeSpeech();
  const media = new Map<string, FakeMedia>();
  const session = createSessionStore(new MemoryStorage());
  const coord = createPlaybackCoordinator({
    speech,
    stations,
    session,
    createMedia: (s) => {
      const m = fakeMedia(s.type === "video" ? "video" : "audio");
      media.set(s.id, m);
      return m;
    },
  });
  return { coord, speech, media, session };
}

describe("PlaybackCoordinator: selección e introducción", () => {
  it("seleccionar muestra la estación sin hablar ni reproducir", () => {
    const { coord, speech } = setup();
    coord.select(A, { fromGesture: true });
    expect(coord.state.activeStationId).toBe(A);
    expect(coord.state.phase).toBe("ready");
    expect(speech.speakText).not.toHaveBeenCalled();
  });

  it("la introducción narra el texto y al terminar habilita Play sin reproducir", () => {
    const { coord, speech, media } = setup();
    coord.select(A, { fromGesture: true });
    coord.playIntroduction();
    expect(coord.state.phase).toBe("narrating");
    expect(speech.utterances[0]!.text).toBe(TEXT_A);
    speech.utterances[0]!.handlers.onEnd();
    expect(coord.state.phase).toBe("ready");
    expect(coord.state.introductionPresented).toBe(true);
    expect(media.has(A)).toBe(false);
  });

  it("si falla la voz, muestra el texto y no bloquea", () => {
    const { coord, speech } = setup();
    coord.select(A, { fromGesture: true });
    coord.playIntroduction();
    speech.utterances[0]!.handlers.onFail("timeout");
    expect(coord.state.phase).toBe("ready");
    expect(coord.state.errorMessage).not.toBeNull();
  });

  it("silenciado, no habla pero cuenta la introducción como presentada", () => {
    const { coord, speech, session } = setup();
    coord.setMuted(true);
    coord.select(A, { fromGesture: true });
    coord.playIntroduction();
    expect(speech.speakText).not.toHaveBeenCalled();
    expect(coord.state.phase).toBe("ready");
    expect(session.read().presentedStations).toContain(A);
  });

  it("cambiar de estación mientras narra cancela la voz y descarta el callback antiguo", () => {
    const { coord, speech } = setup();
    coord.select(A, { fromGesture: true });
    coord.playIntroduction();
    coord.select(B, { fromGesture: true });
    expect(speech.cancel).toHaveBeenCalled();
    speech.utterances[0]!.handlers.onEnd(); // llega tarde
    expect(coord.state.activeStationId).toBe(B);
    expect(coord.state.phase).toBe("ready");
    expect(coord.state.introductionPresented).toBe(false);
  });

  it("repetir la introducción narra de nuevo desde el principio", () => {
    const { coord, speech } = setup();
    coord.select(A, { fromGesture: true });
    coord.playIntroduction();
    speech.utterances[0]!.handlers.onEnd();
    coord.restartIntroduction();
    expect(coord.state.phase).toBe("narrating");
    expect(speech.utterances.at(-1)!.text).toBe(TEXT_A);
  });
});

describe("PlaybackCoordinator: reproducción", () => {
  it("Play se considera activo solo después de que play() resuelva", async () => {
    const { coord, media } = setup();
    coord.select(A, { fromGesture: true });
    const pending = coord.togglePlay();
    expect(coord.state.phase).toBe("ready");
    await pending;
    expect(media.get(A)!.playing).toBe(true);
    expect(coord.state.phase).toBe("playing");
  });

  it("si play() rechaza, pasa a error con reintento disponible", async () => {
    const { coord, media } = setup();
    coord.select(A, { fromGesture: true });
    await coord.togglePlay(); // reproduce
    await coord.togglePlay(); // pausa
    media.get(A)!.rejectNextPlay = "NotAllowedError";
    await coord.togglePlay(); // el navegador rechaza play()
    expect(coord.state.phase).toBe("error");
    expect(coord.state.canRetry).toBe(true);
    expect(coord.state.errorMessage).toMatch(/reintentar/i);
  });

  it("Play se ignora mientras se narra la introducción", async () => {
    const { coord, media } = setup();
    coord.select(A, { fromGesture: true });
    coord.playIntroduction();
    await coord.togglePlay();
    expect(media.has(A)).toBe(false);
    expect(coord.state.phase).toBe("narrating");
  });

  it("una introducción automática (llegada al cuadro) no interrumpe una reproducción pedida por el visitante", async () => {
    const { coord, media, speech } = setup();
    coord.select(A, { fromGesture: true });
    const pending = coord.togglePlay(); // el visitante pulsa Play mientras la cámara avanza
    coord.playIntroduction({ automatic: true });
    await pending;
    expect(media.get(A)!.playing).toBe(true);
    expect(speech.speakText).not.toHaveBeenCalled();
    expect(coord.state.phase).toBe("playing");
  });

  it("nunca hay dos fuentes sonoras: escuchar la introducción pausa el medio activo", async () => {
    const { coord, media } = setup();
    coord.select(A, { fromGesture: true });
    await coord.togglePlay();
    coord.playIntroduction();
    expect(media.get(A)!.playing).toBe(false);
    expect(coord.state.phase).toBe("narrating");
  });

  it("al cambiar de estación pausa el medio anterior y conserva su posición", async () => {
    const { coord, media } = setup();
    coord.select(A, { fromGesture: true });
    await coord.togglePlay();
    media.get(A)!.time = 42;
    coord.select(B, { fromGesture: true });
    expect(media.get(A)!.pause).toHaveBeenCalled();
    coord.select(A, { fromGesture: true });
    expect(media.get(A)!.seek).not.toHaveBeenCalled();
    expect(media.get(A)!.currentTime()).toBe(42);
  });

  it("un final de reproducción obsoleto no cambia la estación actual", async () => {
    const { coord, media } = setup();
    coord.select(A, { fromGesture: true });
    await coord.togglePlay();
    const endedA = media.get(A)!.endedCb!;
    coord.select(B, { fromGesture: true });
    endedA();
    expect(coord.state.activeStationId).toBe(B);
    expect(coord.state.phase).toBe("ready");
  });

  it("silenciar cancela la voz, mantiene el texto y aplica muted a los medios nuevos", async () => {
    const { coord, speech, media } = setup();
    coord.select(A, { fromGesture: true });
    coord.playIntroduction();
    coord.setMuted(true);
    expect(speech.cancel).toHaveBeenCalled();
    expect(coord.state.phase).toBe("ready");
    expect(coord.state.muted).toBe(true);
    coord.select(V, { fromGesture: true });
    await coord.togglePlay();
    expect(media.get(V)!.muted).toBe(true);
  });

  it("ocultar la pestaña pausa todo y no reanuda al volver", async () => {
    const { coord, media, speech } = setup();
    coord.select(A, { fromGesture: true });
    await coord.togglePlay();
    coord.onVisibilityHidden();
    expect(media.get(A)!.playing).toBe(false);
    expect(speech.cancel).toHaveBeenCalled();
    expect(coord.state.phase).toBe("paused");
  });

  it("dispose libera los medios creados", async () => {
    const { coord, media } = setup();
    coord.select(A, { fromGesture: true });
    await coord.togglePlay();
    coord.dispose();
    expect(media.get(A)!.dispose).toHaveBeenCalled();
  });
});
