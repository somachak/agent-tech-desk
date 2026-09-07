#!/usr/bin/env python3
"""Chapter 3 — lambda (sort shelf / rank candidates)."""
from common import *

SECTIONS = [
  {"id": "s1", "num": "3.1", "title": "Small anonymous functions"},
  {"id": "s2", "num": "3.2", "title": "key= on sorted"},
  {"id": "s3", "num": "3.3", "title": "Sort My Ingredients by %"},
  {"id": "s4", "num": "3.4", "title": "Tie-break by INCI name"},
  {"id": "s5", "num": "3.5", "title": "Project: rank shelf candidates"},
  {"id": "cheat", "num": "—", "title": "Cheat sheet"},
]

FLOWS = {
  "lambda_key": {
    "fig": "FIG.01",
    "title": "sorted + key callable",
    "intro": "sorted builds a new list. key= receives each element and returns the sort value. A lambda is a one-expression function for that slot.",
    "nodes": [
      {"id": "rows", "label": "shelf rows"},
      {"id": "key", "label": "lambda r: …"},
      {"id": "cmp", "label": "compare keys"},
      {"id": "out", "label": "new sorted list"},
    ],
    "path": [
      {"id": "rows", "note": "My Ingredients shelf: dicts with inci, pct, banned."},
      {"id": "key", "note": "lambda r: (-r['pct'], r['inci']) — one expression."},
      {"id": "cmp", "note": "Python compares the returned keys, not the dicts wholesale."},
      {"id": "out", "note": "Original list unchanged; UI gets a ranked copy."},
    ],
  },
}

CODE = {
  "lambda_intro": {
    "file": "lambda_shape.py",
    "output": [
      "15",
      "Coco-Glucoside",
    ],
    "lines": [
      {"t": "add = lambda a, b: a + b", "c": "lambda params: expression — returns the expression value."},
      {"t": "print(add(7, 8))"},
      {"t": ""},
      {"t": "row = {'inci': 'Coco-Glucoside', 'pct': 12}"},
      {"t": "get_inci = lambda r: r['inci']"},
      {"t": "print(get_inci(row))"},
    ],
  },
  "sort_pct": {
    "file": "sort_by_pct.py",
    "output": [
      "Coco-Glucoside 12.0",
      "Glycerin 3.0",
      "Phenoxyethanol 0.8",
      "Xanthan Gum 0.4",
    ],
    "lines": [
      {"t": "rows = ["},
      {"t": "    {'inci': 'Glycerin', 'pct': 3.0},"},
      {"t": "    {'inci': 'Xanthan Gum', 'pct': 0.4},"},
      {"t": "    {'inci': 'Coco-Glucoside', 'pct': 12.0},"},
      {"t": "    {'inci': 'Phenoxyethanol', 'pct': 0.8},"},
      {"t": "]"},
      {"t": "ranked = sorted(rows, key=lambda r: -r['pct'])", "c": "Negate for descending %."},
      {"t": "for r in ranked:"},
      {"t": "    print(r['inci'], r['pct'])"},
    ],
  },
  "tiebreak": {
    "file": "sort_pct_then_name.py",
    "output": [
      "Coco-Glucoside 12.0",
      "Glycerin 3.0",
      "Aloe Vera 0.5",
      "Xanthan Gum 0.5",
      "Phenoxyethanol 0.8",
    ],
    "lines": [
      {"t": "rows = ["},
      {"t": "    {'inci': 'Xanthan Gum', 'pct': 0.5},"},
      {"t": "    {'inci': 'Aloe Vera', 'pct': 0.5},"},
      {"t": "    {'inci': 'Glycerin', 'pct': 3.0},"},
      {"t": "    {'inci': 'Coco-Glucoside', 'pct': 12.0},"},
      {"t": "    {'inci': 'Phenoxyethanol', 'pct': 0.8},"},
      {"t": "]"},
      {"t": "# Wait — fix demo order expectation: descending pct, then name"},
      {"t": "ranked = sorted(rows, key=lambda r: (-r['pct'], r['inci']))", "c": "Tuple key: primary then secondary."},
      {"t": "for r in ranked:"},
      {"t": "    print(r['inci'], r['pct'])"},
    ],
  },
  "project": {
    "file": "rank_shelf_candidates.py",
    "output": [
      "Coco-Glucoside 12.0 keep",
      "Glycerin 3.0 keep",
      "Phenoxyethanol 0.8 keep",
      "Xanthan Gum 0.4 keep",
      "Methylisothiazolinone 0.1 banned",
    ],
    "lines": [
      {"t": "shelf = ["},
      {"t": "    {'inci': 'Glycerin', 'pct': 3.0, 'banned': False},"},
      {"t": "    {'inci': 'Methylisothiazolinone', 'pct': 0.1, 'banned': True},"},
      {"t": "    {'inci': 'Coco-Glucoside', 'pct': 12.0, 'banned': False},"},
      {"t": "    {'inci': 'Xanthan Gum', 'pct': 0.4, 'banned': False},"},
      {"t": "    {'inci': 'Phenoxyethanol', 'pct': 0.8, 'banned': False},"},
      {"t": "]"},
      {"t": ""},
      {"t": "def rank_candidates(rows):"},
      {"t": "    \"\"\"Banned last; else descending pct, then INCI.\"\"\""},
      {"t": "    return sorted("},
      {"t": "        rows,"},
      {"t": "        key=lambda r: (r['banned'], -r['pct'], r['inci']),", "c": "False < True so keepers rise."},
      {"t": "    )"},
      {"t": ""},
      {"t": "for r in rank_candidates(shelf):"},
      {"t": "    flag = 'banned' if r['banned'] else 'keep'"},
      {"t": "    print(r['inci'], r['pct'], flag)"},
    ],
  },
}

# Fix tiebreak expected output - with the data:
# Coco 12, Glycerin 3, Phenoxy 0.8, Aloe 0.5, Xanthan 0.5
# Output I wrote was wrong order for Phenoxy. Let me fix in the file...
# Actually looking at my tiebreak output again:
# Coco-Glucoside 12.0
# Glycerin 3.0
# Aloe Vera 0.5
# Xanthan Gum 0.5
# Phenoxyethanol 0.8  <-- WRONG, Phenoxy should be before Aloe

# I'll fix this when writing - need to correct CODE["tiebreak"]["output"]

TRACE = {
  "fig": "TRACE.01",
  "title": "rank_candidates — key tuple",
  "lines": [ln["t"] for ln in CODE["project"]["lines"]],
  "steps": [
    {"line": 1, "vars": {"shelf": "5 rows"}, "note": "My Ingredients shelf sample."},
    {"line": 10, "vars": {}, "note": "lambda returns (banned, -pct, inci)."},
    {"line": 16, "vars": {}, "io": [{"k": "out", "text": "Coco-Glucoside 12.0 keep"}], "note": "Highest % keeper first."},
  ],
}

s1 = section(
  "s1", "3.1", "Small anonymous functions",
  "\n".join([
    p("Tutorial §4.9.6. A <code>lambda</code> creates a function from a single expression — no <code>def</code> block, no statements. Ideal for short <code>key=</code> callables."),
    code("lambda_intro", "280px"),
    callout("Limit", "Lambdas cannot contain statements (no assignment, no loops). Reach for def when logic grows.", "quiet"),
  ]),
  summary="lambda params: expr — anonymous one-liner function returning expr.",
)

s2 = section(
  "s2", "3.2", "key= on sorted",
  "\n".join([
    p("<code>sorted(iterable, key=fn)</code> calls <code>fn</code> on each item and sorts by those results. The original objects keep their identity; only order changes."),
    flow("lambda_key", "400px"),
  ]),
  summary="Pass a callable to key=. Lambda is the usual short form for dict field access.",
)

s3 = section(
  "s3", "3.3", "Sort My Ingredients by %",
  "\n".join([
    p("Descending mass % on the shelf: negate the percent so larger values sort first."),
    code("sort_pct", "360px"),
  ]),
  summary="key=lambda r: -r['pct'] ranks high-actives first for the formulator.",
  exercise="Sort the same rows ascending by pct with a lambda (no reverse=True).",
)

s4 = section(
  "s4", "3.4", "Tie-break by INCI name",
  "\n".join([
    p("When two rows share a %, sort alphabetically by INCI. Return a <strong>tuple</strong> from the lambda — Python compares left to right."),
    code("tiebreak", "400px"),
  ]),
  summary="key=lambda r: (-r['pct'], r['inci']) — required Formulaite shelf ranking key.",
)

s5 = section(
  "s5", "3.5 · Project", "Project: rank shelf candidates",
  "\n".join([
    p("Inspiration Studio ranking: banned rows sink; among keepers, descending % then name. One lambda, three-part key."),
    code("project", "460px"),
    trace("480px"),
  ]),
  summary="rank_candidates uses (banned, -pct, inci). Capstone may sort before building the recipe card.",
)

cheat = cheat_sheet([
  ("lambda", "Anonymous function: lambda args: expr."),
  ("sorted(..., key=)", "Sort by transformed keys; new list."),
  ("Descending %", "key=lambda r: -r['pct']"),
  ("Tuple key", "(-pct, inci) for tie-breaks."),
  ("banned last", "(banned, -pct, inci) — False sorts before True."),
  ("When to def", "Multi-statement logic → named def, not lambda."),
])

# Fix tiebreak output
CODE["tiebreak"]["output"] = [
  "Coco-Glucoside 12.0",
  "Glycerin 3.0",
  "Phenoxyethanol 0.8",
  "Aloe Vera 0.5",
  "Xanthan Gum 0.5",
]
# Remove the comment line from tiebreak for cleaner demo
CODE["tiebreak"]["lines"] = [
  {"t": "rows = ["},
  {"t": "    {'inci': 'Xanthan Gum', 'pct': 0.5},"},
  {"t": "    {'inci': 'Aloe Vera', 'pct': 0.5},"},
  {"t": "    {'inci': 'Glycerin', 'pct': 3.0},"},
  {"t": "    {'inci': 'Coco-Glucoside', 'pct': 12.0},"},
  {"t": "    {'inci': 'Phenoxyethanol', 'pct': 0.8},"},
  {"t": "]"},
  {"t": "ranked = sorted(rows, key=lambda r: (-r['pct'], r['inci']))", "c": "Tuple key: primary then secondary."},
  {"t": "for r in ranked:"},
  {"t": "    print(r['inci'], r['pct'])"},
]

html = chapter_shell(
  ch_num=3,
  title="lambda — sort shelf / rank",
  part_label="Part II — Data shaping",
  lede="§4.9.6 lambda as Formulaite shelf ranking: sorted(rows, key=lambda r: (-r['pct'], r['inci'])) — and banned-last candidate ranking.",
  intro_paras=[
    "My Ingredients shelf and Inspiration Studio candidate lists. Intermediate-friendly: you already know lists and dicts.",
  ],
  stats={"sections": "05", "diagrams": "01", "programs": "04"},
  sections_html=s1 + s2 + s3 + s4 + s5,
  cheat_html=cheat,
  next_label="04 List comprehensions",
  sections=SECTIONS,
  flows=FLOWS,
  code=CODE,
  trace=TRACE,
)
write("Chapter 3.dc.html", html)
