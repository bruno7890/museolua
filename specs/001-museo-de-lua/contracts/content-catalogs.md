# Contrato: catálogos JSON

Todos los catálogos viven en `public/` y se cargan con rutas relativas (`config/site.json`,
`data/stations.json`, `data/decorations.json`). El validador en `scripts/validate-content.ts`
y el cargador en runtime usan las mismas reglas (`src/content/validate.ts`).

## Reglas generales

- `schemaVersion` debe ser `1` en los tres archivos.
- Números finitos; tamaños y tiempos > 0; posiciones dentro de los límites de la sala.
- Rutas: relativas, sin `..`, sin `://`, sin `//`, sin barra inicial; deben existir en `public/`.
- Textos: se muestran como texto plano (`textContent`). Ningún campo se interpreta como HTML.
- IDs únicos dentro de cada catálogo.
- Errores: lista con `{ file, path, code, message }`. El modo demo admite `placeholder: true`;
  el modo publicación rechaza cualquier `placeholder: true` **o** ruta inexistente.

## `config/site.json`

```ts
interface SiteConfig {
  schemaVersion: 1;
  title: string;                 // "Museo de Lua"
  ornament: { src: string; alt: string; placeholder: boolean }; // SVG
  theme: { purple: string; salmon: string; lavender: string; plum: string; grayWarm: string };
  entry: { label: string; transitionMs: number; reducedTransitionMs: number };
  access: { algorithm: "SHA-256"; salt: string; verifier: string; informalNotice: string };
  speech: {
    preferredVoiceName?: string;
    lang: "es";
    fallbackLangs: string[];     // p. ej. ["es-EC", "es-419"]
    rate: number; pitch: number; volume: number;   // 0.95 / 1 / 0.7 por defecto
    startTimeoutMs: number;      // 4000
    maxUtteranceMs: number;      // 60000
    baseEndTimeoutMs: number;    // 2000
    msPerCharacter: number;      // 80
  };
  welcome: { touchText: string; desktopText: string; speechTouch?: string; speechDesktop?: string };
  navigation: {
    walkSpeed: number; lookSensitivity: number; approachRate: number;
    approachDistance: number; eyeHeight: number; fov: number;
    collisionRadius: number; pitchLimitDegrees: number;
  };
  quality: { defaultProfile: "standard" | "reduced" };
}
```

Validaciones: `theme.*` son colores hexadecimales `#RRGGBB`; `rate` en [0.5, 2];
`pitch` en [0, 2]; `volume` en [0, 1]; `fov` en [30, 90]; `pitchLimitDegrees` en [0, 60];
`speech.lang === "es"`; `fallbackLangs` solo códigos `es-*`; `access.verifier` es hex de 64 caracteres.

## `data/stations.json`

```ts
interface StationCatalog { schemaVersion: 1; stations: Station[] }

interface Station {
  id: string;                    // "estacion-01"…"estacion-10"
  order: number;                 // 1..10, único
  enabled: boolean;
  type: "audio" | "video";
  title: string;
  description: string;
  credit: string;
  placeholder: boolean;
  image: { src: string; alt: string; width: number; height: number };
  narration: { mode: "browser"; text: string; speechText?: string; policy: "first-visit" };
  media: { src: string; mime: "audio/mpeg" | "audio/wav" | "video/mp4"; durationSeconds?: number; poster?: string };
  captions?: { src: string; lang: string };       // FR-040: opcional, solo vídeo
  placement: { wall: "left" | "right" | "front" | "back"; position: number; width: number; centerY: number };
}
```

Validaciones:
- Exactamente **10** estaciones habilitadas en el modo publicación; en demo se admiten
  deshabilitadas, pero el total debe ser 10 registros.
- Distribución: 3 con `wall = "left"`, 3 con `"right"`, 2 con `"front"`, 2 con `"back"`. Los dos
  `type: "video"` no comparten muro (D-09).
- `type: "video"` → `media.mime = "video/mp4"`; `captions` solo si `type = "video"`.
- `narration.text.length` ≤ 600.
- `image.width`/`height` > 0; la proporción de la imagen determina la altura del marco
  (`height_frame = width_frame × height / width`).
- Ningún par `(wall, position)` repetido; `|position_a − position_b| ≥ width_a/2 + width_b/2 + 8`
  en el mismo muro (margen de separación).

## `data/decorations.json`

```ts
interface DecorationCatalog { schemaVersion: 1; decorations: Decoration[] }

interface Decoration {
  id: "decor-rug-entry" | "decor-gon-left-01" | "decor-gon-left-02" | "decor-gon-left-03" | "decor-gon-right-01" | "decor-gon-right-02";
  enabled: boolean;
  kind: "floor-image" | "wall-image";
  image: { src: string; alt: string; credit: string; placeholder: boolean };
  placement?: { wall: "left" | "right"; position: number; width: number; centerY: number };  // wall-image
  transform?: { position: [number, number, number]; rotationDegrees: [number, number, number]; size: [number, number] }; // floor-image
  fit: "contain" | "cover";
  interactive: false;
}
```

Validaciones: exactamente 6 decoraciones (1 alfombra + 5 paneles); los paneles caen en un
muro lateral sin solaparse con una estación del mismo muro (margen 8 unidades); `interactive`
debe ser `false`.

## Ejemplo válido mínimo (modo demo)

```json
{
  "schemaVersion": 1,
  "stations": [
    {
      "id": "estacion-01",
      "order": 1,
      "enabled": true,
      "type": "audio",
      "title": "Canción de demostración",
      "description": "Marcador de prueba para revisar el flujo.",
      "credit": "Generado localmente para pruebas",
      "placeholder": true,
      "image": { "src": "media/images/01.png", "alt": "Marcador de portada", "width": 1024, "height": 1024 },
      "narration": { "mode": "browser", "text": "Esta es una introducción de demostración.", "policy": "first-visit" },
      "media": { "src": "media/audio/01.wav", "mime": "audio/wav", "durationSeconds": 6 },
      "placement": { "wall": "left", "position": 200, "width": 35, "centerY": 0 }
    }
  ]
}
```
