// Screenshots the site at every QA width (first screen + optional full page) using the installed Chrome.
// Usage: node scripts/shots.mjs [url] [--out dir] [--full] [--widths 360,1440] [--reduced] [--devices]
import { chromium, devices } from "playwright-core";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};
const url = args.find((a) => /^https?:\/\//.test(a)) ?? "http://localhost:4400";
const out = path.resolve(opt("--out", "lab/shots"));
const widths = opt("--widths", "320,360,375,390,414,768,1024,1280,1440,1920").split(",").map(Number);
const full = flag("--full");
const reduced = flag("--reduced");

await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });

/** Walks the page in viewport steps (window.scrollTo moves Lenis too), so lazy images load and once-only reveals fire. */
async function walk(page) {
  const step = await page.evaluate(() => Math.round(window.innerHeight * 0.6));
  for (let y = 0; ; y += step) {
    const height = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), Math.min(y, height));
    await page.waitForTimeout(140);
    if (y >= height) break;
  }
  // Images in hidden panes never load (lazy + display:none), so wait only for rendered ones, and never forever.
  await page.evaluate(() => {
    const pending = [...document.images].filter((img) => !img.complete && img.checkVisibility());
    return Promise.race([Promise.all(pending.map((img) => img.decode().catch(() => null))), new Promise((r) => setTimeout(r, 5000))]);
  });
  await page.waitForTimeout(900);
}

async function shoot(name, contextOptions) {
  const context = await browser.newContext({ ...contextOptions, reducedMotion: reduced ? "reduce" : "no-preference" });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(2600); // hero intro + handoff
  await page.screenshot({ path: path.join(out, `${name}-first.png`) });
  const overflow = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));
  if (full) {
    await walk(page);
    // Pinned sections hold their scroll position; capture from the top so the page reads in order.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(out, `${name}-full.png`), fullPage: true });
  }
  console.log(`${name}: horizontal overflow ${overflow}px${errors.length ? ` | console errors: ${errors.join(" / ")}` : ""}`);
  await context.close();
}

for (const w of widths) await shoot(`w${w}`, { viewport: { width: w, height: w < 768 ? 844 : w < 1600 ? 900 : 1080 } });
if (flag("--devices")) {
  await shoot("pixel7", devices["Pixel 7"]);
  await shoot("iphone15", devices["iPhone 15"] ?? devices["iPhone 14"]);
}
await browser.close();
