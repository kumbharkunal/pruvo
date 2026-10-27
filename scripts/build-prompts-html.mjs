// Builds docs/image-prompts.html from docs/IMAGE_PROMPTS.md so the two never drift apart.
// Usage: node scripts/build-prompts-html.mjs
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const md = await readFile(path.join(root, "docs/IMAGE_PROMPTS.md"), "utf8");

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const inline = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

// Summary table rows: "| 1 | `file` (size) | used | shown | edge |"
const rows = md
  .split("\n")
  .filter((l) => /^\|\s*\d+\s*\|/.test(l))
  .map((l) => l.split("|").slice(1, -1).map((c) => c.trim()));

// Prompt sections: "#### N. name" + meta paragraph + fenced prompt
const sections = md.split(/^#### /m).slice(1).map((chunk) => {
  const [titleLine, ...rest] = chunk.split("\n");
  const body = rest.join("\n");
  const fence = body.match(/```\n([\s\S]*?)\n```/);
  const meta = body.slice(0, fence ? fence.index : undefined).trim();
  return { title: titleLine.trim(), meta, prompt: fence ? fence[1].trim() : "" };
});

const cards = sections
  .map(
    (s, i) => `
    <article class="card" id="p${i + 1}">
      <header>
        <h2>${esc(s.title)}</h2>
        <button type="button" class="copy" data-target="t${i + 1}" aria-describedby="status">Copy prompt</button>
      </header>
      <p class="meta">${inline(s.meta)}</p>
      <pre id="t${i + 1}" tabindex="0">${esc(s.prompt)}</pre>
    </article>`,
  )
  .join("\n");

const table = rows
  .map(
    (r) =>
      `<tr><td>${esc(r[0])}</td><td>${inline(r[1])}</td><td>${inline(r[2])}</td><td>${inline(r[3])}</td><td>${inline(r[4])}</td></tr>`,
  )
  .join("\n");

const html = `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Pruvo image prompts</title>
<style>
  :root { --bay:#0C183C; --bay-950:#060D22; --bay-800:#14244F; --paper:#F4F7FB; --ink:#0E1838; --ink-700:#3A4566; --blue:#3B66CC; --blue-300:#93B3F5; --green:#548E45; --green-700:#3A6E2E; --line:#DCE3EE; }
  * { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
  body { margin: 0; background: var(--paper); color: var(--ink); font: 16px/1.55 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  .top { background: var(--bay); color: #fff; padding: 48px 16px 40px; }
  .wrap { max-width: 980px; margin: 0 auto; }
  .rule { width: 72px; height: 2px; background: linear-gradient(90deg, var(--blue) 0 60%, var(--green) 60% 100%); margin-bottom: 20px; }
  h1 { font-size: clamp(1.75rem, 1.2rem + 2.2vw, 2.6rem); line-height: 1.05; letter-spacing: -0.02em; margin: 0 0 12px; font-weight: 650; }
  .top p { color: #A9B5D6; max-width: 62ch; margin: 0; }
  main { padding: 32px 16px 80px; }
  .tablewrap { overflow-x: auto; margin: 0 0 40px; border: 1px solid var(--line); border-radius: 4px; background: #fff; }
  table { border-collapse: collapse; width: 100%; font-size: 14px; }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--line); vertical-align: top; }
  th { color: var(--ink-700); font-weight: 600; }
  tr:last-child td { border-bottom: 0; }
  code { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: .92em; background: #EEF2F8; padding: 1px 5px; border-radius: 3px; }
  .card { background: #fff; border: 1px solid var(--line); border-radius: 4px; padding: 20px; margin: 0 0 20px; }
  .card header { display: flex; gap: 16px; align-items: center; justify-content: space-between; flex-wrap: wrap; }
  h2 { font-size: 1.15rem; margin: 0; font-weight: 650; }
  .meta { color: var(--ink-700); margin: 8px 0 14px; font-size: 15px; }
  pre { white-space: pre-wrap; word-break: break-word; margin: 0; padding: 16px; background: var(--paper); border-radius: 4px; font: 14px/1.6 ui-monospace, SFMono-Regular, Consolas, monospace; color: var(--ink); max-height: 340px; overflow: auto; }
  pre:focus-visible, .copy:focus-visible { outline: 2px solid var(--blue); outline-offset: 2px; }
  .copy { appearance: none; border: 0; border-radius: 4px; background: var(--blue); color: #fff; font: 600 15px/1 system-ui, sans-serif; padding: 12px 16px; min-height: 44px; cursor: pointer; transition: background-color .18s cubic-bezier(.23,1,.32,1), transform .12s cubic-bezier(.23,1,.32,1); }
  .copy:active { transform: scale(.97); }
  .copy[data-done] { background: var(--green-700); }
  @media (hover: hover) and (pointer: fine) { .copy:hover { background: #2F55B0; } }
  #status { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
  @media (prefers-reduced-motion: reduce) { .copy { transition: none; } }
</style>
</head>
<body>
  <div class="top"><div class="wrap">
    <div class="rule" aria-hidden="true"></div>
    <h1>Pruvo image prompts</h1>
    <p>Paste each prompt into a fresh ChatGPT image chat. Save the PNG to <code>assets-src/images/</code> with the file name shown, then run <code>npm run images</code>. Generate the hero desktop first and attach it to the mobile hero; generate the inspector portrait early and attach it wherever the inspector appears.</p>
  </div></div>
  <main><div class="wrap">
    <div class="tablewrap">
      <table>
        <thead><tr><th>#</th><th>File</th><th>Used in</th><th>Displayed at</th><th>Edge colour</th></tr></thead>
        <tbody>
${table}
        </tbody>
      </table>
    </div>
${cards}
    <p id="status" role="status" aria-live="polite"></p>
  </div></main>
<script>
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".copy"); if (!btn) return;
    const text = document.getElementById(btn.dataset.target).innerText;
    try { await navigator.clipboard.writeText(text); }
    catch { const r = document.createRange(); r.selectNodeContents(document.getElementById(btn.dataset.target)); const s = getSelection(); s.removeAllRanges(); s.addRange(r); document.execCommand("copy"); s.removeAllRanges(); }
    btn.textContent = "Copied"; btn.dataset.done = "";
    document.getElementById("status").textContent = btn.closest(".card").querySelector("h2").textContent + " prompt copied";
    setTimeout(() => { btn.textContent = "Copy prompt"; delete btn.dataset.done; }, 1800);
  });
</script>
</body>
</html>
`;

await writeFile(path.join(root, "docs/image-prompts.html"), html);
console.log(`docs/image-prompts.html written: ${sections.length} prompts, ${rows.length} table rows`);
