import { expect, test } from "@playwright/test";
import { spyAudio, unlock } from "./helpers.ts";

// Ampliar un vídeo y salir de la pantalla completa con el sistema (Atrás, Esc o el
// botón del navegador) no debe dejar el vídeo tapando el diálogo.
test.describe("ampliar vídeo", () => {
  test.beforeEach(async ({ page }) => {
    await spyAudio(page);
    await page.goto("./");
    await unlock(page);
    await expect(page.getByRole("button", { name: "Entrar al museo" })).toBeEnabled({ timeout: 30_000 });
    await page.getByRole("button", { name: "Entrar al museo" }).click();
    await expect(page.locator("#gate")).toBeHidden({ timeout: 10_000 });
  });

  test("al salir de pantalla completa por el sistema el diálogo vuelve a verse con sus botones", async ({ page }) => {
    await page.getByRole("button", { name: "Catálogo" }).click();
    await page.locator('[data-station-id="estacion-09"]').click();
    const dialog = page.locator("#station-dialog");
    await expect(dialog).toBeVisible();
    const ampliar = page.getByRole("button", { name: "Ampliar" });
    await expect(ampliar).toBeVisible();

    await ampliar.click();
    // Si el navegador admite pantalla completa, entra; si no, la ampliación es solo visual.
    const enPantallaCompleta = await page.evaluate(() => document.fullscreenElement !== null);
    if (enPantallaCompleta) {
      // Salida que hace el sistema (Esc, Atrás o el botón de salir), sin pasar por la app.
      await page.evaluate(() => document.exitFullscreen());
      await expect.poll(() => page.evaluate(() => document.fullscreenElement === null)).toBe(true);
    }

    await expect(page.locator("#station-video")).not.toHaveClass(/dialog__video--expanded/);
    await expect(page.getByRole("button", { name: "Cerrar" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Ampliar" })).toBeVisible();
    // El diálogo debe ser lo que se ve en el punto de los botones.
    const cerrar = await page.getByRole("button", { name: "Cerrar" }).boundingBox();
    const dentroDelDialogo = await page.evaluate(
      ({ x, y }) => !!document.elementFromPoint(x, y)?.closest("#station-dialog"),
      { x: cerrar!.x + cerrar!.width / 2, y: cerrar!.y + cerrar!.height / 2 },
    );
    expect(dentroDelDialogo).toBe(true);
  });
});
