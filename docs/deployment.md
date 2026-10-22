# Despliegue en GitHub Pages

El sitio es estático: `npm run build` produce `dist/` y eso es todo lo que hay que servir.

## Decisiones que condicionan el despliegue

- **`base: "./"`** en `vite.config.ts`: las rutas del build son relativas, así que el mismo `dist/` funciona en `https://<usuario>.github.io/` y en `https://<usuario>.github.io/<repositorio>/` sin tocar nada. No hay que saber el nombre del repositorio al compilar.
- **CSP por `<meta>`**: GitHub Pages no permite fijar cabeceras de respuesta. La política está en `index.html` (ver `docs/security.md`).
- **Sin backend**: no hay cabeceras, ni Functions, ni variables de entorno en producción. La clave se comprueba en el navegador.
- **Sin CDN en tiempo de ejecución**: todo se sirve desde el mismo origen, de modo que la CSP puede ser estricta.

## Publicar desde Actions (recomendado)

1. En el repositorio, **Settings → Pages → Build and deployment → Source → GitHub Actions**.
2. Ejecuta el flujo **Publicar en GitHub Pages** (`.github/workflows/deploy.yml`). Está preparado para lanzarse a mano (`workflow_dispatch`), nunca automáticamente.
3. El flujo compila, sube `dist/` como artefacto de Pages y publica. La URL aparece en el resumen de la ejecución.

Permisos que usa el flujo: `contents: read` y `pages: write` con `id-token: write` (lo exige la acción oficial de Pages). Nada más.

## Publicar sin Actions

```bash
npm ci
npm run build
```

Sube el contenido de `dist/` con el flujo *Deploy from a branch* de Pages, con `dist/` como carpeta de publicación.

> Si publicas desde una rama distinta de la que usa Actions, recuerda: `dist/` no está versionado (está en `.gitignore`). Compila en local y sube el resultado, o deja que Pages use la rama `gh-pages`.

## Comprobar el resultado

```bash
npm run check:budget           # peso del build y de los medios
npm run validate:content -- --mode=publish
npm run test:e2e               # sobre el build local
npm run test:e2e:subdir        # el mismo recorrido servido en /museo-de-lua/
```

`test:e2e:subdir` es la comprobación que importa para Pages: sirve `dist/` en un subdirectorio y repite el recorrido completo, que es exactamente lo que se encontrará en un proyecto de GitHub Pages.

## Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| Página en blanco | El script se sirve desde una ruta absoluta | No debería ocurrir: `base: "./"`. Comprueba que `dist/index.html` referencia `./assets/…` |
| `Failed to load resource: net::ERR_FAILED` | CSP bloqueando algo | Revisa la consola; `media-src 'self' blob:` y `img-src 'self' data: blob:` cubren lo necesario |
| La voz no se oye | El dispositivo no tiene voz en español | Es el comportamiento previsto: el texto queda en pantalla. Ver `docs/qa.md` |
| El vídeo no arranca | Formato no soportado | Usa MP4 con H.264 + AAC |
| La escena 3D no aparece | WebGL 2 no disponible | La visita continúa en el catálogo 2D, con las mismas estaciones |

## Límites de GitHub Pages reconfirmados

- **1 GB de almacenamiento** por sitio. Con vídeos de 6 minutos por estación, diez estaciones quedan por debajo del límite; conviene comprobarlo con `npm run check:budget` antes de subir.
- **1 GB de ancho de banda** al mes. Reproducir los vídeos repetidamente desde un móvil puede consumirlo con facilidad.
- **Sin cabeceras HTTP personalizadas**: de ahí la CSP por `<meta>`.
- **Sin backend**: la clave nunca sale del navegador.

Si estos límites se quedan cortos, la alternativa es servir los medios desde otro origen y ampliar `media-src` en la CSP; eso rompería el modelo de «todo del mismo origen» y hay que rehacerlo con cuidado.
