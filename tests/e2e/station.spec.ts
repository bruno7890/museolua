import { expect, test } from "@playwright/test";
import { playCalls, spyAudio, speakCalls, unlock } from "./helpers.ts";

test.describe("estación desde el catálogo (mismas reglas que el cuadro)", () => {
  test.beforeEach(async ({ page }) => {
    await spyAudio(page);
    await page.goto("./");
    await unlock(page);
    await expect(page.getByRole("button", { name: "Entrar al museo" })).toBeEnabled({ timeout: 30_000 });
    await page.getByRole("button", { name: "Entrar al museo" }).click();
    await expect(page.locator("#gate")).toBeHidden({ timeout: 10_000 });
  });

  test("abrir una estación muestra su título y su texto de introducción", async ({ page }) => {
    await page.getByRole("button", { name: "Catálogo" }).click();
    await page.locator('[data-station-id="estacion-01"]').click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("Canción de demostración 01");
    await expect(dialog).toContainText("Introducción de demostración para la primera estación.");
  });

  test("Play no inicia la reproducción hasta que el usuario lo pide", async ({ page }) => {
    await page.getByRole("button", { name: "Catálogo" }).click();
    await page.locator('[data-station-id="estacion-02"]').click();
    const play = page.getByRole("button", { name: "Reproducir" });
    await expect(play).toBeEnabled({ timeout: 10_000 });
    expect(await playCalls(page)).toBe(0);
    await play.click();
    // `play()` espera a que el audio cargue (preload="none"); con tres navegadores en paralelo puede tardar.
    await expect(page.getByRole("button", { name: "Pausar" })).toBeVisible({ timeout: 30_000 });
    expect(await playCalls(page)).toBeGreaterThan(0);
  });

  test("Escape cierra el panel y no deja medios en marcha", async ({ page }) => {
    await page.getByRole("button", { name: "Catálogo" }).click();
    await page.locator('[data-station-id="estacion-03"]').click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("silenciar impide hablar en la siguiente estación", async ({ page }) => {
    await page.locator("#btn-mute").click();
    await expect(page.locator("#btn-mute")).toHaveAttribute("aria-pressed", "true");
    const before = (await speakCalls(page)).length;
    await page.getByRole("button", { name: "Catálogo" }).click();
    await page.locator('[data-station-id="estacion-05"]').click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect((await speakCalls(page)).length).toBe(before);
  });

  test("el vídeo ofrece su pista de subtítulos y la estación de audio no", async ({ page }) => {
    await page.getByRole("button", { name: "Catálogo" }).click();
    await page.locator('[data-station-id="estacion-04"]').click();
    const track = page.locator('#station-video track[kind="captions"]');
    await expect(track).toHaveCount(1);
    await expect(track).toHaveAttribute("srclang", "es");
    // La pista se carga de verdad: readyState ≥ 1 significa que el archivo se ha descargado.
    await expect
      .poll(async () => track.evaluate((el) => (el as HTMLTrackElement).readyState), { timeout: 15_000 })
      .toBeGreaterThan(0);

    // Al abrir una estación de audio, la pista del vídeo anterior desaparece.
    await page.locator("#station-close").click();
    await page.getByRole("button", { name: "Catálogo" }).click();
    await page.locator('[data-station-id="estacion-01"]').click();
    await expect(page.locator('#station-video track[kind="captions"]')).toHaveCount(0);
  });
});
