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
