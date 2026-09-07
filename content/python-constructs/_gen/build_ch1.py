#!/usr/bin/env python3
"""Chapter 1 — Functions & docstrings (Formulaite recipe card)."""
from common import *

SECTIONS = [
  {"id": "s1", "num": "1.1", "title": "Why functions in Formulaite"},
  {"id": "s2", "num": "1.2", "title": "def, parameters, return"},
  {"id": "s3", "num": "1.3", "title": "Docstrings that ship"},
  {"id": "s4", "num": "1.4", "title": "format_inci_line"},
  {"id": "s5", "num": "1.5", "title": "Project: build_recipe_card_lines"},
  {"id": "cheat", "num": "—", "title": "Cheat sheet"},
]

FLOWS = {
  "call": {
    "fig": "FIG.01",
    "title": "Call → body → return",
    "intro": "A function packages a named computation. Callers pass arguments; the body runs; a return value (or None) comes back.",
    "nodes": [
      {"id": "call", "label": "Call site", "items": ["format_inci_line(...)"]},
      {"id": "bind", "label": "Bind params", "items": ["name", "pct"]},
      {"id": "body", "label": "Body runs"},
      {"id": "ret", "label": "Return str"},
    ],
    "path": [
      {"id": "call", "note": "Assistant accept handler needs one INCI line for the recipe card."},
      {"id": "bind", "note": "name and pct become local names inside the function."},
      {"id": "body", "note": "f-string formats the display line; no mutation of shelf data."},
      {"id": "ret", "note": "Caller receives the string and appends it to the card."},
    ],
  },
  "card_pipe": {
    "fig": "FIG.02",
    "title": "Accept draft → recipe card lines",
    "intro": "After the AI assistant accepts a bodywash draft, Formulaite builds the visible recipe-card text from ingredient rows.",
    "nodes": [
      {"id": "rows", "label": "ingredients[]", "items": ["inci", "pct"]},
      {"id": "map", "label": "format_inci_line each"},
      {"id": "join", "label": "build_recipe_card_lines"},
      {"id": "ui", "label": "Recipe card UI"},
    ],
    "path": [
      {"id": "rows", "note": "Phase A/B rows from the draft — coco-glucoside, glycerin, …"},
      {"id": "map", "note": "One pure helper per line keeps formatting consistent."},
      {"id": "join", "note": "List of strings ready for join or per-line render."},
      {"id": "ui", "note": "Shown after accept — same text users copy to the notebook."},
    ],
  },
}

CODE = {
  "def_basic": {
    "file": "def_shape.py",
    "output": [
      "Coco-Glucoside 12.0%",
    ],
    "lines": [
      {"t": "def format_inci_line(name, pct):", "c": "def names the function; (name, pct) are parameters."},
      {"t": "    \"\"\"Return one recipe-card INCI line.\"\"\"", "c": "Docstring — first statement; help() and IDEs read it."},
      {"t": "    return f\"{name} {pct:.1f}%\"", "c": "return hands a value back to the caller."},
      {"t": ""},
      {"t": "print(format_inci_line('Coco-Glucoside', 12))", "c": "Arguments bind positionally here."},
    ],
  },
  "docstring": {
    "file": "docstring_help.py",
    "output": [
      "format_inci_line(name, pct)",
      "Return one recipe-card INCI line for the Formulaite assistant.",
      "",
      "name: INCI display name (str).",
      "pct: mass percent as float or int.",
    ],
    "lines": [
      {"t": "def format_inci_line(name, pct):"},
      {"t": "    \"\"\"Return one recipe-card INCI line for the Formulaite assistant.", "c": "Multi-line docstring documents contract."},
      {"t": ""},
      {"t": "    name: INCI display name (str)."},
      {"t": "    pct: mass percent as float or int."},
      {"t": "    \"\"\""},
      {"t": "    return f\"{name} {float(pct):.1f}%\""},
      {"t": ""},
      {"t": "print(format_inci_line.__doc__)", "c": "__doc__ holds the string; help(fn) prints it."},
    ],
  },
  "inci": {
    "file": "format_inci_line.py",
    "output": [
      "Coco-Glucoside 12.0%",
      "Glycerin 3.0%",
      "Phenoxyethanol 0.8%",
    ],
    "lines": [
      {"t": "def format_inci_line(name, pct):"},
      {"t": "    \"\"\"Return one recipe-card INCI line.\"\"\""},
      {"t": "    return f\"{name} {float(pct):.1f}%\""},
      {"t": ""},
      {"t": "samples = ["},
      {"t": "    ('Coco-Glucoside', 12),"},
      {"t": "    ('Glycerin', 3),"},
      {"t": "    ('Phenoxyethanol', 0.8),"},
      {"t": "]"},
      {"t": "for n, p in samples:"},
      {"t": "    print(format_inci_line(n, p))"},
    ],
  },
  "project": {
    "file": "build_recipe_card_lines.py",
    "output": [
      "Coco-Glucoside 12.0%",
      "Glycerin 3.0%",
      "Xanthan Gum 0.4%",
      "Phenoxyethanol 0.8%",
    ],
    "lines": [
      {"t": "def format_inci_line(name, pct):"},
      {"t": "    \"\"\"Return one recipe-card INCI line.\"\"\""},
      {"t": "    return f\"{name} {float(pct):.1f}%\""},
      {"t": ""},
      {"t": "def build_recipe_card_lines(ingredients):", "c": "ingredients: list of dicts with inci + pct."},
      {"t": "    \"\"\"Build recipe-card text lines after assistant accept.\"\"\""},
      {"t": "    lines = []"},
      {"t": "    for row in ingredients:"},
      {"t": "        lines.append(format_inci_line(row['inci'], row['pct']))"},
      {"t": "    return lines"},
      {"t": ""},
      {"t": "draft = ["},
      {"t": "    {'inci': 'Coco-Glucoside', 'pct': 12, 'phase': 'A'},"},
      {"t": "    {'inci': 'Glycerin', 'pct': 3, 'phase': 'A'},"},
      {"t": "    {'inci': 'Xanthan Gum', 'pct': 0.4, 'phase': 'B'},"},
      {"t": "    {'inci': 'Phenoxyethanol', 'pct': 0.8, 'phase': 'C'},"},
      {"t": "]"},
      {"t": "for line in build_recipe_card_lines(draft):"},
      {"t": "    print(line)"},
    ],
  },
}

TRACE = {
  "fig": "TRACE.01",
  "title": "build_recipe_card_lines — one pass",
  "lines": [ln["t"] for ln in CODE["project"]["lines"]],
  "steps": [
    {"line": 1, "vars": {}, "note": "Define format helper first."},
    {"line": 5, "vars": {}, "note": "define build_recipe_card_lines."},
    {"line": 8, "vars": {"lines": "[]"}, "note": "Accumulate formatted strings."},
    {"line": 12, "vars": {"draft": "4 rows"}, "note": "Sample bodywash draft after accept."},
    {"line": 18, "vars": {}, "io": [{"k": "out", "text": "Coco-Glucoside 12.0%"}], "note": "First card line printed."},
  ],
}

s1 = section(
  "s1", "1.1", "Why functions in Formulaite",
  "\n".join([
    p("Official Tutorial §4.8. In Cosmetic AI Assistant, the same formatting rule must run after every <strong>accept draft</strong>: INCI name plus mass %. A named function is the contract — not copy-pasted f-strings in three UI surfaces."),
    flow("call", "400px"),
    pull("One helper, many surfaces: recipe card, notebook paste, formulations library preview."),
  ]),
  summary="Functions name a reusable computation. Formulaite uses them for recipe-card text the assistant shows after accept.",
  exercise="List three places in Formulaite that would call the same format_inci_line helper.",
)

s2 = section(
  "s2", "1.2", "def, parameters, return",
  "\n".join([
    p("Syntax: <code>def name(params):</code> then an indented body. Parameters are local names. <code>return</code> exits with a value; without it, Python returns <code>None</code>."),
    code("def_basic", "280px"),
    callout("Tutorial §4.8", "Defining Functions — parameters, body, return. We skip the Fibonacci demo and format real INCI lines instead.", "quiet"),
  ]),
  summary="def introduces a function; arguments bind to parameters; return sends a value to the caller.",
)

s3 = section(
  "s3", "1.3", "Docstrings that ship",
  "\n".join([
    p("A <strong>docstring</strong> is a string literal as the first statement in the function body. It documents the contract for humans and for <code>help()</code>. Keep it short and precise — what goes in, what comes out."),
    code("docstring", "360px"),
  ]),
  summary="Docstrings live in __doc__. Write them for every public Formulaite helper you expect another engineer (or LLM) to call.",
  exercise="Add a one-line docstring to a helper that returns total_pct from a list of ingredient dicts.",
)

s4 = section(
  "s4", "1.4", "format_inci_line",
  "\n".join([
    p("Canonical line format for recipe cards: <code>{INCI} {pct:.1f}%</code>. Coerce with <code>float</code> so ints from JSON still render with one decimal."),
    code("inci", "360px"),
    callout("Sample data", "Coco-Glucoside 12%, Glycerin 3%, Phenoxyethanol 0.8% — typical mild bodywash actives / humectant / preservative.", "accent"),
  ]),
  summary="format_inci_line(name, pct) is the atomic formatter. Everything else composes it.",
)

s5 = section(
  "s5", "1.5 · Project", "Project: build_recipe_card_lines",
  "\n".join([
    p("Compose: walk a list of ingredient dicts and return a list of formatted strings. This is what the assistant UI renders after accept."),
    flow("card_pipe", "400px"),
    code("project", "440px"),
    trace("480px"),
    callout("Acceptance", "Given the four-row draft, output must be four lines ending in % with one decimal place.", "quiet"),
  ]),
  summary="build_recipe_card_lines maps rows through format_inci_line. Capstone will feed it from FormulaDraft.as_recipe_lines().",
)

cheat = cheat_sheet([
  ("def", "Introduce a named function."),
  ("parameters", "Local names bound by the call."),
  ("return", "Hand a value back (else None)."),
  ("docstring", "First string in the body; __doc__ / help()."),
  ("format_inci_line", "name + pct → recipe-card line."),
  ("build_recipe_card_lines", "list[dict] → list[str] for the card UI."),
])

html = chapter_shell(
  ch_num=1,
  title="Functions & docstrings",
  part_label="Part I — Callable contracts",
  lede="Tutorial §4.8 as Formulaite mini-programs: format_inci_line and build_recipe_card_lines — the text Cosmetic AI Assistant shows on the recipe card after accept.",
  intro_paras=[
    "Assumes you can read Python already. Dense and practical — no Fibonacci. Product context: https://cosmetic-ai-assistant.web.app/ — formulator bench, assistant draft, recipe cards.",
  ],
  stats={"sections": "05", "diagrams": "02", "programs": "04"},
  sections_html=s1 + s2 + s3 + s4 + s5,
  cheat_html=cheat,
  next_label="02 Keyword args, *args, **kwargs",
  sections=SECTIONS,
  flows=FLOWS,
  code=CODE,
  trace=TRACE,
)
write("Chapter 1.dc.html", html)
