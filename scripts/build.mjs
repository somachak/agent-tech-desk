/**
 * Build the static site into public/ from content/.
 *
 * content/ is the attachment (the knowledge base) and is the only source of
 * curriculum. This script never invents curriculum: the bookshelf order, the
 * phase names and every book's blurb are parsed out of the attachment's own
 * book-guides/index.html.
 *
 *   node scripts/build.mjs
 */
import { readFile, writeFile, mkdir, cp, rm, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = path.join(ROOT, "content");
const OUT = path.join(ROOT, "public");

const NAV = [
  ["/", "Desk"],
  ["/bookshelf", "Bookshelf"],
  ["/archive", "Archive"],
  ["/ide", "Python IDE"],
  ["/tutor", "Tutor"],
  ["/python-constructs", "Python constructs"],
  ["/agent-walkthrough", "Agent walkthrough"],
];

/* ------------------------------------------------------------------ parsing */

/** Pull the ordered books straight out of the attachment's bookshelf page. */
async function parseBookshelf() {
  const html = await readFile(path.join(CONTENT, "book-guides", "index.html"), "utf8");
  const phases = [];
  const sectionRe =
    /<section class="phase"><span class="num">([^<]+)<\/span><h2>([^<]+)<\/h2><div class="shelf">([\s\S]*?)<\/div><\/section>/g;
  let s;
  while ((s = sectionRe.exec(html))) {
    const [, name, blurb, shelf] = s;
    const books = [];
    const bookRe = /<div class="book"><div class="n">(\d+)<\/div><div>([\s\S]*?)<\/div><\/div>/g;
    let b;
    while ((b = bookRe.exec(shelf))) {
      const [, n, body] = b;
      const pick = (re) => (body.match(re) || [, ""])[1].trim();
      const levels = [...body.matchAll(/<i style="width:\d+px;background:var\(--accent(?:-(\d))?\)"><\/i>(\d+) (\w+)/g)]
        .map((m) => ({ count: Number(m[2]), level: m[3] }));
      books.push({
        n: Number(n),
        role: pick(/<span class="role">([^<]+)<\/span>/),
        title: pick(/<h3>([^<]+)<\/h3>/),
        meta: pick(/<p class="small">([^<]+)<\/p>/),
        blurb: pick(/<\/p><p>([\s\S]*?)<\/p>/),
        readWhen: pick(/<strong>Read when:<\/strong>([\s\S]*?)<\/p>/),
        levels,
        href: pick(/<a class="go" href="([^"]+)"/),
        sheet: pick(/<a href="([^"]+-cheatsheet\.md)"/),
      });
    }
    phases.push({ name, blurb, books });
  }
  if (!phases.length) throw new Error("could not parse the bookshelf — has content/book-guides/index.html changed?");
  return phases;
}

const slugOf = (href) => href.replace(/\.html$/, "");

/* ------------------------------------------------------------------ chrome */

const TOKENS = `
:root{color-scheme:light;
 --surface:#faf9f5;--surface-2:#f2f0e9;--surface-3:#e8e6dc;--surface-ink:#141413;--line:#d9d7cc;--line-soft:#e8e6dc;
 --ink:#141413;--ink-2:#5c5b57;--ink-3:#6b6a65;--on-ink:#faf9f5;
 --accent:#d97757;--accent-2:#6a9bcc;--accent-3:#788c5d;
 --font-head:"Poppins",Arial,sans-serif;--font-body:"Lora",Georgia,serif;--font-mono:ui-monospace,"SF Mono",Menlo,Consolas,monospace}
*{box-sizing:border-box}
html,body{margin:0;background:var(--surface);color:var(--ink-2);font-family:var(--font-body);font-size:17px;line-height:1.7}
h1,h2,h3,h4{font-family:var(--font-head);color:var(--ink);line-height:1.2;margin:0 0 10px;text-wrap:balance}
h1{font-size:38px;letter-spacing:-.02em;font-weight:600}
h2{font-size:25px;font-weight:600}
h3{font-size:18px;font-weight:600}
p{margin:0 0 12px;max-width:70ch}
strong{color:var(--ink)}
a{color:var(--ink);text-decoration-color:var(--accent);text-underline-offset:3px}
code,.mono{font-family:var(--font-mono);font-variant-numeric:tabular-nums}
code{font-size:.86em;background:var(--surface-3);padding:1px 5px;border-radius:5px;color:var(--ink)}
.small{font-size:14px;color:var(--ink-3)}
.eyebrow{font-family:var(--font-mono);color:var(--ink-3);font-size:12.5px;letter-spacing:.08em;text-transform:uppercase}
button,.btn{font-family:var(--font-head);font-weight:600;font-size:13.5px;border:1px solid var(--line);background:var(--surface-2);color:var(--ink);border-radius:10px;padding:8px 14px;cursor:pointer;text-decoration:none;display:inline-block}
button:hover,.btn:hover{border-color:var(--accent)}
button.go,.btn.go{background:var(--accent);border-color:var(--accent);color:#141413}
button:disabled{opacity:.5;cursor:default}
button:focus-visible,a:focus-visible,input:focus-visible,textarea:focus-visible{outline:2px solid var(--accent-2);outline-offset:2px}
@media(prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
`;

const SITE_NAV_CSS = `
.sitebar{position:sticky;top:0;z-index:50;background:rgba(250,249,245,.94);backdrop-filter:blur(6px);border-bottom:1px solid var(--line)}
.sitebar .in{max-width:1180px;margin:0 auto;padding:9px 22px;display:flex;flex-wrap:wrap;gap:6px 18px;align-items:baseline}
.sitebar .brand{font-family:var(--font-head);font-weight:600;color:var(--ink);text-decoration:none;font-size:14.5px;margin-right:6px}
.sitebar a.nav{font-family:var(--font-head);font-size:13.5px;color:var(--ink-2);text-decoration:none;padding:2px 0;border-bottom:2px solid transparent}
.sitebar a.nav:hover{color:var(--ink);border-color:var(--accent)}
.sitebar a.nav[aria-current=page]{color:var(--ink);border-color:var(--accent)}
.sitebar .spacer{flex:1}
`;

function siteBar(current) {
  const links = NAV.map(
    ([href, label]) =>
      `<a class="nav" href="${href}"${href === current ? ' aria-current="page"' : ""}>${label}</a>`
  ).join("");
  return `<nav class="sitebar"><div class="in"><a class="brand" href="/">Agent Tech &amp; Python Desk</a>${links}<span class="spacer"></span><a class="nav" href="/downloads/Formulaite-Agent-Lab-source.zip">Source zip</a></div></nav>`;
}

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">`;

function page({ title, current, head = "", body, wide = false }) {
  return `<!DOCTYPE html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>${FONTS}
<style>${TOKENS}${SITE_NAV_CSS}
main{max-width:${wide ? "1180px" : "980px"};margin:0 auto;padding:34px 22px 80px}
</style>${head}</head>
<body>${siteBar(current)}<main>${body}</main></body></html>`;
}

/* ------------------------------------------------------------------ pages */

function homePage(phases) {
  const total = phases.reduce((a, p) => a + p.books.length, 0);
  const cards = phases
    .map(
      (p) =>
        `<li><strong>${p.name}</strong> — ${p.books.map((b) => b.title).join("; ")}</li>`
    )
    .join("");
  return page({
    title: "Agent Tech Engineering and Python Knowledge Base",
    current: "/",
    body: `
<span class="eyebrow">Soma Pym · desk</span>
<h1>Agent Tech Engineering and Python Knowledge Base</h1>
<p>A plain-Python ingredient-research agent, an interactive lesson on how a request becomes a filled drawer, and ${total} book guides with cheat sheets — all phrased for Formulaite. Now with somewhere to run the code and someone to ask.</p>

<div class="grid">
  <a class="tile" href="/bookshelf"><b>Bookshelf — ${total} book guides</b><span>Build ladder → chapter map → concept cards by level → printable cheat sheet, per book.</span></a>
  <a class="tile" href="/archive"><b>Archive — everything, dated</b><span>Every guide newest first, with the date it was added and where its material came from.</span></a>
  <a class="tile" href="/ide"><b>Python IDE</b><span>Write and run Python in the browser. Nothing to install; your snippets stay on this device.</span></a>
  <a class="tile" href="/tutor"><b>Tutor</b><span>Ask about anything on the shelf. Answers in plain British English, numbered, with the code.</span></a>
  <a class="tile" href="/python-constructs"><b>Python constructs — 7 chapters</b><span>The Python Tutorial §4.8–§9.10, every example a Formulaite mini-programme, ending in a capstone.</span></a>
  <a class="tile" href="/agent-walkthrough"><b>How a request becomes a filled drawer</b><span>Replay four real runs of the agent step by step; cheat sheets for every Python construct in the code.</span></a>
  <a class="tile" href="/downloads/Formulaite-Agent-Lab-source.zip"><b>Download the Agent Lab source (zip)</b><span>agent_lab/ package, tests, gate scripts, docs. Run: python3 -m agent_lab Glycerin</span></a>
  <a class="tile" href="/downloads/book-guides-and-cheatsheets.zip"><b>Download all guides + cheat sheets (zip)</b><span>The same pages as static files, for offline use.</span></a>
</div>

<h2>The shelf, in its own order</h2>
<ul class="plain">${cards}</ul>
<p class="small">Catalogue percentages and supplier pages inside the lab are teaching fixtures, not regulatory advice.</p>
`,
    head: `<style>
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;margin:20px 0 34px}
.tile{background:var(--surface-2);border:1px solid var(--line);border-radius:14px;padding:18px 20px;text-decoration:none;color:var(--ink)}
.tile:hover{border-color:var(--accent)}
.tile b{font-family:var(--font-head);font-size:18px;display:block;margin-bottom:4px}
.tile span{color:var(--ink-2);font-size:15px}
ul.plain{padding-left:20px}ul.plain li{margin:6px 0}
</style>`,
  });
}

/**
 * The dated archive. content/guides.json is the sidecar that carries what the
 * bookshelf cannot: when each guide was added and where its material came from.
 * It is kept out of book-guides/index.html on purpose — that file's parser is
 * whitespace-sensitive regex and should not have to grow new fields.
 */
async function parseGuidesIndex() {
  const raw = await readFile(path.join(CONTENT, "guides.json"), "utf8");
  const list = JSON.parse(raw);
  if (!Array.isArray(list) || !list.length) throw new Error("content/guides.json is empty");
  for (const g of list) {
    if (!g.slug || !g.title || !g.dateAdded) throw new Error(`content/guides.json entry is missing slug/title/dateAdded: ${JSON.stringify(g)}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(g.dateAdded)) throw new Error(`${g.slug}: dateAdded must be YYYY-MM-DD, got ${g.dateAdded}`);
  }
  return list;
}

const DAY = 86400000;
const longDate = (iso) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const longMonth = (iso) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

function archivePage(entries, now = new Date()) {
  const sorted = [...entries].sort((a, b) => (a.dateAdded < b.dateAdded ? 1 : a.dateAdded > b.dateAdded ? -1 : 0));
  const cutoff = new Date(now.getTime() - 7 * DAY).toISOString().slice(0, 10);
  const recent = sorted.filter((g) => g.dateAdded >= cutoff);
  const older = sorted.filter((g) => g.dateAdded < cutoff);

  const card = (g) => `<article class="entry">
<div class="when"><time datetime="${g.dateAdded}">${longDate(g.dateAdded)}</time></div>
<div>
  <h3><a href="/guides/${g.slug}">${g.title}</a></h3>
  <p class="small meta">${g.role ? `<span class="role">${g.role}</span>` : ""}<span class="src">Source: ${g.source || "not recorded"}</span></p>
  <p class="links"><a class="btn go" href="/guides/${g.slug}">Open the guide</a> <a class="btn" href="/guides/${g.slug}-cheatsheet">Cheat sheet</a> <a class="btn" href="/guides/${g.slug}-cheatsheet.md">Raw Markdown</a></p>
</div>
</article>`;

  const groupBy = (list, key) => {
    const out = [];
    for (const g of list) {
      const k = key(g.dateAdded);
      const last = out[out.length - 1];
      if (last && last.k === k) last.items.push(g);
      else out.push({ k, items: [g] });
    }
    return out;
  };

  // Inside "this week" each entry already shows its own date in the left rail, so
  // day subheadings would just repeat it. Older entries get a month heading, where
  // the grouping earns its place.
  const flatSection = (id, heading, note, items) =>
    !items.length ? "" : `<section id="${id}"><h2>${heading}</h2><p class="small">${note}</p>${items.map(card).join("")}</section>`;
  const groupedSection = (id, heading, note, groups) =>
    !groups.length
      ? ""
      : `<section id="${id}"><h2>${heading}</h2><p class="small">${note}</p>` +
        groups.map((grp) => `<h3 class="daygroup">${grp.k}</h3>${grp.items.map(card).join("")}`).join("") +
        `</section>`;

  const olderGroups = groupBy(older, longMonth);
  const contents = [
    ...(recent.length ? [["Added this week", recent.length]] : []),
    ...olderGroups.map((g) => [g.k, g.items.length]),
  ];

  return page({
    title: "Archive",
    current: "/archive",
    body: `<span class="eyebrow">Archive</span>
<h1>Everything on the desk, newest first</h1>
<p>${entries.length} guides. Each one carries the date it was added and where its material came from, so this page is the way back in when you cannot remember what a thing was called.</p>

<nav class="toc"><strong>Contents</strong><ul>${contents.map(([k, n], i) => `<li><a href="#${i === 0 && recent.length ? "recent" : "previous"}">${k}</a> <span class="small">— ${n} guide${n === 1 ? "" : "s"}</span></li>`).join("")}</ul></nav>

${flatSection("recent", "Added this week", "The last seven days.", recent)}
${groupedSection("previous", "Previous", "Everything before that, newest month first.", olderGroups)}
${!older.length ? '<p class="small">Nothing older than a week yet — this section fills in as the desk grows.</p>' : ""}
`,
    head: `<style>
.toc{background:var(--surface-2);border:1px solid var(--line);border-radius:14px;padding:16px 20px;margin:22px 0 30px}
.toc strong{font-family:var(--font-head);display:block;margin-bottom:6px}
.toc ul{margin:0;padding-left:20px}.toc li{margin:3px 0}
section{margin-bottom:34px}
section h2{border-top:1px solid var(--line);padding-top:22px;margin-top:30px}
.daygroup{font-family:var(--font-mono);font-size:12.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3);font-weight:500;margin:24px 0 10px}
.entry{display:grid;grid-template-columns:170px 1fr;gap:18px;padding:16px 0;border-top:1px solid var(--line-soft)}
.entry:first-of-type{border-top:0}
.entry .when{font-family:var(--font-mono);font-size:13px;color:var(--ink-3);padding-top:3px}
.entry h3{margin-bottom:4px}
.entry h3 a{text-decoration-color:var(--accent)}
.entry .meta{margin-bottom:8px}
.entry .role{background:var(--surface-3);border-radius:999px;padding:2px 9px;margin-right:9px;font-family:var(--font-mono);font-size:12px}
.entry .links{margin:0;display:flex;flex-wrap:wrap;gap:8px}
@media(max-width:700px){.entry{grid-template-columns:1fr;gap:6px}.entry .when{padding-top:0}}
</style>`,
  });
}

function bookshelfPage(phases) {
  const total = phases.reduce((a, p) => a + p.books.length, 0);
  const sections = phases
    .map((p) => {
      const books = p.books
        .map((b) => {
          const bars = b.levels
            .map(
              (l, i) =>
                `<i style="width:${l.count * 6}px;background:var(--accent${
                  ["-3", "-2", ""][i] ?? ""
                })"></i>${l.count} ${l.level}`
            )
            .join("");
          return `<div class="book"><div class="n">${b.n}</div><div>
<span class="role">${b.role}</span><h3>${b.title}</h3>
<p class="small">${b.meta}</p><p>${b.blurb}</p>
<p class="small"><strong>Read when:</strong> ${b.readWhen}</p>
<div class="lv">${bars}</div>
<div class="links"><a class="btn go" href="/guides/${slugOf(b.href)}">Open the guide</a> <a class="btn" href="/guides/${slugOf(b.href)}-cheatsheet">Cheat sheet</a> <a class="btn" href="/ide?book=${slugOf(b.href)}">Try it in the IDE</a></div>
</div></div>`;
        })
        .join("");
      return `<section class="phase"><span class="eyebrow">${p.name}</span><h2>${p.blurb}</h2><div class="shelf">${books}</div></section>`;
    })
    .join("");
  return page({
    title: "Bookshelf",
    current: "/bookshelf",
    body: `<span class="eyebrow">Bookshelf</span><h1>${total} books, one build path</h1>
<p>Each guide turns one book into a build ladder, a chapter map, concept cards you tick off, and a printable cheat sheet — all phrased as Formulaite features.</p>
<div class="callout"><strong>Start here.</strong><ol><li>Open book 1 and read its Foundation cards.</li><li>Build its rung 1 — in the <a href="/ide">Python IDE</a> or in your editor.</li><li>Come back and open book 2.</li></ol></div>
${sections}`,
    head: `<style>
.callout{border-left:3px solid var(--accent);background:var(--surface-2);border-radius:0 12px 12px 0;padding:12px 16px;margin:16px 0}
.callout ol{margin:6px 0 0 18px;padding:0}.callout li{margin:4px 0}
.phase{margin-top:34px}
.shelf{display:grid;gap:12px;margin-top:12px}
.book{display:grid;grid-template-columns:54px 1fr;gap:14px;background:var(--surface-2);border:1px solid var(--line);border-radius:14px;padding:16px 18px}
.book .n{font-family:var(--font-head);font-size:28px;font-weight:600;color:var(--ink-3);line-height:1}
.book h3{margin:0 0 2px}
.book .role{font-family:var(--font-mono);font-size:12px;color:var(--ink-3);letter-spacing:.06em;text-transform:uppercase}
.book p{font-size:15px;margin:6px 0}
.book .links{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
.lv{display:flex;gap:6px;align-items:center;font-family:var(--font-mono);font-size:11.5px;color:var(--ink-3);margin-top:6px;flex-wrap:wrap}
.lv i{display:inline-block;height:8px;border-radius:0 3px 3px 0}
@media(max-width:640px){.book{grid-template-columns:1fr}}
</style>`,
  });
}

/* ------------------------------------------------------------------ IDE */

import { EXAMPLES } from "../app/examples.mjs";

function idePage() {
  const tabs = EXAMPLES.map(
    (e, i) => `<button class="ex${i === 0 ? " on" : ""}" data-id="${e.id}">${e.name}</button>`
  ).join("");
  return page({
    title: "Python IDE",
    current: "/ide",
    wide: true,
    body: `
<span class="eyebrow">Python IDE</span>
<h1>Run Python here</h1>
<p>Real Python, running inside this browser tab — nothing to install, nothing sent anywhere. Pick an example, press <strong>Run</strong>, change a number, run it again.</p>

<div class="callout"><strong>How to drive this page.</strong><ol>
<li>Wait for the status to say <em>ready</em> (the first load fetches Python; about 10 seconds).</li>
<li>Press <strong>▶ Run</strong>. Output appears on the right.</li>
<li>Edit the code, run again. <strong>Save snippet</strong> keeps it on this device; <strong>Ask the tutor</strong> sends it with your question.</li>
</ol></div>

<div class="tabs" id="exTabs">${tabs}<span class="spacer"></span><button id="snipBtn">My snippets</button></div>
<p class="small" id="exNote">${EXAMPLES[0].note}</p>

<div class="ide">
  <div class="pane">
    <div class="bar"><span>editor · main.py</span><span id="status">loading Python…</span></div>
    <textarea id="code" spellcheck="false" aria-label="Python code editor">${EXAMPLES[0].code.replace(/</g, "&lt;")}</textarea>
    <div class="acts">
      <button class="go" id="runBtn" disabled>▶ Run</button>
      <button id="resetBtn">Reset example</button>
      <button id="saveBtn">Save snippet</button>
      <button id="askBtn">Ask the tutor about this</button>
    </div>
  </div>
  <div class="pane">
    <div class="bar"><span>output</span><span id="timing"></span></div>
    <pre id="out" aria-live="polite">Press Run.</pre>
  </div>
</div>

<div id="snips" hidden><h2>My snippets</h2><p class="small">Saved in this browser only. They are not uploaded anywhere.</p><div id="snipList"></div></div>

<p class="small">Python runs through Pyodide (CPython compiled to WebAssembly). Packages from the standard library work; <code>input()</code> does not.</p>
`,
    head: `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.19/codemirror.min.css">
<style>
.callout{border-left:3px solid var(--accent);background:var(--surface-2);border-radius:0 12px 12px 0;padding:12px 16px;margin:16px 0}
.callout ol{margin:6px 0 0 18px;padding:0}.callout li{margin:4px 0}
.tabs{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0 8px;align-items:center}
.tabs .spacer{flex:1}
.tabs button.on{background:var(--accent);border-color:var(--accent)}
.ide{display:grid;grid-template-columns:1.05fr .95fr;gap:14px;margin-top:10px}
.ide>*{min-width:0}
.pane{background:var(--surface-ink);border-radius:14px;overflow:hidden;display:flex;flex-direction:column}
.pane .bar{background:var(--surface-3);color:var(--ink);font-family:var(--font-mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;padding:8px 14px;display:flex;justify-content:space-between;gap:10px}
#code{width:100%;min-height:430px;background:#0f0f0e;color:#faf9f5;border:0;font-family:var(--font-mono);font-size:13px;line-height:1.6;padding:12px 14px;resize:vertical}
.CodeMirror{height:430px;font-family:var(--font-mono);font-size:13px;line-height:1.6;background:#0f0f0e;color:#faf9f5}
.CodeMirror-gutters{background:#0f0f0e;border-right:1px solid #2c2c29}
.CodeMirror-linenumber{color:#6b6a65}
.CodeMirror-cursor{border-left:1px solid #faf9f5}
.CodeMirror-selected{background:#33332e!important}
.cm-keyword{color:#d97757}.cm-string{color:#788c5d}.cm-number{color:#6a9bcc}.cm-comment{color:#8a8880;font-style:italic}
.cm-def{color:#faf9f5}.cm-variable,.cm-variable-2,.cm-property{color:#e8e6dc}.cm-builtin{color:#6a9bcc}.cm-operator{color:#b0aea5}
.acts{display:flex;flex-wrap:wrap;gap:8px;padding:12px 14px;background:#1c1c1a;border-top:1px solid #2c2c29}
.acts button{background:#232320;border-color:#4a4944;color:var(--on-ink)}
.acts button.go{background:var(--accent);border-color:var(--accent);color:#141413}
#out{margin:0;flex:1;background:#0f0f0e;color:#e8e6dc;font-family:var(--font-mono);font-size:13px;line-height:1.6;padding:12px 14px;white-space:pre-wrap;overflow:auto;min-height:430px}
#out .err{color:#e79b7f}
#status,#timing{color:var(--ink-3);letter-spacing:.06em}
#snipList .snip{background:var(--surface-2);border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin:8px 0}
#snipList .snip pre{font-family:var(--font-mono);font-size:12.5px;background:var(--surface-3);border-radius:8px;padding:8px 10px;overflow-x:auto;max-height:150px}
@media(max-width:860px){.ide{grid-template-columns:1fr}}
</style>`,
    // scripts appended below in build()
  }).replace(
    "</body></html>",
    `<script>window.EXAMPLES=${JSON.stringify(EXAMPLES)};</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.19/codemirror.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.19/mode/python/python.min.js"></script>
<script src="https://cdn.jsdelivr.net/pyodide/v0.28.3/full/pyodide.js"></script>
<script src="/app/ide.js"></script></body></html>`
  );
}

/* ------------------------------------------------------------------ tutor */

function tutorPage(phases) {
  const options = phases
    .flatMap((p) => p.books)
    .map((b) => `<option value="${slugOf(b.href)}">${b.n}. ${b.title}</option>`)
    .join("");
  return page({
    title: "Tutor",
    current: "/tutor",
    body: `
<span class="eyebrow">Tutor</span>
<h1>Ask about anything on the shelf</h1>
<p>Answers come back in plain British English: the direct answer first, then numbered steps, then the code. Pick a book to give the tutor context, or leave it on <em>the whole shelf</em>.</p>

<div class="callout"><strong>How to drive this page.</strong><ol>
<li>Type a question — or press one of the starters below.</li>
<li>Press <strong>Ask</strong>. The answer appears underneath.</li>
<li>Anything with code gets a <strong>Send to the IDE</strong> button, so you can run it.</li>
</ol></div>

<div class="ctx">
  <label>Context <select id="book"><option value="">the whole shelf</option>${options}</select></label>
  <span class="small" id="engine">checking the tutor…</span>
</div>

<div class="starters">
  <button class="s">What does <code>**kwargs</code> actually do?</button>
  <button class="s">Explain the agent loop in five steps.</button>
  <button class="s">Show me a dataclass I can paste into the IDE.</button>
  <button class="s">What should I build first, and why?</button>
</div>

<form id="ask">
  <textarea id="q" rows="3" placeholder="Ask a question — for example: why does my drawer fail the gate?" aria-label="Your question"></textarea>
  <div class="row"><button class="go" id="send" type="submit">Ask</button><button type="button" id="clear">Clear thread</button></div>
</form>

<div id="thread" aria-live="polite"></div>
`,
    head: `<style>
.callout{border-left:3px solid var(--accent);background:var(--surface-2);border-radius:0 12px 12px 0;padding:12px 16px;margin:16px 0}
.callout ol{margin:6px 0 0 18px;padding:0}.callout li{margin:4px 0}
.ctx{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin:16px 0 10px;font-family:var(--font-head);font-size:13.5px;color:var(--ink-2)}
select{font-family:var(--font-body);font-size:15px;padding:7px 10px;border:1px solid var(--line);border-radius:10px;background:var(--surface-2);color:var(--ink)}
.starters{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}
.starters button{font-family:var(--font-body);font-weight:400;font-size:14.5px}
.starters code{font-size:.9em}
#q{width:100%;font-family:var(--font-body);font-size:16px;line-height:1.6;padding:12px 14px;border:1px solid var(--line);border-radius:12px;background:var(--surface-2);color:var(--ink);resize:vertical}
form .row{display:flex;gap:8px;margin-top:10px}
.turn{margin:18px 0}
.turn .who{font-family:var(--font-mono);font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3);margin-bottom:6px}
.turn.you .bubble{background:var(--surface-3);border:1px solid var(--line)}
.bubble{background:var(--surface-2);border:1px solid var(--line);border-radius:14px;padding:14px 18px}
.bubble p{margin:0 0 10px}.bubble p:last-child{margin:0}
.bubble ol,.bubble ul{margin:6px 0 10px 20px;padding:0}.bubble li{margin:4px 0}
.bubble pre{background:var(--surface-3);border:1px solid var(--line);border-radius:10px;padding:10px 12px;font-family:var(--font-mono);font-size:12.5px;line-height:1.6;overflow-x:auto}
.bubble .sendide{margin-top:6px}
.note{border-left:3px solid var(--accent-2);padding:2px 12px;margin-top:10px;font-size:14.5px;color:var(--ink-3)}
</style>`,
  }).replace("</body></html>", `<script src="/app/tutor.js"></script></body></html>`);
}

/* ------------------------------------------------------------------ guides */

/** Put the site bar on each guide page from the attachment, unchanged otherwise. */
function withSiteBar(html, extra = "") {
  const bar = siteBar("/bookshelf");
  const css = `<style>${SITE_NAV_CSS}
.sitebar{font-family:var(--font-head)}
body>main:first-of-type{padding-top:18px}
</style>`;
  return (
    html
      .replace("</head>", `${css}</head>`)
      .replace(/<body>/, `<body>${bar}${extra}`)
      // The guides cite the converted book text by its path in the local project.
      // That text is copyrighted and is not published, so the public copy says so.
      .replace(
        /Markdown copy: <code>books-md\/[^<]+<\/code>\./g,
        "The book itself is not published here — it is copyrighted."
      )
      .replace(
        /<code>books-md\/[^<]+<\/code>/g,
        "<em>the book text, kept off this site</em>"
      )
  );
}

/* ------------------------------------------- python constructs course */

const CHAPTER_FILE = /^Chapter (\d+)\.dc\.html$/;

/** Plain text from a fragment of the Mission Docs HTML. */
function plain(fragment) {
  return fragment
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/** Read the seven chapters straight out of the course's own files. */
async function parsePythonConstructs() {
  const dir = path.join(CONTENT, "python-constructs");
  const files = (await readdir(dir)).filter((f) => CHAPTER_FILE.test(f));
  const chapters = [];
  for (const f of files) {
    const html = await readFile(path.join(dir, f), "utf8");
    const n = Number(f.match(CHAPTER_FILE)[1]);
    const eyebrow = plain((html.match(/>(Part\s+[IVX]+[^<]*)</) || [, ""])[1]);
    const title = plain((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [, f])[1]);
    const lede = plain((html.match(/<x-import[^>]*Lede[^>]*>([\s\S]*?)<\/x-import>/) || [, ""])[1]);
    const part = (eyebrow.split("·")[0] || "").replace(/^Part\s*/, "").trim();
    chapters.push({ n, file: f, eyebrow, title, lede, part });
  }
  chapters.sort((a, b) => a.n - b.n);
  if (chapters.length < 7) throw new Error(`only ${chapters.length} Python Constructs chapters found`);
  return chapters;
}

function pythonConstructsPage(chapters) {
  const parts = [];
  for (const c of chapters) {
    const key = c.part || "Chapters";
    const last = parts[parts.length - 1];
    if (last && last.name === key) last.chapters.push(c);
    else parts.push({ name: key, chapters: [c] });
  }
  const sections = parts
    .map((p) => {
      const rows = p.chapters
        .map(
          (c) => `<a class="ch" href="/python-constructs/chapter-${c.n}">
<div class="n">${String(c.n).padStart(2, "0")}</div>
<div><b>${esc(c.title)}</b><span class="lede">${esc(c.lede)}</span></div>
<div class="go">Open →</div></a>`
        )
        .join("");
      return `<section class="part"><span class="eyebrow">Part ${esc(p.name)}</span><div class="chs">${rows}</div></section>`;
    })
    .join("");
  return page({
    title: "Python Constructs",
    current: "/python-constructs",
    body: `
<span class="eyebrow">Python constructs · Mission Docs</span>
<h1>The seven chapters, taught through Formulaite</h1>
<p>The official Python Tutorial, §4.8 to §9.10, rewritten so every example is a Formulaite mini-program — recipe cards, phases, Glass Box events, the ingredients shelf, draft lines, CSV export. It ends in a capstone: accept → recipe card → phase CSV, in plain Python, standard library only.</p>

<div class="callout"><strong>How to drive this section.</strong><ol>
<li>Start with the <a href="/python-constructs/course">course map</a> — it shows all seven chapters and tracks what you have finished.</li>
<li>Work down the chapters in order. Each one names the Tutorial section it covers.</li>
<li>Paste anything you want to try into the <a href="/ide">Python IDE</a> and run it.</li>
</ol></div>

<div class="mapcard">
  <a class="btn go" href="/python-constructs/course">Open the course map</a>
  <span class="small">These pages carry their own Mission Docs design, so they look different from the rest of the desk. That is deliberate — they came from a separate build.</span>
</div>

${sections}

<section>
  <h2>What the capstone needs</h2>
  <p>The chapters build towards one pipeline. These are the pieces it calls, in the order you meet them:</p>
  <div class="tablewrap"><table>
    <thead><tr><th>Piece</th><th>Chapter</th></tr></thead>
    <tbody>
      <tr><td class="t">format_inci_line(name, pct) · build_recipe_card_lines(ingredients)</td><td>01</td></tr>
      <tr><td class="t">add_to_phase(phase, ingredient, *, pct, function="emollient")</td><td>02</td></tr>
      <tr><td class="t">log_assistant_event(kind, *tags, **meta)</td><td>02</td></tr>
      <tr><td class="t">sorted(rows, key=lambda r: (-r["pct"], r["inci"]))</td><td>03</td></tr>
      <tr><td class="t">phase comprehensions — names, keepers, draft lines</td><td>04</td></tr>
      <tr><td class="t">Ingredient · FormulaPhase · FormulaDraft (total_pct, as_recipe_lines)</td><td>05</td></tr>
      <tr><td class="t">stream_assistant_tokens(reply) · iter_phase_csv_rows(phase)</td><td>06</td></tr>
      <tr><td class="t">the whole pipeline, stitched</td><td>07</td></tr>
    </tbody>
  </table></div>
  <p class="small">Source: the course's own README. Progress is stored in your browser under <code>pyconstructs.progress</code>, so ticking a chapter off is remembered on this device only.</p>
</section>
`,
    head: `<style>
.callout{border-left:3px solid var(--accent);background:var(--surface-2);border-radius:0 12px 12px 0;padding:12px 16px;margin:16px 0}
.callout ol{margin:6px 0 0 18px;padding:0}.callout li{margin:4px 0}
.mapcard{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin:18px 0 8px}
.mapcard .small{max-width:60ch}
.part{margin-top:32px}
.chs{display:grid;gap:10px;margin-top:10px}
.ch{display:grid;grid-template-columns:52px 1fr auto;gap:14px;align-items:center;background:var(--surface-2);border:1px solid var(--line);border-radius:14px;padding:14px 18px;text-decoration:none;color:var(--ink)}
.ch:hover{border-color:var(--accent)}
.ch .n{font-family:var(--font-head);font-size:26px;font-weight:600;color:var(--ink-3);line-height:1}
.ch b{font-family:var(--font-head);font-size:17px;display:block;margin-bottom:2px}
.ch .lede{font-size:15px;color:var(--ink-2);display:block}
.ch .go{font-family:var(--font-head);font-size:13px;color:var(--ink-3);white-space:nowrap}
.ch:hover .go{color:var(--ink)}
table{width:100%;border-collapse:collapse;font-size:14.5px;margin:8px 0 12px}
th{font-family:var(--font-head);font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-3);text-align:left;padding:6px 8px;border-bottom:1px solid var(--line)}
td{padding:7px 8px;border-bottom:1px solid var(--line-soft);vertical-align:top}
td.t{font-family:var(--font-mono);font-size:12.5px;color:var(--ink)}
.tablewrap{overflow-x:auto}
@media(max-width:640px){.ch{grid-template-columns:40px 1fr}.ch .go{display:none}}
</style>`,
  });
}

/* ------------------------------------------------- cheat sheets as pages */

const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
const inline = (s) =>
  esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");

/** Render the subset of Markdown the cheat sheets actually use. */
function md2html(md) {
  const lines = md.split("\n");
  let html = "";
  let i = 0;
  let list = null;
  const closeList = () => {
    if (list) {
      html += `</${list}>`;
      list = null;
    }
  };
  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const body = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) body.push(lines[i++]);
      i++;
      closeList();
      html += `<pre data-lang="${esc(lang)}"><code>${esc(body.join("\n"))}</code></pre>`;
      continue;
    }

    if (/^\s*\|/.test(line) && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1] || "")) {
      const row = (l) =>
        l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const head = row(line);
      i += 2;
      const body = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) body.push(row(lines[i++]));
      closeList();
      html +=
        `<div class="tablewrap"><table><thead><tr>${head.map((h) => `<th>${inline(h)}</th>`).join("")}</tr></thead><tbody>` +
        body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("") +
        `</tbody></table></div>`;
      continue;
    }

    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      closeList();
      const level = h[1].length;
      const id = h[2].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      html += `<h${level} id="${id}">${inline(h[2])}</h${level}>`;
      i++;
      continue;
    }

    const box = line.match(/^\s*[-*]\s+\[( |x)\]\s+(.*)$/i);
    if (box) {
      if (list !== "ul-check") {
        closeList();
        html += '<ul class="check">';
        list = "ul-check";
      }
      html += `<li><input type="checkbox"${box[1].toLowerCase() === "x" ? " checked" : ""}><span>${inline(box[2])}</span></li>`;
      i++;
      continue;
    }
    const ul = line.match(/^\s*[-*]\s+(.*)$/);
    if (ul) {
      if (list !== "ul") {
        closeList();
        html += "<ul>";
        list = "ul";
      }
      html += `<li>${inline(ul[1])}</li>`;
      i++;
      continue;
    }
    const ol = line.match(/^\s*(\d+)[.)]\s+(.*)$/);
    if (ol) {
      if (list !== "ol") {
        closeList();
        html += "<ol>";
        list = "ol";
      }
      html += `<li>${inline(ol[2])}</li>`;
      i++;
      continue;
    }

    if (!line.trim()) {
      closeList();
      i++;
      continue;
    }
    closeList();
    html += `<p>${inline(line)}</p>`;
    i++;
  }
  closeList();
  return html.replace(/<\/ul class="check">/g, "</ul>").replace(/<\/ul-check>/g, "</ul>");
}

function cheatSheetPage(slug, md) {
  const title = (md.match(/^#\s+(.*)$/m) || [, slug])[1];
  // the sheet's footer cites the converted book text, which is not published here
  md = md.replace(/`books-md\/[^`]+`/g, "the book itself (kept off this site)");
  return page({
    title,
    current: "/bookshelf",
    body: `<div class="topbar"><a class="btn" href="/guides/${slug}">← The full guide</a> <a class="btn" href="/ide?book=${slug}">Try it in the IDE</a> <a class="btn" href="/tutor?book=${slug}">Ask the tutor</a> <button class="btn" onclick="window.print()">Print</button> <a class="btn" href="/guides/${slug}-cheatsheet.md">Raw Markdown</a></div>
<article class="sheet">${md2html(md)}</article>`,
    head: `<style>
.topbar{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px}
.sheet h1{margin-bottom:6px}
.sheet h2{margin-top:30px;border-top:1px solid var(--line);padding-top:18px}
.sheet h3{margin-top:18px}
.sheet table{width:100%;border-collapse:collapse;font-size:14.5px;margin:8px 0 14px}
.sheet th{font-family:var(--font-head);font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-3);text-align:left;padding:6px 8px;border-bottom:1px solid var(--line)}
.sheet td{padding:7px 8px;border-bottom:1px solid var(--line-soft);vertical-align:top}
.sheet td:first-child{font-family:var(--font-mono);font-size:13px;color:var(--ink)}
.tablewrap{overflow-x:auto}
.sheet pre{background:var(--surface-3);border:1px solid var(--line);border-radius:12px;padding:12px 14px;font-family:var(--font-mono);font-size:12.5px;line-height:1.6;overflow-x:auto}
.sheet ul,.sheet ol{padding-left:20px}.sheet li{margin:4px 0}
.sheet ul.check{list-style:none;padding:0}
.sheet ul.check li{display:flex;gap:10px;align-items:flex-start}
.sheet ul.check input{margin-top:6px;accent-color:#788c5d}
@media print{.sitebar,.topbar{display:none}main{padding:0;max-width:none}body{font-size:11.5px}.sheet h2{margin-top:16px;padding-top:10px}}
</style>`,
  });
}

/* ------------------------------------------------------------------ build */

async function build() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(path.join(OUT, "guides"), { recursive: true });
  await mkdir(path.join(OUT, "app"), { recursive: true });

  const phases = await parseBookshelf();

  await writeFile(path.join(OUT, "index.html"), homePage(phases));
  await writeFile(path.join(OUT, "bookshelf.html"), bookshelfPage(phases));
  const guideIndex = await parseGuidesIndex();
  await writeFile(path.join(OUT, "archive.html"), archivePage(guideIndex));
  await writeFile(path.join(OUT, "ide.html"), idePage());
  await writeFile(path.join(OUT, "tutor.html"), tutorPage(phases));

  // the attachment's guides and cheat sheets
  const files = await readdir(path.join(CONTENT, "book-guides"));
  for (const f of files) {
    const src = path.join(CONTENT, "book-guides", f);
    if (f === "index.html") continue; // replaced by /bookshelf
    if (f.endsWith(".html")) {
      const html = await readFile(src, "utf8");
      const slug = f.replace(/\.html$/, "");
      const back = `<div style="max-width:980px;margin:0 auto;padding:14px 22px 0"><a class="btn" href="/bookshelf">← Bookshelf</a> <a class="btn" href="/guides/${slug}-cheatsheet">Cheat sheet</a> <a class="btn" href="/ide?book=${slug}">Try it in the IDE</a> <a class="btn" href="/tutor?book=${slug}">Ask the tutor</a></div>`;
      await writeFile(path.join(OUT, "guides", f), withSiteBar(html, back));
    } else if (f.endsWith("-cheatsheet.md")) {
      const md = await readFile(src, "utf8");
      const slug = f.replace(/-cheatsheet\.md$/, "");
      await writeFile(path.join(OUT, "guides", `${slug}-cheatsheet.html`), cheatSheetPage(slug, md));
      await cp(src, path.join(OUT, "guides", f));   // raw copy, still downloadable
    } else {
      await cp(src, path.join(OUT, "guides", f));
    }
  }

  // the Python Constructs course, served as it was built
  const constructs = await parsePythonConstructs();
  await cp(path.join(CONTENT, "python-constructs"), path.join(OUT, "python-constructs"), {
    recursive: true,
    filter: (src) => !src.includes("__pycache__"),
  });
  await writeFile(path.join(OUT, "python-constructs.html"), pythonConstructsPage(constructs));

  // the agent walkthrough
  const walk = await readFile(path.join(CONTENT, "visual-guide.html"), "utf8");
  await writeFile(path.join(OUT, "agent-walkthrough.html"), withSiteBar(walk));

  // downloads (public ones only — nothing from private-do-not-upload)
  await cp(path.join(CONTENT, "downloads"), path.join(OUT, "downloads"), { recursive: true });

  // browser code
  for (const f of ["ide.js", "tutor.js"]) {
    await cp(path.join(ROOT, "app", f), path.join(OUT, "app", f));
  }

  const count = phases.reduce((a, p) => a + p.books.length, 0);
  console.log(`built public/ — ${count} books, ${files.length - 1} guide files, ${guideIndex.length} archive entries, ${constructs.length} construct chapters, 6 site pages`);
}

if (!existsSync(path.join(CONTENT, "book-guides", "index.html"))) {
  throw new Error("content/book-guides/index.html is missing — the knowledge base attachment is the source of truth");
}
await build();
