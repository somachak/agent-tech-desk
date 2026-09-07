# Modern Loop Engineering for Agentic AI — cheat sheet

*Dominic F. Hargrave · 187 pages · Formulaite bookshelf book 10 of 14*

**Core idea:** Reliable intelligence comes from the loop around the model, not from the model: observe, reason, act, evaluate, improve, with control at every step.

**Read when:** Open it when your agent works in a demo but you cannot say why it stopped, what it may touch, or how it gets better.

## Vocabulary

| Term | Means |
|---|---|
| Loop engineering | Designing an agent as repeated cycles of observe, reason, act, evaluate, improve. |
| Agent | A model plus memory, planning, tools, evaluation and the power to act. |
| Observation | Gathering the facts the next decision needs; its quality caps decision quality. |
| Evaluation | Checking whether an action achieved the intended result. |
| Loop control | Step limits, checkpoints, approvals and failure rules that stop a runaway. |
| Closed loop | A system that measures its own results and adjusts. |
| Open loop | A system that acts once and never looks back. |
| Feedback drift | Getting better at the rewarded signal and worse at the real goal. |
| Execution layer | Where decisions touch the world: permissions, validation, recovery, monitoring. |
| Short-term memory | Task-local context, discarded when the task ends. |
| Long-term memory | Semantic facts, episodic history and procedural templates that outlive a task. |
| Provisional storage | A staging area for unverified claims before they may enter long-term memory. |
| Provenance | Origin, date, revision and validation status attached to a fact. |
| Context isolation | Retrieved text gets no authority over the agent's rules. |
| Observability | Enough recorded evidence to explain why an outcome happened. |
| Trace | Log events linked into one run's execution path. |
| Audit trail | Tamper-resistant records that tie actions to an identity for accountability. |
| Checkpoint | Saved workflow state so a run resumes instead of restarting. |
| Red team | People who try to break the agent on purpose before an attacker does. |
| Oversight model | How much autonomy an agent gets: approve-all, supervised, or progressive. |

## The pattern

1. objective = what done looks like (the drawer sections)
2. for step in range(max_steps):
3.     observe: gather facts from memory and tools
4.     reason: model proposes one action
5.     control: is it allowed? needs a human? then act
6.     evaluate: deterministic gate, log the verdict
7.     pass -> stop; fail -> feed reasons back
8. after many runs: improve the rules, never mid-run

## Rules of thumb

| Do | Don't |
|---|---|
| Put the stop condition in code (max_steps, timeouts). | Ask the model to decide when it has done enough. |
| Keep the gate free of any model call. | Let the model grade its own drawer. |
| Send gate reasons back as the next input. | Retry with identical input and hope. |
| Stage new claims with source and date, then validate. | Write supplier claims straight into the catalogue. |
| Wrap retrieved text as data with no authority. | Paste a web page next to the system rules. |
| Validate tool outputs against sanity ranges. | Trust a result because the tool is yours. |
| Log one event per loop stage with ids and a timestamp. | Print free text nobody can filter. |
| Give tools a read or write class; gate the writes. | Hand every tool to every agent just in case. |
| Change rules in the slow loop after many traces. | Rewrite the system prompt after one bad run. |
| Benchmark the same tasks after every change, with cost. | Test only the ingredients that already pass. |

## Skeletons

### Five-stage loop with budget

```python
for step in range(1, max_steps + 1):
    reply = model.complete(system, convo.as_api(), tools.to_api())  # observe+reason
    if not reply.tool_uses:
        break                                                      # model answered
    results = [run_tool(c) for c in reply.tool_uses]               # act
    verdict = gate_if_answer(results)                              # evaluate
    box.log("gate", inci, passed=verdict.passed, reasons=verdict.reasons)
    if verdict.passed:
        break
    convo.add_tool_results(results)                                # improve next turn
else:
    box.log("budget_exhausted", inci, max_steps=max_steps)
```

### Deterministic gate

```python
def check_has_sources(drawer, entry):
    return None if drawer.sources else "no sources listed"

def run_gates(drawer, *, catalogue_entry=None, checks=DEFAULT_CHECKS):
    entry = catalogue_entry or {}
    reasons = [r for check in checks if (r := check(drawer, entry)) is not None]
    return GateVerdict(passed=not reasons, reasons=tuple(reasons))
```

### Provisional memory with provenance

```python
@dataclass(frozen=True)
class Fact:
    text: str
    source: str
    retrieved_at: str
    validated: bool = False

provisional: list[Fact] = []

def promote(fact: Fact, catalogue: dict) -> Fact | None:
    ok = fact.text in catalogue.get("facts", [])
    return Fact(fact.text, fact.source, fact.retrieved_at, True) if ok else None
```

### Retrieved text as data

```python
def as_data(text: str) -> str:
    keep = [l for l in text.splitlines()
            if not l.strip().lower().startswith(("ignore", "you must", "system:"))]
    return "<supplier_page_data>\n" + "\n".join(keep) + "\n</supplier_page_data>"
```

## Decisions

| When | Use | Not |
|---|---|---|
| The task is stable and a mistake is cheap | an open loop, one shot | a full closed loop with gates |
| A mistake reaches the drawer or a customer | a closed loop with a deterministic gate | the model's own confidence |
| The gate fails for the first time | retry with the reasons as input | hand to a human straight away |
| The gate fails twice with the same reason | another source or a human | a third identical retry |
| A supplier page has a new claim | provisional storage with source and date | the catalogue |
| A tool writes state or spends money | approval before the call | supervised autonomy |
| You have two agents | direct messages | a coordinator |
| You have many agents | a coordinator and standard messages | a web of direct links |

## Before you ship

- [ ] before you ship, check max_steps and a timeout exist on every run and every tool call
- [ ] before you ship, check the gate has no model call inside it
- [ ] before you ship, check every gate verdict is logged with its reasons
- [ ] before you ship, check retrieved text is wrapped as data and never edits the rules
- [ ] before you ship, check every drawer has at least one source
- [ ] before you ship, check write tools need approval and read tools are logged
- [ ] before you ship, check the benchmark includes a banned and an unknown ingredient
- [ ] before you ship, check the trace can answer why the run stopped

## Build ladder

**Rung 1 · The five-stage loop with a budget** (~1 hour) — Run the ingredient-research agent on one ingredient and label every Glass Box event with its loop stage.
  1. Run `python -m agent_lab Glycerin` and read the Glass Box printout.
  2. Mark each event as observe, reason, act, evaluate or improve.
  3. Set max_steps to 2 and watch the budget_exhausted event appear.
  4. Write one sentence: did the model stop the run, or did the loop?

**Rung 2 · Recovery ladder, checkpoints and provisional memory** (~half a day) — A gate failure that retries, then asks, then hands over; plus a staging list for unverified ingredient claims.
  1. Add a retry counter to the gate feedback in agent.py; after two fails, stop and ask.
  2. Log an evaluation event for every gate verdict, with the reasons list.
  3. Add a `provisional` list to memory.py that holds new claims with source and date.
  4. Promote a claim into the drawer only after catalogue_lookup confirms it.
  5. Put a timeout around read_supplier_page and record it in the Glass Box.

**Rung 3 · Governed tools, injection defence and a cost-aware eval** (~2 days) — Per-tool permissions, supplier text treated as data only, and a repeatable eval that reports cost.
  1. Tag every tool in tools.py as read or write; block write tools without approval.
  2. Wrap supplier page text as data in formulaite_tools.py and strip imperative lines.
  3. Validate tool outputs against the catalogue range before they touch the drawer.
  4. Run all five catalogue ingredients through the loop; record steps, gate fails and token estimate.
  5. Add a red-team supplier page with a hidden instruction and check the gate still holds.

## You're done when

- You can point at a Glass Box trace and name the loop stage of every event, including the one that stopped the run.
- You can make the gate reject a drawer, watch the reasons go back, and see the next attempt fix exactly those.
- You can plant an instruction in a supplier page and show the gate still blocks the out-of-range use level.

*Source: `books-md/modern-loop-engineering-for-agentic-ai.md` · chapters: 1 Understanding Loop Engineering and the Rise of Agentic AI, 2 Foundations of Agentic AI Architecture, 3 Designing Intelligent Feedback Loops for AI Agents, 4 Engineering Reliable Agentic AI Systems, 5 Scaling Agentic AI Infrastructure, 6 Agent Orchestration and Workflow Engineering, 7 Memory, Knowledge, and Learning Systems for Agentic AI, 8 Governing Agentic AI Systems, 9 Security, Safety, and Risk Management for Agentic AI, 10 Observability, Monitoring, and Performance Management, 11 Enterprise Applications and Real-World Agentic AI Deployment, 12 Advanced Loop Engineering Techniques, 13 Evaluating and Benchmarking Agentic AI Systems, 14 Ethical AI, Compliance, and Responsible Agent Engineering, 15 The Future of Loop Engineering and Autonomous AI Systems*
