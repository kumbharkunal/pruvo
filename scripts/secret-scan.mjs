// Fails (exit 1) if any tracked file, or any commit about to be pushed, contains a secret.
// Usage:
//   node scripts/secret-scan.mjs              scan every tracked file
//   node scripts/secret-scan.mjs --pre-push   also scan the commits on stdin (git pre-push hook format)
import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";

const PATTERNS = [
  ["21st.dev API key", /21st_sk_[0-9a-f]{20,}/],
  ["OpenAI-style secret key", /\bsk-(?:proj-)?[A-Za-z0-9_-]{24,}/],
  ["GitHub token", /\bgh[pousr]_[A-Za-z0-9]{30,}/],
  ["AWS access key id", /\bAKIA[0-9A-Z]{16}\b/],
  ["Google API key", /\bAIza[0-9A-Za-z_-]{35}\b/],
  ["Slack token", /\bxox[baprs]-[A-Za-z0-9-]{10,}/],
  ["Private key block", /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
];

const git = (...args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
const findings = [];

function scanText(label, text) {
  for (const [name, re] of PATTERNS) {
    const m = text.match(re);
    if (m) findings.push(`${label}: ${name} (${m[0].slice(0, 12)}…)`);
  }
}

// 1) Tracked files
for (const file of git("ls-files", "-z").split("\0").filter(Boolean)) {
  try {
    if (statSync(file).size > 8 * 1024 * 1024) continue;
    const buf = readFileSync(file);
    if (buf.includes(0)) continue; // binary
    scanText(file, buf.toString("utf8"));
  } catch {
    /* deleted in the working tree */
  }
}

// 2) Commits being pushed (pre-push hook passes "<local ref> <local sha> <remote ref> <remote sha>" lines)
if (process.argv.includes("--pre-push")) {
  const stdin = readFileSync(0, "utf8");
  const ZERO = /^0+$/;
  for (const line of stdin.split("\n").filter(Boolean)) {
    const [, localSha, , remoteSha] = line.split(" ");
    if (!localSha || ZERO.test(localSha)) continue; // branch deletion
    const range = !remoteSha || ZERO.test(remoteSha) ? localSha : `${remoteSha}..${localSha}`;
    scanText(`commits ${range}`, git("log", "-p", "--no-color", range));
  }
}

if (findings.length) {
  console.error("Secret scan FAILED. Nothing was pushed.\n" + findings.map((f) => "  - " + f).join("\n"));
  process.exit(1);
}
console.log("Secret scan passed: no secrets in tracked files" + (process.argv.includes("--pre-push") ? " or outgoing commits." : "."));
