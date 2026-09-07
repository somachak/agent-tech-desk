#!/usr/bin/env python3
"""Chapter 2 — Keyword args, *args, **kwargs (phases + Glass Box log)."""
from common import *

SECTIONS = [
  {"id": "s1", "num": "2.1", "title": "Keyword-only with *"},
  {"id": "s2", "num": "2.2", "title": "add_to_phase — pct must be named"},
  {"id": "s3", "num": "2.3", "title": "*args for tags"},
  {"id": "s4", "num": "2.4", "title": "**kwargs for Glass Box meta"},
  {"id": "s5", "num": "2.5", "title": "Project: log_assistant_event"},
  {"id": "cheat", "num": "—", "title": "Cheat sheet"},
]

FLOWS = {
  "kwonly": {
    "fig": "FIG.01",
    "title": "Positional vs keyword-only",
    "intro": "A bare * in the parameter list forces every following parameter to be passed by name — callers cannot rely on position.",
    "nodes": [
      {"id": "pos", "label": "phase, ingredient", "items": ["positional OK"]},
      {"id": "star", "label": "*", "items": ["barrier"]},
      {"id": "kw", "label": "pct, function", "items": ["must name"]},
      {"id": "row", "label": "phase row dict"},
    ],
    "path": [
      {"id": "pos", "note": "Phase letter and INCI stay easy to pass in order."},
      {"id": "star", "note": "Everything after * is keyword-only (§4.9)."},
      {"id": "kw", "note": "pct=12 — not a silent third positional that could be confused with function."},
      {"id": "row", "note": "Returned dict joins the phase list on the formulator bench."},
    ],
  },
  "glass": {
    "fig": "FIG.02",
    "title": "Glass Box event shape",
    "intro": "Assistant observability: kind + tags + meta. *args collects tags; **kwargs collects arbitrary metadata.",
    "nodes": [
      {"id": "kind", "label": "kind: str"},
      {"id": "tags", "label": "*tags → tuple"},
      {"id": "meta", "label": "**meta → dict"},
      {"id": "evt", "label": "event dict"},
    ],
    "path": [
      {"id": "kind", "note": "e.g. 'accept_draft', 'stream_token', 'banned_hit'."},
      {"id": "tags", "note": "Zero or more string tags without inventing a list param."},
      {"id": "meta", "note": "product=, phase=, latency_ms= — open schema."},
      {"id": "evt", "note": "{'kind', 'tags', 'meta'} — what the Glass Box panel stores."},
    ],
  },
}

CODE = {
  "kwonly": {
    "file": "add_to_phase.py",
    "output": [
      "{'phase': 'A', 'inci': 'Coco-Glucoside', 'pct': 12.0, 'function': 'surfactant'}",
      "{'phase': 'B', 'inci': 'Xanthan Gum', 'pct': 0.4, 'function': 'rheology'}",
    ],
    "lines": [
      {"t": "def add_to_phase(phase, ingredient, *, pct, function='emollient'):", "c": "* forces pct= and function= by name."},
      {"t": "    \"\"\"Append-ready row for a Formulaite phase list.\"\"\""},
      {"t": "    return {"},
      {"t": "        'phase': phase,"},
      {"t": "        'inci': ingredient,"},
      {"t": "        'pct': float(pct),"},
      {"t": "        'function': function,"},
      {"t": "    }"},
      {"t": ""},
      {"t": "print(add_to_phase('A', 'Coco-Glucoside', pct=12, function='surfactant'))"},
      {"t": "print(add_to_phase('B', 'Xanthan Gum', pct=0.4, function='rheology'))"},
      {"t": "# add_to_phase('A', 'Glycerin', 3)  # TypeError: missing pct"},
    ],
  },
  "args": {
    "file": "star_args_tags.py",
    "output": [
      "('accept', 'bodywash', 'uk')",
    ],
    "lines": [
      {"t": "def collect_tags(*tags):", "c": "*tags packs extra positionals into a tuple."},
      {"t": "    return tags"},
      {"t": ""},
      {"t": "print(collect_tags('accept', 'bodywash', 'uk'))"},
    ],
  },
  "kwargs": {
    "file": "star_star_kwargs.py",
    "output": [
      "{'product': 'bodywash', 'phase': 'A', 'latency_ms': 42}",
    ],
    "lines": [
      {"t": "def collect_meta(**meta):", "c": "**meta packs keyword leftovers into a dict."},
      {"t": "    return meta"},
      {"t": ""},
      {"t": "print(collect_meta(product='bodywash', phase='A', latency_ms=42))"},
    ],
  },
  "project": {
    "file": "log_assistant_event.py",
    "output": [
      "{'kind': 'accept_draft', 'tags': ('bodywash', 'uk'), 'meta': {'product': 'Gentle Wash', 'phases': 3}}",
      "{'kind': 'banned_hit', 'tags': ('preservative',), 'meta': {'inci': 'Methylisothiazolinone'}}",
    ],
    "lines": [
      {"t": "def log_assistant_event(kind, *tags, **meta):", "c": "Glass Box-style event builder."},
      {"t": "    \"\"\"Return {kind, tags, meta} for the assistant event stream.\"\"\""},
      {"t": "    return {"},
      {"t": "        'kind': kind,"},
      {"t": "        'tags': tags,"},
      {"t": "        'meta': meta,"},
      {"t": "    }"},
      {"t": ""},
      {"t": "print(log_assistant_event("},
      {"t": "    'accept_draft', 'bodywash', 'uk',"},
      {"t": "    product='Gentle Wash', phases=3,"},
      {"t": "))"},
      {"t": "print(log_assistant_event("},
      {"t": "    'banned_hit', 'preservative',"},
      {"t": "    inci='Methylisothiazolinone',"},
      {"t": "))"},
    ],
  },
}

TRACE = {
  "fig": "TRACE.01",
  "title": "log_assistant_event — pack tags + meta",
  "lines": [ln["t"] for ln in CODE["project"]["lines"]],
  "steps": [
    {"line": 1, "vars": {}, "note": "Signature: kind, then *tags, then **meta."},
    {"line": 8, "vars": {"kind": "'accept_draft'", "tags": "('bodywash','uk')"}, "note": "Extra positionals landed in tags."},
    {"line": 10, "vars": {"meta": "{product, phases}"}, "note": "Named leftovers landed in meta."},
    {"line": 11, "vars": {}, "io": [{"k": "out", "text": "{'kind': 'accept_draft', ...}"}], "note": "One Glass Box event dict."},
  ],
}

s1 = section(
  "s1", "2.1", "Keyword-only with *",
  "\n".join([
    p("Tutorial §4.9. After a <code>*</code> in the parameter list, callers <strong>must</strong> pass those arguments by keyword. That prevents silent swaps — e.g. treating a percent as a function label."),
    flow("kwonly", "400px"),
  ]),
  summary="Keyword-only parameters make dangerous arguments explicit at the call site.",
)

s2 = section(
  "s2", "2.2", "add_to_phase — pct must be named",
  "\n".join([
    p("Formulator bench helper: build a phase row. <code>pct</code> is keyword-only; <code>function</code> defaults to <code>'emollient'</code>."),
    code("kwonly", "400px"),
    callout("Call rule", "add_to_phase('A', 'Glycerin', pct=3) works. Passing 3 positionally after ingredient raises TypeError.", "accent"),
  ]),
  summary="add_to_phase(phase, ingredient, *, pct, function='emollient') — callers must write pct=.",
  exercise="Call add_to_phase for Phenoxyethanol in phase C at 0.8% with function='preservative'.",
)

s3 = section(
  "s3", "2.3", "*args for tags",
  "\n".join([
    p("<code>*args</code> (any name after *) collects extra positional arguments into a tuple. Useful when the number of tags varies per event."),
    code("args", "240px"),
  ]),
  summary="*tags packs zero-or-more positionals into a tuple — no manual list building at the call site.",
)

s4 = section(
  "s4", "2.4", "**kwargs for Glass Box meta",
  "\n".join([
    p("<code>**kwargs</code> collects leftover keyword arguments into a dict. Open-ended metadata without changing the signature every sprint."),
    code("kwargs", "240px"),
    pull("Glass Box traces: kind is fixed; tags and meta flex with the event."),
  ]),
  summary="**meta is the open bag for product=, phase=, latency_ms=, and future fields.",
)

s5 = section(
  "s5", "2.5 · Project", "Project: log_assistant_event",
  "\n".join([
    p("Combine: required <code>kind</code>, variable <code>*tags</code>, open <code>**meta</code>. Return a single event dict the Glass Box panel can append."),
    flow("glass", "400px"),
    code("project", "420px"),
    trace("480px"),
  ]),
  summary="log_assistant_event(kind, *tags, **meta) → {kind, tags, meta}. Capstone logs accept_draft before building the card.",
)

cheat = cheat_sheet([
  ("*", "Barrier: following params are keyword-only."),
  ("*args", "Tuple of extra positional arguments."),
  ("**kwargs", "Dict of extra keyword arguments."),
  ("add_to_phase", "phase, ingredient, *, pct, function=…"),
  ("log_assistant_event", "kind, *tags, **meta → Glass Box dict."),
  ("Default args", "function='emollient' evaluated at def time for immutables."),
])

html = chapter_shell(
  ch_num=2,
  title="Keyword args, *args, **kwargs",
  part_label="Part I — Callable contracts",
  lede="§4.9 / 4.9.2 / 4.9.4 for Formulaite: keyword-only pct on add_to_phase, and log_assistant_event for Glass Box traces.",
  intro_paras=[
    "Phases A/B/C on the formulator bench; assistant events in the Glass Box. Same language features as the Tutorial — product nouns instead of toy demos.",
  ],
  stats={"sections": "05", "diagrams": "02", "programs": "04"},
  sections_html=s1 + s2 + s3 + s4 + s5,
  cheat_html=cheat,
  next_label="03 lambda — sort shelf / rank candidates",
  sections=SECTIONS,
  flows=FLOWS,
  code=CODE,
  trace=TRACE,
)
write("Chapter 2.dc.html", html)
