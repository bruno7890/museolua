# Avisos de Attribution

Museo de Lua
Copyright (C) 2026 los autores del proyecto

Este programa es software libre: puedes redistribuirlo y/o modificarlo bajo los
términos de la Licencia Pública General de GNU, versión 3 o posterior.

Este programa se distribuye SIN GARANTÍA, incluso sin garantía implícita de
COMERCIALIZABILIDAD o IDONEIDAD PARA UN PROPÓSITO PARTICULAR. Consulta la
Licencia Pública General de GNU para más detalles.

---

## Obra de referencia: lrusso/3DArtMuseum

La estructura de la sala, las coordenadas de los cuadros, el comportamiento de
la cámara y el enfoque general de la visita están adaptados de:

- **lrusso/3DArtMuseum** — <https://github.com/lrusso/3DArtMuseum>
- Licencia: GNU General Public License v3.0 o posterior
- Commit consultado: `7ea04e3cbc2ccc3cb8a4d8ff1167f5f9bae9e242`

El código original de esa obra usa Three.js r88, con API que ya no existe en las
versiones actuales; por eso su motor se reescribió sobre Three.js moderno en
lugar de reutilizarse. **No se ha copiado ningún archivo de imagen, audio,
vídeo, fuente o texto de esa obra**: los medios de demostración de este
repositorio se generan localmente con `npm run media:demo`.

La adaptación se mantiene bajo la misma licencia, GPL-3.0-or-later.

## Three.js

- **three** 0.186.1 — <https://threejs.org>
- Licencia: MIT — Copyright (c) 2010-2024 three.js authors
- Distribuido como dependencia de npm; el aviso original se incluye en el
  paquete dentro de `node_modules/three/LICENSE`.

## Fuentes de texto

No se incluyen fuentes tipográficas: la interfaz usa la pila de fuentes del
sistema (`system-ui`, `-apple-system`, `Segoe UI`, `Roboto`).

## Medios de demostración

Los archivos de `public/media/` marcados como `placeholder: true` son
generados localmente con `scripts/generate-demo-media.ts` y no se distribuyen
como contenido final.

El emblema de `public/media/branding/ornament.svg` es un marcador geométrico
original de este repositorio.

## Medios originales de la propietaria

La propietaria del museo confirma que son de su autoría y autoriza su
publicación y distribución en este sitio:

- Audio de las estaciones 05, 06, 07, 08 y 10 (`public/media/audio/`).
- Vídeos de las estaciones 04 y 09 (`public/media/video/`).
- Portadas `video4.jpg` y `video9.jpg` (`public/media/images/`).

El campo `credit` de esas estaciones en `public/data/stations.json` registra
esta procedencia. Los demás medios de demostración no se presentan como obras
finales.
