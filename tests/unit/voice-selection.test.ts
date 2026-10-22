import { describe, expect, it } from "vitest";
import { selectSpanishVoice } from "../../src/media/voice-selection.ts";

const FALLBACK = { fallbackLangs: ["es-EC", "es-419"] };

describe("selectSpanishVoice", () => {
  it("prefiere la voz con el nombre configurado", () => {
    const voices = [
      { name: "Monica", lang: "es-ES" },
      { name: "Paulina", lang: "es-MX" },
    ];
    expect(selectSpanishVoice(voices, { ...FALLBACK, preferredVoiceName: "Paulina" })?.name).toBe("Paulina");
  });

  it("después usa los idiomas de respaldo en su orden", () => {
    const voices = [
      { name: "Madrid", lang: "es-ES" },
      { name: "Latam", lang: "es_419" },
    ];
    expect(selectSpanishVoice(voices, FALLBACK)?.name).toBe("Latam");
  });

  it("si no hay respaldo exacto, acepta cualquier voz es-*", () => {
    expect(selectSpanishVoice([{ name: "Madrid", lang: "es-ES" }], FALLBACK)?.name).toBe("Madrid");
  });

  it("nunca devuelve una voz no española para texto español", () => {
    expect(selectSpanishVoice([{ name: "Zira", lang: "en-US" }], FALLBACK)).toBeNull();
  });

  it("devuelve null si la lista está vacía", () => {
    expect(selectSpanishVoice([], FALLBACK)).toBeNull();
  });
});
