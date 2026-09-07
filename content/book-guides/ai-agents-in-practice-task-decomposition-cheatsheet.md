# AI Agents in Practice: Task Decomposition, Delegation, and Human-in-the-Loop Control — cheat sheet

*Sophie Langford · 94 pages · Formulaite bookshelf book 8 of 14*

**Core idea:** Decompose to the drawer's fixed sections, delegate each under a written contract, and put the human gate exactly where the write happens.

**Read when:** Open it when Formulaite's research loop needs to grow from one agent doing everything into briefed sub-tasks with a person approving the catalogue write.

## Vocabulary

| Term | Means |
|---|---|
| Scope statement | One sentence naming what the agent is for and nothing more. |
| Risk tier | Read, propose or write; decides how much control an action gets. |
| System surface | Every store, page and file the agent can read or write. |
| Sub-question | One drawer section phrased as a question with a known answer shape. |
| Delegation brief | What goes out: sub-question, allowed tools, budget, output shape. |
| Handoff packet | What comes back: values, sources, confidence, open questions. |
| Coordinator | The part that briefs, collects, merges and gates; it never researches. |
| Sub-agent | A small loop with read tools, one brief and its own budget. |
| Deterministic gate | Plain code that passes or fails a drawer with reasons. |
| Human review gate | A checkpoint where a person approves, edits or rejects before a write. |
| Least privilege | Each sub-task gets only the tools it needs. |
| Step budget | A hard cap on tool calls per brief. |
| Escalation | Stopping early and handing a human one clear question. |
| Operational signal | A per-run number such as gate failures or override rate. |
| Override rate | How often the human changes or rejects what the gate passed. |
| Version stamp | Prompt, model, catalogue and gate versions logged per run. |
| Incident drill | A rehearsed failure run to prove gates and escalation work. |
| Scenario | One full path through the decomposition with an expected outcome. |
| Staged promotion | Sandbox, read, propose, write; a new tool climbs one step at a time. |
| Governance page | One page saying who approves what and what is never automated. |

## The pattern

1. Write the scope: one INCI, one drawer.
2. Split into sub-questions from REQUIRED_SECTIONS; keep dependent ones together.
3. Brief each sub-question: role, context, constraints, read tools, budget.
4. Collect handoff packets; escalate any with low confidence or open questions.
5. Merge into a drawer and run the deterministic gate.
6. Show the human one screen: drawer, reasons, sources; approve, edit or reject.
7. Write to the catalogue only after approval; save the trace first.

## Rules of thumb

| Do | Don't |
|---|---|
| Write the scope sentence before writing any prompt. | Start from 'research this ingredient'. |
| Derive sub-questions from the drawer's fixed sections. | Let the model invent the split each run. |
| Give every brief a budget, a tool list and an output shape. | Delegate with a sentence of prose. |
| Put the human gate where the write happens. | Gate every read. |
| Show the reviewer drawer, gate reasons and sources on one screen. | Show the raw conversation. |
| Run the deterministic gate before any human sees a drawer. | Ask the model to review itself. |
| Give sub-agents read tools only. | Pass the full registry for convenience. |
| Save the Glass Box before every write. | Save only successful runs. |
| Stamp each run with prompt, model, catalogue and gate versions. | Change two of them in the same week. |
| Promote a new tool one stage at a time. | Wire a live tool straight into the write path. |

## Skeletons

### Brief out, Handoff back

```python
@dataclass(frozen=True)
class Brief:
    inci: str
    sections: tuple[str, ...]
    tools: tuple[str, ...] = ("catalogue_lookup", "read_supplier_page")
    max_steps: int = 4
@dataclass
class Handoff:
    values: dict[str, str]
    sources: list[str]
    confidence: float
    open_questions: list[str] = field(default_factory=list)
```

### Coordinator: brief, collect, merge, gate

```python
def coordinate(inci: str) -> IngredientDrawer:
    groups = [("inci_name", "function", "typical_use_level", "use_level_pct"),
              ("phase_and_solubility", "ph_range"),
              ("compatibility", "safety_notes")]
    packets = [run_sub_agent(Brief(inci, g)) for g in groups]
    drawer = merge(packets)                      # escalates on weak packets
    verdict = run_gates(drawer, catalogue_entry=catalogue_entry(inci))
    if not verdict:
        raise Escalate(verdict.reasons)
    return drawer
```

### Human gate before the write

```python
def publish(drawer, verdict, box, ask=input) -> str:
    box.save(f"runs/{box.run_id}.json")          # backup first
    print(drawer.to_dict()); print("gate:", verdict.reasons or "PASS")
    answer = ask("approve / edit / reject: ").strip()
    box.log("human_gate", drawer.inci_name, answer=answer)
    if answer != "approve":
        return answer
    catalogue_write(drawer)
    return "written"
```

### Scenario runner

```python
SCENARIOS = {
    "happy":      ("Glycerin", True),
    "missing":    ("Unobtainium", False),
    "contradict": ("Niacinamide", False),
}
for name, (inci, expect_ok) in SCENARIOS.items():
    box_ok = Agent(model=ScriptedModel(), tools=build_registry()).run(inci).ok
    assert box_ok == expect_ok, name
```

## Decisions

| When | Use | Not |
|---|---|---|
| Sub-questions are independent | one brief per group, run side by side | one long loop |
| One section depends on another, like use level on function | one brief covering both | two sub-agents that must reconcile |
| An action only reads | logging and a step budget | a human gate |
| An action writes to the catalogue | deterministic gate, then human gate | either one alone |
| A packet has low confidence or open questions | escalate with one clear question | let the coordinator guess |
| Quality drops after a change | compare runs within the same version stamp | argue from memory |
| A new tool looks useful | sandbox, then read, then propose, then write | straight into production |
| The coordinator keeps filling gaps itself | collapse back to one agent | more sub-agents |

## Before you ship

- [ ] Scope sentence written and it matches Agent.run's single INCI argument.
- [ ] Every drawer section maps to a sub-question and a tool.
- [ ] Every brief has a budget, a tool list and an output shape.
- [ ] Sub-agents hold read tools only; the write tool sits behind the human gate.
- [ ] The reviewer screen shows drawer, gate reasons and sources, with approve, edit, reject.
- [ ] Glass Box saved before every write; the rollback path tested once.
- [ ] Version stamp logged on every run.
- [ ] Scenarios for happy, missing, contradicting and rejected paths pass before shipping.

## Build ladder

**Rung 1 · Scoped, decomposed research for one ingredient** (~1 hour) — A Formulaite run where the scope is one INCI, each drawer section is a written sub-question mapped to a tool, and the Glass Box shows which sub-question each step served.
  1. Write the one-sentence scope and check it matches Agent.run(inci).
  2. Turn REQUIRED_SECTIONS in drawer.py into a list of sub-questions.
  3. Map each sub-question to catalogue_lookup or read_supplier_page.
  4. Run the offline agent on Glycerin and open the saved Glass Box.
  5. Label each event with the sub-question it answered.

**Rung 2 · Briefed sub-runs with a human gate on the catalogue write** (~half a day) — Read-only sub-runs that each get a Brief and return a Handoff packet, a coordinator that merges them, and an approve step before anything is written.
  1. Add Brief and Handoff dataclasses next to drawer.py.
  2. Build a read-only ToolRegistry and give each sub-run its own max_steps.
  3. Write merge() that escalates on low confidence or open questions.
  4. Add approve() showing drawer, gate reasons and sources before the write.
  5. Log the human answer and the gate verdict as Glass Box events.

**Rung 3 · Governed, drilled, measured agent that can take on new tools** (~2 days) — A version-stamped Formulaite agent with a one-page policy the loop reads, a scenario folder that runs before every change, and a staged path for adding a live supplier fetch.
  1. Log a versions event with prompt, model, catalogue and gate versions on every run.
  2. Run the fail_first drill and assert one gate_fail event.
  3. Add a POLICY dict in gates.py and check it before each tool call.
  4. Build scenarios for happy, missing, contradicting and rejected paths.
  5. Add a live read_supplier_page at the sandbox stage and promote it only after scenarios pass.

## You're done when

- Turn one INCI request into a list of Briefs from REQUIRED_SECTIONS, run each with a read-only ToolRegistry, and merge the Handoff packets into one drawer.
- Add a human gate before the catalogue write that shows drawer, gate reasons and sources, and prove from the Glass Box that a reject stopped the write.
- Run four scenarios (happy, missing, contradicting, rejected) with a version stamp on each and report three numbers: gate pass rate, override rate, steps per drawer.

*Source: `books-md/ai-agents-in-practice-task-decomposition.md` · chapters: 1 Chapter 1: Define Scope and Risk, 2 Chapter 2: Map the System Surface, 3 Chapter 3: Prioritize Controls, 4 Chapter 4: Set Input Standards, 5 Chapter 5: Design Human Review Gates, 6 Chapter 6: Harden Access, 7 Chapter 7: Build Backup and Recovery, 8 Chapter 8: Track Operational Signals, 9 Chapter 9: Run Incident Drills, 10 Chapter 10: Automate Repeatable Checks, 11 Chapter 11: Improve Handoff Protocol, 12 Chapter 12: Measure Trust and Quality, 13 Chapter 13: Control Version Drift, 14 Chapter 14: Train Habit Loops, 15 Chapter 15: Handle Edge Cases, 16 Chapter 16: Simplify Support Workflows, 17 Chapter 17: Set Quarterly Goals, 18 Chapter 18: Deploy Lightweight Governance, 19 Chapter 19: Validate With Scenarios, 20 Chapter 20: Sustain the Practice, 21 Chapter 21: Expand to New Tools, 22 Chapter 22: Integrate Policy and Behavior*
