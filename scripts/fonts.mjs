// Builds the page font: Archivo variable, cut to the Latin range and to the axis ranges the design uses.
// Source: google/fonts (OFL), cached in the git-ignored assets-src/fonts/. Run: node scripts/fonts.mjs
import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import subsetFont from "subset-font";

const SOURCE_URL = "https://raw.githubusercontent.com/google/fonts/main/ofl/archivo/Archivo%5Bwdth%2Cwght%5D.ttf";
const SOURCE = new URL("../assets-src/fonts/Archivo[wdth,wght].ttf", import.meta.url);
const OUT = new URL("../src/assets/fonts/archivo-latin-var.woff2", import.meta.url);

// Basic Latin plus the symbols the copy and readings use (µ m, °C, ≤, ranges, quotes, ©) and a few spares
// (rupee, apostrophes, dashes, bullet). Anything else, such as accented names typed into the form, falls
// back to the system font. Re-run after adding copy with new characters.
const RANGES = [
  [0x20, 0x7e], [0xa0, 0xa0], [0xa9, 0xa9], [0xb0, 0xb0], [0xb5, 0xb5], [0xb7, 0xb7], [0xd7, 0xd7], [0x2013, 0x2014],
  [0x2018, 0x2019], [0x201c, 0x201d], [0x2022, 0x2022], [0x2026, 0x2026], [0x20b9, 0x20b9], [0x2212, 0x2212], [0x2264, 0x2265],
];
const text = RANGES.flatMap(([a, b]) => Array.from({ length: b - a + 1 }, (_, i) => String.fromCodePoint(a + i))).join("");

async function source() {
  try {
    await stat(SOURCE);
  } catch {
    const res = await fetch(SOURCE_URL);
    if (!res.ok) throw new Error(`Download failed: ${res.status}`);
    await mkdir(new URL(".", SOURCE), { recursive: true });
    await writeFile(SOURCE, Buffer.from(await res.arrayBuffer()));
  }
  return readFile(SOURCE);
}

const out = await subsetFont(await source(), text, {
  targetFormat: "woff2",
  // Weights 400–700 and widths 87–125% are all the design uses (see DESIGN.md §3).
  variationAxes: { wght: { min: 400, max: 700, default: 400 }, wdth: { min: 87, max: 125, default: 100 } },
  keepFeatures: ["kern", "liga", "calt", "ccmp", "locl", "mark", "mkmk", "rvrn", "tnum", "lnum", "zero", "case"],
  noHinting: true,
});
await mkdir(new URL(".", OUT), { recursive: true });
await writeFile(OUT, out);
console.log(`archivo-latin-var.woff2: ${(out.length / 1024).toFixed(1)} KB`);
