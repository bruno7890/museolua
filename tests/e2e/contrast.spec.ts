import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { spyAudio, unlock } from "./helpers.ts";

// Contraste medido con axe-core (WCAG 2 AA) en cada pantalla de la visita.
const AXE = path.resolve("node_modules/axe-core/axe.min.js");

async function contrasteDe(page: Page): Promise<string[]> {
  const resultado = await page.evaluate(async () => {
    const axe = (window as unknown as { axe: { run: (c: unknown, o: unknown) => Promise<{ violations: { id: string; nodes: { html: string; any: { message: string }[] }[] }[] }> } }).axe;
    const r = await axe.run(document, { runOnly: { type: "rule", values: ["color-contrast"] } });
    return r.violations.flatMap((v) =>
      v.nodes.map((n) => `${v.id}: ${n.html.slice(0, 120)} · ${n.any[0]?.message ?? ""}`),
    );
  });
  return resultado;
}

test.describe("contraste de texto (WCAG 2 AA, medido con axe-core)", () => {
  test.beforeEach(async ({ page }) => {
    await spyAudio(page);
    // Como script de inicialización de Playwright: la CSP del sitio no se relaja para la prueba.
    await page.addInitScript({ path: AXE });
  });

  test("pantalla de entrada", async ({ page }) => {
    await page.goto("./");
    await expect(page.getByRole("heading", { name: "Museo de Lua" })).toBeVisible();
    expect(await contrasteDe(page)).toEqual([]);
  });

  test("barra del museo, ayuda y catálogo", async ({ page }) => {
    await page.goto("./");
    await unlock(page);
    await expect(page.getByRole("button", { name: "Entrar al museo" })).toBeEnabled({ timeout: 30_000 });
    await page.getByRole("button", { name: "Entrar al museo" }).click();
    await expect(page.locator("#gate")).toBeHidden({ timeout: 10_000 });
    await expect(page.locator("#help")).toBeVisible();
    expect(await contrasteDe(page)).toEqual([]);

    await page.getByRole("button", { name: "Catálogo" }).click();
    await expect(page.locator("#catalog-2d")).toBeVisible();
    expect(await contrasteDe(page)).toEqual([]);
  });

  test("panel de estación con texto y estado", async ({ page }) => {
    await page.goto("./");
    await unlock(page);
    await expect(page.getByRole("button", { name: "Entrar al museo" })).toBeEnabled({ timeout: 30_000 });
    await page.getByRole("button", { name: "Entrar al museo" }).click();
    await expect(page.locator("#gate")).toBeHidden({ timeout: 10_000 });
    await page.getByRole("button", { name: "Catálogo" }).click();
    await page.locator('[data-station-id="estacion-01"]').click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(await contrasteDe(page)).toEqual([]);
  });
});
