// Builds the hero's "engineering drawing" twin from the SAME photo, so it aligns pixel for pixel.
// Pipeline: grey + blur → Sobel → non-max thinning → hysteresis (inside the car only) → silhouette
// mask (navy backdrop removed) → composite on a deepened, gridded navy with a blue body fill.
import sharp from "sharp";

const NAVY = [12, 24, 60]; // bay-900
const LINE = [147, 179, 245]; // blue-300
const LINE_HI = [222, 232, 255]; // strong edges and outline
const FILL_DARK = [12, 28, 72];
const FILL_LIGHT = [52, 92, 186];

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const mix = (a, b, t) => a + (b - a) * t;

function quantile(values, q) {
  const s = Float32Array.from(values).sort();
  return s[Math.min(s.length - 1, Math.floor(q * s.length))] || 0;
}

/** Binary morphology with a square structuring element of radius r. */
function morph(mask, w, h, r, dilate) {
  const tmp = new Uint8Array(w * h), out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let v = dilate ? 0 : 1;
      for (let k = -r; k <= r; k++) {
        const xx = x + k;
        const m = xx < 0 || xx >= w ? 0 : mask[y * w + xx];
        if (dilate ? m : !m) { v = dilate ? 1 : 0; break; }
      }
      tmp[y * w + x] = v;
    }
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let v = dilate ? 0 : 1;
      for (let k = -r; k <= r; k++) {
        const yy = y + k;
        const m = yy < 0 || yy >= h ? 0 : tmp[yy * w + x];
        if (dilate ? m : !m) { v = dilate ? 1 : 0; break; }
      }
      out[y * w + x] = v;
    }
  return out;
}

function largestComponent(mask, w, h) {
  const label = new Int32Array(w * h).fill(-1);
  let best = -1, bestArea = 0, id = 0;
  for (let s = 0; s < w * h; s++) {
    if (!mask[s] || label[s] !== -1) continue;
    const stack = [s];
    label[s] = id;
    let area = 0;
    while (stack.length) {
      const p = stack.pop(), x = p % w, y = (p / w) | 0;
      area++;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const q = ny * w + nx;
        if (mask[q] && label[q] === -1) { label[q] = id; stack.push(q); }
      }
    }
    if (area > bestArea) { bestArea = area; best = id; }
    id++;
  }
  const out = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) out[i] = label[i] === best ? 1 : 0;
  return out;
}

function fillHoles(mask, w, h) {
  const outside = new Uint8Array(w * h), stack = [];
  const seed = (i) => { if (!mask[i] && !outside[i]) { outside[i] = 1; stack.push(i); } };
  for (let x = 0; x < w; x++) { seed(x); seed((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { seed(y * w); seed(y * w + w - 1); }
  while (stack.length) {
    const p = stack.pop(), x = p % w, y = (p / w) | 0;
    if (x > 0) seed(p - 1); if (x < w - 1) seed(p + 1); if (y > 0) seed(p - w); if (y < h - 1) seed(p + w);
  }
  const out = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) out[i] = outside[i] ? 0 : 1;
  return out;
}

/**
 * @returns {Promise<{ twin: Buffer, lineArt: Buffer, width: number, height: number, bbox: {x0:number,y0:number,x1:number,y1:number} }>}
 *   twin: RGB raw buffer; lineArt: RGBA raw buffer (lines only, transparent) for the OG image.
 */
export async function buildTwin(srcPath) {
  const { data: rgb, info } = await sharp(srcPath).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height, n = w * h;
  const { data: grey } = await sharp(srcPath).removeAlpha().greyscale().blur(1.3).raw().toBuffer({ resolveWithObject: true });

  // 1. Silhouette: anything that isn't the blue-navy backdrop/floor is car.
  let mask = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const r = rgb[i * 3], g = rgb[i * 3 + 1], b = rgb[i * 3 + 2];
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const navyLike = b - r > 14 && b >= g + 4 && lum < 0.34;
    mask[i] = navyLike ? 0 : 1;
  }
  mask = morph(morph(mask, w, h, 2, false), w, h, 2, true); // open: drop floor speckle
  mask = morph(morph(mask, w, h, 4, true), w, h, 4, false); // close: seal panel gaps
  mask = fillHoles(largestComponent(mask, w, h), w, h);

  // 2. Sobel + non-maximum suppression.
  const mag = new Float32Array(n), dir = new Uint8Array(n);
  for (let y = 1; y < h - 1; y++)
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const p = (dx, dy) => grey[i + dy * w + dx];
      const gx = -p(-1, -1) - 2 * p(-1, 0) - p(-1, 1) + p(1, -1) + 2 * p(1, 0) + p(1, 1);
      const gy = -p(-1, -1) - 2 * p(0, -1) - p(1, -1) + p(-1, 1) + 2 * p(0, 1) + p(1, 1);
      mag[i] = Math.hypot(gx, gy);
      const a = ((Math.atan2(gy, gx) * 180) / Math.PI + 180) % 180;
      dir[i] = a < 22.5 || a >= 157.5 ? 0 : a < 67.5 ? 1 : a < 112.5 ? 2 : 3;
    }
  const near = morph(mask, w, h, 3, true); // edges allowed just outside the silhouette too
  const thin = new Float32Array(n);
  const OFF = [[1, 0], [1, 1], [0, 1], [-1, 1]];
  for (let y = 1; y < h - 1; y++)
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (!near[i]) continue;
      const [dx, dy] = OFF[dir[i]];
      if (mag[i] >= mag[i + dy * w + dx] && mag[i] >= mag[i - dy * w - dx]) thin[i] = mag[i];
    }

  // 3. Hysteresis, thresholds from the car's own edge statistics.
  const inCar = [];
  for (let i = 0; i < n; i++) if (thin[i] > 0 && mask[i]) inCar.push(thin[i]);
  const hi = quantile(inCar, 0.86), lo = hi * 0.42;
  const edge = new Uint8Array(n), stack = [];
  for (let i = 0; i < n; i++) if (thin[i] >= hi) { edge[i] = 1; stack.push(i); }
  while (stack.length) {
    const p = stack.pop(), x = p % w, y = (p / w) | 0;
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 1 || ny < 1 || nx >= w - 1 || ny >= h - 1) continue;
        const q = ny * w + nx;
        if (!edge[q] && thin[q] >= lo) { edge[q] = 1; stack.push(q); }
      }
  }

  // 3b. Cut the floor shadow out of the silhouette. Per column, the car ends a little below its lowest
  // bright pixel (body, chrome, alloy rim); below that, keep only textured pixels (tyre sidewalls carry
  // edges, a smooth floor shadow doesn't).
  const textured = morph(edge, w, h, 5, true);
  const bottom = new Int32Array(w).fill(-1);
  for (let x = 0; x < w; x++)
    for (let y = h - 1; y >= 0; y--) {
      const i = y * w + x;
      if (mask[i] && grey[i] / 255 > 0.42) { bottom[x] = y; break; }
    }
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (mask[i] && y > bottom[x] + 6 && !textured[i]) mask[i] = 0;
    }
  mask = fillHoles(largestComponent(morph(morph(mask, w, h, 2, true), w, h, 2, false), w, h), w, h);
  const nearCar = morph(mask, w, h, 3, true);
  for (let i = 0; i < n; i++) if (!nearCar[i]) edge[i] = 0;

  let x0 = w, y0 = h, x1 = 0, y1 = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (mask[y * w + x]) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }

  // 4. Base layer: the photo's own backdrop deepened towards bay navy, a faint drawing grid, a blue body fill.
  const twin = Buffer.alloc(n * 3);
  const grid = Math.max(16, Math.round(w / 52));
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const lum = grey[i] / 255;
      let r = mix(rgb[i * 3] * 0.5, NAVY[0], 0.5), g = mix(rgb[i * 3 + 1] * 0.5, NAVY[1], 0.5), b = mix(rgb[i * 3 + 2] * 0.5, NAVY[2], 0.5);
      const onMinor = x % grid === 0 || y % grid === 0;
      const onMajor = x % (grid * 4) === 0 || y % (grid * 4) === 0;
      if (onMinor) { const t = onMajor ? 0.1 : 0.05; r = mix(r, LINE[0], t); g = mix(g, LINE[1], t); b = mix(b, LINE[2], t); }
      if (mask[i]) {
        const t = Math.pow(clamp01(lum), 0.85);
        const fr = mix(FILL_DARK[0], FILL_LIGHT[0], t), fg = mix(FILL_DARK[1], FILL_LIGHT[1], t), fb = mix(FILL_DARK[2], FILL_LIGHT[2], t);
        r = mix(r, fr, 0.8); g = mix(g, fg, 0.8); b = mix(b, fb, 0.8);
      }
      twin[i * 3] = r; twin[i * 3 + 1] = g; twin[i * 3 + 2] = b;
    }

  // 5. Line layer: edges (brighter where stronger), silhouette outline, a ground/length dimension line.
  const lines = Buffer.alloc(n * 4);
  const put = (i, col, a) => {
    const prev = lines[i * 4 + 3] / 255, na = Math.max(prev, a);
    if (na === prev) return;
    lines[i * 4] = col[0]; lines[i * 4 + 1] = col[1]; lines[i * 4 + 2] = col[2]; lines[i * 4 + 3] = Math.round(na * 255);
  };
  for (let i = 0; i < n; i++) {
    if (!edge[i]) continue;
    const s = clamp01(thin[i] / (hi * 1.6));
    put(i, [mix(LINE[0], LINE_HI[0], s), mix(LINE[1], LINE_HI[1], s), mix(LINE[2], LINE_HI[2], s)], 0.5 + 0.45 * s);
  }
  for (let y = 1; y < h - 1; y++)
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (mask[i] && (!mask[i - 1] || !mask[i + 1] || !mask[i - w] || !mask[i + w])) put(i, LINE_HI, 0.95);
    }
  const groundY = Math.min(h - 3, y1 + Math.round(h * 0.022));
  const tick = Math.round(h * 0.014);
  for (let x = x0; x <= x1; x++) put(groundY * w + x, LINE, 0.55);
  for (const tx of [x0, x1]) for (let y = groundY - tick; y <= groundY + tick; y++) put(y * w + tx, LINE, 0.7);

  const softLines = await sharp(lines, { raw: { width: w, height: h, channels: 4 } }).blur(0.45).raw().toBuffer();
  const composed = await sharp(twin, { raw: { width: w, height: h, channels: 3 } })
    .composite([{ input: softLines, raw: { width: w, height: h, channels: 4 } }])
    .removeAlpha()
    .raw()
    .toBuffer();

  return { twin: composed, lineArt: softLines, width: w, height: h, bbox: { x0, y0, x1, y1 } };
}
