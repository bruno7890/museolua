import { describe, expect, it, vi } from "vitest";
import {
  createPlaybackCoordinator,
  type MediaHandle,
  type SpeechLike,
  type SpeechHandlers,
} from "../../src/media/playback-coordinator.ts";
import { createSessionStore } from "../../src/app/session-store.ts";
import { stationsFixture } from "../fixtures/catalog.ts";
import type { Station } from "../../src/content/types.ts";

// Política de introducción (US2-A1, US2-A2, EC-05):
// la primera llegada a un cuadro presenta su introducción; repetir una estación ya
// presentada no la fuerza; una introducción abandonada puede ofrecerse de nuevo;
// el silencio durante la narración cuenta como presentación textual.

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

function fakeMedia(kind: "audio" | "video"): MediaHandle {
  return {
    kind,
    play: vi.fn(async () => undefined),
    pause: vi.fn(),
    setMuted: vi.fn(),
    setVolume: vi.fn(),
    seek: vi.fn(),
    currentTime: () => 0,
    duration: () => 6,
    onEnded: vi.fn(),
    onError: vi.fn(),
    dispose: vi.fn(),
  };
}

const stations: Station[] = stationsFixture().stations;
const A = "estacion-01";
const B = "estacion-02";

function setup() {
  const speech = fakeSpeech();
  const session = createSessionStore(new MemoryStorage());
  const coord = createPlaybackCoordinator({
    speech,
    stations,
    session,
    createMedia: (s) => fakeMedia(s.type === "video" ? "video" : "audio"),
  });
  return { coord, speech, session };
}

describe("Política de introducción", () => {
  it("la primera llegada a un cuadro presenta su introducción", () => {
    const { coord, speech } = setup();
    coord.select(A, { fromGesture: true });
    coord.playIntroduction({ automatic: true });

    expect(speech.utterances).toHaveLength(1);
    expect(speech.utterances[0]!.text).toBe(stations[0]!.narration.text);
    expect(coord.state.phase).toBe("narrating");
  });

  it("terminada la introducción, la estación queda presentada en la sesión", () => {
    const { coord, speech, session } = setup();
    coord.select(A, { fromGesture: true });
    coord.playIntroduction({ automatic: true });
    speech.utterances[0]!.handlers.onEnd();

    expect(coord.state.phase).toBe("ready");
    expect(coord.state.introductionPresented).toBe(true);
    expect(session.read().presentedStations).toContain(A);
  });

  it("repetir una estación ya presentada no vuelve a narrar sola", () => {
    const { coord, speech } = setup();
    coord.select(A, { fromGesture: true });
    coord.playIntroduction({ automatic: true });
    speech.utterances[0]!.handlers.onEnd();

    // La visita vuelve a la misma estación: Play queda disponible sin narración forzada.
    coord.select(A, { fromGesture: true });
    coord.playIntroduction({ automatic: true });

    expect(speech.utterances).toHaveLength(1);
    expect(coord.state.phase).toBe("ready");
  });

  it("pedir la introducción a mano sí vuelve a narrar una estación presentada", () => {
    const { coord, speech } = setup();
    coord.select(A, { fromGesture: true });
    coord.playIntroduction({ automatic: true });
    speech.utterances[0]!.handlers.onEnd();

    coord.playIntroduction();

    expect(speech.utterances).toHaveLength(2);
  });

  it("una introducción abandonada a mitad puede volver a ofrecerse", () => {
    const { coord, speech, session } = setup();
    coord.select(A, { fromGesture: true });
    coord.playIntroduction({ automatic: true });

    // La visita abandona la estación: la narración se cancela y no queda presentada.
    coord.select(B, { fromGesture: true });

    expect(speech.utterances).toHaveLength(1);
    expect(session.read().presentedStations).not.toContain(A);

    // Al volver a la estación, la introducción se ofrece otra vez.
    coord.select(A, { fromGesture: true });
    coord.playIntroduction({ automatic: true });

    expect(speech.utterances).toHaveLength(2);
  });

  it("silenciar durante la narración cuenta como presentación textual", () => {
    const { coord, speech, session } = setup();
    coord.select(A, { fromGesture: true });
    coord.playIntroduction({ automatic: true });
    expect(coord.state.phase).toBe("narrating");

    coord.setMuted(true);

    expect(coord.state.phase).toBe("ready");
    expect(coord.state.introductionPresented).toBe(true);
    expect(session.read().presentedStations).toContain(A);
    // Y no se vuelve a narrar al volver a la estación.
    coord.playIntroduction({ automatic: true });
    expect(speech.utterances).toHaveLength(1);
  });
});
