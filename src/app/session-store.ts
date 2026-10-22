// Estado de sesión: acceso concedido, silencio y estaciones presentadas (FR-030, EC-06).
// Usa sessionStorage cuando funciona; si falla, cae a memoria sin lanzar errores.

export const SESSION_KEY = "museo-de-lua:v1";

export interface SessionSnapshot {
  granted: boolean;
  muted: boolean;
  presentedStations: string[];
}

export interface SessionStore {
  read(): SessionSnapshot;
  write(patch: Partial<SessionSnapshot>): void;
  readonly backend: "sessionStorage" | "memory";
}

const EMPTY: SessionSnapshot = { granted: false, muted: false, presentedStations: [] };

function parse(raw: string | null): SessionSnapshot | null {
  if (raw === null) return null;
  try {
    const v: unknown = JSON.parse(raw);
    if (typeof v !== "object" || v === null) return null;
    const o = v as Partial<SessionSnapshot>;
    return {
      granted: o.granted === true,
      muted: o.muted === true,
      presentedStations: Array.isArray(o.presentedStations)
        ? o.presentedStations.filter((s): s is string => typeof s === "string")
        : [],
    };
  } catch {
    return null;
  }
}

export function createSessionStore(storage: Storage | undefined = globalThis.sessionStorage): SessionStore {
  let memory: SessionSnapshot = { ...EMPTY, presentedStations: [] };
  let backend: "sessionStorage" | "memory" = storage ? "sessionStorage" : "memory";

  const readRaw = (): SessionSnapshot => {
    if (backend === "memory" || !storage) return memory;
    try {
      return parse(storage.getItem(SESSION_KEY)) ?? { ...EMPTY, presentedStations: [] };
    } catch {
      backend = "memory";
      return memory;
    }
  };

  return {
    get backend() {
      return backend;
    },
    read() {
      return readRaw();
    },
    write(patch) {
      const next: SessionSnapshot = { ...readRaw(), ...patch };
      memory = next;
      if (backend === "memory" || !storage) return;
      try {
        storage.setItem(SESSION_KEY, JSON.stringify(next));
      } catch {
        backend = "memory";
      }
    },
  };
}
