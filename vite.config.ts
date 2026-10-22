import { defineConfig } from "vite";

// base relativa: el sitio funciona bajo /<repositorio>/ en GitHub Pages sin conocer el nombre.
export default defineConfig({
  base: "./",
  build: {
    target: "es2022",
    outDir: "dist",
    emptyOutDir: true,
    assetsInlineLimit: 0,
    // Three.js ocupa casi todo el bundle; el límite por defecto (500 kB) avisaría sin aportar nada.
    chunkSizeWarningLimit: 700,
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
});
