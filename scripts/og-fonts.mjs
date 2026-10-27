// Downloads tiny TTF subsets of Archivo for the OG image (ImageResponse needs TTF/OTF/WOFF, and a
// local file keeps the image statically generated under Cache Components).
// Usage: node scripts/og-fonts.mjs   (outputs are committed)
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "src/assets/fonts");
const TEXT = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,:;'’+-–&()/?!%";

const variants = [
  { file: "Archivo-ExpandedSemiBold.ttf", axes: "wdth,wght@125,620" },
  { file: "Archivo-Regular.ttf", axes: "wdth,wght@100,430" },
];

await mkdir(dir, { recursive: true });
for (const { file, axes } of variants) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Archivo:${axes}&text=${encodeURIComponent(TEXT)}`, { headers: { "User-Agent": "Mozilla/5.0" } })).text();
  const url = css.match(/src:\s*url\(([^)]+)\)\s*format\('(truetype|opentype)'\)/)?.[1];
  if (!url) throw new Error(`No TTF in Google Fonts response for ${axes}:\n${css.slice(0, 300)}`);
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  await writeFile(path.join(dir, file), buf);
  console.log(`${file}: ${Math.round(buf.length / 1024)} KB`);
}
