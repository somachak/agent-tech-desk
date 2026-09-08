"""
A coding agent, built from nothing, in six steps.

Run it:      python3 agent_lab.py
Run one step: python3 agent_lab.py 3

No API key. No sandbox. No pip install. Plain Python 3.
Every step prints what it is doing and why, then stops so you can read it.

This is NOT the DeepLearning.AI course code. It is the same *mechanism*,
stripped to the smallest thing that still teaches it, using HR data instead
of Pokemon so the questions mean something to you.
"""

import sys, io, json, csv, contextlib, textwrap

# ─────────────────────────────────────────────────────────────────────
# A tiny dataset. Nine people, three grades. Deliberately small enough
# that you can check every answer the agent gives you by eye.
# ─────────────────────────────────────────────────────────────────────
ROWS = [
    {"name": "Ade",    "grade": "G3", "salary": 41000, "years": 2},
    {"name": "Bea",    "grade": "G4", "salary": 52000, "years": 5},
    {"name": "Cai",    "grade": "G3", "salary": 39500, "years": 1},
    {"name": "Dev",    "grade": "G5", "salary": 71000, "years": 9},
    {"name": "Eve",    "grade": "G4", "salary": 55000, "years": 6},
    {"name": "Fin",    "grade": "G3", "salary": 40250, "years": 3},
    {"name": "Gus",    "grade": "G5", "salary": 68000, "years": 8},
    {"name": "Hana",   "grade": "G4", "salary": 50750, "years": 4},
    {"name": "Ira",    "grade": "G5", "salary": 74500, "years": 11},
]

def write_csv(path="people.csv"):
    with open(path, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(ROWS[0]))
        w.writeheader(); w.writerows(ROWS)
    return path

def banner(n, title, why):
    print("\n" + "═" * 68)
    print(f"  STEP {n} · {title}")
    print("═" * 68)
    print(textwrap.fill(why, 68) + "\n")


# ═════════════════════════════════════════════════════════════════════
# STEP 1 · A tool is just a function plus a description of itself
# ═════════════════════════════════════════════════════════════════════
def step1():
    banner(1, "A tool is a function plus a description",
        "A model cannot see your code. It sees a description. So every tool is "
        "two things: the function that does the work, and a JSON schema saying "
        "what it is called and what arguments it takes. Nothing more mysterious "
        "than that.")

    def count_by_grade():                       # the work
        counts = {}
        for r in ROWS:
            counts[r["grade"]] = counts.get(r["grade"], 0) + 1
        return counts

    schema = {                                   # the description
        "name": "count_by_grade",
        "description": "Count how many people are in each grade.",
        "parameters": {"type": "object", "properties": {}},
    }

    TOOLS = {"count_by_grade": count_by_grade}   # the registry

    print("The registry maps a name to a function:")
    print("   ", {k: v.__name__ for k, v in TOOLS.items()})
    print("\nThe schema is what the model is shown:")
    print(textwrap.indent(json.dumps(schema, indent=2), "    "))
    print("\nCalling it by name, the way the agent will:")
    print("    TOOLS['count_by_grade']()  →", TOOLS["count_by_grade"]())
    print("\n👉 TRY IT: add a tool `average_salary()` and register it.")


# ═════════════════════════════════════════════════════════════════════
# STEP 2 · The loop, with a fake model so you can see it clearly
# ═════════════════════════════════════════════════════════════════════
def step2():
    banner(2, "The loop — with a fake model",
        "This is the whole idea of an agent: call the model, and if it asks for "
        "a tool, run the tool, append the result, and ask again. Here the model "
        "is FAKE — a scripted list. That is deliberate. With no API key and no "
        "randomness you can watch the mechanism instead of the magic.")

    def count_by_grade():
        counts = {}
        for r in ROWS:
            counts[r["grade"]] = counts.get(r["grade"], 0) + 1
        return counts

    def highest_paid():
        return max(ROWS, key=lambda r: r["salary"])["name"]

    TOOLS = {"count_by_grade": count_by_grade, "highest_paid": highest_paid}

    # A real model decides these. Ours just reads them off a list.
    SCRIPT = [
        {"type": "tool_call", "name": "count_by_grade", "args": {}},
        {"type": "tool_call", "name": "highest_paid",   "args": {}},
        {"type": "message",   "text": "Three grades: G3 has 3, G4 has 3, G5 has 3. "
                                      "Ira is the highest paid."},
    ]
    def fake_model(messages):
        return SCRIPT[len([m for m in messages if m["role"] == "tool"])]

    messages = [{"role": "user", "content": "How many per grade, and who earns most?"}]
    MAX_STEPS = 5

    for step in range(MAX_STEPS):
        reply = fake_model(messages)

        if reply["type"] == "message":                 # ← the exit condition
            print(f"  [{step}] model speaks — no tool wanted, so we stop.")
            print(f"        “{reply['text']}”")
            break

        print(f"  [{step}] model asks for tool: {reply['name']}({reply['args']})")
        result = TOOLS[reply["name"]](**reply["args"])
        print(f"        tool returns: {result}")
        messages.append({"role": "tool", "content": str(result)})
    else:
        print(f"  stopped at the {MAX_STEPS}-step limit without finishing")

    print("\n  The two exit conditions, and you need both:")
    print("    1. the model stops asking for tools  →  the task is done")
    print("    2. MAX_STEPS is reached              →  the task is stuck")
    print("\n👉 TRY IT: delete the final 'message' from SCRIPT. Watch the limit save you.")


# ═════════════════════════════════════════════════════════════════════
# STEP 3 · One tool to rule them all: run arbitrary code
# ═════════════════════════════════════════════════════════════════════
def step3():
    banner(3, "The tool that changes everything",
        "Instead of writing count_by_grade, average_salary, highest_paid and "
        "fifty more by hand — give the agent ONE tool that runs Python. Now it "
        "can answer questions you never anticipated. This is the whole premise "
        "of a coding agent, and it is about fifteen lines.")

    def execute_code(code: str) -> dict:
        out = io.StringIO()
        try:
            with contextlib.redirect_stdout(out):
                exec(code, {"ROWS": ROWS})       # ROWS is the only thing it can see
            return {"result": out.getvalue().strip(), "error": None}
        except Exception as e:
            # A short, structured error — NOT a stack trace. The model has to
            # read this and recover from it, so keep it small and specific.
            return {"result": None, "error": f"{type(e).__name__}: {e}"}

    print("  A question nobody wrote a tool for — median salary per grade:\n")
    code = """
import statistics
by = {}
for r in ROWS:
    by.setdefault(r["grade"], []).append(r["salary"])
for g in sorted(by):
    print(g, "median", statistics.median(by[g]))
"""
    print(textwrap.indent(code.strip(), "      "))
    print("\n  execute_code returns:")
    print("     ", execute_code(code))

    print("\n  And when the code is wrong:")
    print("     ", execute_code("print(ROWS[99])"))
    print("\n  Note what came back: a short string, not forty lines of traceback.")
    print("  That is a design decision. The error goes into the model's context,")
    print("  and context is the thing you are always running out of.")
    print("\n👉 TRY IT: ask it for the salary range within grade G4.")


# ═════════════════════════════════════════════════════════════════════
# STEP 4 · Why this is dangerous
# ═════════════════════════════════════════════════════════════════════
def step4():
    banner(4, "Why this is dangerous",
        "Step 3 handed a language model the ability to run any Python on your "
        "machine. Notice that we never gave it a 'delete file' tool — and it "
        "does not need one. exec() already reached everything you can reach.")

    def execute_code(code: str) -> dict:
        out = io.StringIO()
        try:
            with contextlib.redirect_stdout(out):
                exec(code, {"ROWS": ROWS})
            return {"result": out.getvalue().strip(), "error": None}
        except Exception as e:
            return {"result": None, "error": f"{type(e).__name__}: {e}"}

    print("  No file tools were registered. Watch anyway:\n")
    print(execute_code("import os; print(sorted(os.listdir('.'))[:6])"))
    print(execute_code("import getpass, platform; print(getpass.getuser(), platform.system())"))
    print("\n  It listed your folder and named you. It could as easily have")
    print("  written, moved or deleted. Nothing here was malicious — the point")
    print("  is that NOTHING STOPPED IT.")
    print("\n  That is the entire argument for a sandbox, and you have just")
    print("  produced the evidence yourself rather than being told.")
    print("\n👉 THINK: what is the smallest change that would make this safe?")


# ═════════════════════════════════════════════════════════════════════
# STEP 5 · Watch the context grow
# ═════════════════════════════════════════════════════════════════════
def step5():
    banner(5, "Watch the context fill up",
        "Every loop appends to `messages`. Nothing removes anything. That is "
        "why agents get slower, dearer and dimmer as a task goes on — the "
        "course calls it context rot. You cannot manage what you cannot see, "
        "so: measure it.")

    def size(messages):
        chars = sum(len(str(m["content"])) for m in messages)
        return chars, chars // 4          # ~4 chars per token, rough but honest

    messages = [{"role": "user", "content": "Summarise this workforce."}]
    fake_outputs = [
        str(ROWS),                                  # a fat, unfiltered tool result
        str(ROWS),
        "G3:3 G4:3 G5:3",                           # the same thing, filtered
    ]
    print(f"  {'turn':<6}{'added':>8}{'total':>8}{'~tok':>7}   this turn added")
    prev = size(messages)[0]
    for i, out in enumerate(fake_outputs):
        messages.append({"role": "tool", "content": out})
        c, t = size(messages)
        print(f"  {i:<6}{c - prev:>8}{c:>8}{t:>7}   {'█' * ((c - prev) // 25)}")
        prev = c

    print("\n  Turns 0 and 1 each dumped the whole table in — about 550")
    print("  characters apiece. Turn 2 returned the answer only: 14 characters.")
    print("  Same question answered, roughly forty times less context spent.")
    print("\n  Three fixes, in order of how much they buy you:")
    print("    1. return the ANSWER, not the data it came from")
    print("    2. clip logs and repeated errors")
    print("    3. paginate anything that lists files or rows")
    print("\n👉 TRY IT: make fake_outputs[0] the filtered string. Watch the bars.")


# ═════════════════════════════════════════════════════════════════════
# STEP 6 · Put it together
# ═════════════════════════════════════════════════════════════════════
def step6():
    banner(6, "The whole agent, in one screen",
        "Registry, schema, loop, exit condition, structured errors, context "
        "measurement. This is every idea from the course in about forty lines. "
        "Swapping the fake model for a real one is a ten-line change — and it "
        "changes nothing about the shape.")

    def execute_code(code: str) -> dict:
        out = io.StringIO()
        try:
            with contextlib.redirect_stdout(out):
                exec(code, {"ROWS": ROWS})
            return {"result": out.getvalue().strip(), "error": None}
        except Exception as e:
            return {"result": None, "error": f"{type(e).__name__}: {e}"}

    TOOLS = {"execute_code": execute_code}
    SCHEMAS = [{"name": "execute_code",
                "description": "Run Python. ROWS is a list of dicts with name, grade, salary, years.",
                "parameters": {"type": "object",
                               "properties": {"code": {"type": "string"}},
                               "required": ["code"]}}]

    SCRIPT = [
        {"type": "tool_call", "name": "execute_code",
         "args": {"code": "print(sum(r['salary'] for r in ROWS if r['grade']=='G5') / 3)"}},
        {"type": "message", "text": "Mean G5 salary is 71,166.67."},
    ]
    def fake_model(messages, schemas):
        return SCRIPT[len([m for m in messages if m["role"] == "tool"])]

    def agent(question, max_steps=5):
        messages = [{"role": "user", "content": question}]
        for step in range(max_steps):
            reply = fake_model(messages, SCHEMAS)
            if reply["type"] == "message":
                return reply["text"], messages
            result = TOOLS[reply["name"]](**reply["args"])
            print(f"    [{step}] ran {reply['name']} → {result}")
            messages.append({"role": "tool", "content": str(result)})
        return "gave up at the step limit", messages

    answer, messages = agent("What is the mean salary in grade G5?")
    print(f"\n  answer   : {answer}")
    print(f"  turns    : {len(messages)} messages")
    print(f"  context  : ~{sum(len(str(m['content'])) for m in messages)//4} tokens")
    print("\n  Check it yourself: (71000 + 68000 + 74500) / 3 = 71,166.67  ✓")
    print("\n👉 NEXT: replace fake_model with a real API call. Everything else stays.")


STEPS = {1: step1, 2: step2, 3: step3, 4: step4, 5: step5, 6: step6}

if __name__ == "__main__":
    write_csv()
    wanted = [int(sys.argv[1])] if len(sys.argv) > 1 else sorted(STEPS)
    for n in wanted:
        STEPS[n]()
    print("\n" + "─" * 68)
    print("  people.csv written next to this file, if you'd rather use pandas.")
    print("─" * 68)
