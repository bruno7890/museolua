# Guía de contenido

Cómo sustituir los marcadores de demostración por las obras reales sin tocar código.

## Estructura

```text
public/
├── config/site.json          # clave, voz, textos de bienvenida, navegación, tema
├── data/stations.json        # las diez estaciones
├── data/decorations.json     # alfombra y paneles
└── media/
    ├── branding/ornament.svg # emblema de la portada
    ├── images/               # una portada por estación (PNG/JPG/WebP)
    ├── decor/                # alfombra y paneles de pared
    ├── audio/                # una canción por estación de audio
    ├── video/                # un vídeo por estación de vídeo
    └── captions/             # subtítulos opcionales (.vtt)
```

## Paso 1 · Copiar los medios

1. Copia las portadas a `public/media/images/` con el nombre que usarás en el catálogo (`01.png`, `02.jpg`, …).
2. Copia las canciones a `public/media/audio/`.
3. Copia los vídeos a `public/media/video/`.
4. Si añades subtítulos, déjalos en `public/media/captions/` como `.vtt` y referéncialos desde la estación.

Recomendaciones para que la visita vaya fluida en móvil:

- **Portadas**: 1024×1024 o 1600×1200, JPG o WebP, por debajo de 400 kB cada una.
- **Canciones**: MP3 o M4A, 128–192 kbps. Para una canción completa, entre 3 y 6 MB.
- **Vídeos**: MP4 (H.264 + AAC), 720p o 1080p. **Un vídeo de 6 minutos puede ocupar 80 MB**: compruébalo con `npm run check:budget`.
- Nada se descarga hasta que la visitante lo pide, así que el peso no bloquea la entrada.

## Paso 2 · Editar los catálogos

`public/data/stations.json`:

```jsonc
{
  "id": "estacion-01",          // único; no lo cambies si ya hay enlaces guardados
  "order": 1,                   // orden en el catálogo 2D
  "enabled": true,              // false la oculta sin borrar el archivo
  "type": "audio",              // "audio" | "video"
  "title": "Título de la obra",
  "description": "Texto breve para el catálogo.",
  "credit": "Autoría · Fuente · Licencia",
  "placeholder": false,         // true = marcador de demostración
  "image": { "src": "media/images/01.png", "alt": "Descripción de la imagen", "width": 1024, "height": 1024 },
  "narration": {
    "mode": "browser",          // "browser" = voz del navegador | "text" = solo texto
    "text": "Lo que se lee en voz alta al llegar al cuadro.",
    "speechText": "Opcional: texto alternativo para la voz.",
    "policy": "first-visit"     // "first-visit" | "always"
  },
  "media": { "src": "media/audio/01.mp3", "mime": "audio/mpeg", "durationSeconds": 187 },
  "placement": { "wall": "left", "position": 200, "width": 35, "centerY": 0 }
}
```

**`placement` decide dónde aparece el cuadro en la sala.** `wall` admite `left`, `right`, `front` y `back`. `position` es la distancia al centro de la pared en unidades de la referencia; `width` el ancho del marco. Reparto actual: tres cuadros a la izquierda, tres a la derecha, dos al frente y dos al fondo.

`public/data/decorations.json` sigue el mismo patrón (`id`, `kind`, `src`, `placement`, `placeholder`). Tiene exactamente seis entradas: la alfombra de entrada (`kind: "floor-image"`, con `transform`) y cinco paneles de pared (`kind: "wall-image"`, con `placement`). Los paneles caen en los muros laterales y no pueden solaparse con un cuadro del mismo muro.

`public/config/site.json` ajusta la clave, la voz, los textos de bienvenida y los parámetros de navegación. `navigation.eyeHeight` está en `0` por coherencia con la escala de la referencia: súbelo a `1.6` si prefieres la altura en metros del encargo.

## Paso 3 · Validar

```bash
npm run validate:content
```

Modo demostración: admite `placeholder: true` y avisa de los marcadores.
Modo publicación: **falla** si queda algún `placeholder: true` o si algún archivo referenciado no existe en `public/`.

```bash
npm run validate:content -- --mode=publish
```

Ese es el comando que debe pasar antes de publicar.

## Paso 4 · Probar

```bash
npm run test:e2e
```

Las pruebas usan los catálogos de `public/`, así que si cambias títulos o textos, ajusta las expectativas de `tests/e2e/station.spec.ts` (busca `Canción de demostración 01`).

## Paso 5 · Publicar

Ver `docs/deployment.md`.

## Textos de voz

- El texto que se lee en voz alta sale de `narration.text`. Si quieres que suene distinto al texto en pantalla, usa `narration.speechText`.
- `narration.mode: "text"` desactiva la voz de esa estación: el texto sigue visible. Útil si una obra ya tiene su propia grabación.
- La voz la elige el navegador (`es`, con reserva `es-EC` y `es-419`). Si el dispositivo no tiene ninguna voz en español, el texto se muestra en pantalla y la visita continúa.
- `policy: "first-visit"` narra la introducción solo la primera vez en esa sesión; `"always"` la repite cada vez que se llega al cuadro.
