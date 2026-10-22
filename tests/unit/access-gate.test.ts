import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { computeVerifier, normalizeAccessKey, verifyAccessKey } from "../../src/access/access-gate.ts";
import { siteFixture } from "../fixtures/catalog.ts";

const SALT = "sal-de-prueba";

function expectedVerifier(normalized: string): string {
  return createHash("sha256").update(`${SALT}:${normalized}`).digest("hex");
}

describe("normalizeAccessKey", () => {
  it("quita espacios externos, pasa a minúsculas y elimina acentos", () => {
    expect(normalizeAccessKey("  Lúa  ")).toBe("lua");
  });

  it("colapsa espacios internos", () => {
    expect(normalizeAccessKey("Luna   de   miel")).toBe("luna de miel");
  });
});

describe("computeVerifier", () => {
  it("calcula SHA-256 sobre sal y clave normalizada", async () => {
    expect(await computeVerifier("lua", SALT)).toBe(expectedVerifier("lua"));
  });
});

/** Simula un contexto no seguro (http por IP local): `crypto.subtle` no existe. */
async function sinCryptoSubtle<T>(accion: () => Promise<T>): Promise<T> {
  const own = Object.getOwnPropertyDescriptor(globalThis.crypto, "subtle");
  Object.defineProperty(globalThis.crypto, "subtle", { value: undefined, configurable: true });
  try {
    return await accion();
  } finally {
    if (own) Object.defineProperty(globalThis.crypto, "subtle", own);
    else Reflect.deleteProperty(globalThis.crypto, "subtle");
  }
}

describe("computeVerifier sin crypto.subtle", () => {
  it("calcula el mismo verificador con el respaldo propio", async () => {
    const verificador = await sinCryptoSubtle(() => computeVerifier("lua", SALT));
    expect(verificador).toBe(expectedVerifier("lua"));
  });

  it("acepta la clave correcta en un contexto no seguro", async () => {
    const config = { ...siteFixture().access, salt: SALT, verifier: expectedVerifier("lua") };
    const ok = await sinCryptoSubtle(() => verifyAccessKey("lua", config));
    expect(ok).toBe(true);
  });

  it("sigue rechazando la clave incorrecta en un contexto no seguro", async () => {
    const config = { ...siteFixture().access, salt: SALT, verifier: expectedVerifier("lua") };
    const ok = await sinCryptoSubtle(() => verifyAccessKey("otra", config));
    expect(ok).toBe(false);
  });

  it("usa el respaldo si `crypto.subtle` falla", async () => {
    const verificador = await sinCryptoSubtle(async () => {
      Object.defineProperty(globalThis.crypto, "subtle", {
        value: { digest: () => Promise.reject(new Error("sin soporte")) },
        configurable: true,
      });
      return computeVerifier("lua", SALT);
    });
    expect(verificador).toBe(expectedVerifier("lua"));
  });
});

describe("verifyAccessKey", () => {
  it("acepta la clave correcta aunque cambie mayúsculas o acentos", async () => {
    const config = { ...siteFixture().access, salt: SALT, verifier: expectedVerifier("lua") };
    expect(await verifyAccessKey("LÚA", config)).toBe(true);
  });

  it("rechaza una clave incorrecta", async () => {
    const config = { ...siteFixture().access, salt: SALT, verifier: expectedVerifier("lua") };
    expect(await verifyAccessKey("otra", config)).toBe(false);
  });

  it("no expone la clave en el resultado", async () => {
    const config = { ...siteFixture().access, salt: SALT, verifier: expectedVerifier("lua") };
    const result = await verifyAccessKey("lua", config);
    expect(JSON.stringify(result)).not.toContain("lua");
  });

  it("rechaza una clave vacía sin consultar el verificador", async () => {
    const config = { ...siteFixture().access, salt: SALT, verifier: expectedVerifier("") };
    expect(await verifyAccessKey("   ", config)).toBe(false);
  });
});
