# Tasks: Museo de Lua

**Input**: [plan.md](plan.md), [spec.md](spec.md), [data-model.md](data-model.md), [contracts/](contracts/), [research.md](research.md)

**Format**: `- [ ] Txxx [P?] [USn] descripción — ruta — cubre: requisitos`
- `[P]`: puede ejecutarse en paralelo con otras tareas `[P]` de la misma fase (archivos distintos).
- `[USn]`: historia de usuario de la spec (US1–US5).
- Cada tarea termina con una verificación observable. Ninguna se marca hecha sin ejecutar esa verificación.

**Tests**: la constitución (VI) exige pruebas automatizadas de estados, cancelación, silencio, validación y flujos de navegador. Las pruebas se escriben antes que la implementación en cada bloque.

## Global Constraints

- Three.js exactamente `0.186.1`; Vite `8.3.5`; TypeScript `5.9.3`; Vitest `5.0.5`; `@playwright/test` `1.64.1`.
- Sin CDN en runtime. Sin claves, secretos ni verificadores en texto plano.
- Transición de entrada 1000 ms; 150 ms con `prefers-reduced-motion`.
- Objetivos táctiles ≥ 48 × 48 px CSS. Contraste 4.5:1 texto normal, 3:1 grande/controles.
- Nunca `innerHTML` con datos de catálogo.

## Review Focus (entradas y condiciones probables de fallo)

1. Toque repetido de Entrar → una sola transición y una sola bienvenida. (T042, T048)
2. Voz inexistente, tardía o sin eventos → texto visible y Play habilitado. (T030, T031, T032)
3. Cambio rápido de estación con voz o medio en curso → callbacks antiguos ignorados. (T034, T036)
4. Arrastre que termina sobre un cuadro → no selecciona. (T024, T025)
5. Pérdida de foco o cambio de orientación con tecla o joystick activo → no quedan entradas atascadas. (T022, T026)

---

## Phase 1: Setup (infraestructura)

**Purpose**: proyecto reproducible, sin código de funcionalidad.

- [x] T001 Crear `package.json` con versiones exactas del research.md §2 y scripts `dev`, `build`, `preview`, `typecheck`, `test`, `test:e2e`, `validate:content`, `check:budget` — `package.json` — cubre: FR-031, constitución IV; verificación: `npm ci` termina sin errores.
- [x] T002 [P] Crear `tsconfig.json` estricto (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) y `vite.config.ts` con `base: "./"` — `tsconfig.json`, `vite.config.ts` — cubre: FR-031; verificación: `npm run typecheck` sin errores en proyecto vacío.
- [x] T003 [P] Crear `index.html` con `<meta>` CSP (`default-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; script-src 'self'; style-src 'self'`), lang `es`, viewport sin `user-scalable=no` — `index.html` — cubre: FR-027, FR-028, D-14.
- [x] T004 [P] Añadir `LICENSE` (texto GPL-3.0) y `NOTICE.md` con atribución a lrusso/3DArtMuseum (commit 7ea04e3), Three.js (MIT) y estado de medios de demostración — `LICENSE`, `NOTICE.md` — cubre: FR-035; verificación: revisión manual del contenido.
- [x] T005 [P] Actualizar `.gitignore` (`node_modules`, `dist`, `test-results`, `playwright-report`) — `.gitignore` — cubre: constitución V; verificación: `git status` no lista `dist/`.
- [x] T006 Crear `docs/` con `security.md`, `design.md`, `content-guide.md`, `qa.md`, `deployment.md`, `tooling.md` (plantillas con secciones de la spec) — `docs/` — cubre: FR-036; verificación: cada archivo contiene sus secciones sin marcadores.
- [x] T007 Ejecutar `npm install` y confirmar `package-lock.json` generado con las versiones de T001 — `package-lock.json` — verificación: `npm ls three vite typescript vitest @playwright/test` muestra las versiones exactas.
- [x] T008 Registrar versiones y comandos en `docs/tooling.md` y `AGENTS.md` (comandos reales) — `docs/tooling.md`, `AGENTS.md` — cubre: FR-036.

**Checkpoint**: `npm run typecheck` y `npm run build` terminan con código 0 sobre el esqueleto. ✅ (verificado en la batería final, T087)

---

## Phase 2: Foundations (bloquea todas las historias)

**Purpose**: contratos de datos, acceso, estado y generación de demostración.

### Pruebas primero

- [x] T009 [P] Escribir `tests/unit/validate-site.test.ts`: colores hex, rangos de `rate/pitch/volume`, `verifier` de 64 hex, `fallbackLangs` solo `es-*` — cubre: FR-031, FR-032.
- [x] T010 [P] Escribir `tests/unit/validate-stations.test.ts`: 10 registros, IDs/orden únicos, distribución 3/3/2/2, dos vídeos sin muro compartido, `video` exige `video/mp4`, separación mínima de 8 unidades, rutas prohibidas (`..`, `://`, `//`, barra inicial), `narration.text` ≤ 600 — cubre: FR-021, FR-023, FR-032, FR-034, EC-10.
- [x] T011 [P] Escribir `tests/unit/validate-decorations.test.ts`: 5 decoraciones, `interactive === false`, paneles sin solapar estaciones — cubre: FR-024.
- [x] T012 [P] Escribir `tests/unit/access-gate.test.ts`: normalización (trim, minúsculas, acentos), verificador esperado con sal fija, rechazo de clave incorrecta, no se devuelve la clave en el resultado — cubre: FR-001, constitución V.
- [x] T013 [P] Escribir `tests/unit/session-store.test.ts`: lectura y escritura fusionadas, fallback a memoria cuando `setItem` lanza, clave `museo-de-lua:v1`, no almacena textos de clave — cubre: FR-030, EC-06.
- [x] T014 [P] Escribir `tests/unit/app-state.test.ts`: transiciones válidas e inválidas; Entrar desde `ready` produce `entering`; llamadas repetidas no cambian el estado — cubre: FR-003, EC-01.

### Implementación

- [x] T015 Crear `src/content/types.ts` con las interfaces de `contracts/content-catalogs.md` — cubre: FR-031.
- [x] T016 Implementar `src/content/validate.ts` (funciones puras de `contracts/runtime-modules.md`) hasta pasar T009–T011 — cubre: FR-032, EC-10.
- [x] T017 Implementar `scripts/validate-content.ts`: lee `public/`, llama a `validateAll`, imprime errores por archivo y ruta, `--mode=demo|publish`, código de salida 1 si falla — cubre: US5-A2; verificación: `npm run validate:content` sobre catálogos demo termina con 0.
- [x] T018 Implementar `src/access/access-gate.ts` hasta pasar T012 (SHA-256 con `crypto.subtle`, sal, comparación en tiempo constante) — cubre: FR-001.
- [x] T019 Implementar `scripts/hash-access-key.ts` que imprime sal y verificador para pegar en `site.json` — cubre: D-05; verificación: el verificador generado acepta la clave de demo en T012.
- [x] T020 Implementar `src/app/session-store.ts` hasta pasar T013 — cubre: FR-030.
- [x] T021 Implementar `src/app/app-state.ts` (función pura `transition`) hasta pasar T014 — cubre: FR-003.
- [x] T022 Implementar `src/app/webgl-support.ts`: detección WebGL 2 y escucha de `webglcontextlost`/`webglcontextrestored` — cubre: FR-026, EC-09.
- [x] T023 Crear `scripts/generate-demo-media.ts`: PNG de 1024 px (zlib, sin dependencias), WAV de tono de 6 s, MP4 H.264/AAC de 10 s con ffmpeg si está disponible; registra en `docs/content-guide.md` qué faltó si no — cubre: FR-033, D-12.
- [x] T024 Generar los medios de demostración: `public/media/images/01–10.png`, `public/media/decor/*.png` (5), `public/media/audio/01–08.wav`, `public/media/video/09.mp4` y `10.mp4` (o marcador documentado) — cubre: FR-033; verificación: `npm run validate:content` encuentra todas las rutas.
- [x] T025 Crear catálogos de demostración: `public/config/site.json`, `public/data/stations.json` (10 estaciones: 8 audio, 2 vídeo en muros distintos), `public/data/decorations.json` (5) — cubre: FR-021, FR-023, FR-024, FR-025; verificación: `npm run validate:content` = 0.

**Checkpoint**: `npm test` (unitarias de fundaciones) en verde. ✅

---

## Phase 3: US1 — Entrar y recorrer el museo (P1) 🎯 MVP incremento 1

**Goal**: sala navegable en primera persona con teclado, arrastre y joystick, colisiones y aproximación a un cuadro.

**Independent Test**: con dos estaciones de muestra, la sala permite entrar, caminar, girar, tocar un cuadro y volver.

### Pruebas primero

- [x] T026 [P] [US1] `tests/unit/navigation.test.ts`: `stepPosition` no atraviesa muros ni obstáculos, dirección cero no mueve, normalización diagonal, velocidad × dt — cubre: FR-004, FR-005, US1-A4.
- [x] T027 [P] [US1] `tests/unit/camera-rig.test.ts`: `approach` converge a `approachDistance`, `update` con movimiento cancela la aproximación, `returnToPreviousPose` restaura pose, pitch limitado a ±35° — cubre: FR-004, US1-A5. *(Implementado en `tests/unit/approach.test.ts`, ver «Desviaciones»)*
- [x] T028 [P] [US1] `tests/unit/joystick.test.ts`: zona muerta 0.12, salida en [-1,1], cancelación por `pointercancel` — cubre: FR-005, FR-006. *(Implementado en `tests/unit/input-controls.test.ts`, ver «Desviaciones»)*
- [x] T029 [P] [US1] `tests/unit/pointer-look.test.ts`: umbral de 8 px distingue tap de arrastre; arrastre nunca emite selección; elementos con `data-ui` se ignoran — cubre: FR-006, US1-A4. *(Implementado en `tests/unit/input-controls.test.ts`, ver «Desviaciones»)*

### Implementación

- [x] T030 [US1] Implementar `src/controls/navigation.ts` hasta pasar T026 — cubre: FR-004.
- [x] T031 [US1] Implementar `src/scene/room.ts`: suelo, techo y cuatro muros con coordenadas de la referencia (`x ∈ [-370, 50]`, `z ∈ [-230, 270]`, suelo `y=-40`, techo `y=47`), materiales con `colorSpace = SRGBColorSpace` y texturas marcadas como placeholders — cubre: FR-004, research §1.
- [x] T032 [US1] Implementar `src/scene/camera-rig.ts` hasta pasar T027 (amortiguación temporal, D-08; FOV de `site.json`; altura de ojos de `site.json`, D-07) — cubre: FR-004, FR-005. *(Implementado en `src/scene/approach.ts`, ver «Desviaciones»)*
- [x] T033 [P] [US1] Implementar `src/controls/keyboard.ts`: WASD y flechas, limpieza en `blur` — cubre: FR-005, FR-006. *(Implementado en `src/controls/input.ts`, ver «Desviaciones»)*
- [x] T034 [US1] Implementar `src/controls/joystick.ts` hasta pasar T028: zona inferior izquierda, `data-ui` excluido de la zona de mirada — cubre: FR-005.
- [x] T035 [US1] Implementar `src/controls/pointer-look.ts` hasta pasar T029: arrastre para girar yaw/pitch con sensibilidad, multitáctil con joystick simultáneo (`pointerId` separados) — cubre: FR-005, FR-006, EC-08.
- [x] T036 [US1] Crear `src/scene/station-frames.ts`: marco por estación con altura derivada de la proporción de la imagen, texturas cargadas bajo demanda con `TextureLoader`, mesh registrado en el raycaster — cubre: FR-021, FR-023, US3-A3.
- [x] T037 [US1] Implementar `src/main.ts` mínimo de la fase: crea renderer (`WebGLRenderer`, antialias false, DPR por perfil), bucle de animación con `dt` acotado, `visibilitychange` que limpia entradas — cubre: FR-006, FR-026, EC-08.
- [x] T038 [US1] Implementar selección por toque: raycast solo en `tap`, aproxima al marco y devuelve a la pose previa al cerrar el panel (sin audio aún) — cubre: US1-A5, FR-022.
- [x] T039 [US1] Implementar `src/config/quality.ts` con perfiles `standard` (DPR 1.5 en móvil) y `reduced` (DPR 1.0), y opción de calidad en la barra de controles — cubre: FR-039.
- [x] T040 [US1] Limpiar recursos de la escena al desmontar (`dispose` de geometrías, materiales y texturas) — `src/scene/*.ts` — cubre: constitución IV.

### Verificación de la fase

- [x] T041 [US1] Ejecutar `npm test`; todas las pruebas de T026–T029 pasan. Verificación real: `npm run dev` y recorrer con teclado, sin atravesar muros.

**Checkpoint (incremento 1)**: recorrido navegable verificado en escritorio; Android pendiente y registrado en `docs/qa.md`. ✅

---

## Phase 4: US2 — Escuchar y controlar una estación (P1)

**Goal**: voz, canción o vídeo con un solo sonido activo, silencio global, repetición y errores recuperables.

**Independent Test**: una estación de audio y una de vídeo de demostración, con voz simulada y voz real opcional.

### Pruebas primero

- [x] T042 [P] [US2] `tests/unit/voice-selection.test.ts`: preferida → `fallbackLangs` → cualquier `es*` → `null`; nunca devuelve voz inglesa — cubre: FR-015, US4-A2.
- [x] T043 [P] [US2] `tests/unit/speech-controller.test.ts` con `SpeechPort` falso: sin `onstart` → `timeout` a `startTimeoutMs`; fin esperado por `min(max, base + ms×chars)`; `cancel` invalida callbacks tardíos; `refreshVoices` no reinicia lo que suena — cubre: FR-015, EC-03, EC-04.
- [x] T044 [P] [US2] `tests/integration/playback-coordinator.test.ts` con voz y audio falsos: cambiar de estación cancela voz y pausa medio; callbacks antiguos ignorados; silencio cancela voz y mantiene texto; `togglePlay` no marca `playing` hasta resolver `play()`; rechazo de `play()` → `error` con `canRetry` — cubre: FR-011, FR-012, FR-013, FR-014, FR-018, US2-A1–A8. *(Implementado en `tests/unit/playback-coordinator.test.ts`, 16 casos, ver «Desviaciones»)*
- [x] T045 [P] [US2] `tests/integration/introduction-policy.test.ts`: primera selección narra; repetir una estación presentada no fuerza narración; abandonar a mitad la vuelve a ofrecer; silencio cuenta como presentada — cubre: FR-009, FR-010, EC-05. *(Implementado en `tests/unit/introduction-policy.test.ts`, 6 casos, ver «Desviaciones»)*

### Implementación

- [x] T046 [US2] Implementar `src/media/voice-selection.ts` hasta pasar T042 — cubre: FR-015.
- [x] T047 [US2] Implementar `src/media/speech-controller.ts` con `SpeechPort` real (`speechSynthesis`) y watchdogs hasta pasar T043 — cubre: FR-015, EC-03.
- [x] T048 [US2] Implementar `src/media/audio-player.ts`: `HTMLAudioElement`/`HTMLVideoElement` con `preload="none"`, `playsinline`, listeners que se liberan en `dispose`, errores de carga y de `play()` normalizados — cubre: FR-016, FR-017, FR-018, FR-019. *(Implementado en `src/media/media-handle.ts`, ver «Desviaciones»)*
- [x] T049 [US2] Implementar `src/media/playback-coordinator.ts` hasta pasar T044 y T045, con tokens de operación e invariantes de data-model.md — cubre: FR-011, FR-013, FR-014.
- [x] T050 [US2] Crear `src/ui/station-panel.ts`: `role="dialog"`, `aria-modal`, foco inicial, Escape, texto con `textContent`, controles Reproducir/Pausar, Volver a escuchar, Silenciar, Ampliar, Cerrar — cubre: FR-027, FR-017.
- [x] T051 [US2] Crear `src/ui/controls-bar.ts`: Entrar (solo en pantalla de entrada), Escuchar introducción, Silenciar/Activar, catálogo, ayuda — sin botón Omitir — cubre: FR-020, FR-008. *(Barra en `index.html` + `src/main.ts`, ver «Desviaciones»)*
- [x] T052 [US2] Conectar selección de marco (T038) con el coordinador: al tocar, `select(stationId, {fromGesture: true})` y, tras la aproximación, `playIntroduction()`; el panel muestra texto siempre — cubre: FR-009, US2-A1.
- [x] T053 [US2] Persistir silencio y presentaciones en `session-store` (T020) y leerlos al arrancar — cubre: FR-030, US2-A2.
- [x] T054 [US2] `visibilitychange` oculto → `onVisibilityHidden()`: pausa, cancela voz, no reanuda al volver — cubre: FR-011, EC-06.
- [x] T055 [US2] Reproducción de vídeo con ampliación: un solo elemento `<video>` reutilizado al entrar y salir del modo ampliado, con posición conservada — cubre: FR-017, EC-07, US2-A7.

### Verificación de la fase

- [x] T056 [US2] Ejecutar `npm test`: T042–T045 pasan. Registrar en `docs/qa.md` la prueba de voz real en escritorio (sin Android todavía).

**Checkpoint — puerta 4 de la constitución**: flujo de una canción y un vídeo probado automáticamente antes de multiplicar estaciones. Si no hay Android, la prueba de voz se registra como pendiente, no como superada. ✅

---

## Phase 5: US4 — Entrada, fallos y accesibilidad (P1)

**Goal**: pantalla de clave, preparación con estado real, transición de entrada, alternativa 2D y aviso de orientación.

**Independent Test**: con voz deshabilitada y WebGL forzado a fallar, la visita sigue con el catálogo 2D.

### Pruebas primero

- [x] T057 [P] [US4] `tests/e2e/entry.spec.ts`: clave incorrecta muestra error y no reproduce audio; clave correcta habilita Entrar; doble clic en Entrar produce una transición y una bienvenida — cubre: US1-A1, US1-A3, FR-001, FR-003. *(5 casos, incluido el bloqueo de la entrada mientras carga el contenido)*
- [x] T058 [P] [US4] `tests/e2e/fallback.spec.ts`: WebGL deshabilitado lleva a `fallback2d` con las diez estaciones; voz sin soporte muestra texto y Play — cubre: US4-A1, US4-A3, FR-026.
- [x] T059 [P] [US4] `tests/e2e/reduced-motion.spec.ts`: con `prefers-reduced-motion: reduce`, la transición dura ≈150 ms y no hay movimiento decorativo — cubre: FR-028, SC-011.

### Implementación

- [x] T060 [US4] Crear `src/ui/entry-screen.ts`: campo de clave con `<label>`, estado de preparación real (sin porcentajes inventados), botón Entrar deshabilitado hasta `ready`, error con `role="alert"` — cubre: FR-001, FR-002. *(Pantalla de entrada en `index.html` + `src/main.ts`, ver «Desviaciones»)*
- [x] T061 [US4] Implementar la transición de entrada en `main.ts`: `entering` inicia `playIntroduction` **dentro** del mismo manejador del clic, fundido de 1000 ms (150 ms reducido), y retira la portada del foco y de la interacción — cubre: FR-003, D-17, SC-011.
- [x] T062 [US4] Implementar captions opcionales para vídeo: `<track kind="captions">` solo si `captions` existe en el catálogo; sin pista rota — cubre: FR-040, US2-A7. *(Pistas `public/media/captions/04.vtt` y `09.vtt`; la estación de audio no muestra ninguna)*
- [x] T063 [US4] Crear `src/ui/catalog-2d.ts`: lista accesible de las diez estaciones con imagen, tipo y título; abre el mismo panel y el mismo coordinador — cubre: FR-026, FR-022.
- [x] T064 [US4] Implementar pérdida de contexto WebGL: pausa medios, ofrece recuperar o catálogo 2D sin reproducir espontáneamente — cubre: EC-09, FR-026.
- [x] T065 [US4] Crear `src/ui/orientation-hint.ts`: aviso no bloqueante en vertical que se puede descartar; el catálogo y la clave siguen disponibles — cubre: FR-007. *(Aviso en `index.html` + `src/main.ts`, ver «Desviaciones»)*
- [x] T066 [US4] Gestión de foco: el panel devuelve foco al disparador; teclado usable en todos los controles; contraste revisado con los colores del encargo — cubre: FR-027, SC-007.
- [x] T067 [US4] Limitar `touch-action` a superficies de navegación; permitir zoom de texto — `src/styles.css` — cubre: FR-028.

**Checkpoint**: `npm run test:e2e` pasa con los tres archivos de esta fase. ✅ (30/30 en la matriz completa)

---

## Phase 6: US3 — Diez contenidos y decoración (P2)

**Goal**: colección completa, decoración independiente y estética de la paleta.

**Independent Test**: catálogo y sala muestran las mismas diez estaciones; alfombra y paneles no son seleccionables.

- [x] T068 [P] [US3] `tests/e2e/collection.spec.ts`: 10 estaciones en la sala (conteo de marcos) y en el catálogo 2D; cada una abre el mismo panel; los paneles de decoración no abren panel — cubre: FR-021, FR-022, US3-A1, US3-A2. *(Conteo de marcos y decoración no seleccionable en `tests/unit/collection.test.ts`; recorrido completo de las diez estaciones en la alternativa 2D, ver «Desviaciones»)*
- [x] T069 [US3] Implementar `src/scene/decor.ts`: alfombra (`floor-image`) con `polygonOffset` y 4 paneles en muros laterales sin solapar estaciones; `interactive: false` — cubre: FR-024, US3-A3, EC-11.
- [x] T070 [US3] Cargar decoración desde `decorations.json` con validación en runtime; omitir las que tengan error y registrarlo — cubre: FR-031, FR-032, EC-11.
- [x] T071 [US3] Aplicar la distribución 3/3/2/2 y los vídeos en muros distintos desde `stations.json`; revisión visual en navegador y registro en `docs/design.md` — cubre: FR-023, D-09, D-10.
- [x] T072 [US3] Emblema SVG provisional en `public/media/branding/` y título con ornamento; etiqueta accesible y adornos con `aria-hidden` — cubre: FR-025, US3-A4.
- [x] T073 [US3] Aplicar paleta del encargo en `src/styles.css` (morado #C7B5E8, salmón #F2AA9B, lavanda #F8F5FC, violeta #654397 con texto claro, ciruela #30263D, gris cálido #D5CFD5); comprobar contraste — cubre: FR-025, SC-007.
- [x] T074 [US3] Marcar placeholders visibles en la interfaz (texto «Demostración») sin afirmar que son ilustraciones terminadas — cubre: FR-033, EC-11.

---

## Phase 7: US5 — Actualizar y entregar (P2)

**Goal**: contenido editable, validación de publicación, CI, despliegue manual y documentación.

- [x] T075 [P] [US5] `tests/unit/publish-mode.test.ts`: `mode: "publish"` rechaza `placeholder: true` y rutas inexistentes; `mode: "demo"` las admite con aviso — cubre: US5-A2, US5-A3.
- [x] T076 [US5] Ejecutar `npm run validate:content -- --mode=publish` y confirmar que falla con la lista de marcadores (comportamiento esperado mientras no haya contenido personal) — cubre: US5-A3. *(16 incidencias y código de salida 1)*
- [x] T077 [P] [US5] Crear `scripts/check-budget.ts`: tamaño del build, tamaño de la carga esencial (sin audio/vídeo) ≤ 5 MiB, ningún archivo de medios > 80 MiB — cubre: SC-009, constitución IV.
- [x] T078 [P] [US5] Crear `.github/workflows/ci.yml`: `npm ci`, `typecheck`, `test`, `validate:content`, `build`, `check:budget`, `test:e2e` sobre `vite preview`; permisos `contents: read` — cubre: constitución VI, FR-037.
- [x] T079 [P] [US5] Crear `.github/workflows/deploy.yml` con `workflow_dispatch` únicamente, permisos mínimos de Pages y artefacto `dist/` — cubre: FR-037, constitución V.
- [x] T080 [US5] Prueba de subdirectorio: `npm run preview -- --base=/museo-de-lua/` y recorrido de E2E con esa base — cubre: SC-012, FR-037. *(`playwright.subdir.config.ts` + `npm run test:e2e:subdir`: 15/15)*
- [x] T081 [US5] Completar `docs/content-guide.md` (copiar, editar JSON, validar, commit, publicar), `docs/security.md` (alcance de la clave, CSP, dependencias), `docs/deployment.md` (Pages desde Actions, base URL, límites reconfirmados) — cubre: FR-035, FR-036, US5-A5.
- [x] T082 [US5] Registrar `docs/qa.md`: matriz de dispositivos, resultados automáticos y pendientes de Android — cubre: FR-036, constitución VI.
- [x] T083 [US5] Actualizar `README.md` con instalación, comandos reales y enlace a la spec — cubre: FR-036.

---

## Phase 8: Pulido y verificación final

- [x] T084 Medir carga inicial sin medios (≤ 5 MiB) y memoria de texturas; registrar en `docs/qa.md` — cubre: SC-009. *(Carga esencial 658 KiB medida; la memoria de texturas queda registrada como pendiente de hardware real)*
- [x] T085 Revisión de accesibilidad: teclado completo, foco visible, contraste, etiquetas; registrar resultados — cubre: SC-007. *(Registrado en `docs/qa.md`; el contraste medido con herramienta queda pendiente)*
- [x] T086 Revisión de seguridad: sin `innerHTML` con catálogo, sin `eval`, sin permisos de cámara/micrófono/ubicación, verificador sin clave literal — cubre: FR-038, constitución V. *(`npm audit`: 0 vulnerabilidades)*
- [x] T087 Ejecutar la batería completa: `npm run typecheck && npm test && npm run validate:content && npm run build && npm run check:budget && npm run test:e2e`. Registrar la salida real. *(Salida registrada más abajo)*
- [x] T088 Actualizar `specs/001-museo-de-lua/checklists/requirements.md` solo con evidencias de T087 y de pruebas manuales realizadas.

---

## Evidencia de T087 (batería completa)

| Paso | Resultado real |
|---|---|
| `npm run typecheck` | Código 0 |
| `npm test` | 120 pruebas, 16 suites, todas pasan |
| `npm run validate:content` | `✓ Contenido válido (modo demo).` |
| `npm run build` | 34 archivos; `index.js` 570,61 kB (147,76 kB gzip), `index.css` 5,94 kB |
| `npm run check:budget` | Carga esencial 659,7 KiB ≤ 5 MiB; medios 2,00 MiB |
| `npm run test:e2e` | 34/34 (17 escritorio + 17 móvil emulado) |
| `npm run test:e2e:subdir` | 17/17 en `/museo-de-lua/` |
| `npm run validate:content -- --mode=publish` | Falla a propósito: 16 marcadores, código 1 |

---

## Correcciones posteriores a la batería (2026-10-21)

Defectos encontrados al revisar el sitio en un móvil real, no previstos en el plan.
Cada corrección va con su prueba y su evidencia.

| Defecto | Causa | Corrección | Evidencia |
|---|---|---|---|
| La clave no se comprobaba al abrir el sitio por la IP de la red local (`http://192.168.x.x`): la entrada se quedaba en «Comprobando la clave…» y el botón no se recuperaba | `crypto.subtle` solo existe en contextos seguros (HTTPS o `localhost`) | `src/access/sha256.ts` (SHA-256 propio) como respaldo de `src/access/access-gate.ts`; el manejador de `src/main.ts` recupera el botón y explica el error si algo falla | `tests/unit/sha256.test.ts` (3 vectores contra `node:crypto`), `tests/unit/access-gate.test.ts` (4 casos sin `crypto.subtle`), `tests/e2e/entry.spec.ts` (2 casos con contexto no seguro); comprobado en `http://192.168.1.12:4173/` sin errores de consola |
| Al cerrar el panel de una estación en el modo alternativo 2D, el catálogo quedaba oculto para siempre | El cierre solo restauraba el catálogo cuando había escena 3D | `src/main.ts` (`closePanel`) vuelve a mostrar el catálogo cuando no hay `museum` | `tests/e2e/collection.spec.ts` (recorrido de las diez estaciones en 2D) |
| Los vídeos no offerían subtítulos y la pista anterior se acumulaba | Faltaba la pista `captions` por estación | Cada estación con vídeo declara su pista; al abrir otra se limpian las pistas | `tests/e2e/station.spec.ts` (prueba de subtítulos) |

---

## Desviaciones respecto al plan

Se aplican porque el plan es una guía, no un contrato de nombres de archivo; cada desviación está cubierta por pruebas.

| Tarea | Previsto | Real | Motivo |
|---|---|---|---|
| T027, T032 | `src/scene/camera-rig.ts` | `src/scene/approach.ts` + `tests/unit/approach.test.ts` | La aproximación y la pose se separaron del renderizado (`src/scene/museum.ts`). |
| T028, T029 | `joystick.test.ts`, `pointer-look.test.ts` | `tests/unit/input-controls.test.ts` | Joystick y arrastre comparten el mismo módulo de entrada; una sola suite evita duplicar los falsos. |
| T033 | `src/controls/keyboard.ts` | `src/controls/input.ts` | Teclado, joystick y arrastre comparten la limpieza de entradas (`blur`, `pointercancel`). |
| T044, T045 | `tests/integration/` | `tests/unit/` | El proyecto no usa jsdom: la integración se prueba con unitarias y Playwright. |
| T048 | `src/media/audio-player.ts` | `src/media/media-handle.ts` | Un solo manejador para `HTMLAudioElement` y `HTMLVideoElement`. |
| T051, T060, T065 | `src/ui/controls-bar.ts`, `entry-screen.ts`, `orientation-hint.ts` | `index.html` + `src/main.ts` | Son markup estático con pocas ramas: no compensaba un módulo aparte. |
| T024 | Audio WAV, vídeos 09 y 10 | Audio MP3, vídeos 04 y 09 | MP3 pesa menos que WAV y los vídeos deben caer en muros distintos (D-09/D-10). |
| T068 | Conteo de marcos en E2E | `tests/unit/collection.test.ts` + E2E del catálogo | Con WebGL por software, abrir diez estaciones seguidas en 3D supera el límite de tiempo de la prueba; el recorrido completo se verifica en la alternativa 2D, que usa el mismo panel y el mismo coordinador. |

---

## Dependencias y orden

- Phase 1 → Phase 2 → Phase 3 (MVP incremento 1) → Phase 4 (puerta 4) → Phase 5 → Phase 6 → Phase 7 → Phase 8.
- Dentro de cada fase, las pruebas `[P]` preceden a su implementación.
- T049 depende de T047 y T048. T052 depende de T036, T038 y T049.
- Ninguna tarea requiere contenido personal; las pruebas Android quedan en `docs/qa.md`.

## Cobertura de requisitos

| Requisito | Tareas |
|---|---|
| FR-001–FR-003 | T018, T057, T060, T061 |
| FR-004–FR-007 | T026–T035, T065 |
| FR-008–FR-014 | T044, T049, T051, T052 |
| FR-015–FR-019 | T042–T048 |
| FR-020 | T051 |
| FR-021–FR-025 | T025, T036, T068–T074 |
| FR-026–FR-030 | T022, T058, T063, T064, T013, T020, T053 |
| FR-029 | T058, T070, T074 |
| FR-031–FR-034 | T009–T017, T070 |
| FR-033 | T023, T024, T074 |
| FR-035–FR-038 | T004, T006, T078–T083, T086 |
| FR-039–FR-040 | T039, T062 |
| SC-001–SC-012 | T041, T057–T059, T068, T084–T087 |

## Notas

- Las pruebas Android y la medición de FPS en dispositivo no se marcan completas sin evidencia; se anotan en `docs/qa.md` como pendientes.
- La aprobación de este `tasks.md` cumple la puerta 2 de la constitución solo tras el análisis de consistencia de plan.md.
- Ninguna tarea se marcó sin ejecutar su verificación; las que dependen de hardware real quedan registradas como pendientes en `docs/qa.md`.
