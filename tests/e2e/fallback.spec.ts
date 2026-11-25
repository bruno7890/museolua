import { expect, test } from "@playwright/test";
import { disableWebGL2, spyAudio, unlock } from "./helpers.ts";

test.describe("sin WebGL 2: catálogo accesible con las diez estaciones", () => {
  test.beforeEach(async ({ page }) => {
    await spyAudio(page);
    await disableWebGL2(page);
  });

  test("muestra las diez estaciones y explica la alternativa", async ({ page }) => {
    await page.goto("./");
    await unlock(page);
    const catalog = page.locator("#catalog-2d");
    await expect(catalog).toBeVisible({ timeout: 15_000 });
    await expect(page.locator(".catalog__item")).toHaveCount(10);
    await expect(page.locator("#webgl-message")).toContainText("WebGL 2");
    await expect(page.locator("#museum")).toBeHidden();
    await expect(page.locator("#catalog-close")).toBeHidden();
  });

  test("abrir una estación desde el catálogo muestra su panel", async ({ page }) => {
    await page.goto("./");
    await unlock(page);
    await expect(page.locator(".catalog__item")).toHaveCount(10, { timeout: 15_000 });
    await page.locator('[data-station-id="estacion-04"]').click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("Vídeo de Lua 04");
  });
});
