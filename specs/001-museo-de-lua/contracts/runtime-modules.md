# Contrato: módulos de runtime

Interfaces internas entre módulos de `src/`. Son el contrato que deben respetar las tareas.
Los nombres y tipos son exactos; los cuerpos los decide la implementación.

## Coordenadas de muro

- `wall: "left" | "right"`: `position` es la coordenada **z** del centro del marco; `x` fijo
  (`-369` izquierda, `49` derecha, valores de la referencia).
- `wall: "front" | "back"`: `position` es la coordenada **x**; `z` fijo (`-229` frente, `269` fondo).
- Orientación: izquierda `rotation.y = +π/2`, derecha `-π/2`, frente `0`, fondo `π`.
- Punto de aproximación: `approachDistance` (50) en la normal del muro hacia el interior.

## `app/app-state.ts`

```ts
type AppPhase = "locked" | "verifying" | "loading" | "ready" | "entering" | "touring" | "fallback2d";

interface AppState {
  phase: AppPhase;
  selectedStationId: string | null;
}

// Transiciones permitidas:
// locked → verifying (clave enviada)
// verifying → locked (clave incorrecta) | loading (correcta)
// loading → ready (contenido esencial listo) | fallback2d (sin WebGL o fallo)
// ready → entering (Entrar; ignora llamadas repetidas)
// entering → touring (transición completada)
// touring → fallback2d (pérdida de contexto WebGL)
// fallback2d → touring (recuperación exitosa) — opcional
function transition(state: AppState, event: AppEvent): AppState;
```

Un evento no válido en un estado devuelve el mismo estado; no lanza excepciones.

## `access/access-gate.ts`

```ts
// Normaliza: trim, minúsculas, sin acentos (NFD + quitar marcas), espacios colapsados.
function normalizeAccessKey(raw: string): string;
// Verificador: SHA-256 hex de `${salt}:${normalized}`.
function computeVerifier(normalizedKey: string, salt: string): Promise<string>;
// true si el verificador coincide. Comparación en tiempo constante sobre cadenas hex.
function verifyAccessKey(raw: string, config: SiteConfig["access"]): Promise<boolean>;
```

No se guarda ni registra `raw`.

## `app/session-store.ts`

```ts
interface SessionSnapshot { granted: boolean; muted: boolean; presentedStations: string[] }
interface SessionStore {
  read(): SessionSnapshot;
  write(patch: Partial<SessionSnapshot>): void;   // fusiona y persiste
  readonly backend: "sessionStorage" | "memory";
}
function createSessionStore(storage?: Storage): SessionStore;
```

Clave `museo-de-lua:v1`. Si `setItem` falla, cambia a `memory` sin lanzar.

## `content/validate.ts` (puro)

```ts
interface ValidationIssue { file: string; path: string; code: string; message: string }
interface ValidationResult { ok: boolean; issues: ValidationIssue[] }
interface ValidateOptions { mode: "demo" | "publish"; existingPaths: ReadonlySet<string> }

function validateSiteConfig(input: unknown, opts: ValidateOptions): ValidationResult;
function validateStations(input: unknown, opts: ValidateOptions): ValidationResult;
function validateDecorations(input: unknown, opts: ValidateOptions): ValidationResult;
function validateAll(files: { site: unknown; stations: unknown; decorations: unknown }, opts: ValidateOptions): ValidationResult;
```

`existingPaths` contiene las rutas relativas de `public/` que existen. El validador no lee el disco.

## `media/playback-coordinator.ts`

```ts
interface PlaybackCoordinator {
  readonly state: PlaybackSnapshot;
  subscribe(listener: (s: PlaybackSnapshot) => void): () => void;

  // Selección de estación. Pausa el medio anterior, cancela voz, invalida tokens.
  select(stationId: string, opts: { fromGesture: boolean }): void;
  // Narración de la estación seleccionada (introducción).
  playIntroduction(): void;
  // Reproducción/pausa del medio de la estación activa; requiere gesto.
  togglePlay(): Promise<void>;
  restartIntroduction(): void;       // pausa el medio y repite la introducción desde el principio
  close(): void;                     // pausa y cancela, conserva posiciones
  setMuted(muted: boolean): void;    // cancela voz; muted en medios
  seek(seconds: number): void;
  setVolume(v: number): void;
  onVisibilityHidden(): void;        // pausa y cancela, sin reanudar
  dispose(): void;
}

interface PlaybackSnapshot {
  activeStationId: string | null;
  phase: "idle" | "narrating" | "ready" | "playing" | "paused" | "error";
  muted: boolean;
  positionSeconds: number;
  durationSeconds: number | null;
  errorMessage: string | null;
  canRetry: boolean;
  introductionPresented: boolean;
}
```

Reglas:
- Toda acción incrementa `token`. Callbacks de voz/medio con token antiguo no cambian el estado.
- `togglePlay()` resuelve tras `play()`; si rechaza, `phase = "error"` y `canRetry = true`.
- `playIntroduction()` cancela cualquier narración en curso antes de iniciar la nueva.
- Si `muted`, `playIntroduction()` no habla: pasa a `ready` con texto visible (FR-013).

## `media/speech-controller.ts`

```ts
interface SpeechSession { id: number; text: string }
interface SpeechPort {                       // abstracción para tests
  speak(utterance: { text: string; lang: string; voice: unknown; rate: number; pitch: number; volume: number;
                     onstart: () => void; onend: () => void; onerror: () => void }): void;
  cancel(): void;
  getVoices(): unknown[];
  readonly supported: boolean;
}

interface SpeechController {
  speakText(text: string, handlers: { onStart(): void; onEnd(): void; onFail(reason: "unsupported" | "error" | "timeout"): void }): SpeechSession;
  cancel(): void;                            // invalida la sesión actual
  refreshVoices(): void;                     // ante voiceschanged; no reinicia lo que suena
}
```

Watchdogs: `startTimeoutMs` sin `onstart` → fallo `timeout`; tras `onstart`, fin esperado
`min(maxUtteranceMs, baseEndTimeoutMs + msPerCharacter × longitud)` → fallo `timeout` y `cancel()`.

## `media/voice-selection.ts` (puro)

```ts
interface VoiceLike { name: string; lang: string; localService?: boolean; default?: boolean }
function selectSpanishVoice(voices: readonly VoiceLike[], pref: { preferredVoiceName?: string; fallbackLangs: string[] }): VoiceLike | null;
```

Orden: nombre preferido → idioma exacto de `fallbackLangs` → cualquier `es*` → `null`.
Nunca devuelve una voz no española para texto español.

## `scene/camera-rig.ts`

```ts
interface CameraRig {
  readonly pose: { x: number; y: number; z: number; yaw: number; pitch: number };
  update(dtSeconds: number, input: { move: {x: number; z: number}; look: {dYaw: number; dPitch: number} }): void;
  approach(stationPlacement: StationPlacement, distance: number): void;   // cancelable
  cancelApproach(): void;
  returnToPreviousPose(): void;
  isApproaching(): boolean;
}
```

`update` no mueve si `isApproaching()` y hay entrada de movimiento (cancela aproximación).
Aproximación: `pos += (target - pos) × (1 - exp(-approachRate × dt))`; termina al estar
a < 0.5 unidades de la meta.

## `controls/navigation.ts` (puro)

```ts
interface Bounds { minX: number; maxX: number; minZ: number; maxZ: number }
function stepPosition(pos: {x:number; z:number}, dir: {x:number; z:number}, speed: number, dt: number,
                      bounds: Bounds, radius: number, obstacles: readonly Rect[]): { x: number; z: number };
// Limita dentro de los muros y evita obstáculos (rectángulos de cuadros y paneles, mismo radio).
```

`dir` se normaliza; `dir` de longitud 0 deja la posición igual.

## `controls/pointer-look.ts`

- Un puntero que se mueve más de 8 px CSS se convierte en `look`; si no, en `tap`.
- `tap` solo selecciona cuadro si el objetivo es un marco de estación (raycast) y no hay panel abierto.
- Ignora punteros cuyo `target` pertenece a controles de interfaz (`data-ui="true"`).

## `controls/joystick.ts`

Zona izquierda de la pantalla (mitad inferior-izquierda). Radio base 56 px CSS; devuelve
`{x, y}` en [-1, 1] con zona muerta 0.12. Se activa solo con `pointerdown` en su zona.

## `scene/room.ts` y `scene/station-frames.ts`

```ts
function buildRoom(): { group: THREE.Group; bounds: Bounds; obstacles: Rect[] };
function buildStationFrames(stations: readonly Station[], textures: TextureCache): StationFrame[];
interface StationFrame { stationId: string; mesh: THREE.Mesh; placement: StationPlacement; approachPose: {x:number; z:number; yaw:number} }
```

Liberación: `dispose()` en geometrías, materiales y texturas creadas; las texturas
compartidas se liberan una vez.

## `ui/station-panel.ts`

- Contenedor `role="dialog"` con `aria-modal="true"` y `aria-labelledby`.
- Foco inicial en el título; Escape cierra; al cerrar devuelve el foco al disparador.
- Contenido se crea con `textContent`; nunca `innerHTML` con datos de catálogo.
- Controles: Reproducir/Pausar, Volver a escuchar, Silenciar/Activar, Ampliar, Cerrar.

## `scene/decor.ts`

Crea 1 alfombra (`floor-image`) y hasta 4 paneles (`wall-image`), todos con
`userData.interactive = false`. Ninguno entra en la lista de objetos seleccionables.
El suelo de la alfombra usa `polygonOffset` para evitar parpadeo.
