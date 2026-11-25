import { describe, expect, it, vi } from "vitest";
import { createSharedVideo } from "../../src/media/media-handle.ts";

describe("vídeo compartido", () => {
  it("al cambiar de portada limpia el fotograma y libera el propietario anterior", () => {
    const element = {
      pause: vi.fn(),
      removeAttribute: vi.fn(),
      load: vi.fn(),
    } as unknown as HTMLVideoElement;
    const shared = createSharedVideo(element);
    shared.setOwner("estacion-04");

    shared.reset();

    expect(element.pause).toHaveBeenCalledOnce();
    expect(element.removeAttribute).toHaveBeenCalledWith("src");
    expect(element.load).toHaveBeenCalledOnce();
    expect(shared.owner()).toBeNull();
  });
});
