import { defineConfig } from "vitest/config";

// Solo pruebas unitarias. Las pruebas de navegador (*.spec.ts) las ejecuta Playwright.
export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
    restoreMocks: true,
    clearMocks: true,
  },
});
