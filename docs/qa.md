# QA

Registro de qué está verificado y qué queda pendiente. Actualiza esta tabla en cada cambio.

## Automático

| Comprobación | Comando | Resultado |
|---|---|---|
| Tipos | `npm run typecheck` | Correcto |
| Unitarias | `npm test` | 135 pruebas, 17 suites, todas pasan |
| Contenido (demo) | `npm run validate:content` | Correcto |
| Contenido (publicación) | `npm run validate:content -- --mode=publish` | **Falla a propósito**: quedan marcadores `placeholder: true` |
| Build | `npm run build` | Correcto: 573 kB de JS (148 kB gzip), 7,5 kB de CSS, 35 archivos |
| Presupuesto | `npm run check:budget` | Carga esencial 2,09 MiB ≤ 5 MiB; medios 6,79 MiB |
| E2E escritorio | `npm run test:e2e -- --project=chromium-desktop` | 25/25 |
| E2E móvil emulado | `npm run test:e2e -- --project=chromium-android` | 25/25 |
| E2E en subdirectorio | `npm run test:e2e:subdir` | 25/25 |

La batería completa que exige la constitución es:

```bash
npm run typecheck && npm test && npm run validate:content && npm run build && npm run check:budget && npm run test:e2e
```

## Rendimiento (T084)

| Medición | Valor | Cómo se obtuvo |
|---|---|---|
| Carga esencial sin medios | 2,09 MiB (148 KiB solo JS; el resto son portadas y paneles) | `npm run check:budget` |
| Build completo con medios | 8,88 MiB (43 archivos) | `npm run check:budget` |
| Archivos más pesados | `media/audio/01.mp3` 2,23 MiB, `media/video/04.mp4` 644 KiB | `npm run check:budget` |
| Memoria de texturas | No medida | Requiere un dispositivo Android real; pendiente |

Los medios se piden bajo demanda: la visita no descarga ningún audio ni vídeo hasta que la visitante lo reproduce.

## Revisar en el teléfono

El build se sirve en la red local para comprobarlo en un móvil real:

```bash
npm run build
npm run preview -- --host --port 4173     # en la red local
ipconfig                                   # IPv4 de la tarjeta Wi-Fi
```

Abre `http://<IPv4>:4173/` en el móvil, con la **misma red Wi-Fi**, y entra con la clave
de demostración (`lua`). Si el navegador del móvil no conecta, es el cortafuegos de
Windows: permite Node.js en redes privadas. Para desarrollo con recarga en caliente,
`npm run dev -- --host` sirve el código sin compilar.

Con el móvil conectado por USB (Android), `adb reverse tcp:4173 tcp:4173` permite
usar `http://localhost:4173/` sin depender del Wi-Fi.

Es la vía para cerrar los puntos que quedan pendientes en Android: voz del sistema en
español, multitáctil real, pantalla completa real, FPS sostenidos, rotación de pantalla
y reproducción de vídeo en red móvil.

## Dispositivos

| Dispositivo | Navegador | Resultado | Notas |
|---|---|---|---|
| Escritorio 1280×720 | Chromium 141 (Playwright) | Automático, 25/25 | Representado por el proyecto `chromium-desktop` |
| Móvil emulado 412×915 (Pixel 7) | Chromium 141 (Playwright) | Automático, 25/25 | No es hardware real: no valida multitáctil real ni pantalla completa |
| Android físico (Chrome) | — | **Pendiente** | Falta el dispositivo |
| iOS / Safari | — | **Pendiente** | Sin probar |

## Pendiente en hardware Android

Estos puntos **no** se pueden cerrar con emulación:

- [ ] Voz del sistema (`SpeechSynthesis`) con una voz real en español y su fin real (el emulador no dispara `onend`).
- [ ] Multitáctil real: joystick y arrastre de cámara a la vez.
- [ ] Pantalla completa real del vídeo (el emulador no la concede).
- [ ] Fotogramas por segundo sostenidos (objetivo: 30 FPS) y memoria resident.
- [ ] Rotación de la pantalla y aviso de orientación.
- [ ] Reproducción de vídeo en la red móvil.

## Accesibilidad (T085)

Revisión estática y con lector de pantalla simulado:

- [x] Teclado completo: tabulación, foco atrapado dentro del diálogo, `Escape` cierra el panel.
- [x] Foco visible: `:focus-visible` con contorno de 3 px.
- [x] Contraste: texto oscuro sobre pastel; botón principal violeta (`#654397`) con texto blanco, superior a 4.5:1.
- [x] Objetivos táctiles de 48×48 px como mínimo.
- [x] Etiquetas: `aria-live` en los estados de reproducción, `role="alert"` en los errores, `aria-modal` en el diálogo.
- [x] Alternativa textual completa: la visita no depende de la voz ni de la imagen.
- [x] `prefers-reduced-motion` reduce la transición de entrada de 1000 ms a 150 ms.
- [x] Contraste medido con herramienta: ver «Contraste» más abajo.

### Contraste (medido)

Herramienta: `axe-core` 4.14.0 (dependencia de desarrollo fijada) ejecutado en Playwright sobre la entrada, el museo, el catálogo y el panel de estación (`tests/e2e/contrast.spec.ts`). Resultado: 0 incumplimientos de `color-contrast` en las cuatro pantallas.

axe no puede determinar el fondo detrás de un degradado o de la escena 3D; esos casos se calculan en el peor color posible (`tests/unit/contrast.test.ts`):

| Pareja | Razón de contraste | Mínimo WCAG AA |
|---|---|---|
| Texto plum sobre lavanda (entrada) | 13,2:1 | 4,5:1 |
| Texto plum sobre tinte lila o salmón del degradado | 9,9:1 y 10,1:1 | 4,5:1 |
| Barra y ayuda del museo sobre la escena (90 % de fondo) | 11,4:1 o más | 4,5:1 |
| Botón principal: blanco sobre violeta | 7,5:1 | 4,5:1 |
| Botón «Entrar al museo»: blanco sobre violeta-lila (el más ajustado) | 5,4:1 | 4,5:1 |
| Error: texto plum sobre `#fbe3dc` | 11,7:1 | 4,5:1 |

Pendiente de medir en el móvil real: el contraste bajo la luz del día, que no se puede reproducir con una herramienta.

## Seguridad (T086)

- [x] Sin `innerHTML` con datos del catálogo: todo con `textContent`.
- [x] Sin `eval` ni `new Function`.
- [x] Sin permisos de cámara, micrófono, geolocalización ni notificaciones.
- [x] Verificador SHA-256 con sal, sin la clave literal en el bundle.
- [x] CSP restrictiva en `<meta>`.
- [x] Sin peticiones a terceros.
- [x] `npm audit` sin vulnerabilidades altas.

## Correcciones encontradas durante la QA

| Fecha | Hallazgo | Corrección |
|---|---|---|
| 2026-10-21 | En pantallas estrechas la barra de controles perdía su posición y el lienzo 3D tapaba los botones | La barra mantiene su posición; el aviso de orientación se mantiene dentro de la barra |
| 2026-10-21 | El aviso de orientación se superponía a la barra y bloqueaba el botón «Catálogo» | Vive dentro de la barra, así que nunca tapa los controles |
| 2026-10-21 | Pulsar «Continuar» antes de que cargara el contenido se descartaba en silencio | El botón queda deshabilitado con el aviso «Cargando el museo…» y la pulsación espera al runtime |
| 2026-10-21 | Llegar a un cuadro cancelaba la canción que la visitante acababa de poner | La introducción automática no interrumpe una reproducción en curso |
| 2026-10-21 | Sin WebGL 2, al cerrar el panel de una estación el catálogo quedaba oculto y sin forma de volver a abrirlo | Al cerrar el panel, la alternativa 2D vuelve a mostrar el catálogo |
| 2026-10-21 | Los vídeos no offerían subtítulos y la pista de la estación anterior se acumulaba | Cada estación con vídeo declara su pista `captions`; al abrir otra, se limpian las pistas |
| 2026-10-21 | Al abrir el sitio por la IP de la red local desde el móvil, la comprobación de la clave fallaba: `crypto.subtle` no existe fuera de un contexto seguro y la entrada se quedaba bloqueada en «Comprobando la clave…» | Respaldo de SHA-256 en TypeScript para contextos no seguros; además, la entrada nunca se deja bloqueada sin explicación (ver `EC-12`) |
| 2026-10-21 | En horizontal en el móvil la barra ocupaba casi media pantalla, el joystick tapaba la ayuda y, en la pantalla de entrada, el botón «Entrar al museo» quedaba fuera de la pantalla | Barra de una línea (botones de 44 px, título oculto), joystick en la esquina, ayuda a su derecha; en horizontal la entrada usa dos columnas (clave a la derecha) y `viewport-fit=cover` con zonas seguras | `tests/e2e/landscape.spec.ts` (740×360: barra ≤ 90 px, botones dentro de la pantalla en una fila, entrada sin desplazamiento, sin solape joystick-ayuda); captura comprobada |
| 2026-10-22 | Al ampliar un vídeo y salir de pantalla completa con el sistema (Atrás, Esc o el botón del navegador), el vídeo seguía a pantalla completa tapando el diálogo: solo se veía el vídeo, sin botones | La clase de ampliación no seguía al estado real de pantalla completa | `ampliar` usa la API del navegador y un listener de `fullscreenchange` quita la ampliación al salir; sin API, ampliación solo visual | `tests/e2e/video-expand.spec.ts` (sale de pantalla completa por API y comprueba que el diálogo y sus botones vuelven a verse); reproducido antes del arreglo |
| 2026-10-22 | Al pulsar Reproducir en el móvil no había ninguna señal mientras el audio cargaba; el botón parecía no responder | El estado no distinguía «cargando» de «listo» | Nueva fase `loading`: el botón muestra «Cargando…», se deshabilita y el estado dice «Cargando el audio…» | `tests/unit/playback-coordinator.test.ts`, `tests/e2e/play-loading.spec.ts` |
| 2026-10-22 | Una narración que terminaba o fallaba tarde podía devolver a «listo» un audio que cargaba o ya sonaba | Los callbacks de la voz no comprobaban la fase actual | `onEnd`/`onFail` actúan solo si la fase es `narrating` | `tests/unit/playback-coordinator.test.ts` (eventos tardíos) |
| 2026-10-22 | El botón «Ampliar» no indicaba que el vídeo estaba ampliado | Sin etiqueta de estado | El botón dice «Reducir» mientras el vídeo está ampliado; un único punto (`setVideoExpanded`) controla clase y etiqueta | `tests/e2e/video-expand.spec.ts` |
