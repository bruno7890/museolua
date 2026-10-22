// Máquina de estados de la visita. Función pura: un evento no válido devuelve el mismo objeto.
// Contrato: specs/001-museo-de-lua/contracts/runtime-modules.md

export type AppPhase = "locked" | "verifying" | "loading" | "ready" | "entering" | "touring" | "fallback2d";

export interface AppState {
  phase: AppPhase;
  selectedStationId: string | null;
}

export type AppEvent =
  | { type: "submitKey" }
  | { type: "keyRejected" }
  | { type: "keyAccepted" }
  | { type: "contentReady" }
  | { type: "enter" }
  | { type: "transitionDone" }
  | { type: "selectStation"; stationId: string }
  | { type: "clearSelection" }
  | { type: "webglLost" }
  | { type: "webglUnavailable" }
  | { type: "webglRestored" };

export function initialAppState(): AppState {
  return { phase: "locked", selectedStationId: null };
}

export function transition(state: AppState, event: AppEvent): AppState {
  const to = (phase: AppPhase, extra: Partial<AppState> = {}): AppState => ({ ...state, ...extra, phase });

  switch (event.type) {
    case "submitKey":
      return state.phase === "locked" ? to("verifying") : state;
    case "keyRejected":
      return state.phase === "verifying" ? to("locked") : state;
    case "keyAccepted":
      return state.phase === "verifying" ? to("loading") : state;
    case "contentReady":
      return state.phase === "loading" ? to("ready") : state;
    case "enter":
      return state.phase === "ready" ? to("entering") : state;
    case "transitionDone":
      return state.phase === "entering" ? to("touring") : state;
    case "selectStation":
      return state.phase === "touring" || state.phase === "fallback2d"
        ? { ...state, selectedStationId: event.stationId }
        : state;
    case "clearSelection":
      return state.selectedStationId === null ? state : { ...state, selectedStationId: null };
    case "webglLost":
      return state.phase === "touring" ? to("fallback2d") : state;
    case "webglUnavailable":
      return state.phase === "loading" || state.phase === "ready" ? to("fallback2d") : state;
    case "webglRestored":
      return state.phase === "fallback2d" && state.selectedStationId === null ? to("touring") : state;
    default:
      return state;
  }
}
