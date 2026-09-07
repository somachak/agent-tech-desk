# Building Autonomous AI Agents with Claude AI — cheat sheet

*Nolan Stark · 104 pages · Formulaite bookshelf book 5 of 14*

**Core idea:** An agent is a loop of reason, act, observe; every design choice exists to make one of those three parts more bounded, more inspectable, or more reliable.

**Read when:** Open it when the Formulaite research agent 'works' but you cannot say why it stopped, why it picked a tool, or whether it is safe to let it run alone.

## Vocabulary

| Term | Means |
|---|---|
| Agent | A system whose output acts, and whose result feeds back into its next decision. |
| Reason-act-observe loop | Think, call a tool, look at the result, repeat until a stop rule fires. |
| Failure modes | Reasoning (wrong choice), acting (malformed call), observation (unusable result). |
| Stopping condition | A rule that ends the loop: goal met, ceiling hit, or escalation. |
| Resource ceiling | A hard cap on steps, time or cost, sized per task type. |
| Escalation | Pausing to hand a decision to a human, checked before the ceiling. |
| Tool schema | Name, description and parameters; the model's whole view of a tool. |
| Tool-selection failure | The 'almost right' tool chosen because two descriptions overlap. |
| MCP | A standard for how a model discovers and calls a server's tools; valuable for reuse. |
| Decomposition | Turning a goal into steps that each have their own success evidence. |
| Context window | What the model sees on this call; small, curated working memory. |
| Persistent memory | An external store written on purpose and read back on demand. |
| State drift | Acting on a picture of the world that has since changed. |
| Idempotent action | Same net effect however many times it runs. |
| Transient vs deterministic | Likely to clear (retry with backoff) versus will fail again (escalate). |
| Circuit breaker | Stops calls to a failing dependency for a cooldown, then retries. |
| Least privilege | Only the actions and data the current task needs. |
| Approval gate | A human check before an irreversible or external action, with reasoning shown. |
| Trajectory evaluation | Scoring how the agent got there, not only the final answer. |
| Human baseline | A domain expert's score on the same cases, so 'good enough' means something. |

## The pattern

1. State the goal with the evidence that would prove it done.
2. Loop: reason, act with one narrow tool, observe, and log all three.
3. Check escalation first, then the goal, then the step ceiling.
4. Write exact facts to memory the moment you learn them.
5. Classify every failure: transient gets backoff retry, deterministic escalates.
6. Re-verify state right before any irreversible action; gate it if external.
7. Score outcome and trajectory separately; fold real failures into the eval set.

## Rules of thumb

| Do | Don't |
|---|---|
| Write the steps down before building anything. | Build a loop for a task whose steps are fixed. |
| Log reasoning, action and observation as three separate records. | Log only the action. |
| Set a hard step ceiling per task type before the first run. | Trust the model's 'I am done' on its own. |
| Describe each tool as an outcome with parameter ranges and edge behaviour. | Describe a tool by its name. |
| Merge or clearly separate overlapping tools. | Add prompt text about which tool to prefer. |
| Keep ids, numbers and error text verbatim beside the summary. | Re-summarise a summary. |
| Label errors transient or deterministic where the tool is defined. | Let the loop guess from the error message. |
| Gate irreversible, external or over-threshold actions and show the reasoning. | Gate every step. |
| Scope tools and data to the current task. | Grant access in case it is needed later. |
| Re-run the whole eval suite after every change and before a model swap. | Re-test only the case you fixed. |

## Skeletons

### Loop with three stop layers

```python
for step in range(1, MAX_STEPS + 1):
    reply = model.complete(system, conv.as_api(), tools.to_api())
    box.log("reason", text=reply.text)
    if reply.confidence < 0.6:
        result = escalate(reply); break            # escalation
    if reply.is_final:
        verdict = run_gates(reply.drawer, catalogue_entry=fresh())
        if verdict: result = reply.drawer; break   # goal
    for call in reply.tool_uses:
        conv.add_tool_results([run_tool(call)])    # act + observe
else:
    result = "budget_exhausted"                    # ceiling
```

### Tool error with a retry class

```python
class ErrorKind(Enum):
    TRANSIENT, DETERMINISTIC = "transient", "deterministic"
class ToolError(Exception):
    def __init__(self, msg, kind=ErrorKind.DETERMINISTIC):
        super().__init__(msg); self.kind = kind

def retry(fn, attempts=3):          # backoff only for TRANSIENT
    for n in range(attempts):
        try: return fn()
        except ToolError as e:
            if e.kind is not ErrorKind.TRANSIENT or n == attempts - 1: raise
            time.sleep(0.5 * 2 ** n)
```

### Glass Box event with audit context

```python
@dataclass
class Event:
    step: int
    kind: str                    # reason | act | observe | gate
    tags: tuple[str, ...] = ()
    meta: dict = field(default_factory=dict)
    ts: float = field(default_factory=time.time)

box.log("gate", "fill_drawer", scope="read_only",
        verdict=str(verdict), reasons=verdict.reasons)
```

### Re-verify, then gate, then write

```python
def publish(drawer, box):
    entry = catalogue_lookup(drawer.inci)        # fresh state
    verdict = run_gates(drawer, catalogue_entry=entry)
    if not verdict:
        return escalate(verdict.reasons)
    if needs_approval(drawer):                    # irreversible write
        ok = ask_human(drawer, reasoning=box.of_kind("reason")[-1])
        box.log("gate", "human", approved=ok)
        if not ok: return "rejected"
    return catalogue.write(drawer)
```

## Decisions

| When | Use | Not |
|---|---|---|
| Steps are fixed and known in advance | a plain workflow | an agent loop |
| Fixed steps with a few runtime choices | a workflow with judgment points | a full agent loop |
| The next step depends on what a tool returns | a single reason-act-observe loop with layered stops | a workflow that guesses |
| Sub-problems are independent, like one drawer per ingredient | a coordinator with sub-agents | one overloaded context |
| A step is both ambiguous and high-stakes | extended thinking on that step | thinking on every step |
| A tool error is a timeout or rate limit | bounded backoff retry | escalation or blind repeats |
| An action is irreversible or touches the outside world | a human approval gate with reasoning shown | an ungated call or a gate on everything |
| An integration will be reused by several agents | MCP | a bespoke one-off connection |

## Before you ship

- [ ] Goal, ceiling and escalation stops all defined and tested before the first real run.
- [ ] Every tool description states outcome, valid ranges, edge behaviour and when to prefer it.
- [ ] Every tool called directly with edge inputs and its error paths triggered on purpose.
- [ ] Exact ids, numbers and error text kept verbatim, separate from the prose summary.
- [ ] Consequential actions re-verify their dependent state immediately before running.
- [ ] Permissions scoped to the current task; gates sit at irreversible or external actions.
- [ ] Eval set mixes real, adversarial and production-failure cases; trajectory scored beside outcome.
- [ ] Full traces captured and a weighted sample read by a human on a schedule.

## Build ladder

**Rung 1 · One-ingredient loop with a hard step budget and a readable trace** (~1 hour) — A Formulaite research run for one ingredient that stops on a step ceiling and whose Glass Box replay shows reason, act and observe as separate events.
  1. Run the offline agent on Glycerin and open the saved Glass Box file.
  2. Label every event in the replay as reason, act or observe.
  3. Lower max_steps to 2 and watch the budget_exhausted stop fire.
  4. Rewrite the catalogue_lookup description as an outcome with edge behaviour.
  5. Call read_supplier_page directly with a bad url and read the error it returns.

**Rung 2 · Drawer research that survives failure and remembers exact facts** (~half a day) — A run that retries only transient supplier-page errors, keeps CAS numbers and error text verbatim beside the conversation, and re-checks the catalogue right before the gate.
  1. Add a transient or deterministic kind to ToolError in tools.py.
  2. Wrap read_supplier_page in a backoff retry that only retries transient errors.
  3. Add a key-facts dict beside the Conversation for CAS numbers and supplier urls.
  4. Re-run catalogue_lookup immediately before run_gates so the use-level range is fresh.
  5. Let fill_drawer return a needs_redecomposition status when the page contradicts the catalogue.

**Rung 3 · Gated, measured, promotable Formulaite agent** (~2 days) — A research agent with a human gate on catalogue writes, scope and gate verdict in every trace event, and an ingredient eval set scored on outcome and trajectory before the model is swapped.
  1. Put an approval step before any accepted drawer is written to the catalogue.
  2. Log permission scope and gate verdict in every Glass Box event's meta.
  3. Build a 20-ingredient eval folder from real drawers, odd INCI names and past gate failures.
  4. Score each run on gate pass (outcome) and on steps, retries and tool errors (trajectory).
  5. Run the whole folder against ScriptedModel and ClaudeModel before flipping the flag.

## You're done when

- Run one Formulaite research loop, open the Glass Box replay, and point to which event was the reasoning, the action and the observation when the drawer came out wrong.
- Label every ToolError in formulaite_tools.py as transient or deterministic and show, from the trace, that only transient ones were retried with backoff.
- Score ten ingredient runs with an outcome score (gate pass) and a trajectory score (steps, retries, tool errors), reported as two separate numbers.

*Source: `books-md/building-autonomous-ai-agents-with-claude.md` · chapters: 1 Chapter 1: What Makes an Agent Autonomous, 2 Chapter 2: The Reason-Act-Observe Loop, 3 Chapter 3: Equipping Agents with Tools, 4 Chapter 4: Orchestrating Complex, Multi-Step Tasks, 5 Chapter 5: Memory, State, and Context Management, 6 Chapter 6: Handling Failure, Retries, and Uncertainty, 7 Chapter 7: Permissions, Guardrails, and Human-in-the-Loop Control, 8 Chapter 8: Evaluating and Testing Autonomous Agents, 9 Chapter 9: Deploying and Operating Agents in Production, 10 Appendix A: A Pre-Deployment Checklist, 11 Appendix C: A Worked Example: A Support-Ticket Triage Agent, 12 Appendix D: Quick Reference: Matching Architecture Patterns to Task Shapes*
