import { expect, test } from "@playwright/test";
import { spyAudio, unlock } from "./helpers.ts";

// Teléfono en horizontal: la barra debe ocupar poco, los botones deben caber en una
// fila y el joystick no debe tapar el texto de ayuda.
test.describe("horizontal en teléfono", () => {
  test.use({ viewport: { width: 740, height: 360 }, isMobile: true, hasTouch: true });

  test.beforeEach(async ({ page }) => {
    await spyAudio(page);
  });

  test("la barra cabe en una fila y los botones quedan dentro de la pantalla", async ({ page }) => {
    await page.goto("./");
    await unlock(page);
    const enter = page.getByRole("button", { name: "Entrar al museo" });
    await expect(enter).toBeEnabled({ timeout: 30_000 });
    await enter.click();
    await expect(page.locator("#gate")).toBeHidden({ timeout: 10_000 });

    const bar = await page.locator(".museum__bar").boundingBox();
    expect(bar).not.toBeNull();
    expect(bar!.height).toBeLessThanOrEqual(90);

    const ids = ["#btn-intro", "#btn-mute", "#btn-catalog", "#btn-home", "#quality"];
    const cajas = await Promise.all(ids.map((id) => page.locator(id).boundingBox()));
    for (const [i, caja] of cajas.entries()) {
      expect(caja, ids[i]).not.toBeNull();
      expect(caja!.x, ids[i]).toBeGreaterThanOrEqual(0);
      expect(caja!.x + caja!.width, ids[i]).toBeLessThanOrEqual(740);
      expect(caja!.y, ids[i]).toBeGreaterThanOrEqual(0);
      expect(caja!.y + caja!.height, ids[i]).toBeLessThanOrEqual(360);
    }
    // Una sola fila: todos empiezan a la misma altura (±2 px).
    const tops = cajas.map((c) => c!.y);
    expect(Math.max(...tops) - Math.min(...tops)).toBeLessThanOrEqual(2);
  });

  test("la entrada cabe sin desplazarse y «Entrar al museo» es visible", async ({ page }) => {
    await page.goto("./");
    await unlock(page);
    const enter = page.getByRole("button", { name: "Entrar al museo" });
    await expect(enter).toBeEnabled({ timeout: 30_000 });

    const sinScroll = await page.locator("#gate").evaluate((el) => el.scrollHeight <= el.clientHeight + 1);
    expect(sinScroll).toBe(true);
    const caja = await enter.boundingBox();
    expect(caja).not.toBeNull();
    expect(caja!.y).toBeGreaterThanOrEqual(0);
    expect(caja!.y + caja!.height).toBeLessThanOrEqual(360);
    const clave = await page.getByLabel("Clave").boundingBox();
    expect(clave!.y + clave!.height).toBeLessThanOrEqual(360);
  });

  test("el joystick no tapa el texto de ayuda", async ({ page }) => {
    await page.goto("./");
    await unlock(page);
    const enter = page.getByRole("button", { name: "Entrar al museo" });
    await expect(enter).toBeEnabled({ timeout: 30_000 });
    await enter.click();
    await expect(page.locator("#gate")).toBeHidden({ timeout: 10_000 });

    const ayuda = await page.locator("#help").boundingBox();
    const joystick = await page.locator(".stick").boundingBox();
    expect(joystick).not.toBeNull();
    expect(joystick!.x + joystick!.width).toBeLessThanOrEqual(740);
    expect(joystick!.y + joystick!.height).toBeLessThanOrEqual(360);
    if (ayuda) {
      const separados =
        joystick!.x + joystick!.width <= ayuda.x ||
        joystick!.y >= ayuda.y + ayuda.height ||
        ayuda.y >= joystick!.y + joystick!.height ||
        ayuda.x + ayuda.width <= joystick!.x;
      expect(separados).toBe(true);
    }
  });
});
