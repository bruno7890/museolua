// Elección de voz en español (FR-015). Nunca devuelve una voz no española.

export interface VoiceLike {
  name: string;
  lang: string;
}

export interface VoicePreference {
  preferredVoiceName?: string;
  fallbackLangs: readonly string[];
}

function norm(lang: string): string {
  return lang.replace(/_/g, "-").toLowerCase();
}

export function selectSpanishVoice<V extends VoiceLike>(voices: readonly V[], pref: VoicePreference): V | null {
  if (pref.preferredVoiceName) {
    const exact = voices.find((v) => v.name === pref.preferredVoiceName && norm(v.lang).startsWith("es"));
    if (exact) return exact;
  }
  for (const wanted of pref.fallbackLangs) {
    const w = norm(wanted);
    const hit = voices.find((v) => norm(v.lang) === w);
    if (hit) return hit;
  }
  const anySpanish = voices.find((v) => /^es(-|$)/.test(norm(v.lang)));
  return anySpanish ?? null;
}
