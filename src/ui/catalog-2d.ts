// Catálogo accesible: las mismas estaciones en lista. Abre el mismo panel y el mismo coordinador (FR-022, FR-026).

import type { Station } from "../content/types.ts";

export function renderCatalog(list: HTMLUListElement, stations: readonly Station[], baseUrl: string, onSelect: (id: string) => void): void {
  const doc = list.ownerDocument;
  list.replaceChildren();
  for (const s of [...stations].filter((x) => x.enabled).sort((a, b) => a.order - b.order)) {
    const li = doc.createElement("li");
    const btn = doc.createElement("button");
    btn.type = "button";
    btn.className = "catalog__item";
    btn.dataset["stationId"] = s.id;

    const thumb = doc.createElement("img");
    thumb.src = new URL(s.image.src, baseUrl).href;
    thumb.alt = "";
    thumb.width = 64;
    thumb.height = 64;
    thumb.loading = "lazy";

    const label = doc.createElement("span");
    label.className = "catalog__label";
    const name = doc.createElement("span");
    name.textContent = s.title;
    const kind = doc.createElement("span");
    kind.className = "catalog__kind";
    kind.textContent = s.type === "video" ? "Vídeo" : "Canción";
    label.append(name, kind);

    btn.append(thumb, label);
    btn.addEventListener("click", () => onSelect(s.id));
    li.append(btn);
    list.append(li);
  }
}
