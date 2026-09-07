# The 7 GenAI Architectures: A Field Guide to Choosing the Right AI System — cheat sheet

*Ranjan Kumar · 477 pages · Formulaite bookshelf book 11 of 14*

**Core idea:** Complexity must be earned by a demonstrated failure of the simpler architecture, and every level up has a price you can compute before you pay it.

**Read when:** Open it when someone proposes an agent for Formulaite and nobody in the room can say what would have to be true for a simpler design to be insufficient.

## Vocabulary

| Term | Means |
|---|---|
| Rung | One architecture on the ladder; adds exactly one capability the rung below cannot provide and charges for it. |
| Floor Test | Can a unit test fully specify the correct output for any input? Yes means no model. |
| Termination Test | Can you state the maximum model calls before the run? Yes is Level 5, no is Level 6. |
| Break-Even Test | R = crew cost over agent cost; a crew must beat the agent's accuracy by R, impossible above 1/R. |
| Failure Receipt | A reproducible input, the actual bad output, and the missing capability - required before climbing. |
| Removal Receipt | Stated population, a counter at zero, the smallest detectable effect, and an undoable first step. |
| Zero Row | The measured cost and failure rate of the deterministic version, before any model exists. |
| Format Illusion | Believing a validated response is a verified one; a schema checks shape, never truth. |
| Downstream Veto | A later stage shown the original input can overrule an earlier stage's claim. |
| Blame Sink | The reporting stage is the last one able to detect a fault, not the one that caused it; record origin too. |
| Blast Radius Schema | What a system can cause is a property of its tool schemas, computable before any tool is written. |
| consequence | The read-or-write field on every ToolSpec, with no default, that menus filter on. |
| Context Ratchet | State inside a run only accumulates; what you carry sets the cost slope and hardens early mistakes. |
| Refusal Premium | At an unbounded rung failures run longest, so cost runs inversely to value. |
| unreachable | The give-up field that lets an agent say 'never', read before the evidence check. |
| Budget | Three bounds - iterations, tokens, seconds - each naming itself when it fires. |
| Refusal Cascade | Try the cheapest rung and climb on a refusal, only where the failed attempt is free. |
| Effective Level | The rung whose single-rung cost equals your mean cost per request, read off the cost curve. |
| Scoring Surface | A place a claim can be wrong independently of the answer; the count is the eval difficulty. |
| Instrumentation Level | The highest contiguous rung whose failures your record alone can localize. |

## The pattern

1. Pick ONE request type. Run the Floor Test: if a test can specify the output, no model.
2. Eliminate from Level 7 down with yes-or-no questions about the task; refuse if any answer is unknown.
3. Build the lowest rung nothing forced you past; every exit refuses by name, never defaults.
4. Measure cost and refusal rate on the same columns as the Zero Row.
5. Write the Failure Receipt: input, actual output, missing capability. No receipt, no climb.
6. Climb one rung; keep the cheap path alive as code and route in front of mixed rungs.
7. Descend only with a Removal Receipt: state the population, unroute first, unbuild later.

## Rules of thumb

| Do | Don't |
|---|---|
| Refuse by name on every path that cannot decide. | Write else: return DEFAULT - it turns 'I do not know' into a confident wrong answer. |
| Put real constraints in enums and verify everything else with code. | Trust a max_length or a confidence float; the API demotes them to descriptions. |
| Ask for a verbatim quote or value and check it as a substring. | Ask the model how sure it is. |
| Give every tool a consequence field with no default and filter the menu on it. | Rely on 'never take destructive action' in the prompt. |
| Return tool errors that name what was available; mark empty results is_error=False. | Return 'Error: 404' or treat a healthy empty result as a failure. |
| Carry conclusions and the list of calls made between rounds; re-send the original input every time. | Append every raw tool result to the conversation. |
| Read unreachable before the evidence gate and log which bound stopped a run. | Let a defensive check swallow the only voluntary exit. |
| Report every rate as passes over n with a Wilson interval. | Assert a single draw of a non-deterministic call. |
| Tell the model its round budget at Level 4; tell it there is no number at Level 6. | Say 'you have eight rounds' to a loop - it expands to fill them. |
| Keep the cheap path alive and never import a rung above you. | Delete Level 0 when Level 1 ships. |

## Skeletons

### Top-down rung diagnostic

```python
floor = floor_test(profile)
if floor is None:
    return _refuse(profile, FLOOR)          # unknown: stop the review
if floor is FLOOR.stops_when:
    return _decide(profile, FLOOR)          # Level 0, done
for gate in LADDER:                         # 7, 6, 5, 4, 3, 2
    answer = getattr(profile, gate.field)
    if answer is None:
        return _refuse(profile, gate)
    if answer is gate.stops_when:
        return _decide(profile, gate)
return _decide(profile, BASE)               # Level 1 by default
```

### Read-only tool menu with a blast radius

```python
@dataclass(frozen=True)
class ToolSpec:
    name: str
    description: str
    parameters: dict[str, Any]
    consequence: Literal["read", "write"]   # no default

def menu_for(*, allow_writes: bool = False) -> tuple[ToolSpec, ...]:
    return TOOLS if allow_writes else tuple(s for s in TOOLS if s.consequence == "read")
def blast_radius(tools) -> tuple[str, ...]:
    return tuple(s.name for s in tools if s.consequence == "write")
assert blast_radius(menu_for()) == ()          # asserted in a test, not promised
```

### Bounded loop with a give-up field

```python
def round_(state):
    finding = completer.invoke(system=SYSTEM, user=working(state),
                               tools=menu_for(), execute=box.execute, schema=Verdict).parsed
    if finding.unreachable:                       # read BEFORE the evidence check
        return replace(state, finished=True, gave_up=finding.next_step)
    if not value_supported(finding, state.calls, state.results):
        return replace(state, attempts=state.attempts + ("discarded",))
    return replace(state, findings=state.findings + (finding,),
                   finished=not finding.needs_human)
final = walker.run(node, start, done=lambda s: (
    s.finished or _bound(s, ledger, started, Budget()) is not None))
stopped_by = None if final.finished else _bound(final, ledger, started, Budget())
```

### A rate, not an assertion

```python
@dataclass(frozen=True)
class Rate:
    passes: int
    n: int
    @property
    def interval(self) -> tuple[float, float]:   # Wilson, 95 percent
        if not self.n:
            return (0.0, 1.0)                    # no samples = no information
        z = NormalDist().inv_cdf(0.975); p, n = self.passes / self.n, self.n
        centre = (p + z * z / (2 * n)) / (1 + z * z / n)
        spread = z * ((p * (1 - p) / n + z * z / (4 * n * n)) ** 0.5) / (1 + z * z / n)
        return (max(0.0, centre - spread), min(1.0, centre + spread))
```

## Decisions

| When | Use | Not |
|---|---|---|
| A unit test can specify the correct output for every real input | Level 0 deterministic code with named refusals | A model classifier on the path |
| The answer needs language understanding over input you already hold | Level 1: one typed call, closed enums, a checked quote | Retrieval or tools |
| The answer needs facts in a document corpus and a stale index is fine | Level 2: BM25 with a relevance floor and a checked citation | A vector database before you have measured the lexical baseline |
| One call cannot do it but you can draw the steps before the run | Level 3 workflow with the Floor Test on every stage | A framework graph or an agent |
| A step needs a value that did not exist when the corpus was built | Level 4: one round of read-only tools with a consequence field | Putting metric values in the corpus or asking the model for them |
| The next call's arguments come from the last call's result and you can state the max calls | Level 5: a step tuple with MAX_MODEL_CALLS = 2 * len(STEPS) | A capped loop |
| You cannot state a maximum call count and 'not yet' must be told from 'never' | Level 6 with unreachable, Budget and three memory layers | A chain with N set high |
| Reading and acting must be held by different authorities | Level 7 role menus asserted in a test, gated by an explicit ask | Three prompts sharing one tool registry |

## Before you ship

- [ ] Every request type has a written rung and the question that decided it; none is justified by capability language.
- [ ] The Zero Row is measured: cost and refusal rate of the deterministic path, with a counter per refusal reason.
- [ ] Every exit refuses by name; no default branch, no top_k without a floor, no enum without an unknown member.
- [ ] Every model claim carries a verbatim quote or value that code checks against the input or a tool result.
- [ ] Every tool has consequence set, the default menu's blast radius is asserted empty, and no tool takes a timestamp.
- [ ] The loop has an unreachable field read before the evidence gate, three named bounds, and a journal entry per run.
- [ ] Rates are reported with intervals and n; refusals and unmeasured cases return None, never zero.
- [ ] The cheap path still exists as code, no rung imports a rung above it, and the last-rung counter has an N chosen in advance.

## Build ladder

**Rung 1 · Floor-first drawer fill** (~2 hours) — A Formulaite research path that answers known ingredients from the catalogue with no model call, and fills the drawer with one typed model call only when the catalogue refuses.
  1. Run the Floor Test on catalogue_lookup: list ten INCI names and write the correct drawer for each by hand.
  2. Make catalogue_lookup in formulaite_tools.py return a named refusal for an unknown INCI instead of a default.
  3. Record the Zero Row in glassbox.py: how many drawers the catalogue fills at zero tokens.
  4. Add an evidence quote field to the drawer schema in drawer.py and a gate in gates.py that checks the quote is in the supplier page.
  5. Run ScriptedModel in models.py over the refused ingredients and print the Failure Receipt for each one it cannot fill.

**Rung 2 · One-round tool research with a read-only menu** (~a day) — A tool-using research step where the model picks read_supplier_page and catalogue_lookup once, every value in the drawer is checked against a tool result, and no write tool can reach the menu.
  1. Add a consequence field with no default to Tool in tools.py and filter the registry to read tools before sending it to the model.
  2. Make read_supplier_page return an error that names the known suppliers instead of raising.
  3. Write value_supported in gates.py: reject any drawer value that is not a substring of a recorded tool result.
  4. State the round budget in the system prompt and record every tool call and result in glassbox.py.
  5. Apply the Substitution Test to one wrong drawer: hand the model the right page by hand and rerun.

**Rung 3 · Bounded autonomous researcher with a give-up field** (~3 days) — An agent.py loop that runs until the gate passes or the model declares the drawer unreachable, stopped by a three-part Budget, journaled in the Glass Box, and evaluated as rates with intervals.
  1. Add an unreachable flag to fill_drawer and read it before the evidence gate so a give-up is never discarded.
  2. Replace max_steps in agent.py with Budget(iterations, tokens, seconds) and log which bound fired.
  3. Carry drawer conclusions and the list of tool calls in memory.py, never the raw page text.
  4. Write one journal Entry per run to glassbox.py: routed, cause, rounds, stopped_by, tools.
  5. Score each surface (drawer fields, evidence, tool choice, give-up) as Rate(passes, n) with a Wilson interval.
  6. Route requests through a Refusal Cascade: catalogue first, single call second, loop last.

## You're done when

- You can fill a TaskProfile for one Formulaite request type, run the Floor Test and the Termination Test, and name the rung with the question that decided it.
- You can add a consequence field to the lab's tools, assert the default registry has an empty blast radius, and reject a drawer value that appears in no tool result.
- You can turn agent.py into a bounded loop with an unreachable field read before the gate, log which of three bounds fired, and report each scoring surface as a rate with an interval.

*Source: `books-md/the-7-genai-architectures.md` · chapters: 1 Why GenAI Systems Fail at the Architecture Layer, 2 The Escalation Ladder, 3 Level 0 - The Floor, 4 Architecture 1 - The Prompt Application, 5 Architecture 2 - Retrieval-Augmented Generation, 6 Architecture 3 - The LLM Workflow, 7 Architecture 4 - The Tool-Using LLM, 8 Architecture 5 - Multi-Step Reasoning, 9 Architecture 6 - The Autonomous Agent, 10 Architecture 7 - The Multi-Agent System, 11 Composite Architectures, 12 Costing an Architecture Before You Build It, 13 Evaluating Each Level, 14 Observability Across the Ladder, 15 Climbing - Migrating Up Without a Rewrite, 16 Descending - Rightsizing an Overbuilt System*
