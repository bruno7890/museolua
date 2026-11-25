import { expect, test } from "@playwright/test";
import { disableWebGL2, unlock } from "./helpers.ts";

// T068 / FR-021, FR-022: el catálogo 2D muestra las mismas diez estaciones de la sala
// y cada una abre el mismo panel de estación.

const TITULOS = [
  "Canción de Lua 01",
  "Canción de Lua 02",
  "Canción de Lua 03",
  "Vídeo de Lua 04",
  "Canción de Lua 05",
  "Canción de Lua 06",
  "Canción de Lua 07",
  "Canción de Lua 08",
  "Vídeo de Lua 09",
  "Canción de Lua 10",
];

const IDS = [
  "estacion-01",
  "estacion-02",
  "estacion-03",
  "estacion-04",
  "estacion-05",
  "estacion-06",
  "estacion-07",
  "estacion-08",
  "estacion-09",
  "estacion-10",
];

test.describe("colección completa", () => {
  test("el catálogo 2D ofrece las mismas estaciones que la sala", async ({ page }) => {
    await page.goto("./");
    await unlock(page);
    const enter = page.getByRole("button", { name: "Entrar al museo" });
    await expect(enter).toBeEnabled({ timeout: 30_000 });
    await enter.click();
    await expect(page.locator("#gate")).toBeHidden({ timeout: 10_000 });

    await page.getByRole("button", { name: "Catálogo" }).click();
    const items = page.locator("#catalog-list [data-station-id]");
    await expect(items).toHaveCount(10);
    const ids = await items.evaluateAll((els) => els.map((el) => el.getAttribute("data-station-id")));
    expect(ids).toEqual(IDS);
  });
});

// El recorrido completo se comprueba en la alternativa 2D: la sala 3D con WebGL por software
// es demasiado lenta para abrir las diez estaciones seguidas.
test.describe("sin WebGL 2: las diez estaciones", () => {
  test.beforeEach(async ({ page }) => {
    await disableWebGL2(page);
    await page.goto("./");
    await unlock(page);
    await expect(page.locator("#catalog-list [data-station-id]")).toHaveCount(10, { timeout: 15_000 });
  });

  test("cada una abre su panel con su título, su texto y su reproducción", async ({ page }) => {
    const items = page.locator("#catalog-list [data-station-id]");

    for (let i = 0; i < TITULOS.length; i++) {
      await items.nth(i).click();

      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText(TITULOS[i]!);
      // El mismo panel para todas: texto visible y control de reproducción disponible.
      await expect(dialog.locator("#station-text")).not.toBeEmpty();
      await expect(page.getByRole("button", { name: "Reproducir" })).toBeEnabled();

      await page.locator("#station-close").click();
      await expect(dialog).toBeHidden();
      // Al cerrar, el catálogo vuelve a estar disponible (única vía de acceso sin 3D).
      await expect(page.locator("#catalog-2d")).toBeVisible();
    }
  });
});
