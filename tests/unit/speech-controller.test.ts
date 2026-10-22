import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSpeechController, type SpeechPort, type SpeechUtteranceLike } from "../../src/media/speech-controller.ts";

const OPTS = { startTimeoutMs: 4000, maxUtteranceMs: 60000, baseEndTimeoutMs: 2000, msPerCharacter: 80 };

function fakePort(supported = true) {
  const spoken: SpeechUtteranceLike[] = [];
  const port: SpeechPort = {
    supported,
    speak: vi.fn((u: SpeechUtteranceLike) => {
      spoken.push(u);
    }),
    cancel: vi.fn(),
    getVoices: () => [],
  };
  return { port, spoken };
}

function handlers() {
  return { onStart: vi.fn(), onEnd: vi.fn(), onFail: vi.fn() };
}

describe("createSpeechController", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("sin soporte falla de inmediato sin hablar", () => {
    const { port } = fakePort(false);
    const h = handlers();
    createSpeechController(port, OPTS).speakText("hola", h);
    expect(h.onFail).toHaveBeenCalledWith("unsupported");
    expect(port.speak).not.toHaveBeenCalled();
  });

  it("si el motor no inicia dentro del plazo, falla por timeout y cancela", () => {
    const { port } = fakePort();
    const h = handlers();
    createSpeechController(port, OPTS).speakText("hola", h);
    vi.advanceTimersByTime(4000);
    expect(h.onFail).toHaveBeenCalledWith("timeout");
    expect(port.cancel).toHaveBeenCalled();
  });

  it("el fin esperado depende de la longitud del texto y del máximo", () => {
    const { port, spoken } = fakePort();
    const h = handlers();
    const text = "a".repeat(100); // 2000 + 80 × 100 = 10000 ms
    createSpeechController(port, OPTS).speakText(text, h);
    spoken[0]!.onstart?.();
    vi.advanceTimersByTime(9999);
    expect(h.onFail).not.toHaveBeenCalled();
    vi.advanceTimersByTime(2);
    expect(h.onFail).toHaveBeenCalledWith("timeout");
  });

  it("nunca espera más que el máximo por enunciado", () => {
    const { port, spoken } = fakePort();
    const h = handlers();
    createSpeechController(port, { ...OPTS, maxUtteranceMs: 5000 }).speakText("a".repeat(1000), h);
    spoken[0]!.onstart?.();
    vi.advanceTimersByTime(5000);
    expect(h.onFail).toHaveBeenCalledWith("timeout");
  });

  it("onend antes del plazo entrega éxito y no falla después", () => {
    const { port, spoken } = fakePort();
    const h = handlers();
    createSpeechController(port, OPTS).speakText("hola", h);
    spoken[0]!.onstart?.();
    spoken[0]!.onend?.();
    vi.advanceTimersByTime(60000);
    expect(h.onEnd).toHaveBeenCalledTimes(1);
    expect(h.onFail).not.toHaveBeenCalled();
  });

  it("cancel invalida los callbacks tardíos", () => {
    const { port, spoken } = fakePort();
    const h = handlers();
    const ctl = createSpeechController(port, OPTS);
    ctl.speakText("hola", h);
    spoken[0]!.onstart?.();
    ctl.cancel();
    spoken[0]!.onend?.();
    spoken[0]!.onerror?.();
    expect(h.onEnd).not.toHaveBeenCalled();
    expect(h.onFail).not.toHaveBeenCalled();
  });

  it("una nueva locución cancela la anterior; sus callbacks no se ejecutan", () => {
    const { port, spoken } = fakePort();
    const first = handlers();
    const second = handlers();
    const ctl = createSpeechController(port, OPTS);
    ctl.speakText("uno", first);
    ctl.speakText("dos", second);
    spoken[0]!.onend?.();
    spoken[1]!.onstart?.();
    spoken[1]!.onend?.();
    expect(first.onEnd).not.toHaveBeenCalled();
    expect(second.onEnd).toHaveBeenCalledTimes(1);
  });

  it("refreshVoices no cancela lo que se está leyendo", () => {
    const { port, spoken } = fakePort();
    const h = handlers();
    const ctl = createSpeechController(port, OPTS);
    ctl.speakText("hola", h);
    vi.mocked(port.cancel).mockClear(); // speakText cancela la cola antes de empezar; lo ignoramos
    ctl.refreshVoices();
    expect(port.cancel).not.toHaveBeenCalled();
    spoken[0]!.onstart?.();
    spoken[0]!.onend?.();
    expect(h.onEnd).toHaveBeenCalledTimes(1);
  });
});
