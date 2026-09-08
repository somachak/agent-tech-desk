# Agent Tech Engineering and Python Knowledge Base

Soma Pym's desk: the fourteen book guides and the agent walkthrough, plus somewhere to run the code and someone to ask. One Cloudflare Worker serves the lot.

## Run it locally

```bash
npm install       # wrangler + pyodide (dev dependencies)
npm run dev          # builds public/, then starts wrangler on http://localhost:8787
```

The tutor works with no key at all — it falls back to a small offline stand-in that answers the common questions and tells you how to connect the real one. Everything else is static.

## Deploy

```bash
npx wrangler login
npm run deploy
```

`npm run deploy` builds `public/` and then runs `wrangler deploy`. Free plan is enough: Workers static assets are not billed for requests, and the Worker only runs for `/api/*` and tidy URLs.

### The tutor's key

```bash
npx wrangler secret put MODEL_API_KEY     # paste the key when prompted
```

The key is issued from Meta's Model API console. The secret lives in Cloudflare, never in the repo. For local development put it in `.dev.vars` instead (copy `.dev.vars.example`); that file is git-ignored.

The Worker picks its engine in this order:

| Order | Engine | When |
|---|---|---|
| 1 | Meta Model API — `muse-spark-1.3` | `MODEL_API_KEY` is set |
| 2 | Workers AI — `@cf/meta/llama-3.1-8b-instruct` | an `AI` binding exists |
| 3 | Offline mock | neither — the site still runs |

To switch to Workers AI after deploying, add this to `wrangler.jsonc` and redeploy:

```jsonc
"ai": { "binding": "AI" }
```

Leave `MODEL_API_KEY` unset (or delete the secret) if you want the AI binding to take over.

## What is where

| Path | What it is |
|---|---|
| `content/` | The knowledge base attachment — the only source of curriculum. Not served directly. |
| `scripts/build.mjs` | Generates `public/` from `content/`: home, bookshelf, IDE, tutor, 14 guides, 14 cheat-sheet pages. |
| `worker/index.js` | Tidy URLs and `/api/tutor`. Everything else comes from the assets binding. |
| `app/` | Browser code: `ide.js`, `tutor.js`, and `examples.mjs` (the IDE's programs). |
| `public/` | Build output. Git-ignored — run `npm run build`. |
| `scripts/check.mjs` | The acceptance gates in `GATES.md`. `npm run check` runs them all. |

The bookshelf order, the phase names and every book's blurb are parsed out of `content/book-guides/index.html` at build time. Nothing about the curriculum is written in the build script, so the attachment stays the source of truth.

### Not published

The books themselves are copyrighted and are not in this repo. `scripts/check.mjs build` fails if any page starts referencing them.

## Checks

```bash
npm run check                 # all five
node scripts/check.mjs ide    # every IDE example really runs, in Pyodide
```

`ide` runs each of the five example programs through Pyodide 0.28.3 (CPython 3.13) in Node — the same build the browser loads — and asserts the real output. If an example stops working, that gate goes red.

## Pages

| URL | What |
|---|---|
| `/` | The desk |
| `/bookshelf` | 14 guides in the attachment's own order, in three phases |
| `/guides/<slug>` | One book's guide |
| `/guides/<slug>-cheatsheet` | The printable cheat sheet (`.md` alongside for the raw file) |
| `/ide` | Python in the browser, via Pyodide |
| `/tutor` | Meta Model API / Workers AI / offline mock |
| `/agent-walkthrough` | Four recorded agent runs, replayed step by step |
| `/api/tutor`, `/api/tutor/health` | The tutor endpoint and which engine is live |

## Notes

- British English throughout.
- The IDE keeps snippets in `localStorage` — on the device, never uploaded.
- Pyodide has no network and no `input()`. Standard library only.
- Catalogue percentages and supplier pages inside the lab are teaching fixtures, not regulatory advice.
