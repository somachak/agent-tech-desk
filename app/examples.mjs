/* The programs offered in the browser IDE. Every one runs in Pyodide
   (CPython 3.13, standard library only) — scripts/check.mjs proves it. */
export const EXAMPLES = [
  {
    id: "star-args",
    name: "*args and **kwargs",
    note: "The Glass Box recorder: one signature that accepts any extra labels and any extra fields.",
    code: `# The Glass Box: log(kind, *tags, **meta)
# *tags  collects loose extra values into a tuple
# **meta collects name=value pairs into a dict

def log(kind, *tags, **meta):
    return {"kind": kind, "tags": tags, "meta": meta}

event = log("gate", "glycerin", "retry", passed=False, reasons=["out of range"])

print("kind :", event["kind"])
print("tags :", event["tags"])
print("meta :", event["meta"])
`,
  },
  {
    id: "dataclass",
    name: "A dataclass record",
    note: "The Ingredient Drawer as data: Python writes __init__ and __repr__ for you.",
    code: `from dataclasses import dataclass, field

@dataclass
class IngredientDrawer:
    inci_name: str = ""
    function: str = ""
    use_level_pct: float | None = None
    sources: list[str] = field(default_factory=list)   # a fresh list per drawer

    def missing(self):
        return [n for n in ("inci_name", "function", "use_level_pct", "sources")
                if not getattr(self, n)]

drawer = IngredientDrawer(inci_name="Glycerin", function="humectant")
print(drawer)
print("still missing:", drawer.missing())
`,
  },
  {
    id: "gate",
    name: "A deterministic gate",
    note: "Plain code has the last word: checks return a reason, or None when they pass.",
    code: `def check_range(pct, lo, hi):
    if pct is None:
        return "no use level given"
    if not (lo <= pct <= hi):
        return f"use_level_pct {pct}% is outside the catalogue range {lo}-{hi}%"
    return None

def run_gates(pct, lo=1.0, hi=10.0):
    checks = [lambda: check_range(pct, lo, hi)]
    reasons = [r for check in checks if (r := check()) is not None]
    return (not reasons), reasons

for value in (5.5, 50.0, None):
    passed, reasons = run_gates(value)
    print(f"{str(value):>5}  ->  {'PASS' if passed else 'FAIL'}  {reasons}")
`,
  },
  {
    id: "generator",
    name: "A generator (yield)",
    note: "Replay a run one event at a time instead of building the whole list.",
    code: `events = [
    {"step": 1, "kind": "request"},
    {"step": 2, "kind": "model_reply"},
    {"step": 3, "kind": "tool_call"},
    {"step": 4, "kind": "gate"},
]

def replay(events):
    for event in events:
        yield event          # hand one back, pause here, continue when asked

for event in replay(events):
    print(f"[{event['step']:02d}] {event['kind']}")

print("a generator object:", replay(events))
`,
  },
  {
    id: "loop",
    name: "The agent loop, in miniature",
    note: "Think → act → gate → repeat, with a step budget so it can never run away.",
    code: `CATALOGUE = {"glycerin": {"inci": "Glycerin", "lo": 1.0, "hi": 10.0}}

def fake_model(step, feedback):
    "Stands in for Claude: step 1 asks for a tool, step 2 answers."
    if step == 1:
        return {"tool": "catalogue_lookup", "input": {"inci": "glycerin"}}
    return {"answer": {"inci_name": "Glycerin", "use_level_pct": 50.0 if not feedback else 5.5}}

def run(max_steps=4):
    feedback = None
    for step in range(1, max_steps + 1):
        reply = fake_model(step, feedback)
        if "tool" in reply:
            print(f"step {step}: tool -> {reply['tool']}({reply['input']})")
            continue
        pct = reply["answer"]["use_level_pct"]
        entry = CATALOGUE["glycerin"]
        if entry["lo"] <= pct <= entry["hi"]:
            print(f"step {step}: gate PASS at {pct}%")
            return reply["answer"]
        feedback = f"{pct}% is outside {entry['lo']}-{entry['hi']}%"
        print(f"step {step}: gate FAIL — {feedback}")
    print("budget exhausted")

print("drawer:", run())
`,
  },
];
