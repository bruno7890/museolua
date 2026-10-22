// Genera medios de DEMOSTRACIÓN (no son obras ni material de la autora de la referencia).
// PNG: sin dependencias (zlib). Audio y vídeo: ffmpeg, si está disponible en el PATH.
// Uso: npm run media:demo

import { deflateSync } from "node:zlib";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PUBLIC = join(import.meta.dirname, "..", "public");

// ---------- PNG ----------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf: Uint8Array): number {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Uint8Array): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, Buffer.from(data), crc]);
}

/** Lienzo de color suave con una luna y una estrella: marcador visual, no una obra. */
function makePng(width: number, height: number, hue: [number, number, number], label: number): Buffer {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  const cx = width * 0.7;
  const cy = height * 0.28;
  const r = Math.min(width, height) * 0.12;
  for (let y = 0; y < height; y++) {
    raw[y * (width * 3 + 1)] = 0;
    for (let x = 0; x < width; x++) {
      const t = y / height;
      let R = hue[0] * (1 - t) + 0xf2 * t;
      let G = hue[1] * (1 - t) + 0xaa * t;
      let B = hue[2] * (1 - t) + 0x9b * t;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < r) {
        R = 0xf8;
        G = 0xf5;
        B = 0xfc;
      } else if (dist < r * 1.08) {
        R = 0x65;
        G = 0x43;
        B = 0x97;
      }
      // Pequeña marca de número para distinguir visualmente cada marcador.
      if (x > 16 && x < 16 + 10 * (label % 10 + 1) && y > 16 && y < 30) {
        R = 0x30;
        G = 0x26;
        B = 0x3d;
      }
      const o = y * (width * 3 + 1) + 1 + x * 3;
      raw[o] = Math.round(R);
      raw[o + 1] = Math.round(G);
      raw[o + 2] = Math.round(B);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // profundidad
  ihdr[9] = 2; // RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw, { level: 9 })), chunk("IEND", new Uint8Array())]);
}

// ---------- utilidades ----------
function write(rel: string, data: Buffer | string): void {
  const full = join(PUBLIC, rel);
  mkdirSync(join(full, ".."), { recursive: true });
  writeFileSync(full, data);
  console.log(`  ✓ ${rel}`);
}

function ffmpegAvailable(): boolean {
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// ---------- generación ----------
const PALETTE: [number, number, number][] = [
  [0xc7, 0xb5, 0xe8],
  [0xd8, 0xc7, 0xf0],
  [0xb9, 0xa6, 0xdd],
  [0xe6, 0xd4, 0xf5],
  [0xc0, 0xc8, 0xe8],
  [0xd2, 0xbe, 0xe6],
  [0xbf, 0xb0, 0xe0],
  [0xdd, 0xcf, 0xef],
  [0xc9, 0xbb, 0xe4],
  [0xe2, 0xd6, 0xf2],
];

console.log("Imágenes de estaciones (1024 px):");
for (let i = 1; i <= 10; i++) {
  const n = String(i).padStart(2, "0");
  write(`media/images/${n}.png`, makePng(1024, 1024, PALETTE[i - 1]!, i));
}

console.log("Decoración (marcadores):");
write("media/decor/rug-entry.png", makePng(1024, 640, [0xf2, 0xaa, 0x9b], 0));
for (const id of ["gon-left-01", "gon-left-02", "gon-right-01", "gon-right-02"]) {
  write(`media/decor/${id}.png`, makePng(512, 768, [0xc7, 0xb5, 0xe8], 1));
}

write(
  "media/branding/ornament.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
  <circle cx="48" cy="48" r="30" fill="#F8F5FC" stroke="#654397" stroke-width="3"/>
  <circle cx="58" cy="40" r="26" fill="#C7B5E8"/>
  <path d="M48 12 L52 22 L63 22 L54 28 L58 39 L48 33 L38 39 L42 28 L33 22 L44 22 Z" fill="#F2AA9B"/>
</svg>
`,
);

if (!ffmpegAvailable()) {
  console.log("ffmpeg no está disponible: audio y vídeo de demostración NO generados.");
  console.log("Instala ffmpeg o añade los archivos manualmente (ver docs/content-guide.md).");
  process.exitCode = 0;
} else {
  console.log("Audio de demostración (MP3, 128 kb/s):");
  // Estaciones de audio: todas menos 04 y 09 (vídeo), según el catálogo.
  const AUDIO_STATIONS = ["01", "02", "03", "05", "06", "07", "08", "10"];
  const freqs = [330, 392, 440, 494, 523, 587, 659, 698];
  freqs.forEach((f, i) => {
    const n = AUDIO_STATIONS[i]!;
    const out = join(PUBLIC, `media/audio/${n}.mp3`);
    mkdirSync(join(out, ".."), { recursive: true });
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "lavfi", "-i", `sine=frequency=${f}:duration=6`, "-b:a", "128k", out]);
    console.log(`  ✓ media/audio/${n}.mp3`);
  });

  console.log("Vídeo de demostración (MP4 H.264/AAC, 10 s):");
  for (const n of ["09", "04"]) {
    const out = join(PUBLIC, `media/video/${n}.mp4`);
    mkdirSync(join(out, ".."), { recursive: true });
    execFileSync("ffmpeg", [
      "-y", "-loglevel", "error",
      "-f", "lavfi", "-i", "testsrc2=size=640x360:rate=24:duration=10",
      "-f", "lavfi", "-i", "sine=frequency=440:duration=10",
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "28", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", out,
    ]);
    console.log(`  ✓ media/video/${n}.mp4`);
  }
}

if (!existsSync(join(PUBLIC, "media/captions"))) mkdirSync(join(PUBLIC, "media/captions"), { recursive: true });
console.log("Listo.");
