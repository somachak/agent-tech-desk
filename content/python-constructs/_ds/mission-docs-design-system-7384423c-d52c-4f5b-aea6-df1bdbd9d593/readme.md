# Mission Docs — Design System

A print-first design system for **generating beautiful PDF documents**, plus the reader surface those documents are published on.

The brand's whole argument is that a document should be worth keeping. Everything here follows from that: real page geometry instead of scrolling layouts, hairline rules instead of boxes, paper grain instead of gradients, and a palette that reads as ink on stock rather than pixels on glass.

## Sources

| Source | What it gave us |
| --- | --- |
| `uploads/CleanShot 2026-08-22 at 11.43.43@2x.png` | The only visual reference: a printed portfolio volume photographed on a slate-blue desk. Off-white stock, navy display type and heavy navy band, terracotta line-pattern and mono tick marks, uppercase geometric sans. The entire palette is sampled from this image. |
| User brief | "Mission beautiful Docs." Palette from the snapshot plus black, dark gray and the snapshot navy as text colors. Navy leads, terracotta accents. Print texture carried over in full. Surface to build: docs reader / published site. Type: **General Sans**. |

No codebase, Figma file, logo or slide deck was provided. There is **no logo** in the sources, so the brand mark is set in type (see Iconography). Component inventory and UI-kit screens are therefore authored from the palette reference and the brief — they are not recreations of an existing product, and any real product screens should be treated as the higher authority once they exist.

---

## Content fundamentals

**Voice.** Flat, declarative, printer's-shop plain. State the thing, stop. The reference object is a portfolio, not an ad — captions and labels do the talking, never a headline.

**Person.** Documents are impersonal: no "we", no "you" inside a page's content. Reader-UI copy speaks in the imperative — "Download PDF", "Copy link", "Search this document" — and only says "you" when it must ("You don't have access to this document").

**Casing.**

- Cover and section titles: **UPPERCASE** for covers, sentence case for interior headings. Never Title Case.
- Eyebrows and labels: uppercase, tracked `0.16em`.
- Tick marks and numerals: uppercase mono, tracked `0.22em`.
- Buttons: sentence case ("Download PDF", not "Download Pdf" or "DOWNLOAD PDF").

**Numbers.** Zero-padded and paired, as on the cover: `001_044`, `007_044`. Years take a leading em dash: `—2025`. Figures and tables are numbered `FIG.03`, `Table 02`. Tabular figures everywhere.

**Length.** Ledes are two or three sentences. Captions stop near 46 characters per line. Body paragraphs cap at 68 characters. If a sentence needs a semicolon and a subclause, it wants to be two sentences.

**Emoji.** Never. Not in documents, not in the reader UI, not in empty states.

**Examples, verbatim in the voice:**

- Cover: `—2025` / `PORTFÓLIO` / `trabalhos selecionados` / `001_044`
- Section opener: `02` / `Method` / "How the survey was run."
- Callout: **Note** — "Figures are self-reported and unaudited."
- Empty state: "Nothing here yet. Published documents appear in this list."
- Error: "That link expired. Ask the owner for a new one."
- Never: "Let's dive in!", "Oops!", "Supercharge your docs".

---

## Visual foundations

### Color

Navy is primary and does all structural work: display type, section rules, the heavy cover band, primary buttons. Terracotta is the accent and appears only in small quantities — tick marks, figure numbers, eyebrows, pattern fields, hover states. Black and dark gray set text: `ink-000` for near-black emphasis and primary text, `ink-700` for running body copy, `ink-500` for captions and mono labels. Slate is the *desk* the document sits on and is never a text color. Paper tints are the only backgrounds a document ever has.

Ratio in practice: roughly 70% paper, 20% ink, 8% navy, 2% terracotta.

### Type

One family, **General Sans** (Fontshare), 300–700; **JetBrains Mono** for every numeral, tick and label. Weights 400 and 600 do nearly all the work; 700 is reserved for cover display. Display type is tracked negative (`-0.02em` at cover size), body sits at 0, and all small uppercase text is tracked wide. Print floor is 14px / 10.5pt body — nothing smaller than 9px anywhere, and 9px only for mono ticks.

### Backgrounds and texture

No photography is provided and none is invented. Backgrounds are flat paper tints. **Grain is real and used in full**: a `feTurbulence` noise field multiplied at 26% over every paper surface (`--texture-grain`, or the `.grain` helper class). Gradients do not exist in this system — not in headers, not behind hero text, not as protection scrims. Where text needs separation from a field, it gets a rule or a solid block, never a fade.

The reference's terracotta line-pattern reads as a *field*, not an illustration: repeating hairline diagonals in `terra-600` over paper, with occasional navy blocks punched into it. Use it as a cover or divider element only, never behind body copy.

### Rules, borders, cards

Rules are the primary structural device, at five weights: `0.5px` hairline (`rule-hairline`, table rows and captions), `1px` ink, `2px` navy (section titles, table headers), `4px` terracotta (pull quotes), `10px` navy (cover band). Vertical rules are rare; table cells never have them.

Cards barely exist. Where a screen needs one it is paper-white with a single `1px` `--border-card` hairline and **no shadow**. There is no elevated-card aesthetic here, and no colored-left-border card — that pattern is explicitly out.

### Corners

Print language: `0` is the default and applies to every page, figure, table and pattern field. `2px` for inputs and tags, `3px` for screen-only cards and menus, pill only for numeric counters. Nothing is ever more rounded than 3px.

### Shadows

Two, and both belong to the screen, never the page: `--shadow-sheet` puts a document sheet on the slate desk, `--shadow-lift` floats a menu or popover. Printed output carries no shadow — pass `shadow={false}` to `DocPage`. No inner shadows except `--shadow-inset-hair`, which is just a hairline expressed as a ring.

### Transparency and blur

Almost none. Transparency appears in exactly two places: the grain overlay, and a `92%`-opacity paper backdrop on a sticky reader header. **No backdrop blur, no frosted glass, no translucent sidebars.** The system is opaque ink.

### Motion

Documents don't move. Interface transitions are 120–280ms on `cubic-bezier(.2,.6,.2,1)` and animate **color, border-color and opacity only**. No bounce, no spring, no scale-in, no scroll-triggered reveals. Page turns in the viewer are an instant swap or a 180ms cross-fade — nothing slides.

### States

- **Hover:** links go navy → terracotta with the underline following; filled buttons darken one step (`navy-800` → `navy-900`); ghost and secondary controls take a `surface-sunken` or `navy-050` wash. No lift, no shadow, no scale.
- **Press:** one further darkening step (`terra-600` → `terra-800`). No shrink transform.
- **Focus:** `2px` `--focus-ring` (navy-500) outline at `2px` offset; fields take a navy border plus a flat `2px navy-050` ring.
- **Disabled:** `surface-sunken` fill, `rule-mid` border, `text-faint` label. Never opacity-only.
- **Selection:** `terra-100` background, black text.

### Layout

Documents are fixed geomehttps://www.descript.com/?pscd=get.descript.com&ps_partner_key=bWFyaW5hbW9naWxrbzM0NzE&ps_xid=XF7EmCImUkGHgW&gsxid=XF7EmCImUkGHgW&gspk=bWFyaW5hbW9naWxrbzM0NzE

https://docs.anthropic.com/en/docs/test-and-evaluate/define-success#price

https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview

https://docs.anthropic.com/en/docs/overview

https://www.jeffsu.org/thank-you-member/

https://www.recraft.ai/projects

https://www.creativefabrica.com/

https://www.midjourney.com/personalize

https://ideogram.ai/t/explore

https://ideogram.ai/assets/image/lossless/response/ih7AQ8m0T3Kp1_AS2JT_CA

https://same.energy/search?i=N4rTR

https://modelcontextprotocol.io/tutorials/building-mcp-with-llms

https://i.pinimg.com/736x/2e/75/97/2e7597ba7a0df63d8ba965322ace5637.jpg

https://www.youtube.com/watch?v=JWfNLF_g_V0

https://getjumper.io/?ref=taaft&utm_source=taaft&utm_medium=referral

https://www.research.autodesk.com/publications/same-stats-different-graphs/

https://www.learnmore365.com/pages/membership-statistics-and-research-methods

https://app.excalidraw.com/s/6te4wNeNjOm/8i9D39TV6mI

https://bigideasdb.com/free-tools/business-idea-generator

https://discord.com/channels/1048241539148681326/1048241543477215280

http://127.0.0.1:9119/chat

http://127.0.0.1:9119/docs

https://www.beri.net/tools

https://www.beri.net/

https://cloudonair.withgoogle.com/events/startup-school-ai-q2-2026

https://www.skool.com/ai-automation-society/classroom/076a1c6e?md=122d76fe19984887af89e30ba0c7d2f8

https://bard.google.com/chat

https://writesonic.com/

https://app.writesonic.com/photosonic?history_id=40d06068-cc06-4e28-87de-a2f76cb1bf3d

https://murf.ai/studio/project/2/P017047150544778K8?workspaceId=WORKSPACEID017047150536901VX

https://cloud.google.com/vertex-ai/generative-ai/docs/learn/prompts/introduction-prompt-design

https://console.cloud.google.com/vertex-ai/studio/overview?project=vernal-vine-172211&walkthrough_id=start_gemini

https://manus.im/app

https://modelcontextprotocol.io/quickstart/user

https://cookbook.openai.com/examples/file_search_responses

https://aistudio.google.com/prompts/new_chat?model=gemini-2.5-flash-lite-06-17&\_gl=1\*1abh87f\*\_ga\*MTA2MTYyMzAxOC4xNzUwOTIzMzMy\*\_ga_P1DBVKWT6V\*czE3NTA5MjMzNjkkbzEkZzEkdDE3NTA5MjMzOTkkajMwJGwwJGgxNDYwOTMwMDU.

https://www.floik.com/?ref=producthunt

https://labs.google/

https://www.testinprod.co/?utm_source=ericbefore.beehiiv.com&utm_medium=newsletter&utm_campaign=your-gift-the-conductor-framework

https://agent-skills.cc/claude-skills

https://simonw.github.io/liteparse/

https://claude.ai/design/p/019e03fd-e69f-77ef-94a5-64c0913e2b1c

https://www.waldo.fyi/new-searchtry: Letter 816×1056 or A4 794×1123 at 96dpi, 76px side margins, 64px head, 56px foot, 12 columns, 24px gutters, 7px baseline. Pages clip — content that overflows gets split across sheets rather than shrunk. The reader UI is the only place anything is fixed/sticky: a header at the top and a contents rail on the left, both flush to the viewport, both opaque.

### Imagery

None supplied. Where an image belongs, `Figure` renders a sunken hairline frame as an honest placeholder. When real imagery arrives, the reference sets the register: cool, desaturated, high-contrast, small figures on large fields of paper — closer to an architectural plate than a photograph. Never warm, never filtered, never full-bleed behind text.

---

## Iconography

**No icon assets were provided in the sources.**

1. **Typographic marks come first, and they are the brand's real iconography.** The em dash used as a tick (`—`), the underscore in `001_044`, the mono index (`02`), `FIG.03`. Reach for these before any glyph — a tick mark is more Mission than an icon.
2. **Where a UI genuinely needs glyphs**, the system uses **[Lucide](https://lucide.dev) from CDN as a flagged substitution** — chosen for its 1.5px uniform stroke and square terminals, which sit closest to the reference's hairline drawing. Load `https://unpkg.com/lucide@0.469.0/dist/umd/lucide.js`, mark up `<i data-lucide="download">`, and call `lucide.createIcons()`. Size 16 or 18, stroke `1.5`, color `currentColor` — icons never carry their own color, and never terracotta unless the label beside them is terracotta too.
3. **Emoji: never.** **Unicode as icons: only the em dash, en dash and middle dot** — nothing else, no arrows drawn from `→` in place of a real glyph.
4. **No hand-drawn SVG.** If a mark is missing, leave the space blank and note it rather than approximating.

⚠️ **Substitution to confirm:** Lucide stands in for an icon set that does not exist yet. If Mission has one, drop the SVGs into `assets/icons/` and update this section.

### Logo

There is no logo in the sources and none was drawn. Wherever a mark would go, the brand name is set in General Sans 600, uppercase, tracked `-0.012em`, in `navy-800`. See `ui_kits/docs-reader/` for how it reads in place.

---

## Index

**Root**

- `styles.css` — the single entry point consumers link. `@import` lines only.
- `readme.md` — this file.
- `SKILL.md` — packaged skill front-matter for use outside this project.
- `thumbnail.html` — homepage tile.

**`tokens/`** — `fonts.css` (CDN `@import`s for General Sans + JetBrains Mono), `colors.css`, `typography.css`, `spacing.css`, `effects.css`, `base.css`.

**`guidelines/`** — 22 specimen cards: Colors (paper, ink, navy, terracotta, slate, text roles, surfaces), Type (cover, heading ladder, body, tick numerals, eyebrow/caption, weights), Spacing (scale, page geometry, rhythm in use), Brand (grain, rule weights, corners, elevation, tick marks, links & states).

**`components/`**

- `print/` — `DocPage`, `RunningHead`, `PageFooter`, `CoverBlock`, `TickMargin`
- `content/` — `SectionTitle`, `Lede`, `Callout`, `Figure`, `DataTable`, `KeyValueList`, `PullQuote`, `TableOfContents`
- `marks/` — `Tag`, `Metric`, `TickLabel`
- `ui/` — `Button`, `TextInput`

Every component ships `<Name>.jsx`, `<Name>.d.ts` and `<Name>.prompt.md`, and each directory has one `@dsCard` HTML.

**Intentional additions.** No source defined a component inventory, so the set above is authored from the brief. `Button` and `TextInput` exist solely because the reader surface needs controls; documents themselves use neither.

**`ui_kits/`**

- `pdf-document/` — the core surface: a generated PDF shown as sheets on the desk, with cover, contents, section, data and colophon pages, plus viewer chrome.
- `docs-reader/` — the published docs site: header, contents rail, article body, download panel.

**`templates/`** — `pdf-report/` (`PdfReport.dc.html`): a five-page print-ready document — cover, contents, section, data, colophon — at true Letter geometry, with `@page` rules so it prints one sheet per page. This is the starting point consuming projects copy.

**`assets/`** — empty. No logo, icons or imagery were provided; Lucide is loaded from CDN.
