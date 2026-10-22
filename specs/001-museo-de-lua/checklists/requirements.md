# Specification Quality Checklist: Museo de Lua

**Purpose**: Revisar completitud y calidad de requisitos antes del plan técnico.
**Created**: 2026-10-21
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No unresolved clarification markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature requirements define measurable outcomes in Success Criteria
- [x] No implementation details leak into specification

## Notes

Revisión documental realizada el 2026-10-21, con correcciones en una segunda pasada.
Esta lista evalúa documentación, no certifica ejecución de pruebas ni cumplimiento
del producto: la implementación existe, pero su validación se registra aparte, en la
sección «Evidencia de ejecución» y en `docs/qa.md`.

### Evidencia de revisión

| Criterio revisado | Evidencia en spec.md |
| --- | --- |
| Valor y destinatarios | US1–US4 describen a la visitante; US5 describe al propietario. Cada historia tiene prioridad, motivo y prueba independiente. |
| Secciones completas | Historias, casos límite, requisitos, entidades, resultados medibles y supuestos, en orden de la plantilla activa. |
| Separación de decisiones técnicas | A-10 reserva tecnologías, versiones, esquemas y algoritmos para el plan. Los requisitos expresan comportamiento observable. |
| Cobertura funcional | FR-001–FR-040 remiten a escenarios US/EC o contienen una comprobación explícita (FR-038 y FR-039). |
| Resultados medibles | SC-001–SC-012 establecen cantidades, límites y verificaciones; no presentan esos objetivos como resultados obtenidos. |
| Fallos y límites | EC-01–EC-12 cubren duplicación, voz, callbacks antiguos, sesión, vídeo, multitáctil, pérdida de 3D y contenido inválido. |
| Supuestos y dependencias | A-01–A-10 documentan precedencia, demo, idioma, persistencia, valores propuestos, distribución y aportaciones finales. |
| Alcance | A-09 excluye cuentas, backend, multijugador, analítica, editor y mejoras opcionales. FR-037 exige autorización de publicación. |
| Clarificaciones | No hay preguntas bloqueantes: A-02 y A-07 permiten avanzar con demo; A-05 identifica decisiones reversibles. |

### Correcciones realizadas durante la revisión

- SC-005 distinguía de manera ambigua el retorno tras cierre y la salida de ampliación.
  Ahora indica pausa obligatoria al regresar de otra estación y conservación de estado
  al salir de ampliación.
- EC-03 ahora mide el límite total de recuperación desde la solicitud de narración.
- FR-040 y US2-A7 hacen explícitos subtítulos opcionales y ausencia de pistas rotas.

### Cobertura para la siguiente fase

| Área | Requisitos | Escenarios principales | Resultados |
| --- | --- | --- | --- |
| Entrada y recorrido | FR-001–FR-007, FR-039 | US1-A1–A7 | SC-001, SC-002, SC-010, SC-011 |
| Voz y reproducción | FR-008–FR-020, FR-040 | US2-A1–A8, US4-A1–A2, A4 | SC-003, SC-004, SC-005, SC-009 |
| Colección y decoración | FR-021–FR-025 | US3-A1–A4 | SC-002, SC-005 |
| Accesibilidad y fallos | FR-026–FR-030 | US4-A1–A6, EC-06, EC-08–EC-12 | SC-006, SC-007, SC-011 |
| Contenido y entrega | FR-031–FR-038 | US5-A1–A5, EC-10; inspección de permisos en US1/US2 | SC-008, SC-012 |

El mapeo anterior permite preparar tareas, pero no sustituye la futura matriz de pruebas.
Hardware Android, medios personales y URL publicada continúan pendientes de ejecución
y aportación; no son bloqueos para redactar el plan técnico de la demo.

## Evidencia de ejecución

Recogida tras la batería completa (T087) y las revisiones manuales. No sustituye a
`docs/qa.md`, que es el registro vivo; aquí solo se deja constancia de lo ejecutado.

| Requisito | Evidencia ejecutada |
| --- | --- |
| FR-001–FR-003 | `tests/unit/access-gate.test.ts`, `tests/unit/app-state.test.ts` y `tests/e2e/entry.spec.ts` (5 casos, incluida la clave incorrecta y el bloqueo de la entrada mientras carga el contenido). |
| FR-004–FR-007 | `tests/unit/navigation.test.ts`, `tests/unit/approach.test.ts`, `tests/unit/input-controls.test.ts` y recorrido manual en `npm run dev` sin atravesar muros. |
| FR-008–FR-014 | `tests/unit/playback-coordinator.test.ts` (16 casos): cambio de estación, callbacks antiguos, silencio y error de `play()` con reintento. |
| FR-015–FR-019 | `tests/unit/voice-selection.test.ts`, `tests/unit/speech-controller.test.ts` y `tests/e2e/station.spec.ts`. |
| FR-020 | Inspección de la barra en `index.html`: no existe botón Omitir ni música ambiental. |
| FR-021–FR-025 | `tests/unit/collection.test.ts` (10 marcos, 2 vídeos en muros distintos, distribución 3/3/2/2, decoración no seleccionable) y `tests/e2e/collection.spec.ts`. |
| FR-026–FR-030 | `tests/e2e/fallback.spec.ts` (WebGL 2 deshabilitado) y `tests/unit/session-store.test.ts`. |
| FR-031–FR-034 | `tests/unit/validate-site.test.ts`, `validate-stations.test.ts`, `validate-decorations.test.ts` y `npm run validate:content`. |
| FR-035–FR-038 | `LICENSE`, `NOTICE.md`, `docs/security.md` y `npm audit` sin vulnerabilidades. |
| FR-039–FR-040 | `src/config/quality.ts` con los dos perfiles y `tests/e2e/station.spec.ts` (pista de subtítulos presente en vídeo y ausente en audio). |
| SC-001–SC-012 | `npm run check:budget` (carga esencial 657,7 KiB ≤ 5 MiB), `npm run test:e2e` (30/30) y `npm run test:e2e:subdir` (15/15 en `/museo-de-lua/`). |

Pendientes que no pueden cerrarse con la evidencia disponible: voz del sistema en español
sobre hardware Android, multitáctil real, pantalla completa real, FPS sostenidos, memoria
de texturas, contraste medido con herramienta y publicación con contenido definitivo.
Están registrados en `docs/qa.md`.
