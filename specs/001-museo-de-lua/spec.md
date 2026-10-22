# Feature Specification: Museo de Lua

**Feature Branch**: sin rama específica creada; la feature se identifica por su directorio.

**Created**: 2026-10-21

**Status**: Especificación para revisión y planificación; aplicación aún no implementada.

**Input**: Construir el museo personal 3D descrito en
`Museo_de_Lua_Plan_y_Especificaciones.md` (versión 3 consolidada) y
`Museo_de_Lua_Prompt_Spec_Kit_OpenCode.md`, conforme a la constitución 1.0.0.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entrar y recorrer el museo (Priority: P1)

Como visitante, quiero acceder con la clave compartida y explorar una sala de museo
en primera persona, a mi ritmo y desde móvil o computador, sin crear una cuenta.

**Why this priority**: El recorrido real es la experiencia central; una portada o
una colección de tarjetas por sí solas no satisfacen el encargo.

**Independent Test**: Usar una sala con cuadros de muestra, sin canciones personales,
para comprobar entrada, desplazamiento, selección y retorno al inicio.

**Acceptance Scenarios**:

1. **US1-A1 — Given** una visita nueva, **When** se abre el enlace y se introduce una
   clave incorrecta, **Then** no suena nada y aparece un error accesible; con la clave
   correcta se prepara la visita y se permite Entrar cuando esté disponible.
2. **US1-A2 — Given** contenido esencial todavía cargando, **When** la visitante espera,
   **Then** ve un estado real de preparación, sin porcentajes inventados; si falla la
   sala, puede entrar a la alternativa de contenidos cuando esté disponible.
3. **US1-A3 — Given** la visita preparada, **When** se pulsa Entrar dos veces seguidas,
   **Then** se produce una sola entrada y una sola bienvenida, la portada deja de recibir
   foco y la sala permite explorar mientras se escucha la voz.
4. **US1-A4 — Given** la sala abierta, **When** se usa teclado o joystick y arrastre,
   **Then** se camina y gira sin atravesar paredes; dos dedos pueden mover y mirar a la vez.
   Un arrastre no selecciona cuadros y no hay salto ni balanceo de cabeza.
5. **US1-A5 — Given** una posición recorrida, **When** se toca un cuadro,
   **Then** se aproxima sin cruzar paredes; al cerrar su panel se recupera el punto
   anterior a la aproximación. Volver al inicio recupera la entrada sin repetir voz.
6. **US1-A6 — Given** movimiento activo, **When** se abre un panel, pierde el foco,
   cancela un toque o cambia la orientación, **Then** no quedan entradas atascadas;
   manipular los controles del panel no mueve la cámara.
7. **US1-A7 — Given** la visita en vertical, **When** aparece la recomendación horizontal,
   **Then** se puede continuar en vertical, usar la clave y consultar el catálogo.

### User Story 2 - Escuchar y controlar una estación (Priority: P1)

Como visitante, quiero entender qué representa un cuadro y decidir cuándo reproducir
su canción o vídeo, pudiendo silenciar, repetir y salir sin sonidos mezclados.

**Why this priority**: Voz y medios dan sentido a la visita; perder el control del
sonido o dejar un reproductor bloqueado hace fallar el recorrido.

**Independent Test**: Una estación de audio y una de vídeo de demostración, accesibles
desde el catálogo, permiten comprobar el flujo aunque la sala no esté disponible.

**Acceptance Scenarios**:

1. **US2-A1 — Given** una estación no presentada, **When** se selecciona,
   **Then** se pausa el medio anterior, se cancela la bienvenida o voz previa y aparece
   el texto; tras la aproximación se intenta su narración. Play se habilita al finalizar,
   sin reproducir por sí solo. Si hace falta otro gesto, se ofrece escuchar explícitamente.
2. **US2-A2 — Given** una estación ya presentada, **When** se regresa durante la misma
   sesión, **Then** Play está disponible sin repetir obligatoriamente la introducción.
   Una introducción abandonada antes de terminar puede ofrecerse de nuevo.
3. **US2-A3 — Given** un medio reproduciendo, **When** se pulsa Volver a escuchar o
   Introducción global, **Then** se pausa y se narra el texto elegido desde el principio;
   al terminar no se reanuda el medio automáticamente.
4. **US2-A4 — Given** una narración activa, **When** se silencia,
   **Then** la voz se cancela, el texto permanece y Play queda habilitado; esa estación
   cuenta como presentada. Nuevas estaciones no narran mientras continúe el silencio.
5. **US2-A5 — Given** un vídeo reproduciendo, **When** se silencia y luego se activa
   sonido, **Then** puede continuar visualmente y recuperar sonido en su posición actual
   conservando volumen. Si estaba pausado, permanece pausado. Repetir en silencio
   muestra texto y una acción explícita para activar sonido y escuchar.
6. **US2-A6 — Given** audio o vídeo disponible, **When** se reproduce, pausa, avanza,
   retrocede y cambia volumen donde el dispositivo lo permita, **Then** controles,
   tiempo y estado reflejan el medio real. Cambiar y regresar conserva posición sin autoplay.
7. **US2-A7 — Given** un vídeo abierto, **When** se amplía y se vuelve al panel,
   **Then** se conservan posición y estado con un solo reproductor; si no hay pantalla
   completa nativa, funciona la ampliación dentro de la página. Si el vídeo tiene
   subtítulos aportados, pueden activarse; sin ellos no aparece una pista rota.
8. **US2-A8 — Given** voz o medio activo, **When** se cambia rápidamente de estación,
   cierra el panel u oculta la pestaña, **Then** se cancelan voces y se pausan medios;
   respuestas tardías no afectan la selección actual ni se reanuda nada al regresar.

### User Story 3 - Descubrir los diez contenidos y la decoración (Priority: P2)

Como visitante, quiero reconocer los diez recuerdos disponibles y elegirlos tanto
desde los cuadros como desde un catálogo legible, en un museo cuidado y amistoso.

**Why this priority**: Completa el contenido y la identidad sobre el recorrido y el
flujo multimedia ya verificables con dos estaciones.

**Independent Test**: Un catálogo completo de demostración permite abrir cada contenido
y verificar nombres, tipos y textos; la sala permite comprobar su distribución visual.

**Acceptance Scenarios**:

1. **US3-A1 — Given** la configuración inicial, **When** se consulta la sala y el catálogo,
   **Then** aparecen exactamente diez estaciones: ocho de audio y dos de vídeo,
   con identificadores, títulos, imágenes y contenido coherentes entre ambas entradas.
2. **US3-A2 — Given** una posición de recorrido, **When** se abre una estación desde
   el catálogo y se cierra, **Then** se mantiene esa posición sin teletransporte y se
   aplican las mismas reglas de narración, silencio y reproducción que desde el cuadro.
3. **US3-A3 — Given** la sala completa, **When** se inspeccionan sus paredes y entrada,
   **Then** hay tres estaciones en cada lateral, dos al fondo y dos atrás; los vídeos
   están separados. Alfombra y cuatro paneles adicionales no bloquean aproximaciones,
   no parpadean con las superficies ni abren reproductores al seleccionarlos.
4. **US3-A4 — Given** contenido de muestra, **When** se visita el museo,
   **Then** las piezas pendientes están identificadas, el emblema es sustituible,
   las imágenes mantienen proporción y la paleta lavanda/salmón conserva texto legible.

### User Story 4 - Continuar ante fallos y usar la visita de forma accesible (Priority: P1)

Como visitante, quiero acceder a los contenidos aunque mi dispositivo no reproduzca
voz o no muestre 3D, y manejar todos los paneles sin depender exclusivamente del ratón.

**Why this priority**: La disponibilidad de voz y 3D varía por dispositivo; su ausencia
no debe excluir a la visitante ni bloquear el contenido principal.

**Independent Test**: Abrir el catálogo con voz y 3D deshabilitados, usar teclado y
probar medios de muestra; ejecutar casos de fallo sin necesitar ilustraciones finales.

**Acceptance Scenarios**:

1. **US4-A1 — Given** que no hay voz, no comienza, se interrumpe o nunca notifica su fin,
   **When** se solicita narración, **Then** el texto queda disponible y Play se habilita
   dentro del límite de seguridad; no se exige esperar la duración de una voz inexistente.
2. **US4-A2 — Given** voces que aparecen tarde, **When** la visita ya está abierta,
   **Then** no se reinicia lo que se está narrando; futuras narraciones pueden usar una
   voz española disponible. No se fuerza una voz inglesa para texto español.
3. **US4-A3 — Given** 3D no disponible o perdido durante la visita, **When** se detecta
   el problema, **Then** se ofrece recuperación o catálogo 2D con los mismos contenidos,
   sin reiniciar sonidos ni perder el control de silencio.
4. **US4-A4 — Given** una ruta ausente, medio incompatible o reproducción rechazada,
   **When** se abre o reproduce esa estación, **Then** hay mensaje y reintento o marcador;
   la interfaz no afirma estar reproduciendo y las otras estaciones siguen disponibles.
5. **US4-A5 — Given** navegación por teclado, **When** se abre y cierra un panel,
   **Then** el foco entra al panel, no se escapa detrás, es visible y vuelve al control
   que lo abrió o a una alternativa estable; Escape cierra el panel correspondiente.
6. **US4-A6 — Given** movimiento reducido y texto ampliado, **When** se entra y navega,
   **Then** no hay pulsación o vuelo decorativo, la transición es breve y los controles
   siguen siendo alcanzables; selección y estados no dependen exclusivamente del color.

### User Story 5 - Actualizar y entregar el museo (Priority: P2)

Como propietario, quiero sustituir canciones, vídeos, imágenes, textos y decoración
fuera de la visita, validar los cambios y decidir cuándo publicar.

**Why this priority**: Permite personalizar la demo sin modificar programación y evita
que una ejecución del agente publique contenido sin autorización.

**Independent Test**: Cambiar un título, una narración y un medio de muestra usando solo
los archivos de contenido; validar y preparar una entrega sin publicarla.

**Acceptance Scenarios**:

1. **US5-A1 — Given** un museo de demostración, **When** se editan los catálogos y medios,
   **Then** cambian títulos, narraciones, tipo, orden y decoración sin editar la aplicación;
   los identificadores existentes pueden conservarse y las piezas deshabilitadas se ocultan.
2. **US5-A2 — Given** identificadores duplicados, tamaños no válidos, rutas externas,
   campos incompatibles o archivos inexistentes, **When** se valida contenido,
   **Then** se identifica el registro y el problema. El modo demo admite marcadores
   explícitos, pero no convierte una ruta rota en un recurso válido.
3. **US5-A3 — Given** recursos provisionales, **When** se prepara publicación final,
   **Then** se informa de pendientes y se exige sustituirlos u ocultarlos conforme al
   alcance; el inventario distingue permisos de medios y licencia de código.
4. **US5-A4 — Given** una entrega preparada, **When** no se ha autorizado publicar,
   **Then** no hay despliegue automático; con autorización, la comprobación incluye el
   enlace real bajo el nombre del repositorio y la carga de catálogos y medios.
5. **US5-A5 — Given** una nueva entrega, **When** se revisan sus guías,
   **Then** explican ejecutar, editar contenido, validar, preparar y publicar, junto con
   recursos pendientes y equipos realmente probados, sin declarar privacidad de archivos.

### Edge Cases

- **EC-01**: Toque repetido de Entrar durante carga o transición: una única entrada.
- **EC-02**: Narración vacía, voz no disponible o silencio: pasar directamente a listo.
- **EC-03**: Narración sin inicio: recuperación en un máximo propuesto de 4 segundos;
  sin fin: límite proporcional al texto con máximo propuesto de 60 segundos desde
  la solicitud de narración.
- **EC-04**: Una voz de una estación anterior termina después de seleccionar otra:
  la estación actual no cambia de estado ni inicia reproducción.
- **EC-05**: Interrupción por cambio de estación puede volver a ofrecer introducción;
  interrupción por silencio cuenta como presentación textual.
- **EC-06**: Recarga o almacenamiento de sesión inaccesible: visita usable, sin sonido
  antes de un nuevo gesto; si no se pueden conservar preferencias, usar memoria de visita.
- **EC-07**: Vídeo de seis minutos, búsqueda cerca del final y salida de pantalla completa:
  posición y pausa coherentes, sin segundo reproductor ni cambio de estación involuntario.
- **EC-08**: Giro, cambio de tamaño, barras móviles y cancelación de un dedo mientras el
  otro sigue activo: controles visibles y sin desplazamiento atascado.
- **EC-09**: Pérdida de 3D durante reproducción: pausar al ofrecer recuperación, mantener
  selección y silencio, no duplicar medios al usar el catálogo alternativo.
- **EC-10**: Texto con etiquetas o instrucciones aparentes se muestra como texto;
  rutas fuera del contenido permitido se rechazan, sin cargar recursos arbitrarios.
- **EC-11**: Decoración ausente se sustituye por superficie neutra o se oculta; una
  portada ausente tiene marcador y no impide consultar su texto o contenido disponible.
- **EC-12**: Catálogo completamente ilegible: mensaje recuperable y acción de reintento;
  no se presenta una sala vacía como museo cargado satisfactoriamente.

## Requirements *(mandatory)*

### Functional Requirements

#### Acceso y recorrido

- **FR-001**: La visita DEBE abrir sin sonido y permitir introducir una clave informal,
  con error accesible si es incorrecta y sin guardar el texto introducido. (US1-A1)
- **FR-002**: Entrar DEBE estar disponible únicamente al tener una experiencia usable,
  con estado de preparación o alternativa recuperable ante fallo. (US1-A2, EC-12)
- **FR-003**: Entrar DEBE iniciar una sola bienvenida desde el gesto y retirar la portada
  de interacción y foco, sin esperar al fin de la voz para explorar. (US1-A3, EC-01)
- **FR-004**: La sala DEBE preservar el mapa y acercamiento de la referencia, ofrecer
  primera persona sin avatar y evitar atravesar paredes al caminar o acercarse. (US1-A4–A5)
- **FR-005**: El recorrido DEBE permitir teclado, ratón/arrastre y joystick con giro
  simultáneo táctil, sensibilidad ajustable y retorno al inicio sin bienvenida automática.
  Cambiar sensibilidad debe alterar el giro de forma perceptible y reversible. (US1-A4–A5)
- **FR-006**: Un arrastre NO DEBE activar cuadros; paneles y pérdida de foco DEBEN
  detener entradas de movimiento y permitir recuperarlas sin teclas atascadas. (US1-A4, A6)
- **FR-007**: La orientación horizontal DEBE ser recomendación; clave, controles y
  catálogo DEBEN seguir disponibles en vertical y tras redimensionar. (US1-A7, EC-08)

#### Voz, silencio y medios

- **FR-008**: La bienvenida DEBE poder repetirse y tener texto e instrucciones adecuadas
  a táctil/escritorio; seleccionar una estación DEBE interrumpirla. (US1-A3, US2-A1, A3)
- **FR-009**: La primera selección DEBE presentar la introducción con texto visible;
  terminar habilita Play sin autoplay. Si la voz requiere otro gesto, DEBE ofrecerse
  escuchar explícitamente sin bloquear el contenido. (US2-A1, US4-A1)
- **FR-010**: Las estaciones presentadas DEBEN recordarse durante la sesión; repetir
  DEBE empezar desde el principio y pausar el medio activo. (US2-A2–A3, EC-05)
- **FR-011**: Nunca DEBEN solaparse fuentes audibles; cambiar selección, cerrar u ocultar
  la pestaña DEBE detener voz y pausar medios sin reanudar automáticamente. (US2-A8)
- **FR-012**: Respuestas tardías de acciones previas NO DEBEN alterar la estación,
  controles o reproducción de la selección vigente. (US2-A8, EC-04)
- **FR-013**: Silencio DEBE aplicarse a voz, canciones y vídeos; cancela voz, mantiene
  texto, habilita contenido y conserva volumen elegido en medios. (US2-A4–A5)
- **FR-014**: Reactivar sonido NO DEBE iniciar medios pausados ni voz; repetir estando
  silenciado requiere una acción explícita para activar sonido y escuchar. (US2-A5)
- **FR-015**: Voz ausente, tardía, fallida, sin eventos o texto vacío NO DEBEN bloquear
  reproducción; se DEBE preferir español sin prometer voz idéntica u offline. (US4-A1–A2, EC-02–03)
- **FR-016**: Audio y vídeo DEBEN ofrecer reproducción, pausa, progreso, búsqueda,
  tiempos y volumen donde sea compatible, conservando posición durante la visita. (US2-A6)
- **FR-017**: Vídeo DEBE mantener proporción, permitir reproducción dentro de la página,
  ampliación y pantalla completa compatible desde gesto, con un solo medio activo. (US2-A7)
- **FR-018**: Un fallo o rechazo de reproducción DEBE mostrar mensaje y acción útil,
  sin afirmar que el medio está reproduciéndose antes de confirmarlo. (US4-A4)
- **FR-019**: Las canciones y vídeos NO DEBEN descargarse completos al entrar; solo
  se solicitan bajo demanda de selección/reproducción. Verificar ausencia de esas
  descargas antes de seleccionar una estación. (US1-A2, US2-A1)
- **FR-020**: NO DEBE existir botón Omitir ni música ambiental inicial; cerrar,
  seleccionar otra estación y silenciar DEBEN permanecer disponibles. (US2-A1, A4, A8)

#### Colección e identidad

- **FR-021**: La demo completa DEBE contener diez estaciones habilitadas, inicialmente
  ocho audios y dos vídeos, con títulos, textos, imágenes y descripciones. (US3-A1)
- **FR-022**: Catálogo y cuadros DEBEN abrir la misma estación; el catálogo NO DEBE
  teletransportar y el cierre DEBE restaurar recorrido y foco coherentes. (US3-A2, US4-A5)
- **FR-023**: Distribución inicial: tres estaciones en cada lateral, dos al fondo y
  dos atrás, con vídeos separados y aproximaciones libres. (US3-A3)
- **FR-024**: Alfombra y cuatro paneles decorativos DEBEN estar separados del contenido
  interactivo, no tener narración ni tapar cuadros ni producir parpadeo. (US3-A3, EC-11)
- **FR-025**: Identidad DEBE ser amistosa con título y adornos sustituibles, paleta
  consolidada y proporciones de imagen intactas; sin mensajes de pareja ni decoración
  romántica añadida. Recursos provisionales DEBEN identificarse. (US3-A4)

#### Accesibilidad y recuperación

- **FR-026**: La visita DEBE tener alternativa 2D con los mismos contenidos ante ausencia
  o pérdida de 3D, y ofrecer recuperación sin reproducción espontánea. (US4-A3, EC-09)
- **FR-027**: Textos y controles DEBEN tener etiquetas, contraste, foco visible,
  navegación por teclado y gestión de foco en paneles; Escape DEBE cerrar/liberar
  el control apropiado sin dejar movimiento activo. (US4-A5, US1-A6)
- **FR-028**: Controles táctiles DEBEN tener objetivo de 48×48 px; zoom de texto,
  reducción de movimiento y áreas seguras DEBEN respetarse. (US4-A6, EC-08)
- **FR-029**: Voz, medios e imágenes ausentes DEBEN producir alternativas locales
  comprensibles, manteniendo utilizables las demás estaciones. (US4-A1, A4, EC-11–12)
- **FR-030**: Acceso informal, silencio y presentaciones DEBEN persistir en la sesión
  cuando sea posible, con alternativa en memoria y nuevo gesto para voz tras recarga.
  Posiciones de medios no requieren persistencia tras recargar. (US2-A2, EC-06)

#### Contenido y entrega

- **FR-031**: El propietario DEBE editar configuración, textos, tipos, orden, posiciones,
  medios y decoración fuera de la visita, sin cambiar código de aplicación. (US5-A1)
- **FR-032**: La validación DEBE detectar registros inválidos, IDs duplicados, rutas
  prohibidas, tamaños no positivos y recursos ausentes, indicando qué corregir. (US5-A2)
- **FR-033**: La demo DEBE incluir medios reproducibles y marcadores reconocibles;
  la preparación final DEBE identificar y resolver contenido pendiente. (US5-A3)
- **FR-034**: El contenido DEBE mostrarse como texto seguro y restringir recursos a
  rutas permitidas de la propia visita; NO DEBE ejecutar instrucciones del catálogo. (EC-10)
- **FR-035**: La entrega DEBE explicar que la clave no hace privados los archivos,
  preservar licencia/atribución del código e inventariar procedencia de medios. (US5-A3, A5)
- **FR-036**: Se DEBEN entregar instrucciones de instalación, edición, validación y
  publicación, evidencia de pruebas, limitaciones y pendientes de recursos. (US5-A5)
- **FR-037**: Publicar requiere indicación del propietario; la entrega preparada DEBE
  funcionar bajo un subdirectorio y verificarse en su URL si llega a publicarse. (US5-A4)
- **FR-038**: La visita NO DEBE solicitar cuentas, pagos, cámara, micrófono o ubicación,
  ni incorporar seguimiento; revisar permisos y comportamiento durante US1 y US2.
- **FR-039**: DEBE ofrecerse calidad reducida seleccionable sin perder acceso al catálogo
  ni contenido; al cambiarla durante US1-A4 la visita mantiene controles y selección.
- **FR-040**: Vídeos con subtítulos aportados DEBEN permitir activarlos; su ausencia
  NO DEBE generar pistas rotas ni bloquear reproducción. (US2-A7)

### Key Entities *(include if feature involves data)*

- **Configuración del museo**: nombre, ornamentos, paleta, entrada, clave informal,
  mensajes de bienvenida, preferencias de voz y calidad; compartida por toda la visita.
- **Estación**: identidad estable, orden, tipo, título, descripción, imagen y alternativa,
  introducción, medio, subtítulos opcionales, ubicación, disponibilidad, crédito y
  condición de demostración. Una estación representa un único contenido seleccionable.
- **Decoración**: identidad, recurso, descripción, ubicación, dimensiones, ajuste,
  procedencia, habilitación y condición provisional; sin reproducción asociada.
- **Sesión de visita**: acceso concedido, silencio y estaciones presentadas; permite
  volver al contenido sin repetir pasos innecesarios.
- **Reproducción actual**: selección, estado, posición, volumen y acción de narración;
  representa la única actividad sonora autorizada en un momento dado.
- **Recurso y evidencia**: origen y permiso de cada medio; resultado de validación,
  equipo probado y pendientes asociados a una entrega identificada.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una apertura nueva y una clave errónea producen cero sonidos; diez toques
  rápidos de Entrar producen una sola entrada y como máximo una bienvenida. (US1-A1–A3)
- **SC-002**: Se pueden alcanzar/seleccionar las diez estaciones mediante recorrido
  y catálogo, sin atravesar paredes ni seleccionar por arrastre. (US1-A4–A5, US3-A1)
- **SC-003**: En la matriz de cambio, repetición, silencio, cierre y ocultación hay
  cero fuentes audibles superpuestas y cero reanudaciones no solicitadas. (US2-A1–A8)
- **SC-004**: Todos los casos de fallo de voz permiten seguir leyendo y reproducir:
  ausencia conocida sin espera artificial, fallo de inicio ≤4 s y fin perdido ≤60 s
  como máximos iniciales configurables. (US4-A1, EC-02–03)
- **SC-005**: Las ocho canciones y dos vídeos de muestra permiten play/pausa/búsqueda;
  cerrar/cambiar y regresar conserva posición dentro de 1 s de tolerancia y deja el
  medio pausado. Salir de ampliación conserva el estado de reproducción existente,
  sin crear otro medio. (US2-A6–A7, US3-A1)
- **SC-006**: Con 3D y voz no disponibles, las diez estaciones siguen accesibles y
  sus medios reproducibles manualmente desde el catálogo. (US4-A1, A3)
- **SC-007**: Todos los controles principales son alcanzables por teclado, tienen foco
  visible y objetivos táctiles de 48×48 px; contraste mínimo 4,5:1 para texto normal
  y 3:1 para texto grande y controles relevantes. (US4-A5–A6)
- **SC-008**: El propietario puede cambiar un título, una introducción, un medio y una
  decoración sin editar código; todos los errores de contenido de US5-A2 son detectados.
- **SC-009**: La carga inicial transferida no supera el objetivo de 5 MiB y no descarga
  canciones o vídeos completos antes de su selección. Medir en carga sin caché. (FR-019)
- **SC-010**: Objetivo de al menos 30 FPS sostenidos en un Android identificado durante
  60 segundos de recorrido tras carga; registrar fluctuaciones, calidad y equipo.
  No se considera demostrado con emulación. (US1-A4, FR-039)
- **SC-011**: La transición configurada inicialmente dura aproximadamente 1 s
  (tolerancia visual 0,2 s); en movimiento reducido aproximadamente 150 ms, sin pulsación
  ni vuelos decorativos. (US1-A3, US4-A6)
- **SC-012**: Una entrega construida bajo subdirectorio carga todos los catálogos y
  recursos de muestra; no se publica sin autorización. Si se publica, la URL real pasa
  la misma comprobación y el informe distingue hardware probado de pendiente. (US5-A4–A5)

## Assumptions

- **A-01 — Autoridad documental**: la versión 3 consolidada fija las decisiones de producto;
  el prompt maestro fija proceso y entregables. La constitución 1.0.0 resuelve precedencias.
- **A-02 — Provisionales**: se usará clave recreativa de demo, título con ornamentos
  discretos y medios generados o redistribuibles identificados. No se necesitan secretos
  ni recursos personales para planificar o desarrollar.
- **A-03 — Idioma y tono**: textos españoles de amistad. Bienvenida objetivo 15–25 s e
  introducciones 5–12 s, sin garantizar duración/voz idéntica ni funcionamiento offline.
- **A-04 — Sesión**: silencio y presentaciones sobreviven recargas si el almacenamiento
  de sesión funciona; posiciones de medios solo durante la visita actual en memoria.
- **A-05 — Valores reversibles**: límites de voz de 4 s para inicio y 60 s máximo total,
  tolerancia de posición de 1 s y medición de recorrido de 60 s son propuestas de prueba,
  ajustables con evidencia Android; no son mediciones ya obtenidas.
- **A-06 — Distribución**: se conserva el mapa de referencia; posiciones exactas, tamaños
  y separación de vídeos/decoración se fijarán tras inspección y visualización de la sala.
- **A-07 — Dependencias de entrega final**: Bruno aporta medios, textos definitivos,
  emblema si lo desea, clave final y acceso a un Android identificado. Su ausencia no
  bloquea la demo; la prueba real y personalización final quedan registradas como pendientes.
- **A-08 — Medios largos**: validar vídeo de aproximadamente seis minutos y presupuesto
  menor de 80 MiB por archivo al disponer de una muestra adecuada; un vídeo corto de demo
  no demuestra reproducción satisfactoria del contenido final.
- **A-09 — Alcance excluido**: cuentas, backend, multijugador, personajes, pagos,
  analítica, editor de habitaciones y panel de subida. Vídeo sobre pared y voz pregrabada
  son mejoras futuras. No se promete privacidad real de archivos ni compatibilidad universal.
- **A-10 — Separación documental**: tecnología, versiones, esquemas y algoritmos se
  decidirán en investigación/plan/contratos. Esta especificación describe resultados
  esperados y no acredita que estén implementados ni probados.
