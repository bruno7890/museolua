import { describe, expect, it } from "vitest";
import { createSessionStore, SESSION_KEY } from "../../src/app/session-store.ts";

class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length() {
    return this.data.size;
  }
  clear() {
    this.data.clear();
  }
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  key(index: number) {
    return [...this.data.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
}

class FailingStorage extends MemoryStorage {
  override setItem(): void {
    throw new DOMException("quota", "QuotaExceededError");
  }
}

describe("createSessionStore", () => {
  it("usa la clave museo-de-lua:v1", () => {
    expect(SESSION_KEY).toBe("museo-de-lua:v1");
  });

  it("empieza vacío y fusiona cambios", () => {
    const store = createSessionStore(new MemoryStorage());
    expect(store.read()).toEqual({ granted: false, muted: false, presentedStations: [] });
    store.write({ granted: true });
    store.write({ muted: true, presentedStations: ["estacion-01"] });
    expect(store.read()).toEqual({ granted: true, muted: true, presentedStations: ["estacion-01"] });
  });

  it("persiste en el almacenamiento indicado", () => {
    const storage = new MemoryStorage();
    createSessionStore(storage).write({ granted: true });
    expect(JSON.parse(storage.getItem(SESSION_KEY)!)).toMatchObject({ granted: true });
  });

  it("cambia a memoria cuando el almacenamiento falla, sin lanzar", () => {
    const store = createSessionStore(new FailingStorage());
    expect(() => store.write({ muted: true })).not.toThrow();
    expect(store.backend).toBe("memory");
    expect(store.read().muted).toBe(true);
  });

  it("no guarda ningún texto de clave", () => {
    const storage = new MemoryStorage();
    const store = createSessionStore(storage);
    store.write({ granted: true });
    expect(storage.getItem(SESSION_KEY)).not.toMatch(/lua/i);
  });

  it("ignora datos corruptos y empieza de nuevo", () => {
    const storage = new MemoryStorage();
    storage.setItem(SESSION_KEY, "{no es json");
    expect(createSessionStore(storage).read().granted).toBe(false);
  });
});
