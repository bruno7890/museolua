# Herramientas del repositorio

## Flujo de trabajo

El proyecto sigue **GitHub Spec Kit**: la especificación manda sobre el código.

```text
specs/001-museo-de-lua/
├── spec.md          # requisitos (FR-xxx) y criterios (EC-xx, SC-xx)
├── plan.md          # arquitectura, decisiones y puertas de la constitución
├── research.md      # decisiones D-01…D-17 con su alternativa rechazada
├── data-model.md    # entidades y estados
├── quickstart.md    # comandos
├── contracts/       # esquemas JSON e interfaces entre módulos
├── checklists/requirements.md
└── tasks.md         # 88 tareas trazables
```

`.specify/memory/constitution.md` fija los principios: experiencia fiel, control del sonido, simplicidad, procedencia, calidad demostrable y permiso explícito para publicar.

Regla de trabajo: **una tarea de `tasks.md` no se marca como hecha sin una evidencia** (prueba que pasa o captura registrada).

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en `http://127.0.0.1:5173` |
| `npm run build` | Compila a `dist/` |
| `npm run preview` | Sirve `dist/` como lo hará el hosting |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Pruebas unitarias (Vitest) |
| `npm run test:e2e` | Recorrido completo en Chromium de escritorio y móvil emulado |
| `npm run test:e2e:subdir` | El mismo recorrido servido en `/museo-de-lua/` (como en Pages) |
| `npm run validate:content` | Valida los catálogos (modo demo) |
| `npm run validate:content -- --mode=publish` | Valida exigiendo contenido real |
| `npm run check:budget` | Comprueba el peso del build y de los medios |
| `npm run hash:key -- --key "clave" --salt "museo-de-lua-v1"` | Genera el verificador SHA-256 de la clave |
| `npm run media:demo` | Regenera los marcadores de demostración |

Batería completa de la constitución:

```bash
npm run typecheck && npm test && npm run validate:content && npm run build && npm run check:budget && npm run test:e2e
```

## Scripts

| Archivo | Función |
|---|---|
| `scripts/validate-content.ts` | Valida `config/site.json`, `data/stations.json` y `data/decorations.json` contra los archivos reales de `public/` |
| `scripts/check-budget.ts` | Presupuesto de 5 MiB para la carga esencial y de 80 MiB por archivo de medios |
| `scripts/hash-access-key.ts` | Calcula sal + verificador SHA-256 de la clave de entrada |
| `scripts/generate-demo-media.ts` | Genera portadas PNG, canciones MP3 y vídeos MP4 de marcador |

Los scripts se ejecutan con `node --experimental-strip-types` (Node ≥ 22.18): TypeScript directo, sin paso de compilación.

## Entorno

- Node `24.16.0` (mínimo `22.18.0`).
- Playwright necesita el navegador: `npx playwright install chromium` (en CI, `--with-deps`).
- `ffmpeg` en el PATH solo para regenerar los medios de demostración.

## Pruebas

- **Unitarias** (`tests/unit/`): máquina de estados, navegación, aproximación, entradas, selección de voz, validador de contenido, sesión, colección de la sala, política de introducción, acceso (verificador y respaldo de SHA-256) y coordinador de reproducción con dobles de voz y medio.
- **E2E** (`tests/e2e/`): entrada (incluido el caso sin contexto seguro), panel de estación, colección completa, movimiento reducido y alternativa 2D, sobre el *build* servido por `vite preview`, en Chromium de escritorio y en el perfil `Pixel 7`.

## GitHub Spec Kit

```bash
specify init --here --ai opencode   # si hay que reinicializar
specify check                         #valida la constitution
```

Los comandos de slash están en `.opencode/commands/` (`/speckit.constitution`, `/speckit.specify`, `/speckit.plan`, `/speckit.tasks`, `/speckit.implement`).

## Superpowers

El plugin de superpowers está instalado localmente en `.opencode/opencode.json` y aporta las habilidades de proceso (brainstorming, systematic-debugging, TDD, verificación). Skills de proyecto de Three.js, frontend y testing en `.agents/skills/`.

## Convenciones del código

- Sin framework: TypeScript + módulos ES, sin empaquetador aparte.
- Los módulos se separan por responsabilidad y **solo `media/` decide sonido**.
- Ningún módulo de `scene/` importa de `ui/`: la comunicación pasa por `app-state` y el `PlaybackCoordinator`.
- Todo el texto del catálogo se escribe con `textContent`.
- Comentarios y documentación en español.
- Versiones fijadas de forma exacta; `package-lock.json` se versiona.
