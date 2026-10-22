# Museo de Lua — Prompt maestro para OpenCode y GitHub Spec Kit

Preparado el 21 de octubre de 2026. Documento de encargo: las secciones de implementación son instrucciones para OpenCode, no una afirmación de que el proyecto ya esté construido o probado.

## Cómo usar este documento

1. Guarda este archivo en la raíz de tu proyecto y abre esa carpeta en OpenCode Desktop.
2. Pega el «Prompt de preparación» en el chat de OpenCode. Configurará Spec Kit en tu equipo; descargar este documento no lo instala.
3. Pega el «Prompt de ejecución». OpenCode deberá leer íntegramente el encargo y convertirlo en los documentos de Spec Kit antes de implementar por fases.
4. No hace falta proporcionar todavía las canciones, imágenes, vídeos, clave ni texto definitivo de bienvenida: se usarán marcadores y contenido de demostración identificado.

GitHub Spec Kit: https://github.com/github/spec-kit

### Prompt de preparación

```text
Configura GitHub Spec Kit en este proyecto para OpenCode Desktop, conservando mis skills y archivos existentes.

Primero inspecciona AGENTS.md, el estado de Git, la configuración de OpenCode y cualquier instalación existente de Spec Kit. Lee la documentación oficial actual:
https://github.github.io/spec-kit/installation.html
https://github.github.io/spec-kit/integrations/opencode.html
https://github.github.io/spec-kit/guides/existing-projects.html

Verifica Python 3.11+, uv y la disponibilidad de specify. Si falta un requisito, resuélvelo con el instalador oficial apropiado para mi sistema y verifica su versión; si requiere una acción que solo yo puedo hacer, dame el paso exacto. No cambies políticas de ejecución globales ni desactives controles de seguridad.

Si no existe Specify CLI, la instalación oficial publicada es:
uv tool install specify-cli

Comprueba specify version y specify init --help antes de inicializar. En Windows, la configuración prevista es:
specify init --here --integration opencode --script ps

Para una carpeta no vacía, conserva primero una copia o punto de recuperación de los archivos que se puedan reemplazar y revisa el diff. Usa --force únicamente después de esa revisión si el CLI lo necesita. No borres archivos, no hagas git reset y no sobrescribas cambios del usuario. Si Spec Kit ya está inicializado, usa su gestión de integraciones en vez de reinicializar; la documentación actual contempla specify integration install opencode.

Verifica la integración y los comandos realmente generados. En la versión documentada, OpenCode usa .opencode/commands/ y comandos como /speckit.specify. Conserva las skills instaladas; no las reinstales ni inventes skills ausentes. Registra las versiones en docs/tooling.md y explica brevemente qué quedó configurado.

Si existe un conflicto con mi configuración, resuélvelo mediante una combinación revisable. No habilites publicación automática al instalar herramientas. Al finalizar, deja el proyecto preparado para leer Museo_de_Lua_Prompt_Spec_Kit_OpenCode.md.
```

### Prompt de ejecución

```text
Lee por completo @Museo_de_Lua_Prompt_Spec_Kit_OpenCode.md y aplica el «Encargo del proyecto» que contiene.

Usa GitHub Spec Kit como flujo principal y las skills realmente instaladas como apoyo. Primero inspecciona el proyecto y el repositorio base; después crea o actualiza constitución, especificación, investigación, plan, modelo de datos, contratos y tareas siguiendo las plantillas de la versión instalada. No pongas todo en spec.md: separa requisitos de producto y decisiones técnicas.

Resuelve las decisiones rutinarias con los valores propuestos en el documento, registrándolos como supuestos configurables. Pregunta únicamente por bloqueos que no se puedan resolver con marcadores o una decisión reversible. No vuelvas a preguntar por colores, número de estaciones, dispositivo prioritario, botón Entrar o ausencia de botón Omitir: ya están decididos.

Analiza consistencia y cobertura antes de implementar. Luego construye por fases, verifica cada incremento y actualiza tareas y documentación. No marques pruebas como realizadas si no las ejecutaste. Las revisiones de requisitos y las pruebas de software son evidencias distintas. Respeta las puertas de revisión que tenga la configuración instalada; no marques checklists pendientes solo para saltarlas.

Entrega una experiencia 3D funcional, no solo una portada o un mockup. Prepara el despliegue gratuito en GitHub Pages, con publicación manual inicialmente. Al finalizar muestra cómo ejecutarlo, qué funciona, qué falta aportar, qué pruebas se hicieron y qué requiere probarse en Android real.
```

## Encargo del proyecto

### 1. Objetivo y decisiones confirmadas

Construir «Museo de Lua»: museo web 3D inmersivo para una amiga, con recorrido en primera persona y sin avatar, creación de personaje ni multijugador. Debe abrirse desde un enlace en Android, computador y tablet.

- Referencia elegida: https://github.com/lrusso/3DArtMuseum . Mantener el espíritu del recorrido, distribución y catálogo que le gustaron al propietario, adaptando contenido, controles y ambientación.
- Diez estaciones multimedia en total: ocho imágenes con canciones y dos estaciones de vídeo. El esquema debe permitir cambiar posteriormente el tipo de una estación.
- Vídeos de hasta aproximadamente seis minutos; duración no equivale a tamaño aceptable de archivo.
- Narración generada desde texto con la voz disponible en el dispositivo; no se necesitan grabaciones iniciales ni una API de pago.
- Bienvenida iniciada mediante un botón Entrar llamativo. Transición agradable que hace desaparecer la portada. Después queda un botón Introducción para volver a escucharla.
- No incluir botón Omitir. Sí incluir un control global de silencio y permitir cerrar una estación.
- Cada estación presenta una narración breve al activarla; al terminar se habilita Play. La canción o vídeo nunca empieza automáticamente por terminar la narración.
- Colores: morado claro y salmón. Apariencia artística, cuidada y amistosa; evitar corazones, declaraciones románticas y estética excesivamente cursi.
- Decoración adicional: alfombra con imagen en la entrada y cuadros laterales de Hunter x Hunter, especialmente Gon Freecss. Estas piezas no consumen ninguna de las diez estaciones multimedia.
- Contenido administrado desde fuera del sitio: archivos y configuración en el repositorio. La visitante sí ve un catálogo dentro del museo, pero no un panel para subir contenido.
- Clave de entrada compartida como barrera informal contra curiosos. El propietario acepta que no será autenticación real.
- Preferencia de alojamiento: GitHub Pages y servicios gratuitos, sin backend ni suscripciones obligatorias.
- El nombre y sus adornos serán configurables. No inventar los símbolos exactos de una imagen que no esté disponible: usar provisionalmente «Museo de Lua» con ornamentos gráficos discretos y sustituibles.

### 2. Inspección inicial y uso de skills

Antes de decidir cómo adaptar la referencia, revisar su código, licencia, dependencias, controles táctiles, disposición, catálogo y reproducción. Registrar el commit inspeccionado. No asumir la versión de Three.js ni copiar ejemplos de una skill moderna sobre una API antigua.

Elegir el camino de menor complejidad que produzca una base mantenible: reutilizar y modernizar el código viable; si una parte heredada necesita reemplazarse, justificarlo en un ADR y preservar las funciones acordadas. El repositorio de referencia declara GPL-3.0: conservar licencia, atribuciones y cumplir las condiciones aplicables a las partes reutilizadas. Inventariar también las licencias de recursos gráficos y sonoros.

Leer las skills instaladas relevantes antes de cada trabajo:

| Trabajo | Skills candidatas, solo si existen |
| --- | --- |
| Escena y controles | threejs-fundamentals, threejs-interaction |
| Materiales y ambiente | threejs-materials, threejs-lighting, threejs-textures |
| Rendimiento móvil | threejs-performance |
| Interfaz y sistema visual | frontend-design, web-design-guidelines |
| Pruebas de navegador | webapp-testing |
| Depuración y verificación | systematic-debugging, verification-before-completion, requesting-code-review |
| Revisión de seguridad | differential-review, sharp-edges |

Spec Kit organiza el trabajo; las otras skills aportan criterios técnicos. Si hay varios sistemas de planificación instalados, mantener una sola lista de tareas oficial. No agregar React, un framework o una herramienta solo porque una skill lo mencione.

### 3. Documentación y flujo Spec Kit

Usar la sintaxis realmente instalada. El flujo previsto para OpenCode es constitución → especificación → aclaración de bloqueos → plan → tareas → análisis → implementación → verificación/convergencia. Invocar los comandos de Spec Kit en el chat o mediante el mecanismo admitido, nunca como comandos de PowerShell. No afirmar que un comando se ejecutó por haber imitado sus resultados.

Preparar:

- `.specify/memory/constitution.md`: principios del proyecto, simplicidad, coste, accesibilidad, compatibilidad y calidad.
- Carpeta de feature según las plantillas instaladas: `spec.md`, `plan.md`, `tasks.md`, `research.md`, `data-model.md`, `quickstart.md` y contratos cuando corresponda.
- `docs/design.md`: paleta, medidas propuestas, distribución de las diez estaciones, estados de interfaz y decisiones visuales.
- `docs/content-guide.md`: cómo añadir o cambiar audios, imágenes, vídeos, textos y decoración.
- `docs/security.md`: alcance de la clave, archivos públicos, validación, dependencias y despliegue.
- `docs/qa.md`: matriz de dispositivos, casos, resultados y limitaciones reales.
- `docs/deployment.md`: configuración de Pages, base URL y publicación manual.
- `docs/tooling.md` y ADR breves para decisiones importantes.
- `AGENTS.md`: comandos reales de desarrollo/verificación, estructura y vínculo a las especificaciones. Integrar con uno existente.

Asignar identificadores de requisitos y enlazarlos con tareas y pruebas. Mantener los documentos actualizados cuando cambie una decisión.

### 4. Arquitectura propuesta

Base preferida: Vite, TypeScript estricto, Three.js y HTML/CSS para interfaz accesible. Adaptar si la inspección demuestra una opción más simple. Bundlear dependencias y usar lockfile. No depender de CDNs en tiempo de ejecución para la escena principal.

Separar responsabilidades:

- `src/app/`: inicialización, estados y coordinación.
- `src/scene/`: sala, iluminación, superficies, marcos y recursos GPU.
- `src/controls/`: teclado, ratón, táctil y colisiones.
- `src/media/`: gestor de reproducción y narración.
- `src/ui/`: portada, catálogo, panel de estación, ayuda y ajustes.
- `src/content/`: tipos y validadores del catálogo.
- `src/config/`: parámetros de escena, interfaz y calidad.
- `public/content/`: JSON editable de estaciones, decoración y narraciones.
- `public/media/`: imágenes, audios, vídeos y marcadores.
- `scripts/`: validación de contenido, presupuesto de archivos y controles de entrega.
- `tests/`: pruebas de estados, integración y navegador.

Estos nombres son una propuesta, no una obligación de reconstruir un proyecto existente. Mantener módulos pequeños, dependencias explícitas y una sola autoridad para estado de audio. No usar Redux, un motor físico completo o un bus de eventos general sin necesidad demostrada.

### 5. Dirección visual y parámetros iniciales

Valores de partida propuestos, ajustables tras probar:

| Parámetro | Valor inicial |
| --- | --- |
| Lavanda | `#D8C7F0` |
| Salmón | `#F2A79B` |
| Fondo crema | `#F7F3F5` |
| Texto oscuro | `#30273C` |
| Verde de acento para Gon | `#4F8A66`, en pequeñas cantidades |
| Sala | Aproximadamente 18 × 12 × 4 m, o escala equivalente de la referencia |
| Cámara | Altura 1.6 m; FOV inicial 65° |
| Desplazamiento | 2.2 m/s; sin salto, sin balanceo de cabeza |
| Colisión | Radio aproximado 0.3 m; impedir atravesar paredes |
| Alcance de interacción | Aproximadamente 3 m, respetando obstáculos |
| Transición de entrada | 650–900 ms; sin demoras artificiales |
| Objetivos táctiles | Al menos 48 × 48 CSS px como objetivo de diseño |
| Calidad móvil | DPR limitado inicialmente a 1.5; modo bajo a 1 |

Proponer una distribución clara de diez puntos con espacio para acercarse, paredes sin saturación, marcos coherentes y luz suave. Evitar sombras dinámicas costosas por cada cuadro, reflejos en tiempo real y posprocesado pesado por defecto. Usar superficies sencillas y una composición real de museo 3D.

Comprobar contraste del texto y foco visible; los colores pastel no sirven por sí solos como texto sobre fondo claro. Respetar `prefers-reduced-motion`: transición breve sin zoom o vuelo de cámara. La alfombra debe verse integrada en el suelo, sin parpadeo por superficies superpuestas ni colisión innecesaria.

### 6. Entrada, orientación y recorrido

Portada con título, campo de clave y botón Entrar. Preparar en segundo plano solo la carga esencial. Mostrar progreso real si hace falta; no inventar porcentajes. Cuando la clave sea correcta y el contenido esencial esté disponible, el gesto Entrar inicia la voz y la transición. No esperar al final de una animación para intentar por primera vez la narración: se puede perder la activación del usuario.

Si la clave es incorrecta, mostrar un error discreto y accesible. Si falla un recurso, informar y ofrecer una alternativa usable. Tras entrar, ocultar la portada también para teclado y lectores de pantalla.

Android prioritario: recomendar orientación horizontal con una pantalla clara, sin depender de que el navegador permita bloquearla. Mantener acceso al catálogo 2D en vertical. En escritorio usar WASD y flechas; mirar con ratón y Pointer Lock cuando esté disponible. Proporcionar arrastre como alternativa. Escape libera el control y no deja teclas presionadas.

Móvil: joystick izquierdo para movimiento y arrastre derecho para mirar; manejar dos dedos simultáneamente, zonas muertas y sensibilidad configurable. Al abrir un panel, el gesto de tocar un botón no debe mover la cámara. Reiniciar entradas al perder foco, cambiar orientación, cancelar puntero o esconder la pestaña. Detener movimiento con modales abiertos. Restaurar control mediante un gesto cuando lo exija el navegador.

### 7. Narración y coordinación del audio

Implementar Web Speech API con `speechSynthesis`, `SpeechSynthesisUtterance`, selección de voz y `voiceschanged`. Priorizar español disponible, con preferencia configurable es-EC/es-LA cuando exista y fallback a otra voz es-*; no garantizar género, nombre, naturalidad ni funcionamiento offline. Las voces pueden depender del sistema y del proveedor del dispositivo.

Texto provisional editable de bienvenida:

> Bienvenida al Museo de Lua. Este espacio reúne canciones, imágenes y algunos vídeos para que los explores a tu ritmo. Acércate a un cuadro y tócalo para descubrirlo. También puedes abrir el catálogo para elegir una sección. Cuando quieras, puedes volver a escuchar esta introducción o silenciar el sonido. Disfruta el recorrido.

Mostrar las indicaciones específicas de cada dispositivo también como texto. Narraciones de estaciones breves, idealmente de 10–20 segundos, con texto editable por el propietario.

Reglas obligatorias:

1. Nada audible antes de Entrar. Narrar una estación solo al tocarla/activarla, nunca por pasar cerca o por hover.
2. Solo una fuente audible a la vez: bienvenida, narración, canción o vídeo.
3. Abrir otra estación pausa el medio anterior y cancela narraciones pendientes; callbacks antiguos no pueden alterar la estación nueva.
4. Durante narración, mostrar estado «Escuchando introducción» y Play temporalmente deshabilitado. Al terminar, habilitar Play sin reproducir automáticamente.
5. Si no hay voz, está silenciado, falla la API o vence un plazo de seguridad, mostrar el texto y habilitar Play. Implementar watchdog calculado según longitud con un límite razonable y configurable; no dejar la interfaz bloqueada.
6. El control Silenciar cancela la voz y silencia audio/vídeo. Si había una narración, permite pasar al estado listo. Reactivar sonido no reinicia voz ni medios por sorpresa.
7. Introducción pausa el medio activo y vuelve a narrar la bienvenida si no está silenciado; si lo está, muestra su texto. Reanudar una canción siempre requiere acción del usuario.
8. Cerrar una estación o esconder la pestaña pausa medios y cancela narración. El regreso no reproduce automáticamente.
9. Manejar rechazos de `play()` con un botón de reintento visible; no mostrar «reproduciendo» antes de confirmarlo.
10. Permitir cambiar el proveedor a un archivo de narración pregrabado en el futuro sin reescribir la interfaz.

### 8. Ocho audios y dos vídeos

Imágenes/posters dentro de marcos 3D. Al activar una estación, abrir un panel HTML accesible superpuesto con título, imagen o vídeo, texto y controles. Esta es la base recomendada por compatibilidad móvil y pantalla completa.

Audio: HTMLAudioElement, play/pausa, progreso, búsqueda temporal, tiempo y volumen cuando el dispositivo lo permita. Imagen de portada conservando proporción. Recordar posición durante la sesión; al cambiar a otra estación, pausar la anterior.

Vídeo: HTMLVideoElement con `playsinline`, poster, controles funcionales y pantalla completa solicitada desde un botón. Usar MP4 H.264 + AAC como formato base propuesto y confirmar reproducción con los archivos reales. Si fullscreen no está disponible, expandir el panel dentro de la página. Al salir de fullscreen, conservar posición, pausa y coherencia del estado.

No descargar ni decodificar los dos vídeos al iniciar. `preload="none"` para medios antes de seleccionarlos; metadata bajo demanda. No basarse únicamente en la proximidad para cargar archivos grandes.

VideoTexture en la pared queda como mejora posterior si las mediciones lo permiten. Si se implementa, compartir un único elemento de vídeo activo entre controles y textura, con limpieza de recursos; no abrir otro reproductor desincronizado ni hacer de esta mejora un requisito para entregar el MVP.

Guía de preparación propuesta:

- Imágenes WebP/JPEG, normalmente 1024–1600 px en el lado largo; reducir peso según calidad visual.
- Vídeo inicial 720p, 24/30 fps, H.264 y AAC, optimizado para inicio progresivo. Subir a 1080p solo si hay presupuesto y beneficio visible.
- Objetivo de vídeo menor de 80 MiB por archivo y audio aproximadamente 128–192 kb/s. Son presupuestos propios del proyecto; verificar los límites reales de GitHub al publicar.
- Para seis minutos, 1.5 Mb/s de vídeo + 128 kb/s de audio son aproximadamente 73 MB decimales antes de pequeñas variaciones. Medir siempre el archivo resultante.
- Subtítulos WebVTT cuando el propietario los aporte; texto alternativo y descripciones desde el inicio.
- Preparar ejemplos de compresión opcionales con FFmpeg, conservando los originales fuera del repositorio de despliegue.

### 9. Catálogo y decoración editables desde fuera

Separar datos del código. Crear esquema y validación de contenido en build y mensajes defensivos en runtime. Una estación debe incluir como mínimo:

- `id`, `type` (audio/video), `title`, `description`, `narrationText`.
- `image`, `imageAlt`, `mediaSrc`, `poster` opcional, `captionsSrc` opcional.
- `placement`: pared, posición, tamaño y orientación según el sistema elegido.
- `enabled`, `order`, `credit` y estado de contenido pendiente cuando corresponda.

Decoración en archivo separado: `id`, `image`, `alt`, `placement`, `size`, `fit`, `credit`. Permitir alfombra y cuadros decorativos sin narración ni reproductor. Si faltan imágenes de Gon, crear marcadores locales adecuados con nombres claros; no afirmar que una imagen pendiente está terminada ni descargar recursos arbitrarios sin revisar procedencia y permisos.

Catálogo visible dentro del museo: diez tarjetas con imagen, tipo y título; cada tarjeta abre la misma estación y la misma lógica de narración/reproducción que el marco 3D. Al cerrar, volver al recorrido conservando ubicación. No hace falta teletransportar a la visitante.

Guía para el propietario: copiar archivo → editar JSON → validar → commit/push → ejecutar publicación. Sin panel de administración, cuentas, base de datos ni subida de archivos desde la web.

Proporcionar una demo que funcione con placeholders y medios de muestra redistribuibles o generados localmente. Separar el modo demo del modo publicación: las estaciones pendientes deben identificarse y no producir enlaces rotos. La ausencia de contenido personal no bloquea la construcción técnica.

### 10. Seguridad y límites de la clave

La clave del frontend es solo una puerta visual. El JavaScript se puede modificar y los archivos se pueden solicitar directamente; un repositorio público también expone su contenido. No presentar un hash, una variable VITE_* o sessionStorage como protección de los medios. Ninguna credencial personal real debe usarse como clave del museo.

Permitir configurar un verificador para la clave recreativa y usar un indicador de sesión para no pedirla durante cada navegación. No guardar ni registrar el texto introducido. Documentar cómo se configura sin exigir la clave real para empezar. Los secretos de compilación tampoco ocultan valores incluidos en el bundle.

Controles concretos:

- Insertar textos con APIs seguras, sin `innerHTML` para contenido del catálogo. Validar URLs y rutas; por defecto solo recursos del mismo origen bajo la base de la app.
- No usar `eval`, scripts desde el catálogo, SDKs de seguimiento, credenciales en código ni APIs de pago.
- No solicitar cámara, micrófono, ubicación o permisos ajenos al recorrido. Sí permitir fullscreen/pointer lock mediante gesto.
- HTTPS en producción. Diseñar y probar una CSP compatible con Vite y los recursos usados; explicar qué puede aplicarse con meta y qué exige cabeceras que Pages no permite configurar libremente. No declarar activo un control que el hosting no soporta.
- Lockfile, revisión de dependencias y análisis de vulnerabilidades con valoración de alcance; no aplicar actualizaciones disruptivas de forma ciega.
- GitHub Actions con permisos mínimos y acciones revisadas, preferiblemente fijadas a commits verificados. No exponer secretos en PRs de forks ni ejecutar código no confiable con permisos de publicación.
- Mantener aviso/licencia de la base GPL y un inventario de recursos. Usar canciones, vídeos e imágenes que el propietario pueda publicar.

Si en el futuro se pide privacidad real de los medios, registrar que cambia la arquitectura y requerirá control de acceso en el servidor/hosting o una solución criptográfica diseñada para ello. No añadir ese coste al alcance actual.

### 11. Hooks y automatización

Distinguir tres capas y no inventar nombres de eventos de una herramienta:

**Ciclo de vida de la aplicación:** definir contratos internos para entrada, apertura/cierre de estación, inicio/fin/error de narración, reproducción/pausa, cambio de silencio, visibilidad y liberación. Pueden ser funciones o eventos tipados, sin dependencia de React. Todo listener debe poder desuscribirse. Liberar geometrías, texturas y materiales de Three.js; cancelar timers y evitar loops de render duplicados.

**Git y CI:** pre-commit ligero para formato/lint de archivos preparados, sin reformatear archivos ajenos. CI en pull requests para instalación reproducible, tipos, lint, validación del catálogo, tests relevantes y build. Ejecutar E2E sobre el build servido. Los hooks locales se pueden omitir: CI es la verificación compartida.

**Spec Kit/OpenCode:** inspeccionar el soporte de eventos de la versión instalada. La documentación consultada describe un plugin `.opencode/plugin/speckit-events.ts` y su referencia en `opencode.json`; usar el instalador oficial y combinar configuración, no copiar hooks de Claude a OpenCode. No añadir plugins extra si los comandos y CI cubren la necesidad. No automatizar push, merge o despliegue por el mero hecho de que el agente terminó una respuesta.

Definir scripts reales y documentados como `dev`, `build`, `preview`, `typecheck`, `lint`, `test`, `test:e2e` y `validate:content`. Añadir solo herramientas que esos scripts realmente utilicen.

### 12. Rendimiento, compatibilidad y QA

Presupuestos iniciales de ingeniería, sujetos a medición:

- Carga inicial transferida objetivo ≤5 MiB, excluyendo medios bajo demanda. Medir tamaño transferido y recursos cargados, no solo el bundle JavaScript.
- Objetivo ≥30 FPS en un Android de gama media identificado; aspirar a 60 FPS en escritorio. No prometer cifras sin dispositivo y medición.
- Calidad adaptable, pocas luces, texturas dimensionadas y suspensión del render cuando no aporta cambios o la pestaña está oculta.
- No medir FPS de WebGL solo con emulación móvil de Playwright ni asumir que Lighthouse valida la experiencia 3D.
- Si WebGL falla o se pierde el contexto, ofrecer recuperación controlada o catálogo 2D con reproducción. El fallback es parte del producto.

Pruebas prioritarias:

1. Clave incorrecta/correcta, entrada una sola vez y ausencia de sonido previo.
2. Inicio de voz desde Entrar, repetir Introducción, silencio y reactivación.
3. Falta de voces, lista de voces tardía, error/timeout y callbacks obsoletos.
4. Las diez estaciones aparecen y las ocho de audio/dos de vídeo usan contenido correcto.
5. Play solo cuando termina/cancela/falla la narración; ningún medio se reproduce por su cuenta.
6. Cambio rápido entre estaciones, cierre, catálogo y cambio de pestaña sin mezcla de sonidos.
7. Play/pausa, progreso, seek, fin, archivo ausente, error de red y reintento.
8. Fullscreen, salida de fullscreen y alternativa en panel ampliado.
9. Movimiento, colisiones, Escape, multitáctil, giro y controles en distintas orientaciones.
10. Rutas funcionando bajo /nombre-del-repo/, incluyendo JSON, imágenes y vídeos.
11. Teclado, foco en modales, restauración de foco, contraste y reducción de movimiento.
12. WebGL no disponible, contenido inválido, textos maliciosos y enlaces externos no permitidos.

Usar tests unitarios para estados y validación, y pruebas reales de navegador para flujos. Las voces y APIs del sistema pueden simularse en tests automáticos, pero la prueba de Android real debe indicarse separadamente. Registrar navegador, sistema, dispositivo, resultado y evidencia. No declarar la interfaz móvil validada solo por capturas de escritorio estrechas.

### 13. Fases y entregables

**Fase 0 — Preparación:** instalación/configuración de Spec Kit, inventario de skills, inspección de la base y licencia, especificación y decisión de adaptación.

**Fase 1 — Recorrido funcional:** sala gris simple pero navegable, colisiones, cámara, controles Android/escritorio, catálogo mínimo y fallback 2D. Probar primero la movilidad.

**Fase 2 — Flujo vertical completo:** portada/clave/Entrar/voz, una estación de audio y una de vídeo, estados, silencio y fullscreen. Verificar el flujo completo antes de multiplicarlo.

**Fase 3 — Museo completo:** diez estaciones, catálogo editable, decoración, alfombra, paleta y transición final. Recursos provisionales claramente identificados.

**Fase 4 — Calidad:** correcciones de accesibilidad, rendimiento, seguridad, limpieza de recursos, errores y revisión de dependencia/licencias.

**Fase 5 — Entrega:** build estático, workflow manual de Pages preparado, guía de contenido, matriz QA y lista exacta de recursos pendientes. Publicar solo cuando el propietario lo indique, sin confundir preparar el workflow con haber publicado.

Cada fase termina con una versión ejecutable y una actualización de tareas/evidencias. No hacer un rediseño completo inesperado al final. No exigir el contenido personal para probar con recursos de demostración.

### 14. Despliegue y definición de terminado

Configurar Vite para la base real de GitHub Pages. Evitar rutas absolutas a la raíz del dominio para recursos del proyecto. Una sola página sin rutas de servidor es suficiente. Preparar GitHub Actions con `workflow_dispatch` para publicación manual y CI separado para validación. Documentar la selección de GitHub Actions como fuente de Pages.

Comprobar los límites actuales del hosting y Git antes de incorporar medios; no usar Git LFS como solución asumida para servir vídeos en Pages. Medir el tamaño del sitio y estimar transferencia por visita. Si no cabe, reducir peso o presentar una alternativa gratuita con sus límites concretos antes de añadirla.

Se considera técnicamente entregable cuando el recorrido 3D, las diez estaciones, el catálogo, voz con fallback, controles multimedia, silencio, orientación, clave informal y modo 2D funcionan con contenido de muestra; los controles automáticos pasan; el build y las rutas de Pages se prueban; y los pendientes de contenido y pruebas en hardware real quedan explícitos.

El informe final debe distinguir: implementado y probado; implementado pendiente de prueba real; contenido que debe aportar el propietario; URL local de ejecución; preparación de publicación y estado real del despliegue. No afirmar seguridad absoluta, compatibilidad universal ni publicación completada sin evidencia.

## Fuentes oficiales consultadas

- Spec Kit y propósito: https://github.com/github/spec-kit
- Instalación: https://github.github.io/spec-kit/installation.html
- Integración OpenCode y eventos: https://github.github.io/spec-kit/integrations/opencode.html
- Adopción en repositorio existente: https://github.github.io/spec-kit/guides/existing-projects.html
- Flujo SDD: https://github.github.io/spec-kit/quickstart.html
- Comandos OpenCode: https://opencode.ai/docs/commands/
- Base de museo y licencia declarada: https://github.com/lrusso/3DArtMuseum
- SpeechSynthesis: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
- Reproducción y autoplay: https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay
- Límites de Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits

La distribución visual, presupuestos y arquitectura propuestos son decisiones de este encargo. Las fuentes sustentan la integración y las restricciones de plataforma, no garantizan por sí solas rendimiento o compatibilidad del museo.
