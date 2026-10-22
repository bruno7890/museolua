// Arranque y orquestación de la visita: clave → carga → Entrar → sala 3D (o catálogo 2D si no hay WebGL).
// Las decisiones de estado viven en app-state.ts; los sonidos, en PlaybackCoordinator.

import "./styles.css";
import type { Decoration, SiteConfig, Station, StationCatalog, DecorationCatalog, ValidateOptions } from "./content/types.ts";
import { validateAll } from "./content/validate.ts";
import { verifyAccessKey } from "./access/access-gate.ts";
import { createSessionStore } from "./app/session-store.ts";
import { initialAppState, transition, type AppEvent, type AppState } from "./app/app-state.ts";
import { isWebGL2Available } from "./app/webgl-support.ts";
import { qualitySettings, type QualityProfile } from "./config/quality.ts";
import { createInputController, type InputController } from "./controls/input.ts";
import { createMuseum, type Museum } from "./scene/museum.ts";
import { createBrowserSpeechPort, createSpeechController, type SpeechController } from "./media/speech-controller.ts";
import { selectSpanishVoice, type VoiceLike } from "./media/voice-selection.ts";
import { createPlaybackCoordinator, type PlaybackCoordinator } from "./media/playback-coordinator.ts";
import { createAudioHandle, createSharedVideo, createVideoHandle } from "./media/media-handle.ts";
import { createStationPanel, type StationPanel } from "./ui/station-panel.ts";
import { renderCatalog } from "./ui/catalog-2d.ts";

const BASE = document.baseURI;

function el<T extends HTMLElement = HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Falta el elemento #${id}`);
  return node as T;
}

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouchDevice = () => window.matchMedia("(pointer: coarse)").matches;

async function loadJson<T>(path: string): Promise<T> {
  const r = await fetch(new URL(path, BASE));
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
  return (await r.json()) as T;
}

/** Rutas declaradas en los catálogos. La existencia real se comprueba con validate:content y al cargar. */
function declaredPaths(site: SiteConfig, stations: StationCatalog, decor: DecorationCatalog): Set<string> {
  const paths = new Set<string>([site.ornament.src]);
  for (const s of stations.stations) {
    paths.add(s.image.src);
    paths.add(s.media.src);
    if (s.media.poster) paths.add(s.media.poster);
    if (s.captions) paths.add(s.captions.src);
  }
  for (const d of decor.decorations) paths.add(d.image.src);
  return paths;
}

interface Runtime {
  site: SiteConfig;
  stations: Station[];
  decorations: Decoration[];
}

async function loadRuntime(): Promise<Runtime> {
  const [site, stations, decor] = await Promise.all([
    loadJson<SiteConfig>("config/site.json"),
    loadJson<StationCatalog>("data/stations.json"),
    loadJson<DecorationCatalog>("data/decorations.json"),
  ]);
  const opts: ValidateOptions = { mode: "demo", existingPaths: declaredPaths(site, stations, decor) };
  const result = validateAll({ site, stations, decorations: decor }, opts);
  if (!result.ok) {
    const first = result.issues[0]!;
    throw new Error(`Configuración no válida (${first.file} · ${first.path}): ${first.message}`);
  }
  return { site, stations: stations.stations, decorations: decor.decorations };
}

function main(): void {
  const gate = el("gate");
  const gateForm = el<HTMLFormElement>("gate-form");
  const keyInput = el<HTMLInputElement>("access-key");
  const gateSubmit = el<HTMLButtonElement>("gate-submit");
  const gateError = el("gate-error");
  const gateStatus = el("gate-status");
  const enterBtn = el<HTMLButtonElement>("enter-button");
  const museumRoot = el("museum");
  const sceneHost = el("scene-host");
  const helpBox = el("help");
  const helpText = el("help-text");
  const webglMessage = el("webgl-message");
  const catalogSection = el("catalog-2d");
  const catalogList = el<HTMLUListElement>("catalog-list");
  const catalogBtn = el<HTMLButtonElement>("btn-catalog");
  const catalogClose = el<HTMLButtonElement>("catalog-close");
  const introBtn = el<HTMLButtonElement>("btn-intro");
  const muteBtn = el<HTMLButtonElement>("btn-mute");
  const homeBtn = el<HTMLButtonElement>("btn-home");
  const qualitySelect = el<HTMLSelectElement>("quality");
  const orientation = el("orientation-hint");
  const orientationDismiss = el<HTMLButtonElement>("orientation-dismiss");

  let app: AppState = initialAppState();
  const dispatch = (ev: AppEvent) => {
    app = transition(app, ev);
  };

  const session = createSessionStore();
  let runtime: Runtime | null = null;
  let museum: Museum | null = null;
  let input: InputController | null = null;
  let coordinator: PlaybackCoordinator | null = null;
  let panel: StationPanel | null = null;
  let speech: SpeechController | null = null;
  let currentVoice: VoiceLike | null = null;
  let profile: QualityProfile = "standard";
  let helpTimer: number | undefined;
  let orientationDismissed = false;

  const showGateError = (message: string) => {
    gateError.textContent = message;
    gateError.hidden = false;
  };

  // ---------------------------------------------------------------- voz
  const port = createBrowserSpeechPort();
  const refreshVoice = () => {
    if (!runtime) return;
    const s = runtime.site.speech;
    currentVoice = selectSpanishVoice(port.getVoices(), {
      ...(s.preferredVoiceName !== undefined ? { preferredVoiceName: s.preferredVoiceName } : {}),
      fallbackLangs: s.fallbackLangs,
    });
  };
  if (typeof speechSynthesis !== "undefined") speechSynthesis.addEventListener("voiceschanged", refreshVoice);

  const speakText = (text: string) => {
    if (!speech || session.read().muted || text.trim().length === 0) return;
    speech.speakText(text, { onEnd: () => {}, onFail: () => {} });
  };

  const welcomeText = (): string => {
    if (!runtime) return "";
    return isTouchDevice() ? runtime.site.welcome.touchText : runtime.site.welcome.desktopText;
  };
  const welcomeSpeech = (): string => {
    if (!runtime) return "";
    const w = runtime.site.welcome;
    return isTouchDevice() ? (w.speechTouch ?? w.touchText) : (w.speechDesktop ?? w.desktopText);
  };

  const showHelp = (text: string) => {
    helpText.textContent = text;
    helpBox.hidden = false;
    window.clearTimeout(helpTimer);
    helpTimer = window.setTimeout(() => {
      helpBox.hidden = true;
    }, 12000);
  };

  // ---------------------------------------------------------------- estaciones
  const openStation = (id: string) => {
    if (!runtime || !coordinator || !panel) return;
    if (panel.isOpen()) panel.close();
    const station = runtime.stations.find((s) => s.id === id);
    if (!station) return;
    catalogSection.hidden = true;
    coordinator.select(id, { fromGesture: true });
    panel.open(station, coordinator.state);
    if (museum && app.phase === "touring") museum.approachStation(id);
  };

  const closePanel = () => {
    if (!panel || !panel.isOpen()) return;
    coordinator?.close();
    panel.close();
    museum?.returnToPrevious();
    // Sin sala 3D el catálogo es la única puerta de acceso: se vuelve a mostrar.
    if (!museum) catalogSection.hidden = false;
  };

  // ---------------------------------------------------------------- escena
  const onFrame = (last: { t: number }) => (now: number) => {
    requestAnimationFrame(onFrame(last));
    const dt = (now - last.t) / 1000;
    last.t = now;
    if (!museum || !input) return;
    museum.update(dt, input.snapshot());
    museum.render();
    const arrived = museum.consumeArrival();
    // Al llegar frente al cuadro se narra la introducción solo si el visitante no ha empezado ya a reproducir:
    // así nunca se interrumpe una canción elegida por el visitante.
    if (
      arrived &&
      panel?.isOpen() &&
      panel.stationId() === arrived &&
      coordinator &&
      coordinator.state.phase === "ready" &&
      !coordinator.state.introductionPresented
    ) {
      coordinator.playIntroduction({ automatic: true });
    }
  };

  const showFallback = (message: string) => {
    dispatch({ type: "webglUnavailable" });
    gate.hidden = true;
    museumRoot.hidden = true;
    catalogSection.hidden = false;
    catalogClose.hidden = true;
    webglMessage.textContent = message;
    webglMessage.hidden = false;
    showHelp(welcomeText());
  };

  const prepareMuseum = () => {
    if (!runtime) return;
    if (!isWebGL2Available()) {
      showFallback("Esta sala 3D necesita WebGL 2. Puedes usar el catálogo con las mismas estaciones.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.className = "museum__canvas";
    sceneHost.append(canvas);
    const quality = qualitySettings(profile, window.devicePixelRatio);
    try {
      museum = createMuseum({
        canvas,
        site: runtime.site,
        stations: runtime.stations,
        decorations: runtime.decorations,
        baseUrl: BASE,
        pixelRatio: quality.pixelRatio,
        onContextLost: () => {
          coordinator?.onVisibilityHidden();
          showFallback("Se perdió la conexión gráfica. Puedes usar el catálogo o recargar la página.");
        },
      });
    } catch {
      canvas.remove();
      showFallback("No se pudo iniciar la sala 3D en este dispositivo. Puedes usar el catálogo.");
      return;
    }

    input = createInputController({
      surface: sceneHost,
      host: museumRoot,
      isBlocked: () => (panel?.isOpen() ?? false) || !catalogSection.hidden,
      onTap: (x, y) => {
        if (app.phase !== "touring" || !museum) return;
        const id = museum.pick(x, y);
        if (id) openStation(id);
      },
    });

    museum.resize(window.innerWidth, window.innerHeight);
    window.addEventListener("resize", () => museum?.resize(window.innerWidth, window.innerHeight));
    requestAnimationFrame(onFrame({ t: performance.now() }));
    dispatch({ type: "contentReady" });
    enterBtn.hidden = false;
    enterBtn.disabled = false;
    gateStatus.textContent = "Listo. Pulsa el botón para entrar.";
    enterBtn.focus();
  };

  // ---------------------------------------------------------------- clave y carga
  gateForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (app.phase !== "locked") return;
    gateSubmit.disabled = true;
    gateError.hidden = true;
    gateStatus.textContent = "Comprobando la clave…";
    await runtimePromise; // si el contenido todavía carga, la pulsación no se pierde
    if (!runtime) return; // el fallo ya está escrito en pantalla
    dispatch({ type: "submitKey" });
    const ok = await verifyAccessKey(keyInput.value, runtime.site.access);
    keyInput.value = ""; // la clave no permanece en el DOM
    gateSubmit.disabled = false;
    if (!ok) {
      dispatch({ type: "keyRejected" });
      gateStatus.textContent = "";
      showGateError("La clave no es correcta.");
      keyInput.focus();
      return;
    }
    session.write({ granted: true });
    dispatch({ type: "keyAccepted" });
    gateStatus.textContent = "Preparando tu museo…";
    prepareMuseum();
  });

  enterBtn.addEventListener("click", () => {
    if (app.phase !== "ready" || !museum) return;
    dispatch({ type: "enter" });
    enterBtn.disabled = true;
    museumRoot.hidden = false;
    // La voz se solicita dentro del mismo gesto (D-17).
    if (!session.read().muted) speakText(welcomeSpeech());
    showHelp(welcomeText());
    const ms = prefersReducedMotion() ? runtime!.site.entry.reducedTransitionMs : runtime!.site.entry.transitionMs;
    gate.classList.add("gate--leaving");
    window.setTimeout(() => {
      gate.hidden = true;
      gate.classList.remove("gate--leaving");
      dispatch({ type: "transitionDone" });
      updateOrientation();
    }, ms);
  });

  // ---------------------------------------------------------------- controles globales
  introBtn.addEventListener("click", () => {
    if (panel?.isOpen() && coordinator) {
      coordinator.restartIntroduction();
    } else if (!session.read().muted) {
      speakText(welcomeSpeech());
      showHelp(welcomeText());
    } else {
      showHelp(welcomeText());
    }
  });

  muteBtn.addEventListener("click", () => coordinator?.setMuted(!session.read().muted));

  catalogBtn.addEventListener("click", () => {
    catalogSection.hidden = !catalogSection.hidden;
    if (!catalogSection.hidden) catalogList.querySelector<HTMLElement>("button")?.focus();
  });
  catalogClose.addEventListener("click", () => {
    catalogSection.hidden = true;
    catalogBtn.focus();
  });

  homeBtn.addEventListener("click", () => {
    closePanel();
    museum?.resetToStart();
  });

  qualitySelect.addEventListener("change", () => {
    profile = qualitySelect.value === "reduced" ? "reduced" : "standard";
    museum?.setPixelRatio(qualitySettings(profile, window.devicePixelRatio).pixelRatio);
  });

  const updateOrientation = () => {
    const portrait = window.innerWidth < window.innerHeight;
    const show = app.phase === "touring" && portrait && isTouchDevice() && !orientationDismissed;
    orientation.hidden = !show;
  };
  orientationDismiss.addEventListener("click", () => {
    orientationDismissed = true;
    updateOrientation();
  });
  window.addEventListener("resize", updateOrientation);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      speech?.cancel();
      coordinator?.onVisibilityHidden();
      input?.reset();
    }
  });

  // ---------------------------------------------------------------- arranque
  const runtimePromise = (async () => {
    try {
      runtime = await loadRuntime();
    } catch (err) {
      showGateError(err instanceof Error ? err.message : "No se pudo cargar el museo.");
      gateSubmit.disabled = true;
      return;
    }
    const r = runtime;
    profile = r.site.quality.defaultProfile;
    qualitySelect.value = profile;

    speech = createSpeechController(port, {
      startTimeoutMs: r.site.speech.startTimeoutMs,
      maxUtteranceMs: r.site.speech.maxUtteranceMs,
      baseEndTimeoutMs: r.site.speech.baseEndTimeoutMs,
      msPerCharacter: r.site.speech.msPerCharacter,
      lang: r.site.speech.lang,
      rate: r.site.speech.rate,
      pitch: r.site.speech.pitch,
      volume: r.site.speech.volume,
      getVoice: () => currentVoice,
    });
    refreshVoice();

    const shared = createSharedVideo(el<HTMLVideoElement>("station-video"));
    coordinator = createPlaybackCoordinator({
      speech,
      stations: r.stations,
      session,
      createMedia: (s) => (s.type === "video" ? createVideoHandle(s, BASE, shared) : createAudioHandle(s, BASE)),
    });

    panel = createStationPanel(el("station-dialog"), {
      baseUrl: BASE,
      videoElement: shared.element,
      onPlay: () => void coordinator?.togglePlay(),
      onReplay: () => coordinator?.restartIntroduction(),
      onToggleMute: () => coordinator?.setMuted(!session.read().muted),
      onExpand: () => {
        const v = shared.element;
        v.classList.toggle("dialog__video--expanded");
        if (v.classList.contains("dialog__video--expanded") && v.requestFullscreen) {
          void v.requestFullscreen().catch(() => {});
        }
      },
      onClose: closePanel,
    });

    coordinator.subscribe((s) => {
      panel?.render(s);
      muteBtn.textContent = s.muted ? "Activar sonido" : "Silenciar";
      muteBtn.setAttribute("aria-pressed", String(s.muted));
    });

    renderCatalog(catalogList, r.stations, BASE, (id) => openStation(id));

    // Sin voz en el navegador: se indica en el texto, nunca se bloquea la visita.
    if (!port.supported) showHelp("Este navegador no lee el texto en voz alta. Puedes leer las introducciones en pantalla.");

    if (session.read().granted) {
      dispatch({ type: "submitKey" });
      dispatch({ type: "keyAccepted" });
      gateStatus.textContent = "Preparando tu museo…";
      prepareMuseum();
    } else {
      gateSubmit.disabled = false;
      gateStatus.textContent = "";
      keyInput.focus();
    }
  })();
}

main();
