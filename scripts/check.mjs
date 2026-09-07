/**
 * Gate checks. Usage: node scripts/check.mjs build|order|serve|secrets|all
 * Each mode prints a success-only token when every assertion passes.
 */
import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn, execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EXAMPLES } from "../app/examples.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public");
const problems = [];
const bad = (m) => problems.push(m);

const FORBIDDEN = [/private-do-not-upload/i, /books-md/i, /Formulaite-Agent-Lab-with-books/i];

async function checkBuild() {
  const need = [
    "index.html",
    "bookshelf.html",
    "ide.html",
    "tutor.html",
    "agent-walkthrough.html",
    "app/ide.js",
    "app/tutor.js",
    "downloads/Formulaite-Agent-Lab-source.zip",
    "downloads/book-guides-and-cheatsheets.zip",
  ];
  for (const f of need) if (!existsSync(path.join(OUT, f))) bad(`missing ${f}`);

  const guides = existsSync(path.join(OUT, "guides")) ? await readdir(path.join(OUT, "guides")) : [];
  const html = guides.filter((f) => f.endsWith(".html") && !f.endsWith("-cheatsheet.html"));
  const sheetPages = guides.filter((f) => f.endsWith("-cheatsheet.html"));
  const sheets = guides.filter((f) => f.endsWith("-cheatsheet.md"));
  if (html.length !== 14) bad(`expected 14 guide pages, found ${html.length}`);
  if (sheetPages.length !== 14) bad(`expected 14 cheat-sheet pages, found ${sheetPages.length}`);
  if (sheets.length !== 14) bad(`expected 14 raw cheat sheets, found ${sheets.length}`);
  if (guides.includes("index.html")) bad("guides/index.html should be replaced by /bookshelf");

  // no page may reference the private material
  for (const f of ["index.html", "bookshelf.html", "ide.html", "tutor.html", ...html.map((h) => "guides/" + h), ...sheetPages.map((h) => "guides/" + h)]) {
    const text = await readFile(path.join(OUT, f), "utf8");
    for (const re of FORBIDDEN) if (re.test(text)) bad(`${f} references ${re}`);
    if (!text.includes('class="sitebar"')) bad(`${f} has no site navigation`);
  }
  // the site bar must reach every feature from a guide page
  const guide = await readFile(path.join(OUT, "guides", html[0]), "utf8");
  for (const href of ["/bookshelf", "/ide", "/tutor"]) {
    if (!guide.includes(`href="${href}"`)) bad(`guide page does not link ${href}`);
  }
  console.log(`  ${html.length} guides, ${sheetPages.length} cheat-sheet pages (+${sheets.length} raw), 5 site pages, no private references`);
}

async function checkOrder() {
  const src = await readFile(path.join(ROOT, "content", "book-guides", "index.html"), "utf8");
  const built = await readFile(path.join(OUT, "bookshelf.html"), "utf8");
  const titles = (h) => [...h.matchAll(/<h3>([^<]+)<\/h3>/g)].map((m) => m[1]);
  const a = titles(src);
  const b = titles(built);
  if (a.length !== 14) bad(`the attachment lists ${a.length} books, expected 14`);
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    bad(`built order differs from the attachment:\n    attachment: ${a.join(" | ")}\n    built:      ${b.join(" | ")}`);
  }
  const phases = (h) => [...h.matchAll(/<h2>([^<]+)<\/h2>/g)].map((m) => m[1]);
  for (const p of phases(src)) if (!built.includes(p)) bad(`phase text missing from the bookshelf: ${p.slice(0, 40)}`);
  // every linked guide exists
  for (const m of built.matchAll(/href="\/guides\/([^"]+)"/g)) {
    const target = m[1].endsWith(".md") ? m[1] : m[1] + ".html";
    if (!existsSync(path.join(OUT, "guides", target))) bad(`bookshelf links a missing file: ${target}`);
  }
  console.log(`  14 books in the attachment's own order, 3 phases, every link resolves`);
}

function waitFor(url, tries = 60) {
  return new Promise((resolve, reject) => {
    const tick = async (n) => {
      try {
        const r = await fetch(url);
        if (r.ok || r.status === 404) return resolve();
      } catch {}
      if (n <= 0) return reject(new Error("server did not come up"));
      setTimeout(() => tick(n - 1), 500);
    };
    tick(tries);
  });
}

async function checkServe() {
  const port = Number(process.env.CHECK_PORT || 8799);
  const base = `http://127.0.0.1:${port}`;
  // reuse a dev server already on that port, otherwise start one
  let server = null;
  let log = "";
  const alreadyUp = await fetch(base + "/").then((r) => r.ok).catch(() => false);
  if (!alreadyUp) {
    server = spawn(
      path.join(ROOT, "node_modules", ".bin", "wrangler"),
      ["dev", "--port", String(port), "--ip", "127.0.0.1", "--local", "--log-level", "error"],
      { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, GROQ_API_KEY: "" } }
    );
    server.stdout.on("data", (d) => (log += d));
    server.stderr.on("data", (d) => (log += d));
  }
  try {
    await waitFor(base + "/");
    const get = async (p) => {
      const r = await fetch(base + p);
      return { status: r.status, text: await r.text(), type: r.headers.get("content-type") || "" };
    };
    const home = await get("/");
    if (home.status !== 200 || !home.text.includes("Agent Tech Engineering and Python Knowledge Base")) {
      bad(`/ returned ${home.status}`);
    }
    const shelf = await get("/bookshelf");
    if (shelf.status !== 200 || !shelf.text.includes("books, one build path")) bad(`/bookshelf returned ${shelf.status}`);
    const ide = await get("/ide");
    if (ide.status !== 200 || !ide.text.includes("pyodide")) bad(`/ide returned ${ide.status} or has no Pyodide`);
    const guide = await get("/guides/python-ai-programming-second-edition");
    if (guide.status !== 200 || !guide.text.includes("Build ladder")) bad(`a guide page returned ${guide.status}`);
    const sheet = await get("/guides/python-ai-programming-second-edition-cheatsheet");
    if (sheet.status !== 200 || !sheet.type.includes("text/html")) bad(`cheat-sheet page served as ${sheet.type}`);
    if (!sheet.text.includes("Vocabulary") || !sheet.text.includes("<table>")) bad("the cheat-sheet page did not render its tables");
    const raw = await get("/guides/python-ai-programming-second-edition-cheatsheet.md");
    if (raw.status !== 200) bad(`raw cheat sheet returned ${raw.status}`);
    const js = await get("/app/ide.js");
    if (js.status !== 200) bad(`/app/ide.js returned ${js.status}`);

    const health = await fetch(base + "/api/tutor/health").then((r) => r.json());
    if (health.engine !== "mock") bad(`health says engine=${health.engine}, expected mock with no key`);

    const ask = await fetch(base + "/api/tutor", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "What does **kwargs actually do?" }] }),
    }).then((r) => r.json());
    if (ask.engine !== "mock") bad(`tutor engine was ${ask.engine}`);
    if (!/kwargs/.test(ask.reply || "")) bad("the mock tutor did not answer the kwargs question");
    if (!ask.note) bad("the mock answer is not labelled as a mock");

    console.log(`  served / /bookshelf /ide a guide and a cheat sheet; mock tutor answered ${(ask.reply || "").length} chars`);
  } catch (err) {
    bad(`${err.message}\n${log.slice(-600)}`);
  } finally {
    if (server) server.kill("SIGTERM");
  }
}

async function checkSecrets() {
  const ignore = await readFile(path.join(ROOT, ".gitignore"), "utf8");
  for (const rule of ["public/", ".dev.vars", "node_modules/", ".wrangler/"]) {
    if (!ignore.includes(rule)) bad(`.gitignore does not cover ${rule}`);
  }
  const tracked = execSync("git ls-files", { cwd: ROOT }).toString().split("\n").filter(Boolean);
  for (const f of tracked) {
    if (/^\.dev\.vars$/.test(f) || f.startsWith("public/") || f.startsWith("node_modules/")) bad(`tracked but should not be: ${f}`);
    if (f.endsWith(".zip") || f.endsWith(".html") || f.endsWith(".md") || f.endsWith(".json")) continue;
    const text = await readFile(path.join(ROOT, f), "utf8").catch(() => "");
    if (/gsk_[A-Za-z0-9]{20,}/.test(text)) bad(`a Groq-shaped key appears in ${f}`);
  }
  for (const f of tracked.filter((f) => /\.(js|mjs|jsonc|json|md)$/.test(f))) {
    const text = await readFile(path.join(ROOT, f), "utf8").catch(() => "");
    if (/gsk_[A-Za-z0-9]{20,}/.test(text)) bad(`a Groq-shaped key appears in ${f}`);
  }
  console.log(`  ${tracked.length} tracked files, no key-shaped strings, ignores cover public/ and .dev.vars`);
}

/** Every IDE example must run in Pyodide — the same CPython 3.13 the browser loads. */
async function checkIde() {
  const { loadPyodide } = await import("pyodide");
  const py = await loadPyodide();
  const expect = {
    "star-args": ["('glycerin', 'retry')", "'passed': False"],
    dataclass: ["IngredientDrawer(inci_name='Glycerin'", "still missing:"],
    gate: ["PASS", "FAIL", "outside the catalogue range"],
    generator: ["[01] request", "[04] gate", "generator object"],
    loop: ["gate FAIL", "gate PASS", "drawer:"],
  };
  for (const ex of EXAMPLES) {
    let out = "";
    py.setStdout({ batched: (s) => (out += s + "\n") });
    py.setStderr({ batched: (s) => (out += s + "\n") });
    try {
      await py.runPythonAsync(ex.code);
    } catch (err) {
      bad(`example ${ex.id} raised: ${String(err.message || err).split("\n").slice(-3).join(" ")}`);
      continue;
    }
    if (!out.trim()) bad(`example ${ex.id} printed nothing`);
    for (const want of expect[ex.id] || []) {
      if (!out.includes(want)) bad(`example ${ex.id} output lacks ${JSON.stringify(want)}\n    got: ${out.slice(0, 220)}`);
    }
  }
  // the IDE page must offer exactly these, and load that same Pyodide build
  const html = await readFile(path.join(OUT, "ide.html"), "utf8");
  const version = (html.match(/pyodide\/v([\d.]+)\/full/) || [])[1];
  if (!version) bad("the IDE page does not pin a Pyodide version");
  const pkg = JSON.parse(await readFile(path.join(ROOT, "package.json"), "utf8"));
  const dev = (pkg.devDependencies || {}).pyodide || "";
  if (version && !dev.includes(version)) bad(`page loads Pyodide ${version} but the checked version is ${dev}`);
  for (const ex of EXAMPLES) if (!html.includes(ex.name)) bad(`the IDE page does not offer ${ex.name}`);
  console.log(`  ${EXAMPLES.length} examples ran in Pyodide ${version} (CPython ${py.runPython("import sys; sys.version.split()[0]")}) with the expected output`);
}

/** The Python Constructs course must be served whole, and its index must list every chapter. */
async function checkConstructs() {
  const dir = path.join(OUT, "python-constructs");
  const files = existsSync(dir) ? await readdir(dir) : [];
  const chapters = files.filter((f) => /^Chapter \d+\.dc\.html$/.test(f));
  if (chapters.length !== 7) bad(`expected 7 chapter files, found ${chapters.length}`);
  for (const f of ["Course.dc.html", "support.js", "dc-siblings.js", "Code.dc.html", "Flow.dc.html", "Trace.dc.html"]) {
    if (!files.includes(f)) bad(`python-constructs is missing ${f}`);
  }
  const ds = path.join(dir, "_ds");
  if (!existsSync(ds)) bad("python-constructs is missing its _ds design system");
  else {
    const inner = (await readdir(ds))[0];
    for (const f of ["styles.css", "_ds_bundle.js"]) {
      if (!existsSync(path.join(ds, inner, f))) bad(`_ds is missing ${f}`);
    }
  }
  if (existsSync(path.join(dir, "_gen", "__pycache__"))) bad("__pycache__ was copied into the site");

  const index = await readFile(path.join(OUT, "python-constructs.html"), "utf8");
  for (let n = 1; n <= 7; n++) {
    if (!index.includes(`/python-constructs/chapter-${n}`)) bad(`the index does not link chapter ${n}`);
  }
  if (!index.includes("/python-constructs/course")) bad("the index does not link the course map");
  // every chapter's real title must appear on the index
  for (const f of chapters.sort()) {
    const html = await readFile(path.join(dir, f), "utf8");
    const title = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [, ""])[1]
      .replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
    const onIndex = title.replace(/&/g, "&amp;");
    if (title && !index.includes(onIndex)) bad(`the index does not show the title of ${f}: ${title}`);
  }
  console.log(`  7 chapters + course map + design system served; index links and titles all match`);
}

const modes = { build: checkBuild, order: checkOrder, serve: checkServe, secrets: checkSecrets, ide: checkIde, constructs: checkConstructs };
const tokens = {
  build: "build verification passed",
  order: "order verification passed",
  serve: "serve verification passed",
  secrets: "secrets verification passed",
  ide: "ide verification passed",
  constructs: "constructs verification passed",
};

const mode = process.argv[2] || "all";
const run = mode === "all" ? Object.keys(modes) : [mode];
for (const m of run) {
  if (!modes[m]) {
    console.log("unknown mode " + m);
    process.exit(1);
  }
  await modes[m]();
  if (mode !== "all") {
    if (problems.length) {
      console.log(problems.map((p) => "FAILED: " + p).join("\n"));
      process.exit(1);
    }
    console.log(tokens[m]);
  }
}
if (mode === "all") {
  if (problems.length) {
    console.log(problems.map((p) => "FAILED: " + p).join("\n"));
    process.exit(1);
  }
  console.log("all verification passed");
}
