# Diseño

## Paleta

Viene del encargo y está en `public/config/site.json` (`theme`).

| Color | Hex | Uso |
|---|---|---|
| Morado claro | `#C7B5E8` | Fondo de la escena, bordes de las tarjetas del catálogo |
| Salmón | `#F2AA9B` | Acento: borde inferior de la barra, marcos, foco de los avisos |
| Lavanda | `#F8F5FC` | Fondo de la interfaz, texto sobre violeta |
| Violeta | `#654397` | Botón principal y joystick (texto blanco encima: > 4.5:1) |
| Ciruela | `#30263D` | Texto principal y bordes de botones |
| Gris cálido | `#D5CFD5` | Fondo de imágenes y vídeos antes de cargar |

Regla general: texto oscuro sobre pastel; el único botón con fondo saturado (violeta) lleva texto blanco.

## Tipografía y ritmo

- `system-ui` (sin fuentes remotas: la CSP lo prohíbe y no hace falta).
- 16 px de base, `line-height: 1.45`.
- Títulos de diálogo 1.4 rem, título de la barra 1.1 rem.
- Espaciado en múltiplos de 8 px; radios de 14 px (tarjetas) y 999 px (botones tipo cápsula).

## La sala

Geometría y cámara adaptadas de [`lrusso/3DArtMuseum`](https://github.com/lrusso/3DArtMuseum) (GPL-3.0). La sala es un recinto cerrado con muros, suelo y techo; el visitante se mueve con las colisiones resueltas como un círculo contra los muros.

- **FOV 65** (D-06): el de la referencia, 37.8, resulta demasiado estrecho en móvil vertical.
- **Altura de ojos 0** por defecto (D-07): en las unidades de la sala, la referencia no define metros; 1.6 m dejaba los cuadros fuera de encuadre. Es configurable en `site.json` (`navigation.eyeHeight`).
- **Colisión**: radio 12 unidades.
- **Aproximación**: amortiguación temporal `1 - e^(-k·dt)` con `k = 6` (D-08), así la llegada al cuadro no depende de los FPS.

### Distribución de los cuadros (D-09, D-10)

Diez estaciones: **3 a la izquierda, 3 a la derecha, 2 al frente y 2 al fondo**. Los dos vídeos están separados (estaciones 4 y 9) para que no queden juntos en la misma pared.

Cada estación declara su sitio en `placement`: `wall` (`left`, `right`, `front`, `back`), `position` (distancia al centro de la pared), `width` (ancho del marco) y `centerY`.

## Interfaz

### Barra superior

Cuatro controles y un selector de calidad: **Escuchar introducción**, **Silenciar**, **Catálogo**, **Volver al inicio** y **Calidad** (Estándar / Reducida). En pantallas estrechas el título ocupa su propia línea y los botones se reparten debajo.

El aviso de orientación vive *dentro* de la barra: así nunca puede tapar un botón, cosa que sí ocurría con una ventana flotante.

### Joystick y mirada

- **Joystick** abajo a la izquierda (116 px en móvil). Mueve la sala; no se mueve al tocar la interfaz.
- **Arrastrar** en la escena gira la cámara (yaw) y la inclinación (pitch, ±35°).
- **Tocar** un cuadro lo abre.
- El zoom queda fuera del gesto de arrastre para que el dedo no pelee con la cámara.

### Panel de estación

Diálogo modal (`role="dialog"`, `aria-modal="true"`) con el foco atrapado dentro y `Escape` para cerrar. Siempre incluye:

- Título, imagen de portada (o póster del vídeo), estado de reproducción (`aria-live`), texto de la introducción y los créditos.
- Botones: **Reproducir/Pausar**, **Volver a escuchar**, **Silenciar**, **Ampliar** (solo vídeo), **Cerrar**.
- El texto está siempre visible: la voz es un extra, nunca la única vía de información.

### Catálogo 2D

Alternativa completa para quien no tiene WebGL 2 o no quiere la vista 3D: las mismas diez estaciones en una lista, con la misma apertura de panel y las mismas reglas de reproducción.

## Movimiento

- Entrada: fundido de 1000 ms; con `prefers-reduced-motion`, 150 ms.
- El emblema de la portada tiene una pulsación suave de 2,4 s; se desactiva con movimiento reducido.
- Nada se mueve solo en la sala: no hay cámara automática ni transiciones que roben el control.

## Color de la interfaz en modo catálogo

El catálogo usa el fondo lavanda y tarjetas blancas con borde morado claro, coherente con la barra. La lista se limita a 720 px de ancho para no forzar la lectura en pantallas grandes.

## Revisión visual pendiente

- Las coordenadas de los cuadros (D-10) se revisaron en el navegador con capturas; falta una revisión con las obras definitivas, que pueden tener proporciones distintas.
- Contraste real medido con herramienta: pendiente (ver `docs/qa.md`).
