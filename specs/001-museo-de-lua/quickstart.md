# Quickstart: Museo de Lua

Guía para validar la feature de extremo a extremo. Los comandos son los previstos en
`package.json` cuando se implemente la Fase 1; no deben darse por ejecutados hasta que
se hayan corrido en el equipo.

## Requisitos

- Node 24 (o ≥ 22.18 para ejecutar `.ts` de herramientas).
- npm 11+.
- ffmpeg (solo para regenerar el vídeo de demostración).
- Chromium de Playwright (`npx playwright install chromium`).

## Instalación reproducible

```powershell
npm ci
```

## Desarrollo

```powershell
npm run dev
```

Abrir `http://localhost:5173/`. Clave de demostración: la indicada en `docs/security.md`.

## Validación de contenido

```powershell
npm run validate:content
```

Debe terminar sin errores en modo demo. Para simular publicación (rechaza placeholders):

```powershell
npm run validate:content -- --mode=publish
```

Se espera que falle mientras existan marcadores; el fallo muestra cada archivo y ruta.

## Pruebas

```powershell
npm run typecheck
npm test
npm run build
npm run test:e2e
```

## Escenarios manuales

| # | Escenario | Resultado esperado |
|---|---|---|
| 1 | Abrir sin clave | Sin sonido; pantalla de clave |
| 2 | Clave incorrecta | Error accesible; sin sonido |
| 3 | Clave correcta, Entrar dos veces | Una entrada; una bienvenida |
| 4 | Recorrido con WASD y arrastre | Sin atravesar muros |
| 5 | Tocar un cuadro | Aproximación y panel con texto |
| 6 | Silenciar durante narración | Voz cancelada; texto visible; Play disponible |
| 7 | Vídeo: play, buscar, ampliar, volver | Un solo reproductor; posición conservada |
| 8 | Abrir catálogo 2D | Mismas diez estaciones |
| 9 | Abrir la URL con subdirectorio (`npm run preview -- --base=/museo-de-lua/`) | Todos los recursos cargan |

## Pruebas en Android (manuales, registrar en docs/qa.md)

Registrar modelo, versión de Android, versión de Chrome, orientación y resultados de:
voz en español, joystick con giro simultáneo, vídeo de demostración a pantalla completa,
rendimiento de 60 s, pérdida y recuperación de la pestaña.

## Publicación

Solo con autorización explícita del propietario. Ver `docs/deployment.md` (se crea en la Fase 7).
