// Detección de WebGL 2 (Three.js r186 lo requiere; WebGL 1 se retiró en r163).

export function isWebGL2Available(doc: Document = document): boolean {
  try {
    const canvas = doc.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return false;
    // Libera el contexto de prueba.
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}
