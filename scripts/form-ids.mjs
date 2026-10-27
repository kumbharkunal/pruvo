// Re-reads the entry ids of Pruvo's Google Form (GET only, never submits) and compares them with the ids
// pinned in src/lib/booking.ts. Run it if Pruvo edits the form: node scripts/form-ids.mjs
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/lib/booking.ts", import.meta.url), "utf8");
const action = source.match(/action:\s*"([^"]+\/formResponse)"/)?.[1];
if (!action) throw new Error("No formResponse URL found in src/lib/booking.ts");
const viewUrl = action.replace(/\/formResponse$/, "/viewform");

const res = await fetch(viewUrl, { method: "GET", redirect: "follow" });
if (!res.ok) throw new Error(`GET ${viewUrl} returned ${res.status}`);
const html = await res.text();
const json = html.match(/FB_PUBLIC_LOAD_DATA_\s*=\s*(\[[\s\S]*?\]);\s*<\/script>/)?.[1];
if (!json) throw new Error("FB_PUBLIC_LOAD_DATA_ not found; the form page format may have changed.");

const data = JSON.parse(json);
const items = data?.[1]?.[1] ?? [];
const live = items
  .filter((item) => Array.isArray(item?.[4]))
  .map((item) => ({ title: item[1], entry: `entry.${item[4][0][0]}`, options: (item[4][0][1] ?? []).map((o) => o[0]) }));

const pinned = new Set([...source.matchAll(/"(entry\.\d+)"/g)].map((m) => m[1]));
console.log(`Form: ${viewUrl}\n`);
for (const f of live) {
  const mark = pinned.has(f.entry) ? "ok     " : "CHANGED";
  console.log(`${mark} ${f.entry.padEnd(18)} ${f.title}${f.options.length ? `  [${f.options.join(" | ")}]` : ""}`);
}
const missing = [...pinned].filter((e) => !live.some((f) => f.entry === e));
if (missing.length) console.log(`\nPinned but no longer on the form: ${missing.join(", ")}`);
process.exitCode = missing.length || live.some((f) => !pinned.has(f.entry)) ? 1 : 0;
