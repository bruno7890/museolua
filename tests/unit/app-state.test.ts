import { describe, expect, it } from "vitest";
import { initialAppState, transition } from "../../src/app/app-state.ts";

describe("máquina de estados de la visita", () => {
  it("empieza bloqueada", () => {
    expect(initialAppState()).toEqual({ phase: "locked", selectedStationId: null });
  });

  it("clave incorrecta vuelve a bloqueada; correcta pasa a loading", () => {
    let s = transition(initialAppState(), { type: "submitKey" });
    expect(s.phase).toBe("verifying");
    expect(transition(s, { type: "keyRejected" }).phase).toBe("locked");
    expect(transition(s, { type: "keyAccepted" }).phase).toBe("loading");
  });

  it("Entrar solo es válido desde ready", () => {
    const loading = { phase: "loading" as const, selectedStationId: null };
    expect(transition(loading, { type: "enter" })).toEqual(loading);
  });

  it("Entrar desde ready inicia entering; repetirlo no cambia el estado", () => {
    const ready = { phase: "ready" as const, selectedStationId: null };
    const entering = transition(ready, { type: "enter" });
    expect(entering.phase).toBe("entering");
    expect(transition(entering, { type: "enter" })).toEqual(entering);
  });

  it("la transición completada pasa a touring", () => {
    const entering = { phase: "entering" as const, selectedStationId: null };
    expect(transition(entering, { type: "transitionDone" }).phase).toBe("touring");
  });

  it("seleccionar una estación solo es válido recorriendo la sala", () => {
    const touring = { phase: "touring" as const, selectedStationId: null };
    const selected = transition(touring, { type: "selectStation", stationId: "estacion-01" });
    expect(selected.selectedStationId).toBe("estacion-01");
    const locked = initialAppState();
    expect(transition(locked, { type: "selectStation", stationId: "estacion-01" }).selectedStationId).toBeNull();
  });

  it("pérdida de WebGL pasa a fallback2d sin perder la estación seleccionada", () => {
    const s = { phase: "touring" as const, selectedStationId: "estacion-03" };
    const next = transition(s, { type: "webglLost" });
    expect(next.phase).toBe("fallback2d");
    expect(next.selectedStationId).toBe("estacion-03");
  });

  it("un fallo de carga sin WebGL lleva al catálogo 2D", () => {
    const loading = { phase: "loading" as const, selectedStationId: null };
    expect(transition(loading, { type: "webglUnavailable" }).phase).toBe("fallback2d");
  });

  it("eventos no válidos devuelven el mismo objeto sin lanzar", () => {
    const s = initialAppState();
    expect(transition(s, { type: "transitionDone" })).toBe(s);
  });
});
