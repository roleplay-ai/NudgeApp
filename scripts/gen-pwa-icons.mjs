import sharp from "sharp";
import { mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "public", "icons");

const BG = "#FFFDF5";
const ACCENT = "#FFCE00";
const FG = "#221D23";

function svgIcon(size, maskable) {
  const outerPad = maskable ? Math.round(size * 0.12) : 0;
  const cx = size / 2;
  const cy = size / 2;
  const inner = Math.round((size - outerPad * 2) * 0.72);
  const rx = Math.round(inner * 0.22);
  const fs = Math.round(inner * 0.52);
  return `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${BG}"/>
  <rect x="${cx - inner / 2}" y="${cy - inner / 2}" width="${inner}" height="${inner}" rx="${rx}" fill="${ACCENT}"/>
  <text x="${cx}" y="${cy}" dominant-baseline="central" text-anchor="middle"
    font-family="system-ui,Segoe UI,sans-serif" font-weight="900" font-size="${fs}" fill="${FG}">N</text>
</svg>`;
}

async function writePng(name, size, maskable) {
  const buf = Buffer.from(svgIcon(size, maskable));
  await sharp(buf).resize(size, size).png().toFile(join(outDir, name));
}

await mkdir(outDir, { recursive: true });
await writePng("icon-192.png", 192, false);
await writePng("icon-512.png", 512, false);
await writePng("icon-512-maskable.png", 512, true);
console.log("Wrote PWA icons to public/icons/");
