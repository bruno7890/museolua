# Modelo de datos: Museo de Lua

**Feature**: 001-museo-de-lua · **Spec**: [spec.md](spec.md) · **Plan**: [plan.md](plan.md)

La aplicación no tiene base de datos. Las entidades son catálogos JSON en `public/`
y estado en memoria de la visita. Los campos y reglas exactos están en
[contracts/content-catalogs.md](contracts/content-catalogs.md).

## Entidades persistidas (catálogos)

### MuseumConfig (`public/config/site.json`)
- `title`, `ornament` (emblema SVG provisional), `room` (imagen del techo; la paleta vive en el código)
- `entry`: `label`, `transitionMs` (1000), `reducedTransitionMs` (150)
- `access`: `hashAlgorithm` ("SHA-256"), `salt`, `verifier` (hex). Nunca la clave literal
- `speech`: `preferredVoiceName?`, `lang` ("es"), `fallbackLangs` (["es-EC","es-419"]), `rate` 0.95, `pitch` 1, `volume` 0.7, `startTimeoutMs` 4000, `maxUtteranceMs` 60000, `msPerCharacter` 80, `baseEndTimeoutMs` 2000
- `welcome`: `touchText`, `desktopText`, `speechTextTouch?`, `speechTextDesktop?`
- `navigation`: `walkSpeed` (unidades/s), `lookSensitivity`, `approachRate` (k), `approachDistance` (50), `eyeHeight`, `fov` (65), `collisionRadius`
- `quality`: `defaultProfile` ("standard"), `reducedProfile` ("reduced")

### Station (`public/data/stations.json`, lista `stations`)
Diez registros. Campos de identidad y contenido:
- `id` (único, `estacion-01` … `estacion-10`), `order` (1–10, único), `enabled` (boolean)
- `type`: `"audio"` (ocho) o `"video"` (dos)
- `title`, `description`, `credit`, `placeholder` (boolean)
- `image`: `src`, `alt`, `width`, `height`
- `narration`: `mode` ("browser"), `text`, `speechText?`, `policy` ("first-visit")
- `media`: `src`, `mime` (`audio/mpeg`, `audio/wav` para demo, `video/mp4`), `durationSeconds?`, `poster?`
- `captions?`: `src`, `lang`
- `placement`: `wall` ("left"|"right"|"front"|"back"), `position` (posición a lo largo del muro), `width`, `centerY`

Reglas: `type = "video"` exige `media.mime = "video/mp4"`; `type = "audio"` no admite vídeo.
`narration.text` vacío significa ir directo a «listo» (EC-02).

### Decoration (`public/data/decorations.json`, lista `decorations`)
- `id` (`decor-rug-entry`, `decor-gon-left-01`, `decor-gon-left-02`, `decor-gon-right-01`, `decor-gon-right-02`)
- `enabled`, `kind`: `"floor-image"` | `"wall-image"`
- `image`: `src`, `alt`, `credit`, `placeholder` (boolean)
- `placement` (muro) **o** `transform` (suelo): posiciones, tamaño, `fit` ("contain"|"cover")
- `interactive`: siempre `false`; no tienen narración ni medio

## Estado en memoria de la visita

### AppState (`app/app-state.ts`)
Estados: `locked` → `verifying` → `loading` → `ready` → `entering` → `touring` (con `station` abierta) → `fallback2d` (alternativa).
Transiciones válidas en la tabla de runtime-modules.md. Entrar solo desde `ready`.

### AccessSession (`app/session-store.ts` y `access/access-gate.ts`)
- `granted: boolean` · `muted: boolean` · `presentedStations: string[]` (ids)
- Persistencia: `sessionStorage` con clave `museo-de-lua:v1`; si falla, memoria del módulo.
- No se guarda el texto de la clave.

### PlaybackState (`media/playback-coordinator.ts`)
- `activeStationId: string | null`
- `phase`: `idle` | `narrating` | `ready` | `playing` | `paused` | `error`
- `token: number` (incrementa en cada acción; callbacks con token antiguo se descartan)
- `positions: Map<stationId, number>` (solo memoria; EC-06)
- `errorMessage?: string`, `retryable: boolean`

Invariantes:
1. Como máximo un medio o una voz audible a la vez.
2. Pasar a `playing` solo después de que `play()` resuelva.
3. Cambiar de estación: `narrating` → cancelado; medio anterior pausado; posición guardada.
4. `muted = true` implica voz cancelada y medios con `muted` (volumen conservado).

### CameraState (`scene/camera-rig.ts`)
- `position: {x, y, z}`, `yaw`, `pitch` (límites ±35° por defecto)
- `approach?: { target: {x,y,z}, yaw, returnPose }` (durante aproximación; `returnPose` vuelve al cerrar)

### InputState (`controls/*`)
- `pointers: Map<pointerId, {role: "joystick"|"look"|"tap", startX, startY, moved}>`
- `keys: Set<string>`; `joystick: {x, y}` normalizado en [-1, 1]
- Se limpia en `blur`, `visibilitychange`, `pointercancel` y cambio de orientación.

### RunDiagnostics (opcional, solo en desarrollo)
- Tiempo de carga, FPS medidos, errores de medios y voz. No se envía a ningún servicio.

## Relaciones

- `Station.placement.wall` determina el muro de la escena; dos estaciones no pueden ocupar
  el mismo `wall` + `position` (validado).
- `PlaybackState.activeStationId` referencia `Station.id`. Un id desconocido se rechaza.
- `AccessSession.presentedStations` solo contiene ids de estaciones existentes.
- `Decoration` no se referencia desde `Station`; está aislada (FR-024).
