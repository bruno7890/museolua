// Controlador de síntesis de voz con tokens de operación y watchdogs (EC-03).
// Cada locución tiene un identificador: los callbacks de una locución que ya no es la actual se ignoran.
// SpeechPort aísla el motor real (speechSynthesis) para poder probarlo sin navegador.

import type { VoiceLike } from "./voice-selection.ts";

export type SpeechFailReason = "unsupported" | "error" | "timeout";

export interface SpeechUtteranceLike {
  text: string;
  lang: string;
  voice: VoiceLike | null;
  rate: number;
  pitch: number;
  volume: number;
  onstart?: () => void;
  onend?: () => void;
  onerror?: () => void;
}

export interface SpeechPort {
  readonly supported: boolean;
  speak(u: SpeechUtteranceLike): void;
  cancel(): void;
  getVoices(): readonly VoiceLike[];
}

export interface SpeechHandlers {
  onStart?: () => void;
  onEnd: () => void;
  onFail: (reason: SpeechFailReason) => void;
}

export interface SpeechSession {
  id: number;
  text: string;
}

export interface SpeechOptions {
  startTimeoutMs: number;
  maxUtteranceMs: number;
  baseEndTimeoutMs: number;
  msPerCharacter: number;
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: VoiceLike | null;
  /** Proveedor de voz: permite elegir la voz cuando el navegador termina de cargarlas (voiceschanged). */
  getVoice?: () => VoiceLike | null;
}

export interface SpeechController {
  speakText(text: string, handlers: SpeechHandlers): SpeechSession;
  cancel(): void;
  refreshVoices(): void;
}

interface Current {
  id: number;
  handlers: SpeechHandlers;
  startTimer: ReturnType<typeof setTimeout> | undefined;
  endTimer: ReturnType<typeof setTimeout> | undefined;
}

export function endWatchdogMs(textLength: number, o: Pick<SpeechOptions, "maxUtteranceMs" | "baseEndTimeoutMs" | "msPerCharacter">): number {
  return Math.min(o.maxUtteranceMs, o.baseEndTimeoutMs + o.msPerCharacter * textLength);
}

export function createSpeechController(port: SpeechPort, o: SpeechOptions): SpeechController {
  let current: Current | null = null;
  let nextId = 0;

  const clearTimers = (c: Current) => {
    if (c.startTimer !== undefined) clearTimeout(c.startTimer);
    if (c.endTimer !== undefined) clearTimeout(c.endTimer);
    c.startTimer = undefined;
    c.endTimer = undefined;
  };

  const detach = (): Current | null => {
    const c = current;
    if (c) clearTimers(c);
    current = null;
    return c;
  };

  return {
    speakText(text, handlers) {
      const id = ++nextId;
      const session: SpeechSession = { id, text };
      if (!port.supported) {
        handlers.onFail("unsupported");
        return session;
      }
      // Una nueva locución sustituye a la anterior.
      detach();
      port.cancel();

      const c: Current = { id, handlers, startTimer: undefined, endTimer: undefined };
      current = c;
      const isCurrent = () => current === c;

      const fail = (reason: SpeechFailReason) => {
        if (!isCurrent()) return;
        detach();
        port.cancel();
        handlers.onFail(reason);
      };

      c.startTimer = setTimeout(() => fail("timeout"), o.startTimeoutMs);

      port.speak({
        text,
        lang: o.lang ?? "es",
        voice: o.getVoice ? o.getVoice() : (o.voice ?? null),
        rate: o.rate ?? 1,
        pitch: o.pitch ?? 1,
        volume: o.volume ?? 1,
        onstart: () => {
          if (!isCurrent()) return;
          if (c.startTimer !== undefined) clearTimeout(c.startTimer);
          c.startTimer = undefined;
          handlers.onStart?.();
          c.endTimer = setTimeout(() => fail("timeout"), endWatchdogMs(text.length, o));
        },
        onend: () => {
          if (!isCurrent()) return;
          detach();
          handlers.onEnd();
        },
        onerror: () => fail("error"),
      });
      return session;
    },

    cancel() {
      if (current) {
        detach();
      }
      port.cancel();
    },

    refreshVoices() {
      // Lee la lista para futuras locuciones; no interrumpe la que suena.
      port.getVoices();
    },
  };
}

/** Puerto real sobre speechSynthesis. Solo se usa en el navegador. */
export function createBrowserSpeechPort(
  synth: SpeechSynthesis | undefined = globalThis.speechSynthesis,
  Utterance: typeof SpeechSynthesisUtterance | undefined = globalThis.SpeechSynthesisUtterance,
): SpeechPort {
  return {
    supported: Boolean(synth && Utterance),
    speak(u) {
      if (!synth || !Utterance) return;
      const utt = new Utterance(u.text);
      utt.lang = u.lang;
      utt.rate = u.rate;
      utt.pitch = u.pitch;
      utt.volume = u.volume;
      utt.voice = (u.voice as SpeechSynthesisVoice | null) ?? null;
      utt.onstart = () => u.onstart?.();
      utt.onend = () => u.onend?.();
      utt.onerror = () => u.onerror?.();
      synth.speak(utt);
    },
    cancel() {
      synth?.cancel();
    },
    getVoices() {
      return synth ? synth.getVoices() : [];
    },
  };
}
