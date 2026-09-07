#!/usr/bin/env python3
"""Chapter 4 — List comprehensions (filter banned, build draft lines)."""
from common import *

SECTIONS = [
  {"id": "s1", "num": "4.1", "title": "Comprehension shape"},
  {"id": "s2", "num": "4.2", "title": "INCI-only names"},
  {"id": "s3", "num": "4.3", "title": "Banned-filtered keepers"},
  {"id": "s4", "num": "4.4", "title": "Draft f-string lines"},
  {"id": "s5", "num": "4.5", "title": "Project: three views of a phase"},
  {"id": "cheat", "num": "—", "title": "Cheat sheet"},
]

FLOWS = {
  "comp": {
    "fig": "FIG.01",
    "title": "Map / filter in one expression",
    "intro": "A list comprehension builds a new list: [expr for item in iterable if condition]. Read it as map + optional filter.",
    "nodes": [
      {"id": "src", "label": "phase list"},
      {"id": "for", "label": "for row in phase"},
      {"id": "if", "label": "if not banned"},
      {"id": "expr", "label": "expr → new list"},
    ],
    "path": [
      {"id": "src", "note": "Phase A rows from the bodywash draft."},
      {"id": "for", "note": "Each row is bound once per iteration."},
      {"id": "if", "note": "Optional filter — omit for pure map."},
      {"id": "expr", "note": "INCI string, keeper dict, or f'{inci} {pct}%' line."},
    ],
  },
}

CODE = {
  "shape": {
    "file": "comp_shape.py",
    "output": [
      "['A', 'B', 'C']",
    ],
    "lines": [
      {"t": "phases = ['A', 'B', 'C']"},
      {"t": "labels = [f'Phase {p}' for p in phases]", "c": "[expr for item in iterable]"},
      {"t": "print([p for p in phases])", "c": "Identity map — still a new list."},
    ],
  },
  "names": {
    "file": "inci_only.py",
    "output": [
      "['Coco-Glucoside', 'Glycerin', 'Xanthan Gum', 'Phenoxyethanol']",
    ],
    "lines": [
      {"t": "phase = ["},
      {"t": "    {'inci': 'Coco-Glucoside', 'pct': 12, 'banned': False},"},
      {"t": "    {'inci': 'Glycerin', 'pct': 3, 'banned': False},"},
      {"t": "    {'inci': 'Xanthan Gum', 'pct': 0.4, 'banned': False},"},
      {"t": "    {'inci': 'Phenoxyethanol', 'pct': 0.8, 'banned': False},"},
      {"t": "]"},
      {"t": "names = [row['inci'] for row in phase]", "c": "(a) INCI-only names"},
      {"t": "print(names)"},
    ],
  },
  "filter_banned": {
    "file": "keepers.py",
    "output": [
      "['Coco-Glucoside', 'Glycerin', 'Xanthan Gum', 'Phenoxyethanol']",
    ],
    "lines": [
      {"t": "phase = ["},
      {"t": "    {'inci': 'Coco-Glucoside', 'pct': 12, 'banned': False},"},
      {"t": "    {'inci': 'Methylisothiazolinone', 'pct': 0.05, 'banned': True},"},
      {"t": "    {'inci': 'Glycerin', 'pct': 3, 'banned': False},"},
      {"t": "    {'inci': 'Xanthan Gum', 'pct': 0.4, 'banned': False},"},
      {"t": "    {'inci': 'Phenoxyethanol', 'pct': 0.8, 'banned': False},"},
      {"t": "]"},
      {"t": "keepers = [row for row in phase if not row['banned']]", "c": "(b) banned-filtered keepers"},
      {"t": "print([k['inci'] for k in keepers])"},
    ],
  },
  "draft_lines": {
    "file": "draft_lines.py",
    "output": [
      "Coco-Glucoside 12%",
      "Glycerin 3%",
      "Xanthan Gum 0.4%",
      "Phenoxyethanol 0.8%",
    ],
    "lines": [
      {"t": "phase = ["},
      {"t": "    {'inci': 'Coco-Glucoside', 'pct': 12, 'banned': False},"},
      {"t": "    {'inci': 'Methylisothiazolinone', 'pct': 0.05, 'banned': True},"},
      {"t": "    {'inci': 'Glycerin', 'pct': 3, 'banned': False},"},
      {"t": "    {'inci': 'Xanthan Gum', 'pct': 0.4, 'banned': False},"},
      {"t": "    {'inci': 'Phenoxyethanol', 'pct': 0.8, 'banned': False},"},
      {"t": "]"},
      {"t": "lines = ["},
      {"t": "    f\"{r['inci']} {r['pct']}%\"", "c": "(c) draft display lines"},
      {"t": "    for r in phase"},
      {"t": "    if not r['banned']"},
      {"t": "]"},
      {"t": "for line in lines:"},
      {"t": "    print(line)"},
    ],
  },
  "project": {
    "file": "three_views.py",
    "output": [
      "names: ['Coco-Glucoside', 'Glycerin', 'Xanthan Gum', 'Phenoxyethanol']",
      "keepers: 4",
      "Coco-Glucoside 12%",
      "Glycerin 3%",
      "Xanthan Gum 0.4%",
      "Phenoxyethanol 0.8%",
    ],
    "lines": [
      {"t": "def phase_views(phase):"},
      {"t": "    \"\"\"Return (names, keepers, draft_lines) via comprehensions.\"\"\""},
      {"t": "    names = [r['inci'] for r in phase]"},
      {"t": "    keepers = [r for r in phase if not r['banned']]"},
      {"t": "    draft_lines = ["},
      {"t": "        f\"{r['inci']} {r['pct']}%\" for r in keepers"},
      {"t": "    ]"},
      {"t": "    return names, keepers, draft_lines"},
      {"t": ""},
      {"t": "phase_a = ["},
      {"t": "    {'inci': 'Coco-Glucoside', 'pct': 12, 'banned': False},"},
      {"t": "    {'inci': 'Glycerin', 'pct': 3, 'banned': False},"},
      {"t": "    {'inci': 'Methylisothiazolinone', 'pct': 0.05, 'banned': True},"},
      {"t": "    {'inci': 'Xanthan Gum', 'pct': 0.4, 'banned': False},"},
      {"t": "    {'inci': 'Phenoxyethanol', 'pct': 0.8, 'banned': False},"},
      {"t": "]"},
      {"t": "names, keepers, lines = phase_views(phase_a)"},
      {"t": "print('names:', names)"},
      {"t": "print('keepers:', len(keepers))"},
      {"t": "for line in lines:"},
      {"t": "    print(line)"},
    ],
  },
}

TRACE = {
  "fig": "TRACE.01",
  "title": "phase_views — three comprehensions",
  "lines": [ln["t"] for ln in CODE["project"]["lines"]],
  "steps": [
    {"line": 3, "vars": {"names": "5 INCIs"}, "note": "Map every row to inci — includes banned."},
    {"line": 4, "vars": {"keepers": "4 rows"}, "note": "Filter drops Methylisothiazolinone."},
    {"line": 5, "vars": {"draft_lines": "4 strs"}, "note": "f-string lines for the draft panel."},
    {"line": 20, "vars": {}, "io": [{"k": "out", "text": "keepers: 4"}], "note": "Views ready for UI."},
  ],
}

s1 = section(
  "s1", "4.1", "Comprehension shape",
  "\n".join([
    p("Tutorial §5.1.3. Prefer a comprehension when the loop body is a single expression that builds a list — clearer than append loops for Formulaite draft transforms."),
    flow("comp", "400px"),
    code("shape", "220px"),
  ]),
  summary="[expr for x in xs if cond] = map + filter. New list; source unchanged.",
)

s2 = section(
  "s2", "4.2", "INCI-only names",
  "\n".join([
    p("Pull display names for an Inspiration Studio board label or autocomplete."),
    code("names", "340px"),
  ]),
  summary="[row['inci'] for row in phase] — pure map over phase rows.",
  exercise="Build a comprehension that lowercases every INCI name.",
)

s3 = section(
  "s3", "4.3", "Banned-filtered keepers",
  "\n".join([
    p("Brand policy: drop banned-flagged materials before the draft is accepted into formulations library."),
    code("filter_banned", "380px"),
    callout("Product rule", "banned True marks materials Brand X will not ship — e.g. MIT preservative.", "accent"),
  ]),
  summary="[row for row in phase if not row['banned']] — filter keepers.",
)

s4 = section(
  "s4", "4.4", "Draft f-string lines",
  "\n".join([
    p("Combine filter + map: keepers become <code>f\"{inci} {pct}%\"</code> lines for the draft pane."),
    code("draft_lines", "400px"),
  ]),
  summary="Multi-line comprehension with if — one expression for draft text lines.",
)

s5 = section(
  "s5", "4.5 · Project", "Project: three views of a phase",
  "\n".join([
    p("One function, three comprehensions: names, keepers, draft_lines. Matches the required mapping (a)(b)(c)."),
    code("project", "460px"),
    trace("480px"),
  ]),
  summary="phase_views returns the three Formulaite views. Capstone uses draft_lines after accept.",
)

cheat = cheat_sheet([
  ("Shape", "[expr for x in xs if cond]"),
  ("Map", "[r['inci'] for r in phase]"),
  ("Filter", "[r for r in phase if not r['banned']]"),
  ("Map+filter", "[f'…' for r in phase if …]"),
  ("vs loop", "Prefer comprehension for single-expression builds."),
  ("Nested", "Possible; keep readable — extract a helper if dense."),
])

html = chapter_shell(
  ch_num=4,
  title="List comprehensions",
  part_label="Part II — Data shaping",
  lede="§5.1.3 for Formulaite drafts: INCI-only names, banned-filtered keepers, and f-string draft lines from a phase list.",
  intro_paras=[
    "Same bodywash sample — coco-glucoside, glycerin, xanthan, phenoxyethanol — plus a banned MIT row to filter.",
  ],
  stats={"sections": "05", "diagrams": "01", "programs": "05"},
  sections_html=s1 + s2 + s3 + s4 + s5,
  cheat_html=cheat,
  next_label="05 Classes — Ingredient, FormulaPhase, FormulaDraft",
  sections=SECTIONS,
  flows=FLOWS,
  code=CODE,
  trace=TRACE,
)
write("Chapter 4.dc.html", html)
