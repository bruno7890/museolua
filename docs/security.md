# Seguridad

Este sitio es una aplicación estática sin servidor. Todo lo que hay en `public/` se publica tal cual.

## La clave no protege nada

La clave de entrada es una **barrera informal**, no un control de acceso:

- El verificador (SHA-256 con sal) viaja dentro del bundle del navegador. Cualquiera que abra las herramientas de desarrollo puede leerlo.
- Los archivos de `public/media/` son públicos: se descargan con una URL directa, sin clave y sin sesión.
- El único propósito es evitar que alguien que abre el enlace entre sin querer y gaste ancho de banda con los vídeos.

Está escrito en la propia pantalla de entrada: *"La clave es una barrera informal y no protege los archivos del sitio."* (FR-035)

### Dónde se comprueba

El verificador se calcula con SHA-256. `crypto.subtle` solo existe en contextos seguros
(HTTPS o `localhost`), así que en el resto de orígenes se usa un respaldo propio en
TypeScript (`src/access/sha256.ts`) que produce exactamente el mismo resultado. Así la
clave se puede comprobar también al revisar el sitio desde el móvil por la IP de la red
local, sin exigir HTTPS. La comparación con el verificador es en tiempo constante.

### Cambiar la clave

```bash
npm run hash:key -- --key "mi-clave-secreta" --salt "museo-de-lua-v1"
```

Devuelve la sal y el verificador para `public/config/site.json`. La sal (`access.salt`) se puede mantener; lo que cambia es `access.verifier`.

La clave de demostración actual es `lua`. **Cámbiala antes de publicar.**

### Sesión

`sessionStorage` guarda el acceso concedido, el estado de silencio y las estaciones ya presentadas. Se borra al cerrar la pestaña. No se envía nada a ningún servidor.

## Content Security Policy

La CSP está en el `index.html` como `<meta http-equiv>` porque GitHub Pages no permite fijar cabeceras de respuesta:

```
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'
```

Consecuencias asumidas:

| Regla | Motivo |
|---|---|
| `script-src 'self'` | No hay scripts inline ni CDN. Three.js se empaqueta en el bundle. |
| `style-src 'self' 'unsafe-inline'` | Three.js y el propio CSS fijan estilos en línea (`.style` y `setAttribute`). |
| `connect-src 'self'` | Solo peticiones a los catálogos JSON del propio sitio. |
| `form-action 'none'` | Impide que el formulario de clave navegue a otro sitio si el script no llegara a cargarse. |
| `object-src 'none'` | No hay plugins ni objetos incrustados. |

`form-action 'none'` es una decisión de seguridad deliberada: si el módulo JavaScript no llegara a ejecutarse, el formulario no puede enviar la clave a ningún sitio.

## Superficie de ataque revisada

- **Sin `innerHTML` con datos del catálogo.** Todo el texto de estaciones y decoraciones se escribe con `textContent` (`src/ui/`). El validador rechaza caracteres de control.
- **Sin `eval`, sin `new Function`, sin `setTimeout` con cadena.** No hay evaluación de código dinámico.
- **Sin permisos de cámara, micrófono, geolocalización ni notificaciones.** No se pide ningún permiso del navegador.
- **Sin `localStorage` para datos sensibles.** Solo `sessionStorage` para preferencias de la visita.
- **Sin peticiones a terceros.** No hay CDN, ni analítica, ni fuentes remotas.
- **Sin claves ni secretos en el frontend**, por diseño: no hay backend.
- **Vídeo y audio bajo demanda.** No se descargan hasta que la visitante los pide (FR-019).

## Dependencias

- **three `0.186.1`** — MIT.
- **Vite `8.3.5`, TypeScript `5.9.3`, Vitest `5.0.5`, Playwright `1.64.1`** — solo desarrollo.

Las versiones están fijadas de forma exacta en `package.json` y el `package-lock.json` se versiona. Para revisar:

```bash
npm audit
npm ci
```

El build es reproducible: `npm ci && npm run build` produce el mismo `dist/`.

## Antes de publicar

- [ ] La clave de demostración `lua` está cambiada.
- [ ] `npm run validate:content -- --mode=publish` pasa (sin marcadores `placeholder: true`).
- [ ] `npm run check:budget` pasa.
- [ ] Los medios tienen su procedencia documentada en `NOTICE.md` y `credit` en cada estación.
- [ ] `npm audit` no reporta vulnerabilidades altas.

## Procedencia

La geometría y el enfoque de la sala están adaptados de
[`lrusso/3DArtMuseum`](https://github.com/lrusso/3DArtMuseum) (GPL-3.0). No se reutiliza ningún archivo de imagen, audio o vídeo de esa obra: los medios de demostración se generan localmente con `npm run media:demo`. Ver `NOTICE.md`.
