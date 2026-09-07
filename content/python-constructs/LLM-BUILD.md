# LLM-BUILD — Formulaite accept pipeline (Phase 1.2)

Implementation contract so another LLM (or engineer) can build Soma’s Phase 1.2 stdlib module from these Mission Docs alone. British English in product copy; code identifiers stay conventional ASCII.

Source: official Python Tutorial **§4.8–§9.10**. Capstone is **not** a school toy — it is a Formulaite / Cosmetic AI Assistant path: accept draft → Glass Box event → recipe card → phase CSV export.

App: https://cosmetic-ai-assistant.web.app/

**No AI / LLM API calls in this build.** Plain Python only.

Progress / docs key: `pyconstructs.progress` (Mission Docs only).

---

## 1. Goal

Ship a tiny stdlib-only module that:

1. Models `Ingredient`, `FormulaPhase`, `FormulaDraft` with `total_pct()` and `as_recipe_lines()`.
2. Formats recipe-card lines via `format_inci_line` / `build_recipe_card_lines`.
3. Builds phase rows with keyword-only `pct` via `add_to_phase`.
4. Logs Glass Box events via `log_assistant_event(kind, *tags, **meta)`.
5. Ranks shelf rows with a lambda key `(-pct, inci)` (and optionally banned-last).
6. Builds phase views with list comprehensions (names, keepers, draft lines).
7. Streams reply tokens and yields CSV row dicts via generators.
8. Exposes `run_accept_pipeline()` that returns `(event, card_lines, csv_phase_a)`.

---

## 2. Stack and seams

| Concern | Choice |
|---------|--------|
| Language | Python 3.10+ |
| Dependencies | **stdlib only** (`csv`, `io`, `typing` optional) |
| Packaging | Single module or small package — see layout |
| Network / LLM | **Forbidden** for Phase 1.2 acceptance |
| Secrets | None |

---

## 3. File layout (suggested app)

```
formulaite-constructs/
  README.md
  requirements.txt          # empty or comment: stdlib only
  src/
    formulaite_constructs/
      __init__.py           # re-export public API
      __main__.py           # demo: print pipeline output
      formatting.py         # format_inci_line, build_recipe_card_lines
      phases.py             # add_to_phase
      glassbox.py           # log_assistant_event
      ranking.py            # rank_candidates (lambda sorted)
      views.py              # phase_views (comprehensions)
      domain.py             # Ingredient, FormulaPhase, FormulaDraft
      streams.py            # stream_assistant_tokens, iter_phase_csv_rows, export_phase_csv
      pipeline.py           # run_accept_pipeline, build_sample_draft
  tests/
    test_formatting.py
    test_phases.py
    test_glassbox.py
    test_ranking.py
    test_views.py
    test_domain.py
    test_streams.py
    test_pipeline_accept.py
```

Mission Docs live in `/workspace/visual-guide-python-constructs/` and teach this shape chapter by chapter.

---

## 4. Interfaces and schemas

### 4.1 Sample draft (required fixtures)

Gentle Wash bodywash sketch (partial — not water-balanced to 100%):

| Phase | INCI | pct | function |
|-------|------|-----|----------|
| A | Coco-Glucoside | 12 | surfactant |
| A | Glycerin | 3 | humectant |
| B | Xanthan Gum | 0.4 | rheology |
| C | Phenoxyethanol | 0.8 | preservative |

Banned example for filter demos: `Methylisothiazolinone` at 0.05%, `banned=True`.

### 4.2 Required functions / types

```python
def format_inci_line(name: str, pct: float | int) -> str:
    """Return one recipe-card INCI line, e.g. 'Glycerin 3.0%'."""

def build_recipe_card_lines(ingredients: list[dict]) -> list[str]:
    """Each dict has at least 'inci' and 'pct'."""

def add_to_phase(phase: str, ingredient: str, *, pct: float | int, function: str = "emollient") -> dict:
    """Return {'phase', 'inci', 'pct', 'function'}. pct is keyword-only."""

def log_assistant_event(kind: str, *tags: str, **meta) -> dict:
    """Return {'kind': kind, 'tags': tags, 'meta': meta}."""

def rank_candidates(rows: list[dict]) -> list[dict]:
    """Sort with key=lambda r: (r.get('banned', False), -r['pct'], r['inci'])."""

def phase_views(phase: list[dict]) -> tuple[list[str], list[dict], list[str]]:
    """
    (a) names = [r['inci'] for r in phase]
    (b) keepers = [r for r in phase if not r.get('banned')]
    (c) draft_lines = [f\"{r['inci']} {r['pct']}%\" for r in keepers]
    MUST use list comprehensions for all three.
    """

class Ingredient:
    def __init__(self, inci: str, pct: float | int, function: str = "emollient"): ...

class FormulaPhase:
    def __init__(self, name: str, items: list[Ingredient] | None = None): ...
    def total_pct(self) -> float: ...

class FormulaDraft:
    def __init__(self, product: str, phases: list[FormulaPhase] | None = None): ...
    def total_pct(self) -> float: ...
    def as_recipe_lines(self) -> list[str]: ...

def stream_assistant_tokens(reply: str):
    """Generator: yield whitespace-separated word chunks."""

def iter_phase_csv_rows(phase: FormulaPhase | dict):
    """Generator: yield dicts {phase, inci, pct, function}."""

def export_phase_csv(phase: FormulaPhase | dict) -> str:
    """CSV text with header phase,inci,pct,function."""

def build_sample_draft() -> FormulaDraft:
    """Return Gentle Wash sample above."""

def run_accept_pipeline() -> tuple[dict, list[str], str]:
    """
    1. build_sample_draft()
    2. event = log_assistant_event('accept_draft', 'bodywash', 'uk',
                                   product=draft.product, total_pct=draft.total_pct())
    3. card = draft.as_recipe_lines()
    4. csv_a = export_phase_csv(draft.phases[0])
    5. return event, card, csv_a
    """
```

### 4.3 Demo CLI

```
python -m formulaite_constructs
```

Print (flexible formatting, keys must appear):

```
GLASSBOX ...
CARD
Coco-Glucoside 12.0%
...
CSV_PHASE_A
phase,inci,pct,function
A,Coco-Glucoside,12.0,surfactant
...
```

---

## 5. Step checklist (build order)

1. [ ] Package layout + public re-exports.
2. [ ] `format_inci_line` + `build_recipe_card_lines` + docstrings.
3. [ ] `add_to_phase` with keyword-only `pct`.
4. [ ] `log_assistant_event`.
5. [ ] `rank_candidates` with lambda key.
6. [ ] `phase_views` with three comprehensions.
7. [ ] Domain classes + `total_pct` / `as_recipe_lines`.
8. [ ] Generators + `export_phase_csv`.
9. [ ] `run_accept_pipeline` + `__main__` demo.
10. [ ] Acceptance suite A1–A8 green.

---

## 6. Acceptance tests

| ID | Assertion |
|----|-----------|
| A1 | `format_inci_line('Glycerin', 3) == 'Glycerin 3.0%'` |
| A2 | `add_to_phase('A', 'Glycerin', pct=3)['pct'] == 3.0`; calling without `pct=` raises `TypeError` |
| A3 | `log_assistant_event('x', 'a', k=1) == {'kind':'x','tags':('a',),'meta':{'k':1}}` |
| A4 | `rank_candidates` orders by descending pct then inci; banned rows last when present |
| A5 | `phase_views` source uses list comprehensions; keepers drop `banned=True` |
| A6 | `build_sample_draft().total_pct() == 16.2`; `len(as_recipe_lines()) == 4` |
| A7 | `list(stream_assistant_tokens('a b c')) == ['a','b','c']`; `iter_phase_csv_rows` yields dicts with required keys |
| A8 | `run_accept_pipeline()` event kind is `accept_draft`; card has 4 lines; CSV starts with header and includes `Coco-Glucoside` |

Pseudo-runner:

```python
def test_capstone_accept():
    assert format_inci_line('Glycerin', 3) == 'Glycerin 3.0%'
    try:
        add_to_phase('A', 'Glycerin', 3)  # type: ignore
        raise AssertionError('expected TypeError')
    except TypeError:
        pass
    draft = build_sample_draft()
    assert abs(draft.total_pct() - 16.2) < 1e-9
    event, card, csv_a = run_accept_pipeline()
    assert event['kind'] == 'accept_draft'
    assert len(card) == 4
    assert csv_a.splitlines()[0] == 'phase,inci,pct,function'
    assert 'Coco-Glucoside' in csv_a
```

---

## 7. Formulaite product rules

- Demo product: Gentle Wash bodywash; UK-leaning tags on accept.
- Phases A (surfactant/humectant), B (rheology), C (preservative).
- Glass Box event shape is fixed: `kind`, `tags` (tuple), `meta` (dict).
- Recipe card lines: `{INCI} {pct:.1f}%`.
- Do not invent chemistry claims; sample percents are teaching fixtures.

---

## 8. Mapping to Mission Docs chapters

| Chapter | Implements |
|---------|------------|
| 1 | format_inci_line, build_recipe_card_lines |
| 2 | add_to_phase, log_assistant_event |
| 3 | rank_candidates (lambda) |
| 4 | phase_views comprehensions |
| 5 | Ingredient, FormulaPhase, FormulaDraft |
| 6 | stream_assistant_tokens, iter_phase_csv_rows, export_phase_csv |
| 7 | run_accept_pipeline + acceptance |

---

## 9. Non-goals (Phase 1.2)

LLM calls, web UI, pandas, databases, full 100% water-balanced formulas, mutating production Firebase data, inventing regulatory INCI advice.

---

## 10. Done means

An engineer or LLM can create `formulaite-constructs/`, implement the APIs above, run tests A1–A8 with stdlib Python, and hand Soma a module that logs accept, prints a recipe card, and exports phase A CSV — ready for later product wiring.
