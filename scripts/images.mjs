// Turns the source PNGs in assets-src/images/ into the site's responsive images.
// Writes public/images/<slot>/<slot>-<w>.(avif|webp), the hero x-ray twins, an OG line-art PNG and
// src/content/images.manifest.json (dimensions, widths, blur placeholders, car bounds).
// Usage: npm run images   (or: node scripts/images.mjs hero-desktop  to rebuild one slot)
import sharp from "sharp";
import { createHash } from "node:crypto";
import { mkdir, writeFile, access, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SLOTS } from "./image-slots.mjs";
import { buildTwin } from "./xray.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(root, "assets-src/images");
const OUT = path.join(root, "public/images");
const MANIFEST = path.join(root, "src/content/images.manifest.json");

const AVIF = { quality: 52, effort: 5, chromaSubsampling: "4:2:0" };
const WEBP = { quality: 78, effort: 6, smartSubsample: true };

const only = process.argv.slice(2);
const exists = (p) => access(p).then(() => true, () => false);
const manifest = (await exists(MANIFEST)) ? JSON.parse(await readFile(MANIFEST, "utf8")) : {};

// File names carry a content hash (`hero-desktop-1280.3f9a1c2b.avif`) so they can be cached immutably.
async function writeSet(input, slot, suffix, widths, kb, v) {
  for (const w of widths) {
    const base = path.join(OUT, slot, `${slot}${suffix}-${w}.${v}`);
    const img = sharp(input.data ?? input, input.raw ? { raw: input.raw } : undefined).resize({ width: w, kernel: "lanczos3" });
    const [a, b] = await Promise.all([img.clone().avif(AVIF).toFile(`${base}.avif`), img.clone().webp(WEBP).toFile(`${base}.webp`)]);
    kb.push(`${w}w ${Math.round(a.size / 1024)}/${Math.round(b.size / 1024)}KB`);
  }
}

for (const [slot, cfg] of Object.entries(SLOTS)) {
  if (only.length && !only.includes(slot)) continue;
  const file = path.join(SRC, cfg.src);
  if (!(await exists(file))) { console.warn(`skip ${slot}: ${cfg.src} not found (SmartImage shows a placeholder)`); continue; }

  const meta = await sharp(file).metadata();
  const widths = cfg.widths.filter((w) => w < meta.width).concat(meta.width).filter((v, i, a) => a.indexOf(v) === i);
  const v = createHash("sha1").update(await readFile(file)).update(JSON.stringify({ AVIF, WEBP, widths, x: cfg.xray ? 3 : 0 })).digest("hex").slice(0, 8);
  await rm(path.join(OUT, slot), { recursive: true, force: true });
  await mkdir(path.join(OUT, slot), { recursive: true });

  const kb = [];
  await writeSet(file, slot, "", widths, kb, v);
  const blurBuf = await sharp(file).resize(16).webp({ quality: 40 }).toBuffer();
  const entry = {
    v,
    width: meta.width,
    height: meta.height,
    widths,
    blur: `data:image/webp;base64,${blurBuf.toString("base64")}`,
    focal: cfg.focal,
    alt: cfg.alt,
  };

  if (cfg.xray) {
    const t = await buildTwin(file);
    const raw = { width: t.width, height: t.height, channels: 3 };
    const xkb = [];
    await writeSet({ data: t.twin, raw }, slot, "-xray", widths, xkb, v);
    entry.xray = { widths };
    // Car bounds as fractions of the image: the scan plane sweeps across exactly this range.
    entry.car = {
      x0: +(t.bbox.x0 / t.width).toFixed(4), y0: +(t.bbox.y0 / t.height).toFixed(4),
      x1: +(t.bbox.x1 / t.width).toFixed(4), y1: +(t.bbox.y1 / t.height).toFixed(4),
    };
    if (slot === "hero-desktop") {
      await mkdir(path.join(OUT, "og"), { recursive: true });
      await sharp(t.lineArt, { raw: { width: t.width, height: t.height, channels: 4 } })
        .extract({ left: t.bbox.x0 - 8, top: Math.max(0, t.bbox.y0 - 8), width: Math.min(t.width - t.bbox.x0 + 8, t.bbox.x1 - t.bbox.x0 + 16), height: Math.min(t.height - t.bbox.y0 + 8, t.bbox.y1 - t.bbox.y0 + Math.round(t.height * 0.05)) })
        .resize({ width: 760 })
        .png({ compressionLevel: 9, palette: true, quality: 90 })
        .toFile(path.join(OUT, "og", "hero-lineart.png"));
    }
    console.log(`${slot}: twin ${xkb.join(", ")}  car ${JSON.stringify(entry.car)}`);
  }

  manifest[slot] = entry;
  console.log(`${slot}: ${meta.width}×${meta.height} → ${kb.join(", ")}`);
}

await mkdir(path.dirname(MANIFEST), { recursive: true });
await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(`manifest: ${Object.keys(manifest).length} slots → ${path.relative(root, MANIFEST)}`);
