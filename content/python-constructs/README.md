# Python Constructs — Mission Docs (Phase 1.2)

Interactive visual guide for the official Python Tutorial **§4.8 through §9.10**, rewritten as Kindle Lab–style Mission Docs for Soma’s curriculum (6 Sep 2026).

Taught through **Formulaite / Cosmetic AI Assistant** mini-programs — recipe cards, phases, Glass Box events, My Ingredients shelf, draft lines, CSV export — not toy school examples.

App context: https://cosmetic-ai-assistant.web.app/

Capstone: a **plain-Python accept → recipe card → phase CSV** pipeline. Stdlib only. No network.

## Open the course

1. Keep these siblings in the same folder as the chapters:
   - `support.js`
   - `dc-siblings.js`
   - `Code.dc.html`, `Flow.dc.html`, `Trace.dc.html`
   - `_ds/` (Mission Docs design system)
2. Open **`Course.dc.html`** in a browser (file:// is supported via `dc-siblings.js` blob embedding).
3. Progress is stored in `localStorage` under the key **`pyconstructs.progress`**.

## Layout

| Path | Role |
|------|------|
| `Course.dc.html` | Course map, parts, progress |
| `Chapter N.dc.html` | Chapters 1–7 (space before number) |
| `LLM-BUILD.md` | Implementation contract for the Phase 1.2 module |
| `_gen/` | Python generators that rebuild chapter HTML |
| `_ds/` | Design system CSS + bundle |

## Chapter map ↔ Tutorial

| Ch | Title | Tutorial |
|----|-------|----------|
| 1 | Functions & docstrings | §4.8 |
| 2 | Keyword args, *args, **kwargs | §4.9 / 4.9.2 / 4.9.4 |
| 3 | lambda — sort shelf / rank | §4.9.6 |
| 4 | List comprehensions | §5.1.3 |
| 5 | Classes — formula objects | §9 |
| 6 | Generators — stream & export | §9.9–9.10 |
| 7 | Capstone — accept → card → export | stitch |

## Required Formulaite APIs

- `format_inci_line(name, pct)` / `build_recipe_card_lines(ingredients)`
- `add_to_phase(phase, ingredient, *, pct, function="emollient")`
- `log_assistant_event(kind, *tags, **meta)`
- `sorted(rows, key=lambda r: (-r["pct"], r["inci"]))`
- phase comprehensions: names / keepers / draft lines
- `Ingredient`, `FormulaPhase`, `FormulaDraft` (+ `total_pct`, `as_recipe_lines`)
- `stream_assistant_tokens(reply)` / `iter_phase_csv_rows(phase)`

## Regenerate chapters

```bash
cd /workspace/visual-guide-python-constructs/_gen
python3 build_ch1.py   # … through build_ch7.py
```

Regenerate `dc-siblings.js` (embeds Code/Flow/Trace for file:// viewing):

```bash
python3 _gen/regen_siblings.py
```

## British English

Copy uses en-GB lightly where it matters (summarise, behaviour). Code identifiers stay ASCII/`en` conventional.

## Source

- Language: Python Tutorial (docs.python.org) §4.8–§9.10
- Prior Mission Docs: `/workspace/visual-guide-ai-python/` (Phase 1.1)
- Gold pattern: `/workspace/visual-guide/` / agent-memory guides
