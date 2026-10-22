# Museo de Lua

## Planteamiento, especificaciones y plan de implementación

**Versión 3 consolidada · 21 de octubre de 2026 · Encargo de Bruno Arroyo**

Estado: documentación lista para implementar. Todavía no se ha construido ni publicado el museo. Esta versión sustituye las decisiones anteriores sobre narraciones MP3, botón Omitir y paleta de colores. Las narraciones serán texto leído por el navegador; las canciones y videos sí serán archivos aportados por Bruno.

## 1. Objetivo

Adaptar el repositorio público [lrusso/3DArtMuseum](https://github.com/lrusso/3DArtMuseum) para crear un museo personal dedicado a Lua, con estética de amistad, navegación en primera persona, diez estaciones multimedia y decoración de Hunter x Hunter centrada en Gon Freecss.

Conservar el mapa de la sala y el acercamiento a cuadros que Bruno probó. Mejorar controles, interfaz y ambientación. Priorizar Chrome en Android y mantener compatibilidad con computador y tablet. Publicar como sitio estático en GitHub Pages, sin backend ni base de datos.

### Decisiones confirmadas

| Elemento | Decisión |
|---|---|
| Nombre | Museo de Lua, con adornos de la referencia: luna, estrella, líneas y motivos de los extremos |
| Colores | Morado claro y salmón, con neutros y texto oscuro |
| Tono | Personal, bonito y amistoso; sin mensajes de pareja ni estética cursi |
| Contenido | Ocho cuadros con imagen y canción; dos cuadros con portada y video |
| Videos | Hasta seis minutos; carga bajo demanda |
| Narraciones | Web Speech API, a partir de textos del catálogo; sin audios de voz obligatorios |
| Entrada | Clave informal, botón Entrar llamativo y transición suave hacia el museo |
| Repetición | Escuchar introducción global y Volver a escuchar en cada estación |
| Omitir | No incluir botón Omitir |
| Silencio | Control global para voz, canciones y videos |
| Administración | Catálogos externos editados fuera del sitio |
| Decoración | Alfombra de entrada y paneles laterales de Gon, independientes de las diez estaciones |
| Publicación | GitHub Pages; clave como barrera casual, no protección de archivos |

## 2. Base técnica verificada

En la revisión anterior de esta conversación se inspeccionó el código del repositorio mediante GitHub, rama master. No se ejecutó ni se midió rendimiento. La valoración favorable de la navegación móvil procede de la prueba relatada por Bruno.

| Archivo | Hallazgo | Trabajo necesario |
|---|---|---|
| 3DArtMuseum.htm | Veinte cuadros creados con addToLeft/Front/Right/Back; imagen, MP3 y texto por cuadro | Pasar a diez entradas de catálogo y sustituir contenidos |
| 3DArtMuseum.js | Three.js incrustado, REVISION=88dev, más lógica propia | Separar biblioteca y aplicación; actualizar APIs gradualmente |
| 3DArtMuseum.js | Acercamiento interpolado al cuadro; giro por arrastre | Conservar modo sencillo y añadir recorrido libre con límites |
| 3DArtMuseum.js | Bienvenida y narración mediante new Audio y archivos MP3 | Sustituir la voz por SpeechSynthesis, conservando audio HTML para canciones |
| 3DArtMuseumPleaseRotate.js | Aviso horizontal para móviles | Adaptar aviso y permitir continuar en vertical |
| 3DArtMuseum.css | Interfaz básica, volumen y textos inferiores | Rediseñar portada, reproductores y controles táctiles |
| license.txt | GPL versión 3 | Preservar avisos, licencia, fuente correspondiente y registrar modificaciones |

El repositorio original no incluye un sistema completo de caminar libremente con joystick. Tampoco proporciona el catálogo de decoración ni el flujo de narración seguido de canción/video. Son trabajos de implementación.

Antes de modificarlo, registrar el commit base, conservar una copia de referencia y comprobar licencias de dependencias y recursos. Los medios personales y las ilustraciones no se vuelven libres por estar junto a código GPL. Trabajar en un repositorio propio, sin modificar el del autor.

## 3. Identidad visual

### Emblema

Usar el texto real «Museo de Lua» acompañado de adornos SVG inspirados en la imagen enviada. SVG evita depender de la representación de emojis en cada dispositivo. Mantener una etiqueta accesible y ocultar adornos puramente visuales a lectores de pantalla. Los motivos de los extremos se limitan al emblema; no decorar toda la sala con corazones.

### Paleta de implementación

| Uso | Color | Aplicación |
|---|---|---|
| Morado claro | #C7B5E8 | Paneles, detalles de portada y sala |
| Salmón suave | #F2AA9B | Acentos, bordes y elementos destacados |
| Blanco lavanda | #F8F5FC | Fondos e interfaz clara |
| Violeta profundo | #654397 | Botón principal y estados activos con texto claro |
| Ciruela oscuro | #30263D | Texto y marcos |
| Gris cálido | #D5CFD5 | Piso y superficies neutras |

Proporción orientativa: 60% neutros, 25% morado y 15% salmón. El verde puede aparecer en las propias imágenes de Gon, sin convertirse en otro color principal. Usar texto oscuro sobre los pasteles. Comprobar contraste de 4,5:1 para texto normal y 3:1 para texto grande y controles relevantes. No usar solo color para comunicar selección.

Iluminación suave, sin neón intenso, destellos ni filtros que alteren fotografías. Materiales mates y pocos efectos dinámicos. El acabado debe sentirse personal y alegre, no romántico ni infantil.

## 4. Entrada y transición

1. Abrir el enlace muestra la portada y la clave; no inicia sonido.
2. Al aceptar la clave, preparar escena, catálogos y voces disponibles. Mostrar «Preparando tu museo…» si todavía falta cargar. No descargar canciones o videos completos.
3. En móvil, recomendar horizontal; la clave funciona en vertical y puede continuarse en vertical con interfaz adaptada.
4. Cuando la escena pueda mostrarse, habilitar un botón grande «Entrar al museo», con acentos morado/salmón y un brillo suave.
5. En el manejador directo del clic/toque, desactivar nuevas pulsaciones e iniciar la bienvenida mediante speechSynthesis.speak(). No posponer la solicitud de voz hasta el final de una animación o carga asíncrona.
6. Desvanecer la portada y revelar la escena en 0,8–1,2 segundos; propuesta inicial: 1 segundo. La voz puede acompañar la transición. No esperar a que termine para mostrar el museo.
7. Retirar la portada del foco y de la interacción. Mostrar controles permanentes «Escuchar introducción», «Silenciar» y ayuda.

El botón puede aparecer en unos 300–400 ms y tener una pulsación muy tenue mientras espera. Una vez pulsado, detener animaciones decorativas. Si prefers-reduced-motion está activo, eliminar pulsación y movimiento de cámara decorativo, reduciendo la transición a una aparición breve de unos 150 ms.

Si la voz falla, el museo aparece igualmente y muestra texto y opción para escuchar de nuevo. No esperar indefinidamente la llegada de voces. Si falla 3D, ofrecer la lista accesible de contenidos. Un segundo toque no debe iniciar otra transición ni duplicar la voz.

## 5. Bienvenida y narraciones

### Motor de voz

Usar Web Speech API: SpeechSynthesis, SpeechSynthesisUtterance, getVoices y voiceschanged. No se requiere una clave de API ni comprar un servicio de voz para la aplicación. La selección, naturalidad, acento y disponibilidad dependen del navegador y del dispositivo; no prometer una misma voz en todos los teléfonos ni funcionamiento sin conexión. Algunas voces pueden depender de servicios del sistema.

Consultar voces al iniciar y actualizar la selección cuando llegue voiceschanged, sin reiniciar una narración en curso. Preferir una voz española disponible, primero la preferencia configurada si existe, luego es-EC o es-419, y después cualquier voz es. No seleccionar una voz inglesa para leer español. Si no se obtiene una voz apropiada, probar el idioma es mediante el motor predeterminado; si no se puede reproducir, continuar en modo texto.

Parámetros iniciales propuestos: rate=0.95, pitch=1 y volume=0.7. Ajustarlos al escuchar en Android. Los guiones serán cortos, naturales y con tono de amistad. Revisar pronunciación de Lua y Gon Freecss. Puede existir speechText separado de text para ayudar a la pronunciación sin alterar el texto visible.

La voz del navegador no crea ni exporta un archivo MP3. Un modo opcional de narración pregrabada podría añadirse después, pero no es requisito de esta versión.

### Bienvenida

Preparar dos textos: instrucciones táctiles y de escritorio. Duración deseada de 15–25 segundos, variable según voz. Desde que se revela la sala, permitir mirar y recorrer mientras suena la bienvenida.

Si la visitante selecciona un cuadro durante la bienvenida, cancelarla y pasar a la introducción de ese cuadro. «Escuchar introducción» pausa la canción/video actual, cancela cualquier voz anterior y repite la bienvenida. No reanudar el contenido automáticamente al terminar.

### Introducción de cada cuadro

Duración deseada de 5–12 segundos. Se reproduce en la primera selección de esa estación durante la sesión, tras el acercamiento, si el navegador lo permite. Como el acercamiento puede terminar después del gesto inicial, capturar restricciones y ofrecer «Escuchar introducción» mediante un toque explícito cuando haga falta. No dejar bloqueados los controles si la síntesis falla o no inicia.

Al terminar, habilitar reproducir canción/video, sin inicio automático. Al regresar a un cuadro cuya introducción ya se presentó, habilitar el contenido directamente. «Volver a escuchar» pausa el contenido y reinicia la introducción desde el principio. Si se abandona una introducción antes de terminar, se puede ofrecer de nuevo en la siguiente selección; si se interrumpió por silencio global, se considera presentada mediante texto.

No habrá botón Omitir. Cambiar de estación, silenciar o abandonar el reproductor siguen siendo acciones disponibles. No introducir esperas artificiales para simular la duración de una voz inexistente.

### Recuperación y coordinación

SpeechSynthesis no devuelve la misma promesa de reproducción que HTMLMediaElement.play(). Manejar onstart, onend y onerror de la utterance; invalidar callbacks antiguos mediante un ID de operación. Un temporizador de arranque limitado y un watchdog proporcional al texto evitan bloqueos si el motor no emite eventos; ajustar umbrales en Android. Ante fallo, cancelar, mostrar texto y habilitar contenido.

Al cambiar de estación, repetir o salir, cancelar la cola de voz anterior. No acumular diez introducciones en la cola. Al ocultar la pestaña, cancelar la voz y pausar canciones/videos; al volver, ofrecer repetir sin reanudar automáticamente.

## 6. Silencio global y controles

| Control | Función |
|---|---|
| Entrar al museo | Iniciar bienvenida y revelar la sala; desaparece después |
| Escuchar introducción | Repetir bienvenida/instrucciones desde el museo |
| Volver a escuchar | Repetir introducción del cuadro seleccionado |
| Silenciar / Activar sonido | Control global de todos los sonidos |
| Reproducir / Pausar | Control de canción o video |
| Ampliar | Abrir vista grande y solicitar pantalla completa compatible |
| Cerrar / Volver al museo | Pausar contenido y recuperar recorrido |
| Volver al inicio | Recuperar punto de entrada sin reproducir bienvenida automáticamente |

Silenciar canción/video: establecer muted=true sin alterar el volumen elegido; puede continuar visualmente. Al activar sonido, retornar desde el instante actual; si estaba pausado, permanece pausado.

Silenciar narración: cancelar SpeechSynthesis, mostrar texto y habilitar contenido. No basta con cambiar muted de elementos HTML, porque SpeechSynthesis no es uno de ellos. Mientras esté silenciado, las nuevas estaciones muestran texto y contenido disponible sin iniciar voz. Repetir estando silenciado muestra texto y una acción explícita para activar sonido y escuchar; nunca retirar el silencio por sorpresa.

Recordar el silencio durante la sesión. No modificar volumen del sistema Android. La narración usa repetir/cancelar por acciones del flujo; no depender de pause/resume de síntesis como requisito principal. Los reproductores de canciones y videos sí tendrán pausa/reanudación y progreso.

## 7. Diez estaciones multimedia

Ocho estaciones: imagen fija, título, texto de introducción y canción. Dos estaciones: portada, título, introducción y video. La distribución inicial conserva el mapa: tres piezas en cada lateral, dos al fondo y dos atrás. Validar posiciones y separar los videos. Las coordenadas finales se fijan al visualizar la sala.

Estados: reposo → acercamiento → narración → listo → reproduciendo/pausado → regreso. Error o silencio permiten pasar de narración a listo con texto disponible.

Para video, usar un reproductor HTML superpuesto como solución inicial: botones legibles, progreso, volumen, playsinline y proporción original. La cámara conserva su posición detrás. En cierre, pausar y regresar al mismo punto. Pantalla completa nativa solo desde un gesto y donde esté soportada; mantener siempre ampliación dentro de la página. Reproducción sobre la pared mediante VideoTexture queda como mejora opcional después de validar Android.

Un único controlador coordina voz y medios: nunca suenan a la vez bienvenida, introducción, canción o video. No habrá música ambiental inicial. Conservar posición de reproducción en memoria durante la visita; no reanudar sin solicitud de la visitante.

## 8. Decoración independiente

Preparar una alfombra de entrada y cuatro paneles laterales de Gon Freecss / Hunter x Hunter. No cuentan entre las diez estaciones, no tienen narración ni controles y no participan en la selección de contenido.

| ID | Ubicación | Recurso previsto |
|---|---|---|
| decor-rug-entry | Piso de entrada | Imagen de alfombra con morado, salmón y motivos personales |
| decor-gon-left-01 | Lateral izquierdo | Imagen de Gon |
| decor-gon-left-02 | Lateral izquierdo | Imagen de Gon / Hunter x Hunter |
| decor-gon-right-01 | Lateral derecho | Imagen de Gon |
| decor-gon-right-02 | Lateral derecho | Imagen de Gon / Hunter x Hunter |

Ubicar paneles en espacios libres, sin tapar cuadros, títulos ni puntos de aproximación. La alfombra es una superficie plana sin escalón ni colisión. Evitar parpadeo entre piso/alfombra y pared/panel mediante separación mínima o polygonOffset.

Durante el prototipo usar placeholders locales identificados. Si falta una imagen decorativa, mostrar textura neutra u ocultarla sin romper la escena. En la publicación final sustituir u ocultar placeholders; no presentarlos como ilustraciones terminadas. Guardar procedencia de recursos externos. La generación de imágenes definitivas no forma parte de esta entrega documental.

## 9. Catálogos externos

Bruno edita archivos fuera de la web. Subir medios y publicar cambios actualiza el museo. No hay panel administrativo dentro de la visita. Los catálogos describen y referencian archivos: no almacenan canciones o videos dentro del JSON.

| Archivo bajo public/ | Contenido |
|---|---|
| config/site.json | Nombre, colores, textos de bienvenida, ajustes de voz, entrada y clave informal |
| data/stations.json | Diez estaciones, rutas, textos y posiciones |
| data/decorations.json | Alfombra y decoración lateral |

### Configuración ilustrativa

```json
{
  "schemaVersion": 1,
  "title": "Museo de Lua",
  "theme": { "purple": "#C7B5E8", "salmon": "#F2AA9B", "text": "#30263D" },
  "entry": { "label": "Entrar al museo", "transitionMs": 1000 },
  "speech": { "mode": "browser", "lang": "es", "rate": 0.95, "pitch": 1, "volume": 0.7 },
  "welcome": {
    "touchText": "Texto de bienvenida táctil por definir.",
    "desktopText": "Texto de bienvenida de escritorio por definir."
  }
}
```

### Estación ilustrativa

```json
{
  "schemaVersion": 1,
  "stations": [
    {
      "id": "estacion-01",
      "order": 1,
      "type": "audio",
      "title": "Título por definir",
      "image": "media/images/01.webp",
      "imageAlt": "Descripción de la imagen",
      "narration": {
        "mode": "browser",
        "text": "Introducción breve por proporcionar.",
        "policy": "first-visit"
      },
      "media": { "src": "media/audio/01.mp3", "mime": "audio/mpeg" },
      "placement": { "wall": "left", "position": 200, "width": 35 }
    }
  ]
}
```

El archivo final contiene diez registros, no solo el ejemplo. Para video: type=video, media.src con MP4, mime=video/mp4 y captionSrc opcional. No hay narration.src obligatorio. Derivar altura del cuadro de la proporción real. Usar speechText opcional solo si hay una variante de pronunciación.

### Decoración ilustrativa

```json
{
  "schemaVersion": 1,
  "decorations": [
    {
      "id": "decor-rug-entry",
      "enabled": true,
      "kind": "floor-image",
      "image": "media/decor/rug-entry.webp",
      "alt": "Alfombra de entrada",
      "transform": { "position": [-80, -39.9, 180], "rotationDegrees": [-90, 0, 0], "size": [120, 70] },
      "fit": "contain",
      "interactive": false,
      "placeholder": true
    },
    {
      "id": "decor-gon-left-01",
      "enabled": true,
      "kind": "wall-image",
      "image": "media/decor/gon-left-01.webp",
      "alt": "Ilustración de Gon Freecss",
      "placement": { "wall": "left", "position": 160, "centerY": 20, "width": 24 },
      "fit": "contain",
      "interactive": false,
      "placeholder": true
    }
  ]
}
```

Coordenadas ilustrativas en unidades originales, no metros: el piso de referencia está en y=-40. Validar límites, caras y separación en la escena. contain evita recortes; cover solo para decoración cuando el recorte sea intencional.

Validar esquema, IDs únicos, orden, tipos, números finitos, tamaños positivos, archivos existentes y rutas locales. Ocho audios y dos videos en la configuración inicial. Texto vacío de narración significa pasar directamente a listo. En desarrollo admitir contenidos pendientes con placeholders; para publicar, informar y resolver los faltantes. Renderizar texto sin interpretar HTML arbitrario.

## 10. Preparación de contenido y presupuesto

| Recurso | Especificación inicial |
|---|---|
| Portadas | JPG/WebP, lado largo aproximado 1200–1600 px, proporción original |
| Narraciones | Texto español; no se requiere archivo de voz |
| Canciones | MP3, 128–192 kbps, volumen consistente |
| Videos | MP4 H.264 + AAC, 720p inicial, 24/30 fps, fast start |
| Decoración | Imágenes de 1024 px inicialmente; alfombra hasta 2048 px si hace falta |
| Subtítulos | WebVTT para videos cuando se disponga del texto |

Tamaño aproximado en MB = bitrate total en Mbps × segundos ÷ 8. Un video de seis minutos a 1,8 Mbps totales ocupa unos 81 MB. Fijar presupuesto interno menor de 85 MB por video, comprobando calidad y peso real. Si no alcanza calidad suficiente, reducir duración o evaluar alojamiento multimedia externo. No prometer que un bitrate fijo sea suficiente para cualquier escena.

Ejemplo: ocho canciones de tres minutos a 160 kbps ≈28,8 MB; dos videos de seis minutos a 1,8 Mbps ≈162 MB; multimedia principal ≈190,8 MB, más imágenes y aplicación. Son estimaciones decimales. La duración de canciones aún no está confirmada.

Objetivos orientativos: carga inicial sin medios completos menor de 10 MB, máximo deseable 15 MB; decoración comprimida alrededor de 3 MB; 30 fps sostenidos en Android de prueba. Limitar densidad de render inicialmente a 1,5 en móvil y ofrecer calidad reducida. Medir memoria y dimensiones de texturas, no solo peso descargado. Evitar sombras dinámicas múltiples y posprocesado pesado.

## 11. Navegación y accesibilidad

Mantener tocar/clicar un cuadro para acercarse. Añadir joystick izquierdo y arrastre derecho para recorrido libre táctil; WASD/flechas y arrastre o captura de ratón en escritorio. Ofrecer sensibilidad ajustable y botón para regresar al inicio.

Pointer Events debe distinguir toque de arrastre y separar controles de navegación y reproducción. Un arrastre no selecciona cuadros. Reiniciar entradas tras pérdida de foco. Movimiento dependiente del tiempo, límites de habitación y trayectos de acercamiento sin atravesar paredes. Pausar desplazamiento al manipular reproductores; permitir exploración durante la bienvenida.

Recomendación horizontal, no bloqueo obligatorio. Controlar cambios de tamaño, barras de Android y áreas seguras. Botones de al menos 44×44 px CSS como objetivo, etiquetas accesibles, foco visible y contraste. El modal devuelve el foco al cerrar y admite Escape en escritorio. Mostrar textos de narración siempre. Respetar movimiento reducido.

Si WebGL no inicia o se pierde el contexto, ofrecer recuperación o lista 2D con los mismos contenidos. Si voz no funciona, el modo texto mantiene la visita completa. No bloquear zoom global de texto; limitar touch-action a las superficies de navegación necesarias.

## 12. Arquitectura y estado

HTML/CSS/JavaScript modular, Three.js y Vite. Fijar versiones y lockfile al implementar; elegir Node compatible con la versión de Vite. No es necesario añadir React o migrar a TypeScript para este alcance.

```text
museo-de-lua/
  index.html
  package.json
  package-lock.json
  vite.config.js
  LICENSE
  THIRD_PARTY_NOTICES.md
  README.md
  src/
    main.js
    scene.js
    navigation.js
    stations.js
    decorations.js
    media-controller.js
    speech-controller.js
    session-state.js
    access-gate.js
    ui.js
    styles.css
  public/
    config/site.json
    data/stations.json
    data/decorations.json
    media/branding/
    media/images/
    media/audio/
    media/video/
    media/decor/
    media/captions/
  scripts/validate-content.mjs
  tests/
  .github/workflows/deploy.yml
```

Esta es una estructura propuesta, no archivos ya creados. Separar acceso, preparación/entrada, navegación y multimedia. MediaController coordina reproducción y delega voz a SpeechController. Solo una fuente sonora activa. Cancelar callbacks obsoletos mediante tokens de operación; liberar listeners y recursos al cambiar contenido.

Rutas relativas a la base de despliegue. Resolver catálogo y medios sin barras iniciales que rompan /nombre-del-repositorio/. Asignar src de canciones/videos bajo demanda; capturar rechazos de play(). Evitar dos elementos reproduciendo el mismo video durante ampliación.

SessionStorage: acceso informal, silencio y estaciones presentadas. No almacenar la clave literal. Si no hay storage disponible, usar memoria. Posición de reproducción en memoria durante la visita. Al ocultar pestaña, cancelar voz y pausar medios; nunca reanudar solos. Recargar puede conservar preferencias de la misma sesión, pero la bienvenida vuelve a requerir un gesto explícito.

## 13. Clave y alojamiento

La clave es una barrera visual aceptada por Bruno. Comparar un verificador derivado de la clave permite no escribirla literalmente, pero el control cliente sigue siendo evadible. Los medios y código públicos siguen accesibles. No usar una contraseña personal de otro servicio ni presentar este sistema como acceso privado.

GitHub Pages como opción inicial. Preparar index.html, base de Vite y GitHub Actions que valide, construya y publique dist. HTTPS, archivos dentro de límites y sin LFS para servir medios en Pages. Límites registrados en la investigación previa: sitio publicado de 1 GB, transferencia flexible de 100 GB/mes y límite normal de Git de 100 MiB por archivo. Reconfirmarlos al desplegar; mantener margen, no diseñar justo al límite.

No poner claves API ni tokens en frontend. Conservar licencia y créditos de la adaptación. Esta fase solo entrega documentación; no crea repositorio ni publicación.

## 14. Plan de implementación

| Fase | Trabajo | Criterio de cierre |
|---|---|---|
| 1. Preparación | Registrar commit base, revisar licencia y crear copia propia de trabajo | Referencia original identificada y recursos temporales preparados |
| 2. Base | Separar lógica y migrar Three.js gradualmente | Sala, distribución y acercamiento preservados |
| 3. Prototipo completo de dos estaciones | Un audio, un video y voz del navegador | Reproducción, repetición, silencio y errores probados en Android |
| 4. Entrada y navegación | Clave, carga, botón animado, transición y movimiento | Un toque inicia entrada; sin doble voz ni selección accidental |
| 5. Personalización | Morado/salmón, emblema, diez estaciones, alfombra y paneles | Catálogos externos controlan contenido y decoración |
| 6. Validación | Rendimiento, accesibilidad y multimedia real | Lista de aceptación comprobada; limitaciones documentadas |
| 7. Publicación | Build, Pages y manual de actualización | URL real verificada con rutas y medios correctos |

Primero validar voz y video en Android antes de terminar toda la decoración. No actualizar Three.js sustituyendo el bloque incrustado a ciegas. No estimar fecha final hasta recibir medios y conocer el dispositivo de prueba.

## 15. Pruebas de aceptación

- Portada y clave funcionan en vertical y horizontal; no hay sonido al abrir el enlace.
- Escena lista antes de habilitar Entrar; carga lenta muestra estado útil.
- Entrar inicia una única voz desde el gesto y retira portada en el tiempo configurado.
- Movimiento reducido elimina animaciones innecesarias.
- No existe botón Omitir.
- Seleccionar cuadro interrumpe bienvenida; repetir bienvenida pausa contenido.
- Primera introducción habilita contenido al finalizar; volver al cuadro no obliga a repetirla.
- Voces tardías, lista vacía, síntesis no soportada o eventos faltantes no bloquean la visita.
- Silenciar cancela voz, conserva texto y habilita contenido; nuevos medios respetan silencio.
- Canciones/videos tienen pausa, progreso y retorno correcto; no se superponen sonidos.
- Eventos de una selección antigua no cambian la estación actual.
- Videos reales de hasta seis minutos permiten avance y retorno desde pantalla completa.
- Alfombra y paneles no parpadean ni son seleccionables como estaciones.
- Cambiar contenido exclusivamente mediante catálogos funciona sin editar JavaScript.
- Archivos faltantes muestran mensaje o placeholder en vez de romper la sala.
- Pruebas manuales en Android real y escritorio; tablet y Safari cuando se disponga. Registrar los equipos realmente probados.
- Verificar la URL publicada y no solo el servidor local.

Automatizar validación de JSON/rutas y pruebas del controlador de estados, cancelación, silencio y repetición. Comprobar síntesis y rendimiento manualmente en el dispositivo real: la emulación y mocks no garantizan la experiencia del motor de voz Android.

## 16. Manual de contenido y entregables

1. Preparar imágenes, canciones y videos en formatos previstos.
2. Copiarlos a media/ con nombres simples, sin espacios y en minúsculas.
3. Editar títulos, textos y rutas en catálogos; conservar IDs de estaciones existentes.
4. Para cambiar una voz narrada, editar el texto; no generar ni subir MP3.
5. Ejecutar tareas previstas: npm run validate:content, npm run build y npm run preview. Esas tareas se crearán durante implementación; no asumir que existen en el original.
6. Subir cambios al repositorio propio y verificar el despliegue. Usar nombres versionados de medios o estrategia de caché para evitar contenido antiguo.

Guardar originales pesados fuera de public/ y del repositorio publicado. No subir WAV u originales de video si solo se utilizarán copias comprimidas. El historial de Git puede conservar archivos retirados; publicar únicamente material destinado a compartirse.

Bruno aportará diez portadas, ocho canciones, dos videos, textos de bienvenida e introducciones. Decoraciones finales pueden incorporarse después. Modelo exacto de Android y orientaciones reales se comprobarán al probar, sin bloquear el prototipo. La clave final se define aparte.

Entregables de implementación: código fuente con licencias, build, catálogos documentados, placeholders reemplazables, manual de instalación/actualización, registro de pruebas y URL cuando se publique. No incluye personajes, multijugador, panel de subida, cuentas reales, pagos, analítica ni editor de habitaciones. Video sobre pared y narraciones pregrabadas quedan como mejoras opcionales.

## 17. Fuentes y trazabilidad

- [Repositorio base](https://github.com/lrusso/3DArtMuseum).
- [Entrada y cuadros](https://github.com/lrusso/3DArtMuseum/blob/master/3DArtMuseum.htm). Blob inspeccionado previamente: 742ad1312d8c9e92177ecc2a05d3889a185d6402.
- [Escena y navegación](https://github.com/lrusso/3DArtMuseum/blob/master/3DArtMuseum.js): biblioteca incrustada identificada como 88dev en revisión previa.
- [Orientación](https://github.com/lrusso/3DArtMuseum/blob/master/3DArtMuseumPleaseRotate.js) y [licencia](https://github.com/lrusso/3DArtMuseum/blob/master/license.txt).
- [SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) y [getVoices](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices), consultados durante esta conversación.
- [Límites de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits), registrados en la investigación previa y sujetos a comprobación al publicar.

Las duraciones, dimensiones y presupuestos son objetivos de diseño, no resultados medidos. Esta documentación consolida los requisitos de Bruno y la inspección previa; no representa una auditoría exhaustiva ni certificación de compatibilidad.
