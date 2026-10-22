# AGENTS.md

Guía para agentes que trabajan en este repositorio. Léela antes de tocar código.

## Qué es este proyecto

Museo 3D estático (TypeScript + Vite + Three.js) con diez estaciones. La especificación de `specs/001-museo-de-lua/` manda sobre el código: si el código y la spec discrepan, se actualiza la spec o el código, nunca se ignora la spec.

La constitución (`.specify/memory/constitution.md`) fija cinco principios: **experiencia fiel**, **control del sonido**, **simplicidad**, **procedencia** y **calidad demostrable**. Añade un sexto: **publicar exige permiso explícito del propietario**.

## Comandos (los reales)

```bash
npm ci
npm run dev                                   # http://127.0.0.1:5173
npm run build                                 # -> dist/
npm run typecheck                             # tsc --noEmit
npm test                                      # Vitest
npm run test:e2e                              # Playwright: escritorio + móvil emulado
npm run test:e2e:subdir                       # recorrido en /museo-de-lua/
npm run validate:content                      # modo demo
npm run validate:content -- --mode=publish    # modo publicación (falla si hay placeholders)
npm run check:budget                          # peso del build y de los medios
npm run hash:key -- "clave"                   # verificador SHA-256 de la clave
npm run media:demo                            # regenera los marcadores
```

Batería completa antes de dar por terminado cualquier cambio:

```bash
npm run typecheck && npm test && npm run validate:content && npm run build && npm run check:budget && npm run test:e2e
```

Las pruebas E2E necesitan `npx playwright install chromium` una vez.

## Reglas del proyecto

1. **Solo `media/` decide sonido.** El `PlaybackCoordinator` es la única autoridad: la voz del navegador, la canción y el vídeo nunca suenan a la vez. Cualquier fuente nueva de audio pasa por el coordinador, con su token de operación.
2. **`scene/` no importa de `ui/`.** La comunicación va por `app-state` y por el coordinador. Ningún módulo de escena toca el DOM.
3. **El catálogo solo se escribe con `textContent`.** Prohibido `innerHTML` con datos de `public/data/`.
4. **Sin `eval`, sin CDN, sin peticiones a terceros.** Todo lo que se sirve es del mismo origen.
5. **Los medios se piden bajo demanda.** `preload="none"`; nada se descarga hasta que la visitante lo pide.
6. **Nada suena antes de «Entrar»**, y la narración solo arranca tras un gesto explícito (D-17).
7. **Versiones fijadas de forma exacta** en `package.json`; `package-lock.json` se versiona y en CI se usa `npm ci`.
8. **Comentarios, textos de interfaz y documentación en español.**

## Cómo trabajar

- **TDD en las reglas de negocio.** Antes de tocar `src/`, escribe la prueba en `tests/unit/` o `tests/e2e/` que falla.
- **Una tarea, una prueba.** Si un cambio no tiene prueba, o no es un cambio de comportamiento, o no es una documentación.
- **Sin refactors oportunistas.** Si un cambio es grande, dilo antes de hacerlo.
- **No commits ni push sin que lo pidas.** La constitución exige autorización explícita para publicar; el mismo cuidado aplica al historial.
- **No borres ni regeneres `public/media/` real** sin confirmación: son marcadores generados, pero el destino son obras reales.

## Estructura

```text
src/main.ts        arranque y cableado
src/app/           estado de la visita, sesión, WebGL
src/access/        verificador de clave
src/content/       tipos, validador, carga
src/config/        perfiles de calidad
src/scene/         sala, marcos, decoración, cámara
src/controls/      navegación, teclado, arrastre, joystick
src/media/         coordinador, voz, medios
src/ui/            panel, catálogo 2D, estilos
scripts/           validación, presupuesto, hash de clave, medios demo
tests/unit/        unitarias e integración
tests/e2e/         Playwright
specs/001-museo-de-lua/   spec, plan, research, contratos, tasks
docs/              guía de contenido, despliegue, seguridad, diseño, QA, tooling
```

## Antes de tocar el catálogo

`public/data/stations.json` y `public/config/site.json` son la fuente de verdad del contenido. Si cambias un título o un texto, actualiza también las expectativas de `tests/e2e/station.spec.ts` y vuelve a validar.

## Antes de publicar

```bash
npm run validate:content -- --mode=publish   # sin placeholders
npm run check:budget                         # carga esencial y medios
npm run test:e2e:subdir                      # el sitio funciona en /<repositorio>/
```

Y la lista completa de `docs/security.md`. La publicación en GitHub Pages la lanza una persona desde Actions (`workflow_dispatch`).
