// Recorrido E2E con el sitio servido en un subdirectorio, como en GitHub Pages
// (https://<usuario>.github.io/<repositorio>/). Verifica SC-012 y FR-037.
//
// Uso: npm run test:e2e:subdir

import { defineConfig, devices } from "@playwright/test";

const PORT = 4174;
const BASE = "/museo-de-lua/";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: 2,
  reporter: [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}${BASE}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium-subdir", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort --base=${BASE}`,
    url: `http://127.0.0.1:${PORT}${BASE}`,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
