import { expect, test } from "@playwright/test";
import { unlock } from "./helpers.ts";

// FR-028 / SC-011: con movimiento reducido la entrada es inmediata y sin animaciones.

test.describe("movimiento reducido", () => {
  test("la transición de entrada dura lo mismo que la versión corta y no anima el botón", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("./");
    await unlock(page);

    const enter = page.getByRole("button", { name: "Entrar al museo" });
    await expect(enter).toBeEnabled({ timeout: 30_000 });

    // La preferencia del sistema es la que manda: si no se aplica, la transición dura 1000 ms.
    expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);

    // Sin movimiento reducido el botón tiene una pulsación decorativa; aquí no la hay.
    const animation = await enter.evaluate((el) => getComputedStyle(el).animationName);
    expect(animation).toBe("none");

    // El fundido también es corto: 0,15 s en lugar de 1 s.
    const transicion = await page.evaluate(() => getComputedStyle(document.getElementById("gate")!).transitionDuration);
    expect(transicion).toBe("0.15s");

    // Se registra el retardo real del temporizador de la transición (150 ms, no 1000 ms).
    await page.evaluate(() => {
      const w = window as unknown as { __delays: number[] };
      w.__delays = [];
      const original = window.setTimeout.bind(window);
      window.setTimeout = ((fn: TimerHandler, delay?: number, ...args: unknown[]) => {
        w.__delays.push(Number(delay ?? 0));
        return original(fn, delay, ...args);
      }) as typeof window.setTimeout;
    });

    await enter.click();
    await expect(page.locator("#gate")).toBeHidden({ timeout: 10_000 });

    const delays = await page.evaluate(() => (window as unknown as { __delays: number[] }).__delays);
    expect(delays).toContain(150);
    expect(delays).not.toContain(1000);
    await expect(page.locator("#museum")).toBeVisible();
  });
});
