#!/usr/bin/env python3
"""Chapter 5 — Classes (Ingredient, FormulaPhase, FormulaDraft)."""
from common import *

SECTIONS = [
  {"id": "s1", "num": "5.1", "title": "class and __init__"},
  {"id": "s2", "num": "5.2", "title": "Ingredient"},
  {"id": "s3", "num": "5.3", "title": "FormulaPhase"},
  {"id": "s4", "num": "5.4", "title": "FormulaDraft + total_pct"},
  {"id": "s5", "num": "5.5", "title": "Project: as_recipe_lines"},
  {"id": "cheat", "num": "—", "title": "Cheat sheet"},
]

FLOWS = {
  "compose": {
    "fig": "FIG.01",
    "title": "Draft object graph",
    "intro": "FormulaDraft owns phases; each FormulaPhase owns Ingredient items. Methods ask the graph questions without scattering dict keys.",
    "nodes": [
      {"id": "ing", "label": "Ingredient", "items": ["inci", "pct", "function"]},
      {"id": "ph", "label": "FormulaPhase", "items": ["name", "items[]"]},
      {"id": "dr", "label": "FormulaDraft", "items": ["product", "phases[]"]},
      {"id": "m", "label": "Methods", "items": ["total_pct", "as_recipe_lines"]},
    ],
    "path": [
      {"id": "ing", "note": "One material row — Coco-Glucoside at 12%."},
      {"id": "ph", "note": "Phase A/B/C bags on the formulator bench."},
      {"id": "dr", "note": "Named product draft the assistant accepted."},
      {"id": "m", "note": "total_pct() sums mass; as_recipe_lines() feeds the card."},
    ],
  },
}

CODE = {
  "init": {
    "file": "class_init.py",
    "output": [
      "Coco-Glucoside @ 12.0% (surfactant)",
    ],
    "lines": [
      {"t": "class Ingredient:", "c": "class statement defines a type."},
      {"t": "    def __init__(self, inci, pct, function='emollient'):", "c": "Constructor — self is the instance."},
      {"t": "        self.inci = inci"},
      {"t": "        self.pct = float(pct)"},
      {"t": "        self.function = function"},
      {"t": ""},
      {"t": "    def label(self):"},
      {"t": "        return f\"{self.inci} @ {self.pct}% ({self.function})\""},
      {"t": ""},
      {"t": "g = Ingredient('Coco-Glucoside', 12, 'surfactant')"},
      {"t": "print(g.label())"},
    ],
  },
  "phase": {
    "file": "formula_phase.py",
    "output": [
      "A: 15.0",
    ],
    "lines": [
      {"t": "class Ingredient:"},
      {"t": "    def __init__(self, inci, pct, function='emollient'):"},
      {"t": "        self.inci = inci"},
      {"t": "        self.pct = float(pct)"},
      {"t": "        self.function = function"},
      {"t": ""},
      {"t": "class FormulaPhase:"},
      {"t": "    def __init__(self, name, items=None):"},
      {"t": "        self.name = name"},
      {"t": "        self.items = list(items or [])", "c": "Copy — avoid shared default list."},
      {"t": ""},
      {"t": "    def add(self, ingredient):"},
      {"t": "        self.items.append(ingredient)"},
      {"t": ""},
      {"t": "    def total_pct(self):"},
      {"t": "        return sum(i.pct for i in self.items)"},
      {"t": ""},
      {"t": "a = FormulaPhase('A', ["},
      {"t": "    Ingredient('Coco-Glucoside', 12, 'surfactant'),"},
      {"t": "    Ingredient('Glycerin', 3, 'humectant'),"},
      {"t": "])"},
      {"t": "print(f\"{a.name}: {a.total_pct()}\")"},
    ],
  },
  "draft": {
    "file": "formula_draft.py",
    "output": [
      "Gentle Wash total=16.2%",
    ],
    "lines": [
      {"t": "class Ingredient:"},
      {"t": "    def __init__(self, inci, pct, function='emollient'):"},
      {"t": "        self.inci, self.pct, self.function = inci, float(pct), function"},
      {"t": ""},
      {"t": "class FormulaPhase:"},
      {"t": "    def __init__(self, name, items=None):"},
      {"t": "        self.name, self.items = name, list(items or [])"},
      {"t": "    def total_pct(self):"},
      {"t": "        return sum(i.pct for i in self.items)"},
      {"t": ""},
      {"t": "class FormulaDraft:"},
      {"t": "    def __init__(self, product, phases=None):"},
      {"t": "        self.product = product"},
      {"t": "        self.phases = list(phases or [])"},
      {"t": ""},
      {"t": "    def total_pct(self):", "c": "Sum across all phases."},
      {"t": "        return sum(p.total_pct() for p in self.phases)"},
      {"t": ""},
      {"t": "draft = FormulaDraft('Gentle Wash', ["},
      {"t": "    FormulaPhase('A', [Ingredient('Coco-Glucoside', 12, 'surfactant'), Ingredient('Glycerin', 3)]),"},
      {"t": "    FormulaPhase('B', [Ingredient('Xanthan Gum', 0.4, 'rheology')]),"},
      {"t": "    FormulaPhase('C', [Ingredient('Phenoxyethanol', 0.8, 'preservative')]),"},
      {"t": "])"},
      {"t": "print(f\"{draft.product} total={draft.total_pct()}%\")"},
    ],
  },
  "project": {
    "file": "as_recipe_lines.py",
    "output": [
      "Coco-Glucoside 12.0%",
      "Glycerin 3.0%",
      "Xanthan Gum 0.4%",
      "Phenoxyethanol 0.8%",
      "total=16.2%",
    ],
    "lines": [
      {"t": "class Ingredient:"},
      {"t": "    def __init__(self, inci, pct, function='emollient'):"},
      {"t": "        self.inci, self.pct, self.function = inci, float(pct), function"},
      {"t": ""},
      {"t": "class FormulaPhase:"},
      {"t": "    def __init__(self, name, items=None):"},
      {"t": "        self.name, self.items = name, list(items or [])"},
      {"t": "    def total_pct(self):"},
      {"t": "        return sum(i.pct for i in self.items)"},
      {"t": ""},
      {"t": "class FormulaDraft:"},
      {"t": "    def __init__(self, product, phases=None):"},
      {"t": "        self.product, self.phases = product, list(phases or [])"},
      {"t": "    def total_pct(self):"},
      {"t": "        return sum(p.total_pct() for p in self.phases)"},
      {"t": "    def as_recipe_lines(self):", "c": "Flatten phases → card lines."},
      {"t": "        lines = []"},
      {"t": "        for phase in self.phases:"},
      {"t": "            for item in phase.items:"},
      {"t": "                lines.append(f\"{item.inci} {item.pct:.1f}%\")"},
      {"t": "        return lines"},
      {"t": ""},
      {"t": "draft = FormulaDraft('Gentle Wash', ["},
      {"t": "    FormulaPhase('A', [Ingredient('Coco-Glucoside', 12, 'surfactant'), Ingredient('Glycerin', 3)]),"},
      {"t": "    FormulaPhase('B', [Ingredient('Xanthan Gum', 0.4, 'rheology')]),"},
      {"t": "    FormulaPhase('C', [Ingredient('Phenoxyethanol', 0.8, 'preservative')]),"},
      {"t": "])"},
      {"t": "for line in draft.as_recipe_lines():"},
      {"t": "    print(line)"},
      {"t": "print(f\"total={draft.total_pct()}%\")"},
    ],
  },
}

TRACE = {
  "fig": "TRACE.01",
  "title": "as_recipe_lines — walk the graph",
  "lines": [ln["t"] for ln in CODE["project"]["lines"]],
  "steps": [
    {"line": 14, "vars": {}, "note": "as_recipe_lines defined on FormulaDraft."},
    {"line": 16, "vars": {"lines": "[]"}, "note": "Accumulate across phases."},
    {"line": 22, "vars": {"draft": "Gentle Wash"}, "note": "Three phases constructed."},
    {"line": 28, "vars": {}, "io": [{"k": "out", "text": "Coco-Glucoside 12.0%"}], "note": "Card lines match Chapter 1 formatter."},
  ],
}

s1 = section(
  "s1", "5.1", "class and __init__",
  "\n".join([
    p("Tutorial §9. A <strong>class</strong> defines a type; <code>__init__</code> runs when you construct an instance. <code>self</code> is that instance — attributes hang off it."),
    code("init", "360px"),
  ]),
  summary="class + __init__(self, …) + self.attr. Methods are functions that take self first.",
)

s2 = section(
  "s2", "5.2", "Ingredient",
  "\n".join([
    p("<code>Ingredient(inci, pct, function)</code> — one shelf / draft row as an object instead of a loose dict."),
    pull("Objects beat anonymous dicts once methods and invariants appear."),
  ]),
  summary="Ingredient holds inci, pct, function — the Formulaite material noun.",
  exercise="Construct Ingredient('Glycerin', 3, 'humectant') and print its pct.",
)

s3 = section(
  "s3", "5.3", "FormulaPhase",
  "\n".join([
    p("A named bag of ingredients. Prefer <code>items=None</code> then <code>list(items or [])</code> — never a mutable default argument."),
    code("phase", "440px"),
  ]),
  summary="FormulaPhase(name, items) with total_pct() over its ingredients.",
)

s4 = section(
  "s4", "5.4", "FormulaDraft + total_pct",
  "\n".join([
    p("The accepted assistant draft: product name plus ordered phases. <code>total_pct()</code> should approach 100 for a finished formula (demo totals are partial water-free sketches)."),
    flow("compose", "400px"),
    code("draft", "440px"),
  ]),
  summary="FormulaDraft(product, phases).total_pct() sums every phase.",
)

s5 = section(
  "s5", "5.5 · Project", "Project: as_recipe_lines",
  "\n".join([
    p("Flatten the object graph into the same recipe-card strings Chapter 1 produced from dicts."),
    code("project", "520px"),
    trace("480px"),
    callout("Acceptance", "Four lines + total=16.2% for the Gentle Wash sample.", "quiet"),
  ]),
  summary="as_recipe_lines() is the OO bridge to the recipe card UI and the Capstone.",
)

cheat = cheat_sheet([
  ("class", "Define a new type."),
  ("__init__", "Instance constructor; set self.* attributes."),
  ("self", "The instance — first param of methods."),
  ("Ingredient", "inci, pct, function"),
  ("FormulaPhase", "name, items[]; total_pct()"),
  ("FormulaDraft", "product, phases[]; total_pct(), as_recipe_lines()"),
])

html = chapter_shell(
  ch_num=5,
  title="Classes — formula objects",
  part_label="Part III — Structure & streams",
  lede="§9 Classes as Formulaite domain types: Ingredient, FormulaPhase, FormulaDraft with total_pct() and as_recipe_lines().",
  intro_paras=[
    "Move from dict rows to a small object graph the formulator bench and formulations library can share.",
  ],
  stats={"sections": "05", "diagrams": "01", "programs": "04"},
  sections_html=s1 + s2 + s3 + s4 + s5,
  cheat_html=cheat,
  next_label="06 Generators — stream reply + CSV export",
  sections=SECTIONS,
  flows=FLOWS,
  code=CODE,
  trace=TRACE,
)
write("Chapter 5.dc.html", html)
