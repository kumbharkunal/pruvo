// Crops the TEMPORARY Pruvo logo from the client's Instagram screenshots and writes web assets.
// The mark is never redrawn: we only cut it out and remove its background.
// Sources live in _references/ (git-ignored); outputs are committed. Replace with the vector logo
// as soon as Pruvo supplies it (client question #1).
// Usage: node scripts/brand.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ref = (f) => path.join(root, "_references", f);
const out = (f) => path.join(root, f);

const SOURCES = {
  // Aug 17 post: black wordmark on white. Cleanest light-background rendition.
  light: { file: ref("Screenshot 2026-10-27 001046.png"), box: { left: 58, top: 47, width: 420, height: 123 } },
  // Jun 2 post: white wordmark on navy (Pruvo's own dark usage). Height stops above the lockup rule.
  dark: { file: ref("Screenshot 2026-10-27 001113.png"), box: { left: 39, top: 33, width: 427, height: 121 } },
};

const idx = (x, y, w) => y * w + x;

/** Median colour of the crop's 2px border: the background we remove. */
function borderKey(rgb, w, h) {
  const px = [];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (x < 2 || y < 2 || x >= w - 2 || y >= h - 2) px.push(rgb.subarray(idx(x, y, w) * 3, idx(x, y, w) * 3 + 3));
  const med = (c) => px.map((p) => p[c]).sort((a, b) => a - b)[px.length >> 1];
  return [med(0), med(1), med(2)];
}

/** GIMP-style colour-to-alpha: removes `key`, un-premultiplying anti-aliased edges. */
function colorToAlpha(rgb, w, h, key) {
  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    let a = 0;
    for (let c = 0; c < 3; c++) {
      const v = rgb[i * 3 + c], k = key[c];
      const ac = v > k ? (v - k) / (255 - k || 1) : v < k ? (k - v) / (k || 1) : 0;
      if (ac > a) a = ac;
    }
    a = a < 0.06 ? 0 : Math.min(1, a);
    for (let c = 0; c < 3; c++) {
      const v = rgb[i * 3 + c], k = key[c];
      rgba[i * 4 + c] = a > 0 ? Math.max(0, Math.min(255, Math.round((v - k) / a + k))) : 0;
    }
    rgba[i * 4 + 3] = Math.round(a * 255);
  }
  return rgba;
}

/** 8-connected components of pixels where `on(i)` is true. Returns { label, areas }. */
function components(w, h, on) {
  const label = new Int32Array(w * h).fill(-1);
  const areas = [];
  for (let s = 0; s < w * h; s++) {
    if (label[s] !== -1 || !on(s)) continue;
    const id = areas.length, stack = [s];
    let area = 0;
    label[s] = id;
    while (stack.length) {
      const p = stack.pop(), x = p % w, y = (p / w) | 0;
      area++;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const q = idx(nx, ny, w);
          if (label[q] === -1 && on(q)) { label[q] = id; stack.push(q); }
        }
    }
    areas.push(area);
  }
  return { label, areas };
}

/** Clears connected specks smaller than `minArea`: JPEG noise and stray lockup letters. */
function dropSpecks(rgba, w, h, minArea, t = 20) {
  const { label, areas } = components(w, h, (i) => rgba[i * 4 + 3] > t);
  for (let i = 0; i < w * h; i++) if (label[i] === -1 || areas[label[i]] < minArea) rgba[i * 4 + 3] = 0;
  return rgba;
}

/** End column of the shield: the first run of >=4 empty columns after the mark starts. */
function shieldEnd(rgba, w, h) {
  let started = false, empty = 0;
  for (let x = 0; x < w; x++) {
    let any = false;
    for (let y = 0; y < h; y++) if (rgba[idx(x, y, w) * 4 + 3] > 24) { any = true; break; }
    if (any) { started = true; empty = 0; } else if (started && ++empty >= 4) return x - empty + 1;
  }
  return Math.round(w * 0.3);
}

/**
 * Navy rendition: the background is exactly the navy that is connected to the crop border.
 * Everything else in the shield (blue, green, white car, white check stroke) is the mark: keep
 * its ORIGINAL pixels at full opacity. Colour-to-alpha alone would leave the saturated blue/green
 * half-transparent.
 */
function solidShieldOnKey(rgba, rgb, w, h, xMax, key, tol = 46) {
  const dist = (i) => Math.hypot(rgb[i * 3] - key[0], rgb[i * 3 + 1] - key[1], rgb[i * 3 + 2] - key[2]);
  const bg = new Uint8Array(w * h);
  const stack = [];
  const seed = (i) => { if (!bg[i] && dist(i) < tol) { bg[i] = 1; stack.push(i); } };
  for (let x = 0; x < w; x++) { seed(x); seed(idx(x, h - 1, w)); }
  for (let y = 0; y < h; y++) { seed(idx(0, y, w)); seed(idx(w - 1, y, w)); }
  while (stack.length) {
    const p = stack.pop(), x = p % w, y = (p / w) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      seed(idx(nx, ny, w));
    }
  }
  for (let y = 0; y < h; y++)
    for (let x = 0; x < xMax; x++) {
      const i = idx(x, y, w);
      if (bg[i]) { rgba[i * 4 + 3] = 0; continue; }
      for (let c = 0; c < 3; c++) rgba[i * 4 + c] = rgb[i * 3 + c];
      rgba[i * 4 + 3] = 255;
    }
  return rgba;
}


/** Tight bounding box of pixels with alpha above `t`. */
function alphaBox(rgba, w, h, t = 10) {
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (rgba[idx(x, y, w) * 4 + 3] > t) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
}

/**
 * The black-on-white rendition, cut cleanly: the shield is opaque inside its own coloured outline (holes
 * filled, so its white car and check strokes stay) and transparent outside; the wordmark is keyed from its
 * own darkness in its own black (#0D1014), which drops the JPEG specks that colour-to-alpha leaves behind.
 */
function lightOnWhite(rgb, w, h, xMax) {
  const rgba = Buffer.alloc(w * h * 4);
  const chroma = (i) => Math.max(rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]) - Math.min(rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]);
  // Shield: coloured pixels left of the wordmark, plus everything they enclose.
  const inShield = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < xMax; x++) if (chroma(idx(x, y, w)) > 36) inShield[idx(x, y, w)] = 1;
  const outside = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push(idx(x, 0, w), idx(x, h - 1, w));
  for (let y = 0; y < h; y++) stack.push(idx(0, y, w), idx(w - 1, y, w));
  while (stack.length) {
    const i = stack.pop();
    if (outside[i] || inShield[i]) continue;
    outside[i] = 1;
    const x = i % w, y = (i / w) | 0;
    if (x > 0) stack.push(i - 1);
    if (x < w - 1) stack.push(i + 1);
    if (y > 0) stack.push(i - w);
    if (y < h - 1) stack.push(i + w);
  }
  for (let y = 0; y < h; y++)
    for (let x = 0; x < xMax; x++) {
      const i = idx(x, y, w);
      let a = 0;
      if (!outside[i]) a = 1;
      else {
        // Anti-aliased rim: a pixel touching the shield keeps alpha in proportion to its colour.
        const near = (x > 0 && !outside[i - 1]) || (x < w - 1 && !outside[i + 1]) || (y > 0 && !outside[i - w]) || (y < h - 1 && !outside[i + w]);
        if (near) a = Math.min(1, chroma(i) / 40);
      }
      if (a > 0) for (let c = 0; c < 3; c++) rgba[i * 4 + c] = rgb[i * 3 + c];
      rgba[i * 4 + 3] = Math.round(a * 255);
    }
  // Wordmark: darkness is coverage.
  for (let y = 0; y < h; y++)
    for (let x = xMax; x < w; x++) {
      const i = idx(x, y, w);
      const L = 0.2126 * rgb[i * 3] + 0.7152 * rgb[i * 3 + 1] + 0.0722 * rgb[i * 3 + 2];
      let a = Math.max(0, Math.min(1, (232 - L) / (232 - 24)));
      if (a < 0.14) a = 0;
      rgba[i * 4] = 13;
      rgba[i * 4 + 1] = 16;
      rgba[i * 4 + 2] = 20;
      rgba[i * 4 + 3] = Math.round(a * 255);
    }
  return dropSpecks(rgba, w, h, 30);
}

const raw = (rgba, w, h) => sharp(rgba, { raw: { width: w, height: h, channels: 4 } });

async function cutout(name) {
  const { file, box } = SOURCES[name];
  const { data: rgb, info } = await sharp(file).extract(box).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const key = borderKey(rgb, w, h);
  let rgba = dropSpecks(colorToAlpha(rgb, w, h, key), w, h, 80);
  const end = shieldEnd(rgba, w, h);
  if (name === "dark") solidShieldOnKey(rgba, rgb, w, h, end, key);
  else rgba = lightOnWhite(rgb, w, h, end);
  const tight = alphaBox(rgba, w, h);
  console.log(`${name}: key rgb(${key}) → ${tight.width}×${tight.height}, shield ends at x=${end}`);
  return { png: await raw(rgba, w, h).extract(tight).png().toBuffer(), shieldEnd: end - tight.left };
}

await mkdir(out("public/brand"), { recursive: true });
const light = await cutout("light");
const dark = await cutout("dark");

/**
 * Drops the haze the screenshot crops carry: anything further than 3px from the solid mark (shield and
 * letters, alpha over 160) becomes transparent, so the anti-aliased edges stay and the ghost marks go.
 */
async function clearHaze(png) {
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height, r = 3;
  const solid = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) solid[i] = data[i * 4 + 3] > 160 ? 1 : 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let near = false;
      for (let dy = -r; dy <= r && !near; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) continue;
        for (let dx = -r; dx <= r; dx++) {
          const xx = x + dx;
          if (xx >= 0 && xx < w && solid[yy * w + xx]) {
            near = true;
            break;
          }
        }
      }
      if (!near) data[(y * w + x) * 4 + 3] = 0;
    }
  }
  return raw(data, w, h).png().toBuffer();
}

// Full-size PNGs (OG image, footer); 96px-tall WebPs for the nav (sharp at 32px on 3x screens).
for (const [name, { png }] of Object.entries({ light, dark })) {
  const clean = await clearHaze(png);
  await sharp(clean).png({ compressionLevel: 9 }).toFile(out(`public/brand/pruvo-logo-${name}.png`));
  await sharp(clean).resize({ height: 96, kernel: "lanczos3" }).webp({ quality: 70, alphaQuality: 70, effort: 6, smartSubsample: true }).toFile(out(`public/brand/pruvo-logo-${name}.webp`));
}

// Shield-only mark for icons: the navy rendition's solid shield, largest component only.
{
  const { data, info } = await sharp(dark.png).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;
  const { label, areas } = components(w, h, (i) => i % w < dark.shieldEnd && data[i * 4 + 3] > 0);
  const main = areas.indexOf(Math.max(...areas));
  for (let i = 0; i < w * h; i++) if (label[i] !== main) data[i * 4 + 3] = 0;
  const box = alphaBox(data, w, h);
  const shield = await raw(data, w, h).extract(box).png().toBuffer();
  await sharp(shield).png({ compressionLevel: 9 }).toFile(out("public/brand/pruvo-shield.png"));
  const sq = Math.max(box.width, box.height);
  const icon = async (size, pad, bg) => {
    const inner = Math.round(size * (1 - pad * 2));
    const fitted = await sharp(shield).resize({ width: inner, height: inner, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: "lanczos3" }).png().toBuffer();
    return sharp({ create: { width: size, height: size, channels: 4, background: bg } }).composite([{ input: fitted, gravity: "center" }]).png();
  };
  // Palette PNGs: the favicon is fetched on every first visit, so it stays a few KB.
  const lean = { palette: true, quality: 92, colours: 128, compressionLevel: 9, effort: 10 };
  await (await icon(64, 0.03, { r: 0, g: 0, b: 0, alpha: 0 })).png(lean).toFile(out("src/app/icon.png"));
  await (await icon(180, 0.16, { r: 12, g: 24, b: 60, alpha: 1 })).png(lean).toFile(out("src/app/apple-icon.png"));
  console.log(`shield: ${box.width}×${box.height} (square ${sq}) → icon.png 64, apple-icon.png 180`);
}
