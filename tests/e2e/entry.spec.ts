import { expect, test } from "@playwright/test";
import { playCalls, spyAudio, speakCalls, unlock } from "./helpers.ts";

test.describe("entrada", () => {
  test.beforeEach(async ({ page }) => {
    await spyAudio(page);
  });

  test("abrir sin clave no reproduce nada y no muestra el museo", async ({ page }) => {
    await page.goto("./");
    await expect(page.getByRole("heading", { name: "Museo de Lua" })).toBeVisible();
    expect(await speakCalls(page)).toHaveLength(0);
    expect(await playCalls(page)).toBe(0);
    await expect(page.locator("#museum")).toBeHidden();
  });

  test("una clave incorrecta muestra un error accesible y no suena nada", async ({ page }) => {
    await page.goto("./");
    await page.getByLabel("Clave").fill("otra-clave");
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page.getByRole("alert")).toContainText("no es correcta");
    expect(await speakCalls(page)).toHaveLength(0);
    expect(await playCalls(page)).toBe(0);
  });

  test("con la clave correcta, Entrar inicia una sola bienvenida", async ({ page }) => {
    await page.goto("./");
    await unlock(page);
    const enter = page.getByRole("button", { name: "Entrar al museo" });
    await expect(enter).toBeEnabled({ timeout: 30_000 });
    await enter.dblclick();
    await expect(page.locator("#museum")).toBeVisible();
    await expect(page.locator("#gate")).toBeHidden({ timeout: 10_000 });
    expect(await speakCalls(page)).toHaveLength(1);
    expect(await playCalls(page)).toBe(0); // ninguna canción arranca sola
  });

  test("la clave se borra del campo tras comprobarla", async ({ page }) => {
    await page.goto("./");
    await unlock(page);
    await expect(page.getByLabel("Clave")).toHaveValue("");
  });

  test("mientras carga el contenido la entrada está bloqueada y se avisa", async ({ page }) => {
    let release!: () => void;
    const blocked = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route("**/data/*.json", async (route) => {
      await blocked;
      await route.continue();
    });
    await page.goto("./");
    // Sin contenido cargado no se puede comprobar la clave: el botón avisa en vez de fallar en silencio.
    await expect(page.getByRole("button", { name: "Continuar" })).toBeDisabled();
    await expect(page.locator("#gate-status")).toContainText("Cargando");
    release();
    await expect(page.getByRole("button", { name: "Continuar" })).toBeEnabled();
  });
});
