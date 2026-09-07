#!/usr/bin/env python3
"""Chapter 6 — Generators (stream reply + CSV export iterator)."""
from common import *

SECTIONS = [
  {"id": "s1", "num": "6.1", "title": "yield pauses a function"},
  {"id": "s2", "num": "6.2", "title": "stream_assistant_tokens"},
  {"id": "s3", "num": "6.3", "title": "Consuming with for"},
  {"id": "s4", "num": "6.4", "title": "iter_phase_csv_rows"},
  {"id": "s5", "num": "6.5", "title": "Project: export phase CSV"},
  {"id": "cheat", "num": "—", "title": "Cheat sheet"},
]

FLOWS = {
  "yield": {
    "fig": "FIG.01",
    "title": "Generator protocol",
    "intro": "A function with yield returns a generator object. Each next()/for iteration runs until the next yield, then pauses — state kept between yields.",
    "nodes": [
      {"id": "call", "label": "call generator fn"},
      {"id": "gen", "label": "generator object"},
      {"id": "yield", "label": "yield value"},
      {"id": "resume", "label": "resume on next"},
      {"id": "stop", "label": "StopIteration"},
    ],
    "path": [
      {"id": "call", "note": "stream_assistant_tokens(reply) — does not run the body yet."},
      {"id": "gen", "note": "You hold an iterator; for loops call next for you."},
      {"id": "yield", "note": "One word chunk handed to the UI stream."},
      {"id": "resume", "note": "Body continues after the yield point."},
      {"id": "stop", "note": "When the function returns, iteration ends."},
    ],
  },
  "csv_iter": {
    "fig": "FIG.02",
    "title": "Phase → CSV row dicts",
    "intro": "Export without building a giant list first: yield one DictWriter-ready row at a time.",
    "nodes": [
      {"id": "phase", "label": "FormulaPhase"},
      {"id": "iter", "label": "iter_phase_csv_rows"},
      {"id": "row", "label": "yield {phase,inci,pct,function}"},
      {"id": "write", "label": "csv.DictWriter"},
    ],
    "path": [
      {"id": "phase", "note": "Phase A items after accept."},
      {"id": "iter", "note": "Generator walks items lazily."},
      {"id": "row", "note": "Flat dict matching export columns."},
      {"id": "write", "note": "Consumer writes rows — Capstone wires this."},
    ],
  },
}

CODE = {
  "yield_basic": {
    "file": "yield_shape.py",
    "output": [
      "1",
      "2",
      "3",
    ],
    "lines": [
      {"t": "def count_up(n):", "c": "yield makes this a generator function."},
      {"t": "    i = 1"},
      {"t": "    while i <= n:"},
      {"t": "        yield i", "c": "Pause here; hand i to the caller."},
      {"t": "        i += 1"},
      {"t": ""},
      {"t": "for x in count_up(3):"},
      {"t": "    print(x)"},
    ],
  },
  "stream": {
    "file": "stream_assistant_tokens.py",
    "output": [
      "[token] Drafting",
      "[token] a",
      "[token] mild",
      "[token] bodywash",
      "[token] with",
      "[token] coco-glucoside…",
    ],
    "lines": [
      {"t": "def stream_assistant_tokens(reply):", "c": "Yield word chunks for the AI pane."},
      {"t": "    \"\"\"Yield whitespace-separated tokens from reply.\"\"\""},
      {"t": "    for word in reply.split():"},
      {"t": "        yield word"},
      {"t": ""},
      {"t": "text = 'Drafting a mild bodywash with coco-glucoside…'"},
      {"t": "for token in stream_assistant_tokens(text):"},
      {"t": "    print('[token]', token)"},
    ],
  },
  "consume": {
    "file": "consume_next.py",
    "output": [
      "first=Drafting",
      "rest=['a', 'mild', 'bodywash']",
    ],
    "lines": [
      {"t": "def stream_assistant_tokens(reply):"},
      {"t": "    for word in reply.split():"},
      {"t": "        yield word"},
      {"t": ""},
      {"t": "gen = stream_assistant_tokens('Drafting a mild bodywash')"},
      {"t": "first = next(gen)", "c": "Manual pull — for does this in a loop."},
      {"t": "rest = list(gen)", "c": "Drain the remainder into a list."},
      {"t": "print(f'first={first}')"},
      {"t": "print(f'rest={rest}')"},
    ],
  },
  "csv_rows": {
    "file": "iter_phase_csv_rows.py",
    "output": [
      "{'phase': 'A', 'inci': 'Coco-Glucoside', 'pct': 12.0, 'function': 'surfactant'}",
      "{'phase': 'A', 'inci': 'Glycerin', 'pct': 3.0, 'function': 'humectant'}",
    ],
    "lines": [
      {"t": "def iter_phase_csv_rows(phase):", "c": "phase: object with .name and .items OR dict shape."},
      {"t": "    \"\"\"Yield CSV-ready dicts for one Formulaite phase.\"\"\""},
      {"t": "    name = phase['name'] if isinstance(phase, dict) else phase.name"},
      {"t": "    items = phase['items'] if isinstance(phase, dict) else phase.items"},
      {"t": "    for item in items:"},
      {"t": "        if isinstance(item, dict):"},
      {"t": "            yield {"},
      {"t": "                'phase': name,"},
      {"t": "                'inci': item['inci'],"},
      {"t": "                'pct': float(item['pct']),"},
      {"t": "                'function': item.get('function', 'emollient'),"},
      {"t": "            }"},
      {"t": "        else:"},
      {"t": "            yield {"},
      {"t": "                'phase': name,"},
      {"t": "                'inci': item.inci,"},
      {"t": "                'pct': float(item.pct),"},
      {"t": "                'function': item.function,"},
      {"t": "            }"},
      {"t": ""},
      {"t": "phase_a = {"},
      {"t": "    'name': 'A',"},
      {"t": "    'items': ["},
      {"t": "        {'inci': 'Coco-Glucoside', 'pct': 12, 'function': 'surfactant'},"},
      {"t": "        {'inci': 'Glycerin', 'pct': 3, 'function': 'humectant'},"},
      {"t": "    ],"},
      {"t": "}"},
      {"t": "for row in iter_phase_csv_rows(phase_a):"},
      {"t": "    print(row)"},
    ],
  },
  "project": {
    "file": "export_phase_csv.py",
    "output": [
      "phase,inci,pct,function",
      "B,Xanthan Gum,0.4,rheology",
    ],
    "lines": [
      {"t": "import csv"},
      {"t": "import io"},
      {"t": ""},
      {"t": "def iter_phase_csv_rows(phase):"},
      {"t": "    name = phase['name']"},
      {"t": "    for item in phase['items']:"},
      {"t": "        yield {"},
      {"t": "            'phase': name,"},
      {"t": "            'inci': item['inci'],"},
      {"t": "            'pct': float(item['pct']),"},
      {"t": "            'function': item.get('function', 'emollient'),"},
      {"t": "        }"},
      {"t": ""},
      {"t": "def export_phase_csv(phase) -> str:"},
      {"t": "    buf = io.StringIO()"},
      {"t": "    fields = ['phase', 'inci', 'pct', 'function']"},
      {"t": "    w = csv.DictWriter(buf, fieldnames=fields)"},
      {"t": "    w.writeheader()"},
      {"t": "    for row in iter_phase_csv_rows(phase):", "c": "Consume generator with for."},
      {"t": "        w.writerow(row)"},
      {"t": "    return buf.getvalue()"},
      {"t": ""},
      {"t": "phase_b = {"},
      {"t": "    'name': 'B',"},
      {"t": "    'items': [{'inci': 'Xanthan Gum', 'pct': 0.4, 'function': 'rheology'}],"},
      {"t": "}"},
      {"t": "print(export_phase_csv(phase_b), end='')"},
    ],
  },
}

TRACE = {
  "fig": "TRACE.01",
  "title": "stream_assistant_tokens — yield loop",
  "lines": [ln["t"] for ln in CODE["stream"]["lines"]],
  "steps": [
    {"line": 1, "vars": {}, "note": "Generator function defined."},
    {"line": 6, "vars": {"text": "'Drafting a mild…'"}, "note": "Reply string from the assistant."},
    {"line": 7, "vars": {"token": "'Drafting'"}, "io": [{"k": "out", "text": "[token] Drafting"}], "note": "First yield consumed by for."},
    {"line": 3, "vars": {"token": "'a'"}, "note": "Resumed; next word yielded."},
  ],
}

s1 = section(
  "s1", "6.1", "yield pauses a function",
  "\n".join([
    p("Tutorial §9.9–9.10. <code>yield</code> turns a function into a <strong>generator</strong>. Callers iterate values over time instead of receiving one big list."),
    flow("yield", "420px"),
    code("yield_basic", "300px"),
  ]),
  summary="yield produces a value and pauses. Generators are lazy iterators.",
)

s2 = section(
  "s2", "6.2", "stream_assistant_tokens",
  "\n".join([
    p("Cosmetic AI Assistant streams the reply into the chat pane. Word chunks are a simple stand-in for token streaming — same consumption pattern."),
    code("stream", "320px"),
    trace("480px"),
  ]),
  summary="stream_assistant_tokens(reply) yields split word chunks for the UI.",
  exercise="Change the splitter to yield pairs of words (hint: iterate indices).",
)

s3 = section(
  "s3", "6.3", "Consuming with for",
  "\n".join([
    p("A <code>for</code> loop is the everyday consumer. <code>next()</code> and <code>list()</code> show the same protocol underneath."),
    code("consume", "300px"),
  ]),
  summary="for x in gen: … is the idiomatic consumer; next(gen) pulls one value.",
)

s4 = section(
  "s4", "6.4", "iter_phase_csv_rows",
  "\n".join([
    p("Export iterator: one CSV-shaped dict per ingredient. Accepts dict phases (tests) or FormulaPhase objects (Chapter 5)."),
    flow("csv_iter", "400px"),
    code("csv_rows", "520px"),
  ]),
  summary="iter_phase_csv_rows(phase) yields {phase, inci, pct, function}.",
)

s5 = section(
  "s5", "6.5 · Project", "Project: export phase CSV",
  "\n".join([
    p("Wire the generator to <code>csv.DictWriter</code> via <code>for</code>. Return CSV text (StringIO) so tests need no filesystem."),
    code("project", "460px"),
    callout("Acceptance", "Header plus one data row for phase B xanthan.", "quiet"),
  ]),
  summary="export_phase_csv consumes iter_phase_csv_rows. Capstone exports after accept.",
)

cheat = cheat_sheet([
  ("yield", "Produce a value; pause the function."),
  ("generator", "Iterator returned by a yield function."),
  ("for", "Primary consumer of generators."),
  ("next(g)", "Pull one value; raises StopIteration when done."),
  ("stream_assistant_tokens", "Yield word chunks from a reply string."),
  ("iter_phase_csv_rows", "Yield CSV dicts for phase export."),
])

html = chapter_shell(
  ch_num=6,
  title="Generators — stream & export",
  part_label="Part III — Structure & streams",
  lede="§9.9–9.10 for Formulaite: stream_assistant_tokens for the AI pane, iter_phase_csv_rows for phase CSV export — both consumed with for.",
  intro_paras=[
    "Lazy iteration matters when replies are long and exports should not materialise every row before writing.",
  ],
  stats={"sections": "05", "diagrams": "02", "programs": "05"},
  sections_html=s1 + s2 + s3 + s4 + s5,
  cheat_html=cheat,
  next_label="07 Capstone — accept → card → export",
  sections=SECTIONS,
  flows=FLOWS,
  code=CODE,
  trace=TRACE,
)
write("Chapter 6.dc.html", html)
