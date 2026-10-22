# QA

Registro de qué está verificado y qué queda pendiente. Actualiza esta tabla en cada cambio.

## Automático

| Comprobación | Comando | Resultado |
|---|---|---|
| Tipos | `npm run typecheck` | Correcto |
| Unitarias | `npm test` | 113 pruebas, 15 suites, todas pasan |
| Contenido (demo) | `npm run validate:content` | Correcto |
| Contenido (publicación) | `npm run validate:content -- --mode=publish` | **Falla a propósito**: quedan marcadores `placeholder: true` |
| Build | `npm run build` | Correcto: 569 kB de JS (147 kB gzip), 5,9 kB de CSS, 34 archivos |
| Presupuesto | `npm run check:budget` | Carga esencial 658 KiB ≤ 5 MiB; medios 2,00 MiB |
| E2E escritorio | `npm run test:e2e -- --project=chromium-desktop` | 15/15 |
| E2E móvil emulado | `npm run test:e2e -- --project=chromium-android` | 15/15 |
| E2E en subdirectorio | `npm run test:e2e:subdir` | 15/15 |

La batería completa que exige la constitución es:

```bash
npm run typecheck && npm test && npm run validate:content && npm run build && npm run check:budget && npm run test:e2e
```

## Rendimiento (T084)

| Medición | Valor | Cómo se obtuvo |
|---|---|---|
| Carga esencial sin medios | 658 KiB (147 KiB solo JS) | `npm run check:budget` |
| Build completo con medios de demostración | 2,64 MiB (34 archivos) | `npm run check:budget` |
| Archivos más pesados | `assets/index-*.js` 555 KiB, `media/video/04.mp4` 644 KiB | `npm run check:budget` |
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
| Escritorio 1280×720 | Chromium 141 (Playwright) | Automático, 15/15 | Representado por el proyecto `chromium-desktop` |
| Móvil emulado 412×915 (Pixel 7) | Chromium 141 (Playwright) | Automático, 15/15 | No es hardware real: no valida multitáctil real ni pantalla completa |
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
- [ ] Contraste real medido con herramienta (no solo revisión del código de color).

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
