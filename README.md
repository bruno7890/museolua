# Museo de Lua

Museo 3D personal con diez estaciones: ocho canciones y dos vídeos. La sala se recorre en primera persona con Three.js; la voz la genera el navegador con la Web Speech API; todo el contenido se edita en catálogos JSON validados.

Sala 3D adaptable desde [`lrusso/3DArtMuseum`](https://github.com/lrusso/3DArtMuseum) (GPL-3.0). Estado actual: **demostración completa con contenido provisional**; las obras reales se sustituyen siguiendo [`docs/content-guide.md`](docs/content-guide.md).

## Puesta en marcha

```bash
npm ci
npm run dev          # http://127.0.0.1:5173
```

La clave de la demostración es `lua`.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compila a `dist/` |
| `npm run preview` | Sirve `dist/` |
| `npm run typecheck` | Comprueba los tipos |
| `npm test` | Pruebas unitarias (Vitest) |
| `npm run test:e2e` | Recorrido E2E en Chromium de escritorio y móvil emulado |
| `npm run test:e2e:subdir` | El mismo recorrido en `/museo-de-lua/`, como en GitHub Pages |
| `npm run validate:content` | Valida los catálogos (`-- --mode=publish` para exigir contenido real) |
| `npm run check:budget` | Comprueba el peso del build y de los medios |
| `npm run hash:key -- "clave"` | Genera el verificador de la clave de entrada |
| `npm run media:demo` | Regenera los marcadores de demostración |

Para las pruebas E2E hace falta el navegador de Playwright: `npx playwright install chromium`.

## Cómo está montado

```text
src/
├── main.ts          # arranque, pantalla de clave, cableado de todo
├── app/             # máquina de estados, sesión, detección de WebGL
├── access/          # verificador SHA-256 con sal
├── content/         # tipos, validador y carga de catálogos
├── config/          # perfiles de calidad
├── scene/           # sala, marcos, decoración, cámara
├── controls/        # navegación, teclado, arrastre, joystick
├── media/           # única autoridad sonora: coordinador, voz, medios
└── ui/              # panel de estación, catálogo 2D, estilos
```

Dos reglas que conviene no romper:

1. **Solo `media/` decide sonido.** Un `PlaybackCoordinator` es la única autoridad: la voz, la canción y el vídeo nunca suenan a la vez.
2. **La escena no sabe nada de la interfaz.** `scene/` no importa de `ui/`; se comunican por el estado de la aplicación.

## Documentación

| Documento | Contenido |
|---|---|
| [`docs/content-guide.md`](docs/content-guide.md) | Sustituir los marcadores por las obras reales |
| [`docs/deployment.md`](docs/deployment.md) | Publicar en GitHub Pages |
| [`docs/security.md`](docs/security.md) | Alcance de la clave, CSP, revisión de dependencias |
| [`docs/design.md`](docs/design.md) | Paleta, tipografía, sala, interfaz |
| [`docs/qa.md`](docs/qa.md) | Qué está verificado y qué queda pendiente en Android |
| [`docs/tooling.md`](docs/tooling.md) | Spec Kit, comandos, convenciones |
| [`specs/001-museo-de-lua/`](specs/001-museo-de-lua/) | Especificación, plan, contratos y tareas |

## Estado

- 120 pruebas unitarias y 40 pruebas E2E (20 por perfil de navegador) en verde.
- Carga esencial de 661 KiB, sin audio ni vídeo hasta que se piden.
- Pendiente de hardware Android real: voz del sistema, multitáctil, pantalla completa y FPS (`docs/qa.md`).

## Licencia

GPL-3.0-or-later. Ver [`LICENSE`](LICENSE) y [`NOTICE.md`](NOTICE.md).
