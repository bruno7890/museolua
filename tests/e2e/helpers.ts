import type { Page } from "@playwright/test";

export const DEMO_KEY = "lua"; // clave de demostración (ver docs/security.md)

/**
 * Registra llamadas a la síntesis de voz y al audio antes de que cargue la página.
 * No suena nada: solo cuenta las peticiones, para comprobar la regla "nada suena antes de Entrar".
 */
export async function spyAudio(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as unknown as { __speakCalls: string[]; __playCalls: number };
    w.__speakCalls = [];
    w.__playCalls = 0;
    if ("speechSynthesis" in window) {
      Object.defineProperty(window.speechSynthesis, "speak", {
        configurable: true,
        value: (u: SpeechSynthesisUtterance) => {
          w.__speakCalls.push(u.text);
        },
      });
    }
    const origPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function play(this: HTMLMediaElement) {
      w.__playCalls++;
      return origPlay.call(this).catch(() => undefined);
    };
  });
}

export async function speakCalls(page: Page): Promise<string[]> {
  return page.evaluate(() => (window as unknown as { __speakCalls: string[] }).__speakCalls);
}

export async function playCalls(page: Page): Promise<number> {
  return page.evaluate(() => (window as unknown as { __playCalls: number }).__playCalls);
}

/** Desactiva WebGL 2 para simular un navegador sin soporte. */
export async function disableWebGL2(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function getContext(this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
      if (type === "webgl2") return null;
      return (original as (...a: unknown[]) => RenderingContext | null).call(this, type, ...rest);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
}

/** Introduce la clave y espera a que el museo esté listo para entrar (o el catálogo, sin WebGL). */
export async function unlock(page: Page): Promise<void> {
  await page.getByLabel("Clave").fill(DEMO_KEY);
  await page.getByRole("button", { name: "Continuar" }).click();
}
