<!--
Sync Impact Report — retirar este comentario antes de incorporar la constitución a un commit.
Version change: plantilla sin ratificar → 1.0.0 (primera adopción).
Modified principles: los cinco ejemplos de plantilla se sustituyen por seis principios propios:
I. Experiencia fiel al encargo; II. Accesibilidad y Android prioritario;
III. Control explícito del sonido; IV. Simplicidad y contenido externo;
V. Procedencia y límites de acceso; VI. Calidad demostrable.
Added sections: Restricciones del producto; Flujo de trabajo y puertas de calidad.
Removed sections: únicamente ejemplos y marcadores de la plantilla inicial.
Template synchronization: sin cambios; los comandos leen esta constitución en ejecución.
Deferred placeholders: ninguno. Medios personales y hardware real son pendientes de entrega,
no requisitos necesarios para ratificar estas reglas.
-->

# Museo de Lua Constitution

## Core Principles

### I. Experiencia fiel al encargo

La aplicación DEBE ofrecer un museo 3D navegable en primera persona, sin avatar,
dedicado a Lua con tono de amistad. DEBE preservar la distribución y el acercamiento
a cuadros acordados a partir de lrusso/3DArtMuseum. Antes de adaptar código se DEBEN
inspeccionar su geometría, controles, dependencias y licencia, y registrar el commit base.
Reemplazar una parte heredada requiere un ADR con motivos y funciones preservadas.

La configuración inicial DEBE incluir diez estaciones: ocho imágenes con canción y
dos portadas con vídeo. Los tipos DEBEN ser editables mediante catálogo. La alfombra
y cuatro paneles laterales son decoración independiente, no estaciones seleccionables.
La interfaz DEBE incluir Entrar, repetir introducción, silencio, catálogo y retorno;
NO DEBE incluir Omitir, música ambiental inicial ni mensajes románticos inventados.
Los contenidos provisionales DEBEN identificarse como demostración o pendientes.

### II. Accesibilidad y Android prioritario

Chrome en Android es la plataforma prioritaria; escritorio y tablet forman parte
del alcance. El recorrido DEBE permitir joystick y giro simultáneos en táctil, y
teclado y ratón en escritorio, con límites de sala y movimiento dependiente del tiempo.
Arrastrar NO DEBE seleccionar cuadros. Los paneles DEBEN detener el desplazamiento;
la pérdida de foco, cancelación de puntero y ocultación DEBEN reiniciar las entradas.

La orientación horizontal se recomienda, nunca se impone como bloqueo. La visita
DEBE conservar una alternativa usable en vertical. Los textos y controles DEBEN
tener etiquetas, foco visible y contraste mínimo de 4,5:1 para texto normal y 3:1
para texto grande y controles relevantes. El objetivo táctil es 48×48 px CSS.
Los modales DEBEN gestionar el foco, devolverlo al cerrar y admitir Escape.
La aplicación DEBE respetar movimiento reducido y permitir zoom de texto.

Sin WebGL, o ante pérdida de contexto, DEBE ofrecer recuperación o catálogo 2D
con los mismos contenidos. Sin voz, DEBE continuar con texto y reproducción manual.
Los fallos de estos subsistemas NO DEBEN impedir el acceso a la visita completa.

### III. Control explícito del sonido

Una sola autoridad DEBE coordinar bienvenida, narración, canción y vídeo: nunca
pueden solaparse fuentes audibles. Nada DEBE sonar antes de Entrar. La solicitud de
voz de bienvenida DEBE iniciarse directamente desde el gesto, sin esperar a que
termine una animación o carga asíncrona. Entrar DEBE ser idempotente ante doble toque.

Las introducciones DEBEN mostrarse también como texto. Finalizar, fallar o cancelar
una narración por silencio DEBE habilitar Play sin iniciar el medio automáticamente.
Las estaciones ya presentadas en la sesión NO DEBEN obligar a repetir introducción.
Los motores sin eventos DEBEN tener plazos de seguridad limitados, sin esperas
artificiales cuando ya se conoce que no hay síntesis disponible.

Cambiar de estación, repetir, cerrar u ocultar la pestaña DEBE cancelar la voz
anterior y pausar el medio según el flujo. Los callbacks obsoletos DEBEN invalidarse.
Silenciar DEBE cancelar síntesis y aplicar muted a medios, conservando su volumen.
Activar sonido NO DEBE reiniciar narración ni reproducir medios pausados.
La posición de reproducción se conserva en memoria durante la visita.
Todo rechazo de play() DEBE dejar un estado y una acción de reintento comprensibles.

### IV. Simplicidad y contenido externo

La entrega DEBE ser un sitio estático sin backend, base de datos, cuentas,
administración web ni servicio de pago obligatorio. Se DEBEN usar módulos pequeños,
dependencias explícitas, versiones fijadas y lockfile. La escena principal NO DEBE
depender de CDNs en tiempo de ejecución. Añadir un framework, motor físico o bus
general requiere justificar una necesidad que la solución simple no cubra.

Configuración, estaciones y decoración DEBEN vivir en catálogos externos editables.
Se DEBEN validar esquema, identificadores, tipos, números finitos, tamaños, orden,
rutas y recursos; el runtime DEBE manejar errores sin destruir la visita.
Los textos de catálogo NO DEBEN interpretarse como HTML ni código ejecutable.
Las rutas DEBEN funcionar bajo la base del repositorio de GitHub Pages.
Canciones y vídeos DEBEN cargarse bajo demanda, nunca descargarse completos al abrir.
Los listeners, temporizadores y recursos GPU DEBEN tener un ciclo de liberación definido.

### V. Procedencia y límites de acceso

La adaptación DEBE preservar atribución, avisos y licencia GPL aplicables al código
reutilizado, y entregar su fuente correspondiente. Recursos gráficos y sonoros
DEBEN tener procedencia y permiso de publicación documentados; la licencia del
código NO DEBE presentarse como licencia de los medios personales.

La clave DEBE describirse como barrera informal del cliente, no autenticación ni
protección de archivos. No se DEBE almacenar ni registrar la clave introducida.
Se puede conservar un indicador de acceso en sesión, con alternativa en memoria.
NO DEBEN incluirse credenciales reales, secretos de API, seguimiento, eval ni
permisos de cámara, micrófono o ubicación. Fullscreen y pointer lock requieren gesto.

La publicación DEBE ser manual inicialmente y requerir indicación del propietario.
Los workflows DEBEN aplicar permisos mínimos y separar validación de publicación.
Ningún hook DEBE hacer push, merge o desplegar porque el agente terminó una respuesta.

### VI. Calidad demostrable

Cada requisito DEBE tener identificador, tarea y evidencia de validación prevista.
Los controladores de estado, cancelación, silencio y validación de contenido DEBEN
tener pruebas automatizadas significativas. Los flujos visibles DEBEN probarse en
navegador sobre el build, incluyendo una base de despliegue con subdirectorio.

La voz del sistema, multitáctil, reproducción de medios definitivos y rendimiento
DEBEN evaluarse en hardware real; la emulación y los mocks no equivalen a esa prueba.
Los informes DEBEN registrar entorno, resultado y limitaciones, distinguiendo
implementación, prueba automatizada, prueba real pendiente y contenido pendiente.
NO DEBEN declararse rendimiento, compatibilidad ni publicación sin evidencia.
La falta de medios personales no es motivo para bloquear una demo técnica reproducible.

## Restricciones del producto

- Las fuentes del encargo son `Museo_de_Lua_Plan_y_Especificaciones.md` (versión 3)
  y `Museo_de_Lua_Prompt_Spec_Kit_OpenCode.md`. La versión consolidada prevalece
  en decisiones de producto; el prompt maestro determina el flujo y los entregables.
- La paleta inicial es morado #C7B5E8, salmón #F2AA9B, blanco #F8F5FC,
  violeta #654397, texto #30263D y gris #D5CFD5; los pasteles no sustituyen contraste.
- La transición inicial es de 1000 ms, reducida a unos 150 ms cuando corresponda.
  Se detienen animaciones decorativas tras Entrar y no se bloquea exploración por voz.
- Bienvenida: objetivo de 15–25 segundos; introducciones: 5–12 segundos. Son objetivos
  de escritura, no duraciones garantizadas ni temporizadores de espera obligatoria.
- Se prioriza voz española configurable, luego es-EC/es-419 y después otra es-*;
  sin voz apropiada se intenta idioma es o se continúa en texto, nunca se fuerza inglés.
- Objetivo inicial de transferencia esencial: ≤5 MiB, excluyendo medios bajo demanda.
  Objetivo de rendimiento: ≥30 FPS en Android identificado. Ambos requieren medición.
  DPR móvil inicial limitado a 1,5, modo bajo a 1, sin efectos pesados por defecto.
- Vídeos de hasta aproximadamente seis minutos: presupuesto propio menor de 80 MiB
  por archivo, comprobando calidad y límites vigentes del alojamiento antes de publicar.
- No se incluyen multijugador, personajes, pagos, editor de salas ni subida de archivos.
  VideoTexture y narraciones pregrabadas son mejoras opcionales, no puertas del MVP.
- No se exige clave final, ilustraciones finales ni contenido personal para desarrollar.
  La demo DEBE identificar sus recursos y el modo publicación DEBE detectar pendientes.

## Flujo de trabajo y puertas de calidad

Spec Kit es el flujo principal: constitución → especificación → aclaración de bloqueos
→ investigación y plan → tareas → análisis → implementación incremental → verificación.
Los comandos se usan mediante el mecanismo admitido; seguir un archivo de instrucciones
NO DEBE describirse como una invocación de slash command que no ocurrió.

La feature DEBE separar spec.md, research.md, plan.md, data-model.md, contracts,
quickstart.md y tasks.md. Este último será la lista oficial de tareas de implementación.
Las skills técnicas apoyan ese flujo y no crean otro plan competidor.

Puertas obligatorias:

1. Antes del plan: constitución vigente, requisitos identificados, referencia y licencia
   inspeccionadas y conflictos resueltos o explícitamente bloqueados.
2. Antes de implementar: contratos de datos y estados, tareas trazables y análisis de
   consistencia sin hallazgos críticos abiertos. Los checklists no se completan por intención.
3. Primer incremento: recorrido navegable, límites, selección y fallback 2D verificables.
4. Antes de multiplicar estaciones: un audio y un vídeo con entrada, voz, silencio,
   errores, repetición y cierre probados automáticamente; la prueba Android se registra
   por separado y, si no hay dispositivo, no se afirma superada.
5. Antes de entrega técnica: diez estaciones de demo, validación, tipos/lint cuando
   apliquen, tests y build pasando; guías de contenido, QA, seguridad y despliegue.
6. Antes de publicar: indicación del propietario, contenido destinado a compartirse,
   licencias, presupuestos y configuración de Pages revisados. Después, verificar la URL.

Cada incremento DEBE actualizar tareas y evidencias. No se DEBE sobrescribir trabajo
del propietario ni hacer commits, push o cambios destructivos sin autorización.
Decisiones rutinarias reversibles se documentan; solo bloqueos no resolubles con
marcadores o supuestos configurables requieren preguntas al propietario.

## Governance

Esta constitución gobierna especificaciones, planes, revisiones e implementación.
Una excepción requiere motivo, alternativas, impacto y aprobación explícita del
propietario antes de implementarse; un ADR no autoriza por sí solo cambiar el alcance.
Los comandos y plantillas se revisan contra estos principios en cada puerta de calidad.

Las enmiendas DEBEN registrar fecha, motivo y documentos afectados. Se usa versión
semántica: MAJOR para retirar o redefinir reglas de forma incompatible; MINOR para
añadir principios o ampliar obligaciones; PATCH para aclaraciones sin cambio de alcance.
Las preferencias técnicas propuestas se fijan en el plan, no se convierten en requisitos
del propietario sin distinguir su procedencia. Las decisiones posteriores explícitas
del propietario se incorporan mediante enmienda cuando afecten estas reglas.

**Version**: 1.0.0 | **Ratified**: 2026-10-21 | **Last Amended**: 2026-10-21
