import { expect, test } from "@playwright/test";
import { spyAudio, unlock } from "./helpers.ts";

test.describe("Reproducir muestra que el audio se está cargando", () => {
  test.beforeEach(async ({ page }) => {
    await spyAudio(page);
  });

  test("mientras carga el MP3 el botón y el estado lo dicen; luego pasa a Pausar", async ({ page }) => {
    let liberar!: () => void;
    const retenido = new Promise<void>((resolve) => {
      liberar = resolve;
    });
    await page.route("**/media/audio/02.mp3", async (route) => {
      await retenido;
      await route.continue();
    });

    await page.goto("./");
    await unlock(page);
    await expect(page.getByRole("button", { name: "Entrar al museo" })).toBeEnabled({ timeout: 30_000 });
    await page.getByRole("button", { name: "Entrar al museo" }).click();
    await expect(page.locator("#gate")).toBeHidden({ timeout: 10_000 });

    await page.getByRole("button", { name: "Catálogo" }).click();
    await page.locator('[data-station-id="estacion-02"]').click();
    await page.getByRole("button", { name: "Reproducir" }).click();

    const cargando = page.getByRole("button", { name: "Cargando…" });
    await expect(cargando).toBeDisabled();
    await expect(page.locator("#station-status")).toContainText("Cargando el audio");

    liberar();
    await expect(page.getByRole("button", { name: "Pausar" })).toBeVisible({ timeout: 30_000 });
  });
});
