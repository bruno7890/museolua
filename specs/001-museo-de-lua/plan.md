# Implementation Plan: Museo de Lua

**Branch**: sin rama creada (repositorio sin commits) · **Date**: 2026-10-21 · **Spec**: [spec.md](spec.md)

**Input**: `specs/001-museo-de-lua/spec.md` · **Research**: [research.md](research.md) · **Data model**: [data-model.md](data-model.md) · **Contracts**: [contracts/](contracts/) · **Quickstart**: [quickstart.md](quickstart.md)

## Summary

Aplicación web estática que muestra una sala 3D en primera persona (adaptada de
lrusso/3DArtMuseum) con diez estaciones: ocho de canción y dos de vídeo. La voz se
genera con Web Speech API; canciones y vídeos son archivos bajo demanda. Contenido y
decoración se editan en catálogos JSON validados. Un controlador de reproducción es la
única autoridad sonora. Hay un modo 2D equivalente y despliegue manual en GitHub Pages.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (estricto) · Node 24 para herramientas (≥ 22.18 para type stripping)

**Primary Dependencies**: three 0.186.1 (exacta) · vite 8.3.5 · HTML/CSS propios (sin framework)

**Storage**: Ninguno en servidor. `sessionStorage` para acceso, silencio y estaciones presentadas; memoria para posiciones de medios.

**Testing**: vitest 5.0.5 (unitarias y de integración de módulos) · @playwright/test 1.64.1 (E2E en Chromium sobre `vite preview`) · validador de contenido en `scripts/validate-content.ts`

**Target Platform**: Chrome en Android (prioritario), navegadores de escritorio y tablet modernos con WebGL 2 y Web Speech API; sitio estático en GitHub Pages

**Project Type**: Web application estática (single page, sin backend)

**Performance Goals**: transferencia esencial ≤ 5 MiB sin medios bajo demanda; ≥ 30 FPS en Android identificado (medir, no asumir); DPR móvil 1.5, modo reducido 1.0

**Constraints**: sin CDN en tiempo de ejecución; sin claves ni secretos en el frontend; sin autoplay; una sola fuente sonora; transición 1000 ms (≈150 ms con movimiento reducido); objetivos táctiles 48 × 48 px; contraste 4.5:1 / 3:1; GPL-3.0 con atribución

**Scale/Scope**: 10 estaciones, 4 decoraciones, 1 sala, 3 catálogos JSON; sin multijugador ni panel de administración

## Constitution Check

*GATE antes de Fase 0 (investigación): PASA.* Constitución 1.0.0 revisada.

| Principio | Cómo lo cumple este plan | Estado |
|---|---|---|
| I. Experiencia fiel | Layout, aproximación de 50 unidades y estética de la referencia; desviaciones D-06/D-07/D-09 justificadas en research.md | ✅ con justificación |
| II. Accesibilidad y Android | Pointer Events, joystick, paneles HTML con foco, objetivos 48 px, fallback 2D | ✅ |
| III. Control del sonido | Un `PlaybackCoordinator`; tokens de operación; nada suena antes de Entrar | ✅ |
| IV. Simplicidad | Sin framework ni motor físico; catálogos JSON; dependencias fijas y lockfile | ✅ |
| V. Procedencia | Sin activos de la autora; GPL-3.0 con atribución; inventario en docs/security.md | ✅ |
| VI. Calidad demostrable | Tests de estado y validación; E2E sobre build; QA manual en Android registrado aparte | ✅ |

Puertas de la constitución:
1. **Antes del plan**: referencia y licencia inspeccionadas (research.md §1) ✅
2. **Antes de implementar**: contratos, tareas trazables y análisis (sección *Análisis de consistencia* y `tasks.md`) — cumplida con la revisión de esta versión; sin hallazgos críticos abiertos
3. **Primer incremento**: recorrido navegable (Fase 1 de tasks.md)
4. **Antes de multiplicar estaciones**: flujo completo de una canción y un vídeo probado automáticamente (Fase 2)
5. **Entrega técnica**: diez estaciones demo, validación, tests y build (Fases 3–5)
6. **Publicación**: autorización explícita del propietario (Fase 6)

## Project Structure

### Documentation (esta feature)

```text
specs/001-museo-de-lua/
├── spec.md
├── plan.md                  # este archivo
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── content-catalogs.md  # esquemas JSON y reglas de validación
│   └── runtime-modules.md   # interfaces entre módulos de la aplicación
├── checklists/requirements.md
└── tasks.md
```

### Código fuente (raíz del repositorio)

```text
index.html
package.json · package-lock.json · vite.config.ts · tsconfig.json
LICENSE                        # GPL-3.0
NOTICE.md                      # atribución lrusso/3DArtMuseum, Three.js (MIT)
README.md
AGENTS.md                      # ya existe; se actualizará con comandos reales
src/
├── main.ts                    # arranque, pantalla de clave, Entrar, wiring
├── app/
│   ├── app-state.ts           # máquina de estados de la visita (entrada, sala, 2D)
│   ├── session-store.ts       # sessionStorage con fallback a memoria
│   └── webgl-support.ts       # detección WebGL 2 y pérdida de contexto
├── access/
│   ├── access-gate.ts         # verificador SHA-256 con sal
│   └── sha256.ts              # respaldo de SHA-256 para contextos no seguros
├── content/
│   ├── types.ts               # tipos de catálogos
│   └── validate.ts            # validador puro (usado por script y tests)
├── config/
│   └── quality.ts             # perfiles de calidad (DPR, sombras, render)
├── scene/
│   ├── room.ts                # sala, muros, suelo, techo (coordenadas de referencia)
│   ├── station-frames.ts      # marcos de cuadros y ubicación desde catálogo
│   ├── decor.ts               # alfombra y paneles de Gon
│   ├── wall-placement.ts      # cálculo de posición de cuadros y decoración en el muro
│   ├── approach.ts            # yaw/pitch, aproximación amortiguada y pose previa
│   └── museum.ts              # escena, render, raycast, marcos y decoración
├── controls/
│   ├── navigation.ts          # matemática pura: movimiento, colisión, límites
│   ├── input.ts               # teclado, joystick y arrastre (limpieza de entradas)
│   ├── pointer-look.ts        # arrastre para mirar y tap vs. arrastre
│   └── joystick.ts            # joystick virtual izquierdo
├── media/
│   ├── playback-coordinator.ts  # única autoridad sonora
│   ├── speech-controller.ts     # SpeechSynthesis con tokens y watchdogs
│   ├── voice-selection.ts       # elección de voz (pura)
│   └── media-handle.ts          # HTMLAudioElement / HTMLVideoElement y estados
├── ui/
│   ├── station-panel.ts       # panel accesible con texto, controles y foco
│   ├── catalog-2d.ts          # modo alternativo sin 3D
│   └── styles.css

public/
├── config/site.json
├── data/stations.json
├── data/decorations.json
└── media/
    ├── branding/              # emblema SVG provisional
    ├── images/                # 10 portadas de demostración
    ├── decor/                 # alfombra y cuatro paneles marcados como placeholder
    ├── audio/                 # 8 canciones de demostración (MP3 generadas)
    ├── video/                 # 2 vídeos de demostración (MP4 H.264/AAC)
    └── captions/              # 04.vtt y 09.vtt (subtítulos de demostración)

scripts/
├── validate-content.ts        # valida catálogos y rutas; falla en publicación
├── hash-access-key.ts         # genera el verificador de la clave
├── generate-demo-media.ts     # PNG, MP3 y MP4 de demostración
└── check-budget.ts            # presupuesto de tamaño de archivos y build

tests/
├── unit/                      # estados, navegación, voces, validador, sesión, coordinador
├── fixtures/catalog.ts        # catálogos de prueba compartidos
└── e2e/                       # Playwright: entrada, estación, colección, catálogo 2D

.github/workflows/
├── ci.yml                     # instalación reproducible, typecheck, tests, build
└── deploy.yml                 # workflow_dispatch manual para Pages
```

**Nota sobre el árbol**: la estructura final difiere del borrador inicial en cuatro puntos,
todos con pruebas que lo justifican (ver «Desviaciones» en `tasks.md`): `src/content/load.ts`
no hizo falta (la carga vive en `src/main.ts`), `camera-rig.ts` se dividió en
`src/scene/approach.ts` + `src/scene/museum.ts`, el teclado se unificó con joystick y arrastre
en `src/controls/input.ts`, y la pantalla de entrada, la barra de controles y el aviso de
orientación son markup de `index.html` cableado en `src/main.ts`. La barra de controles y la
pantalla de entrada no se separaron en módulos porque no tienen ramas propias que justifiquen
un archivo. Aparte, `src/access/sha256.ts` es el respaldo de SHA-256 que permite comprobar
la clave en contextos no seguros (`http://` por IP local), como se explica en `research.md` §6.

**Structure Decision**: Single project. Los módulos se separan por responsabilidad
(acceso, escena, controles, medios, interfaz, contenido). Solo `media/` decide sonido.
Ningún módulo de escena importa de `ui/`; la comunicación pasa por el `app-state`.

## Key Design Decisions

Detalle y alternativas en [research.md §8](research.md). Resumen:

- **Una sola autoridad sonora** (`PlaybackCoordinator`). Cada acción crea un token; un
  callback cuyo token no sea el vigente se ignora (FR-011, FR-012).
- **Voz**: `SpeechController` mantiene watchdogs: inicio ≤ 4 s, fin ≤ min(60 s, 2 s + 0,08 s × caracteres)
  (valores configurables en `site.json`; EC-03).
- **Movimiento**: velocidad en unidades/s, colisión como círculo contra los muros de la sala
  y un radio configurable; sin salto ni balanceo (FR-004, FR-005).
- **Aproximación**: `alpha = 1 - exp(-k·dt)` con k configurable (≈ 6 para la referencia a 60 FPS).
  Cancelada por cualquier entrada de movimiento y por abrir un panel.
- **Entrada**: pantalla de clave comprobada con SHA-256 y sal; Entrar solo tras la preparación
  del contenido esencial; el mismo gesto inicia la voz (D-17).
- **Fallback**: WebGL ausente o contexto perdido abre el catálogo 2D con los mismos
  `station` y el mismo coordinador de medios.

## Complexity Tracking

| Violación / desviación | Por qué es necesaria | Alternativa más simple rechazada porque |
|---|---|---|
| Reescritura del motor de la referencia en vez de reutilizar su bloque | Versión r88 con APIs eliminadas; sin ella no hay Three.js moderno ni seguridad | Mantener r88 congelado impide corregir compatibilidad y Pages |
| Dos interfaces de estación (3D y 2D) | Exigido por FR-026 y EC-09 | Solo 3D: contradice la recuperación ante fallo de WebGL |
| Verificador de clave en el bundle | Requisito de no almacenar clave literal y de funcionar en Pages | Sin verificador: la clave quedaría en texto plano |

## Análisis de consistencia

Revisión realizada sobre spec.md, research.md, este plan y la constitución 1.0.0.

| Hallazgo | Severidad | Resolución |
|---|---|---|
| Altura de cámara 1.6 m (encargo) frente a escala de referencia sin unidades definidas | Alta | Resuelto: D-07. Valor configurable; validar en Android |
| FOV 37.8 (referencia) frente a 65 (encargo) | Media | Resuelto: D-06 |
| Spec menciona "2,2 m/s" del encargo y velocidad en unidades | Media | Resuelto: D-11, velocidad en unidades/s ajustable |
| Constitución prohíbe redistribuir medios sin procedencia; referencia usa imágenes de la autora | Alta | Resuelto: D-12, marcadores generados |
| Lint pedido en el prompt maestro no tiene reglas definidas | Baja | Resuelto: D-16, documentado |
| Clave final aún no definida por el propietario | Baja | No bloquea: spec A-02; el verificador de demo se sustituye con `scripts/hash-access-key.ts` |
| Ninguna tarea cubre FR-040 (subtítulos opcionales) | Baja | Cubierta en tareas de vídeo (T062) |
| Sin hallazgos críticos abiertos | — | Puerta 2 cumplida al aprobar tasks.md |

## Riesgos principales

1. **Voz en Android no fiable** → watchdogs, texto siempre visible, prueba real pendiente registrada.
2. **Rendimiento con 10 cuadros de imagen y render continuo** → texturas ≤ 1024 px en demo, render solo al cambiar de estado cuando sea posible, perfiles de calidad.
3. **Vídeos de 6 min (≈ 80 MiB)** → presupuesto por archivo en `check-budget`; medir peso real antes de publicar.
4. **Pérdida de gesto de usuario en Android** → la llamada a `speak()` y `play()` ocurre dentro del manejador del toque.
5. **Coordenadas de cuadros distintas a la referencia** → revisión visual en navegador y registro en `docs/design.md`.
