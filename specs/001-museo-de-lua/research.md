# Investigación técnica: Museo de Lua

**Feature**: 001-museo-de-lua · **Fecha**: 2026-10-21 · **Spec**: [spec.md](spec.md)

Este documento registra lo verificado antes del plan. Las cifras de rendimiento
y compatibilidad NO se han medido todavía; se listan como objetivos a comprobar.

## 1. Inspección de la referencia

Fuente revisada: `lrusso/3DArtMuseum`, commit `7ea04e3cbc2ccc3cb8a4d8ff1167f5f9bae9e242`
(«Update README.md», 2019-04-15, rama master). Archivos leídos: `3DArtMuseum.htm`,
`3DArtMuseum.js`, `3DArtMuseumPleaseRotate.js`, `license.txt`.

| Aspecto | Hallazgo verificado | Decisión |
|---|---|---|
| Motor | Three.js **r88dev** incrustado en el propio `3DArtMuseum.js` (REVISION "88dev"). Usa APIs eliminadas (`ImageUtils`, `Geometry`) | No se reutiliza el bloque incrustado. Se reescribe sobre Three.js moderno; los valores de escena se portan |
| Sala | Suelo y techo `PlaneGeometry`; muros de 600×90 en x=-370 (izq.), x=50 (der.), z=-230 (frente), z=270 (fondo). Suelo y=-40, techo y=47 | Se conservan estas coordenadas como unidades de escena |
| Cámara | Posición inicial (0, 0, 195), FOV 37.8, near 1, far 100000 | FOV **65** según el encargo (decisión D-06); posición inicial en el punto de entrada |
| Cuadros | 20 planos de 30 de alto con `addToLeft/Front/Right/Back`; posiciones x/z fijas. Cada uno con imagen, audio y texto | Pasan a 10 estaciones (D-09). Distribución por pared se recalcula conservando la lógica de muros |
| Aproximación | Al tocar un cuadro: interpolación lineal a 50 unidades frente al cuadro, factor 0.04 **por fotograma** (dependiente de FPS), luego reproduce audio | Interpolación con amortiguación **dependiente del tiempo** (D-08); misma distancia de 50 unidades |
| Giro | Arrastre horizontal: 0.0035 rad/px (ratón), 0.002 (táctil) | Giro por arrastre, sensibilidad configurable; añade inclinación limitada |
| Voz | `new Audio("Welcome.mp3")` y MP3 por cuadro; `pause()` al cambiar | Narración con SpeechSynthesis (spec §5); MP3 solo para canciones |
| Entrada | Pantalla "pleasewait", botón "Comenzar la visita virtual" que reproduce la bienvenida | Entrada con clave informal y transición (spec §4) |
| Orientación | `3DArtMuseumPleaseRotate.js` de Rob Scanlon (**MIT**), bloquea en horizontal con mensaje | Se reimplementa un aviso propio no bloqueante; no se incluye la librería |
| Licencia | `license.txt` = **GPL-3.0** completa | El proyecto se distribuye bajo GPL-3.0-or-later con atribución (D-15) |
| Activos | Imágenes, texturas y MP3 de la autora | **No se descargan ni se redistribuyen**; se usan marcadores generados (D-12) |

Conclusión: la referencia aporta layout, comportamiento de aproximación y estética de
sala. El código del motor es obsoleto y no se copia.

## 2. Verificación de versiones (2026-10-21)

Consultado con `npm view` y Context7 (`/mrdoob/three.js`, docs r186):

| Paquete | Versión elegida | Motivo |
|---|---|---|
| three | **0.186.1** (exacta) | Última publicada. Docs r186: WebGL 2 obligatorio (WebGL 1 eliminado desde r163) |
| vite | **8.3.5** | Última publicada; requiere Node ≥ 20.19 / 22.12 |
| typescript | **5.9.3** | Línea 5.x estable; la 7.x (nativa) se evalúa después |
| vitest | **5.0.5** | Pruebas unitarias de estados y validación |
| @playwright/test | **1.64.1** | Pruebas E2E en Chromium sobre `vite preview` |
| Node | **24.16.0** en el equipo | Ejecuta `.ts` con type stripping (`process.features.typescript = "strip"`) |

Restricciones de la API de Three.js r186 que afectan al diseño:
- `WebGLRenderer` usa WebGL 2; comprobar disponibilidad antes de crear el renderer.
- Texturas de color deben marcarse `colorSpace = SRGBColorSpace`.
- Los materiales básicos no dependen de luces; ahorran coste en móvil.

## 3. Web Speech API

- `speechSynthesis.getVoices()` puede devolver lista vacía al inicio; escuchar `voiceschanged`.
- Eventos `onstart`, `onend`, `onerror` no están garantizados en todos los motores:
  se requieren watchdogs (EC-03) y tokens de operación.
- `speak()` debe invocarse desde un gesto del usuario en Android; la transición de
  entrada se diseña para no diferir la llamada.
- Pronunciación: se usa `speechText` opcional cuando el texto visible no se lee bien.

## 4. Reproducción de medios

- Autoplay: `play()` sin gesto puede rechazarse; toda reproducción se inicia desde
  botón, con manejo de la promesa.
- `preload="none"` para canciones y vídeos; la carga ocurre al seleccionar la estación.
- `playsinline` y `poster` en vídeo. Pantalla completa solo desde gesto.
- Comprobación de compatibilidad: H.264 + AAC en MP4 se considera el formato base.

## 5. Hosting: GitHub Pages

- Publicación de sitio estático desde GitHub Actions; límites a reconfirmar antes de
  publicar (fuente en spec §17). No usar Git LFS para servir medios.
- Pages no permite cabeceras HTTP personalizadas: la CSP se entrega mediante `<meta>`
  y las limitaciones se documentan (D-14).
- Base de Vite: `base: "./"` para funcionar bajo `/<repositorio>/` sin conocer el nombre
  definitivo (D-13).

## 6. Clave informal

- Se almacena solo un **verificador**: SHA-256 de la clave normalizada con una sal,
  en `public/config/site.json`. La clave literal no aparece en el código ni en el repositorio.
- `crypto.subtle` exige contexto seguro: HTTPS en Pages y `localhost` en desarrollo son válidos.
- Limitación explícita: el verificador es visible en el bundle; es una barrera casual (spec §13).

## 7. Herramientas de contenido

- Node 24 ejecuta el validador en TypeScript sin dependencias (`node scripts/validate-content.ts`).
  El mismo módulo de validación se importa desde pruebas Vitest.
- ffmpeg 8 presente en el equipo (`C:\Users\alfal\AppData\Local\Microsoft\WinGet\Links\ffmpeg.exe`):
  permite generar vídeo de demostración corto en H.264/AAC. Si desaparece, la estación de
  vídeo queda con marcador y se registra como pendiente.
- Imágenes de demostración y de decoración: PNG generados por script con `zlib`, sin dependencias.

## 8. Decisiones registradas (D-xx)

| ID | Decisión | Alternativas descartadas |
|---|---|---|
| D-01 | Vite + TypeScript estricto + Three.js; sin React | React/Vue: no aportan a una sala 3D con interfaz pequeña |
| D-02 | Reescritura sobre Three.js r186 con valores portados de la referencia | Actualizar el bloque r88 en el sitio: frágil y con APIs eliminadas |
| D-03 | Estado de medios y voz en un único `PlaybackCoordinator` | Eventos globales sueltos: difíciles de probar |
| D-04 | Validación de catálogos en TypeScript sin dependencias | Zod/Ajv: dependencia extra sin necesidad |
| D-05 | Entrada por verificador SHA-256 con sal | Clave en texto plano; hash sin sal |
| D-06 | FOV 65 (encargo) y posición de cámara en el punto de entrada | FOV 37.8 de la referencia: estrecho en móvil vertical |
| D-07 | Altura de ojos por defecto **igual que la referencia** (y=0 en unidades de escena) | 1.6 m del encargo: en unidades de la sala los cuadros quedarían demasiado altos. Configurable; se valida en Android |
| D-08 | Aproximación con amortiguación temporal (`1 - e^(-k·dt)`) | Factor fijo por fotograma: depende de los FPS |
| D-09 | Diez estaciones: 3 izquierda, 3 derecha, 2 frente, 2 fondo; vídeos separados (estaciones 4 y 9) | Mantener 20 cuadros: contradice el encargo |
| D-10 | Coordinadas de distribución propuestas a partir de las posiciones de referencia y revisadas visualmente | Coordenadas inventadas sin ver la sala |
| D-11 | Velocidad y radio de colisión en unidades de escena, ajustables | Metros: la escala de la referencia no está definida en metros |
| D-12 | Medios de demostración generados localmente; sin activos de la autora | Descargar imágenes de museos: riesgo de licencia |
| D-13 | `base: "./"` y rutas relativas | Ruta fija `/museo-de-lua/`: frágil si cambia el nombre del repositorio |
| D-14 | CSP por `<meta>` y documentación de límites de Pages | Prometer cabeceras que Pages no admite |
| D-15 | Proyecto GPL-3.0-or-later con atribución a lrusso/3DArtMuseum y avisos de Three.js (MIT) | Licencia MIT: incompatible con reutilizar la estructura de GPL |
| D-16 | Sin ESLint en el MVP: `typecheck` + pruebas + validación cubren el alcance | Añadir lint sin reglas definidas: ruido |
| D-17 | Narración y medios se inician solo tras gesto explícito | Autoplay de bienvenida: bloqueado y contrario a la constitución |
