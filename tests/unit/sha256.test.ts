import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { sha256Bytes } from "../../src/access/sha256.ts";

// Respaldo de SHA-256 para contextos no seguros: se compara con node:crypto
// y con los vectores públicos de FIPS 180-4.

describe("sha256Bytes", () => {
  const hex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");

  it("coincide con el vector de la cadena vacía", () => {
    expect(hex(sha256Bytes(new Uint8Array(0)))).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
  });

  it("coincide con el vector de «abc»", () => {
    expect(hex(sha256Bytes(new TextEncoder().encode("abc")))).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });

  it("coincide con node:crypto en textos de distintos tamaños", () => {
    for (const texto of ["a", "lua", "museo-de-lua-v1:lua", "á".repeat(100), "x".repeat(55), "y".repeat(56), "z".repeat(64)]) {
      const esperado = createHash("sha256").update(texto, "utf8").digest("hex");
      expect(hex(sha256Bytes(new TextEncoder().encode(texto)))).toBe(esperado);
    }
  });
});
