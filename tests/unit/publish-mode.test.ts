import { describe, expect, it } from "vitest";
import { validateAll } from "../../src/content/validate.ts";
import { decorationsFixture, existingPathsFixture, siteFixture, stationsFixture } from "../fixtures/catalog.ts";

function run(mode: "demo" | "publish", mutate?: (f: ReturnType<typeof files>) => void) {
  const f = files();
  mutate?.(f);
  return validateAll(f, { mode, existingPaths: existingPathsFixture() });
}

function files() {
  return { site: siteFixture(), stations: stationsFixture(), decorations: decorationsFixture() };
}

describe("modo demo frente a modo publicación", () => {
  it("el modo demo admite marcadores con placeholder: true", () => {
    expect(run("demo").ok).toBe(true);
  });

  it("el modo publicación rechaza cualquier placeholder y lo indica por archivo", () => {
    const result = run("publish");
    expect(result.ok).toBe(false);
    const placeholderIssues = result.issues.filter((i) => i.code === "placeholder");
    expect(placeholderIssues.length).toBeGreaterThan(0);
    expect(placeholderIssues.every((i) => i.file.length > 0 && i.path.length > 0)).toBe(true);
  });

  it("una ruta inexistente falla en ambos modos", () => {
    const missing = (f: ReturnType<typeof files>) => {
      f.stations.stations[0]!.media.src = "media/audio/no-existe.wav";
    };
    expect(run("demo", missing).ok).toBe(false);
    expect(run("publish", missing).ok).toBe(false);
  });

  it("publicación sin marcadores pasa cuando todo es real", () => {
    const result = run("publish", (f) => {
      for (const s of f.stations.stations) s.placeholder = false;
      for (const d of f.decorations.decorations) d.image.placeholder = false;
      f.site.ornament.placeholder = false;
    });
    expect(result.issues.filter((i) => i.code === "placeholder")).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("cada incidencia identifica archivo, ruta y código", () => {
    const result = run("demo", (f) => {
      f.stations.stations[0]!.id = "estacion-02";
    });
    const issue = result.issues.find((i) => i.code === "duplicate-id");
    expect(issue).toBeDefined();
    expect(issue!.file).toBe("data/stations.json");
    expect(issue!.path).toMatch(/stations\[\d+\]\.id/);
  });
});
