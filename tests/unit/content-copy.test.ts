import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { SiteConfig, StationCatalog } from "../../src/content/types.ts";

const PUBLIC = path.resolve("public");
const site = JSON.parse(readFileSync(path.join(PUBLIC, "config/site.json"), "utf8")) as SiteConfig;
const stations = JSON.parse(readFileSync(path.join(PUBLIC, "data/stations.json"), "utf8")) as StationCatalog;

describe("textos proporcionados para la visita", () => {
  it("usa la bienvenida y ayuda entregadas para computadora y móvil", () => {
    expect(site.entry.label).toBe("Entrar al museo");
    expect(site.welcome.speechDesktop).toBe(
      "Bienvenida al Museo de Lua. Por favor, lávate las patas antes de entrar. Después, haz clic en un cuadro para acercarte. Muévete con las flechas y gira arrastrando con el ratón.",
    );
    expect(site.welcome.speechTouch).toBe(
      "Bienvenida al Museo de Lua. Por favor, lávate las patas antes de entrar. Y después toca un cuadro para acercarte. Usa el joystick para moverte y arrastra para mirar alrededor.",
    );
    expect(site.welcome.desktopText).toBe(
      "Haz clic en un cuadro para acercarte. Muévete con WASD o las flechas y gira arrastrando con el ratón.",
    );
    expect(site.welcome.touchText).toBe("Toca un cuadro para acercarte y escuchar su introducción.");
  });

  it("usa los títulos y las introducciones entregadas, sin alterar las descripciones", () => {
    const textos: [string, string, string][] = [
      ["Canción de Lua 01", "Canción número uno, silencio y escúchala.", "audio"],
      ["Canción de Lua 02", "Canción número dos, a relajarse se ha dicho.", "audio"],
      ["Canción de Lua 03", "Canción número tres, no me sé los nombres, pero está cool.", "audio"],
      ["Vídeo de Lua 04", "Vídeo de relleno divertido.", "video"],
      ["Canción de Lua 05", "Canción número cinco, donde la magia ocurre.", "audio"],
      ["Canción de Lua 06", "Canción número seis, donde la buena vibra se siente en el aire.", "audio"],
      ["Canción de Lua 07", "Canción número siete, disfruta.", "audio"],
      ["Canción de Lua 08", "Canción número ocho, poesía hecha canción.", "audio"],
      ["Vídeo de Lua 09", "Vídeo del defensor de los derechos del invitado.", "video"],
      ["Canción de Lua 10", "Canción número diez, a cantar, a cantar.", "audio"],
    ];

    stations.stations.forEach((station, index) => {
      expect(station.title, station.id).toBe(textos[index]![0]);
      expect(station.narration.text, station.id).toBe(textos[index]![1]);
      expect(station.type, station.id).toBe(textos[index]![2]);
      expect(station.description, station.id).toMatch(/^Marcador de demostración:/);
    });
  });
});
