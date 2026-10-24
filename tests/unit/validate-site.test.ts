import { describe, expect, it } from "vitest";
import { validateSiteConfig } from "../../src/content/validate.ts";
import { existingPathsFixture, siteFixture } from "../fixtures/catalog.ts";

const demo = { mode: "demo" as const, existingPaths: existingPathsFixture() };

function codes(input: unknown): string[] {
  return validateSiteConfig(input, demo).issues.map((i) => i.code);
}

describe("validateSiteConfig", () => {
  it("acepta la configuración de referencia", () => {
    expect(validateSiteConfig(siteFixture(), demo).issues).toEqual([]);
  });

  it("rechaza una imagen de techo cuyo archivo no existe", () => {
    const site = siteFixture();
    site.room = { ceilingImage: { src: "media/room/no-existe.jpg", width: 1024, height: 908 } };
    expect(codes(site)).toContain("missing-file");
  });

  it("rechaza una imagen de techo sin dimensiones", () => {
    const site = siteFixture();
    site.room = { ceilingImage: { src: "media/room/techo.jpg", width: 0, height: 908 } };
    expect(codes(site)).toContain("number");
  });

  it("valida rangos de voz", () => {
    const site = siteFixture();
    site.speech.rate = 3;
    site.speech.volume = 1.5;
    site.speech.pitch = -1;
    expect(codes(site).filter((c) => c === "range")).toHaveLength(3);
  });

  it("solo admite idiomas es-* como respaldo", () => {
    const site = siteFixture();
    site.speech.fallbackLangs = ["en-US"];
    expect(codes(site)).toContain("language");
  });

  it("exige un verificador de 64 caracteres hexadecimales", () => {
    const site = siteFixture();
    site.access.verifier = "clave-en-texto-plano";
    expect(codes(site)).toContain("verifier");
  });

  it("limita el campo de visión entre 30 y 90 grados", () => {
    const site = siteFixture();
    site.navigation.fov = 120;
    expect(codes(site)).toContain("range");
  });

  it("rechaza la versión de esquema incorrecta", () => {
    const site = { ...siteFixture(), schemaVersion: 2 };
    expect(codes(site)).toContain("schema-version");
  });
});
