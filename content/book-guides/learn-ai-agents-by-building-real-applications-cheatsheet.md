# Learn AI Agents by Building Real Applications — cheat sheet

*Kitchen to Code · 200 pages · Formulaite bookshelf book 3 of 14*

**Core idea:** Model proposes. Application executes. The model interprets and suggests; plain Python owns the tool list, permissions, validation, state and the rule for stopping.

**Read when:** Open it when you want to build the drawer-filling agent from scratch and understand every boundary, instead of calling a framework you cannot see inside.

## Vocabulary

| Term | Means |
|---|---|
| Agent | A loop that picks allowed actions toward a goal until a stopping condition fires. |
| Tool | A Python function the application lets the model request; the model never runs it. |
| Observation | The small result a tool returns; it becomes context for the next decision. |
| State | The one record of a task: goal, status, steps, history, result. |
| Stopping condition | The rule that ends the loop: done, human needed, error, or step limit. |
| Schema | The contract for the model's output shape, written as a Pydantic class. |
| Business validation | Plain Python rules run after the schema and before the next step. |
| Dispatcher | The one function that checks a tool name and arguments, then runs it. |
| Controlled observation | An ok/error dictionary returned instead of a traceback. |
| Chunk | A piece of a document small enough to retrieve on its own. |
| Grounding | An answer traceable to retrieved or calculated evidence. |
| Evidence package | Verified numbers or labelled sources handed to the model to explain. |
| Planner | The model step that picks one route from a fixed list that includes unsupported and clarify. |
| State machine | A status field plus a map of the transitions that are allowed. |
| Idempotency | Doing the same action twice has no extra effect. |
| Review package | Request, evidence, proposal and reason, handed to a human reviewer together. |
| Least privilege | Only the tools, data and limits the task actually needs. |
| Prompt injection | Instructions hidden inside retrieved or tool content; data, not commands. |
| Release gate | A rule that turns eval results into ship or fix. |
| Regression test | A past failure kept as a permanent test so it cannot return. |

## The pattern

1. Validate the input before any model call.
2. Model proposes: a route, a tool name with arguments, or a structured answer.
3. Application checks: allowed name, valid arguments, permission for this role.
4. Approved code executes; the tool returns a controlled ok/error observation.
5. Validate the result: schema first, then business rules.
6. Consequential? Stop for human review, then re-check before executing.
7. Record state and the trace; stop on success, clarify, unsupported or step limit.

## Rules of thumb

| Do | Don't |
|---|---|
| Check safety-sensitive routes first. | Let a request with approve in it fall through to an ordinary branch. |
| Return {ok: False, error: ...} from every tool failure. | Let a traceback reach the model's context. |
| Describe a tool by what it does and when to use it. | Write a description like Gets information. |
| Print retrieval sources and scores before generating. | Blame the prompt for a retrieval miss. |
| Calculate numbers in code and let the model explain them. | Ask the model for a total, a trend or a cause. |
| Include unsupported and clarify in every route list. | Force every question into the nearest tool. |
| Re-check permission, limits and duplicates after approval. | Treat a click on Approve as execution. |
| Give critical controls zero-tolerance gates. | Ship on a good average pass rate. |
| Retry reads with a bounded backoff policy. | Retry a write without knowing if the first one landed. |

## Skeletons

### Agent loop with a step limit

```python
def run_agent(goal, max_steps=3):
    state = create_state(goal)
    while state["status"] == "running":
        action = decide_next_action(state)
        if action not in TOOLS:
            state["status"] = "needs_input"
            continue
        record_observation(state, action, TOOLS[action]())
        should_stop(state, action)
        if state["steps"] >= max_steps and state["status"] == "running":
            state["status"] = "step_limit_reached"
    return state
```

### Controlled tool with per-failure observations

```python
def safe_tool(arguments):
    value = arguments.get("record_id")
    if not isinstance(value, int) or not 1 <= value <= 200:
        return {"ok": False, "error": "record_id out of range"}
    try:
        response = requests.get(URL.format(value), timeout=10)
        response.raise_for_status()
        return {"ok": True, "data": response.json()}
    except requests.Timeout:
        return {"ok": False, "retryable": True, "error": "timed out"}
    except requests.RequestException:
        return {"ok": False, "error": "service unreachable"}
```

### Typed task with guarded transitions

```python
class Task(BaseModel):
    task_id: str
    status: Literal["created", "working", "review", "done", "failed"] = "created"
    findings: list[str] = Field(default_factory=list)

ALLOWED = {"created": {"working"}, "working": {"review", "failed"},
           "review": {"done", "working"}, "done": set(), "failed": set()}
def change_status(task, new):
    if new not in ALLOWED[task.status]:
        raise ValueError(f"Cannot move from {task.status} to {new}.")
    task.status = new
    save_task(task)
```

### Eval case and release gate

```python
@dataclass
class EvalCase:
    name: str
    user_input: str
    expected_route: str
    must_escalate: bool = False

def ready_to_release(metrics):
    return (metrics["overall_pass_rate"] >= 0.95
            and metrics["authorization_failures"] == 0
            and metrics["duplicate_side_effects"] == 0)
```

## Decisions

| When | Use | Not |
|---|---|---|
| The model's answer must feed another function. | A Pydantic schema and responses.parse. | Free text and a regex. |
| A question has no approved calculation. | The unsupported route, and say so. | The nearest tool. |
| The request is ambiguous. | The clarify route with a question back. | A confident guess. |
| A tool only reads data. | Bounded retries with backoff. | An uncontrolled while True. |
| An action changes the outside world. | Approval, a role limit and an idempotency key. | Model confidence. |
| A behaviour can be verified exactly. | A deterministic check in code. | A model as judge. |
| Something must be remembered tomorrow. | Typed state saved to disk and re-validated. | The chat transcript. |
| A failure shows up in testing. | Fix the owning layer and add a regression test. | Another prompt paragraph. |

## Before you ship

- [ ] Empty and vague input is rejected before the model call.
- [ ] Only allow-listed tool names run; an unknown name returns Tool is not allowed.
- [ ] Every external call has a timeout and returns ok/error, never a traceback.
- [ ] Retrieval scores and source labels are visible before generation.
- [ ] Numbers are computed in code; the model only explains them.
- [ ] State is typed, transitions are guarded, saved state is re-validated on load.
- [ ] Approval is re-checked against role, limit and duplicates before execution.
- [ ] Authorization failures and duplicate side effects are zero in the eval run.

## Build ladder

**Rung 1 · A drawer-filling loop that stops safely** (~2 hours) — An agent that looks up an ingredient, fills the Ingredient Drawer through a schema, refuses unknown tools and stops after a fixed number of steps.
  1. Write the drawer as a typed schema in drawer.py and print as_tool_schema().
  2. Register catalogue_lookup and fill_drawer in the ToolRegistry in tools.py.
  3. Route every model tool request through one dispatcher: ToolRegistry.call().
  4. Give Agent.run() a max_steps budget and a named status when it is hit.
  5. Replay the Glass Box after one run and read each Event aloud.

**Rung 2 · Supplier-page research with evidence, gate and saved state** (~half a day) — The agent reads a supplier page as an untrusted tool result, keeps a source label on every claim, and the gate checks use level against the catalogue before the drawer is accepted.
  1. Give read_supplier_page a timeout and an ok/error return in formulaite_tools.py.
  2. Split the page into labelled chunks and print the top matches before the model sees them.
  3. Add check_has_sources and check_use_level_in_range to run_gates in gates.py.
  4. Send gate failure reasons back to the model as a tool_result and loop.
  5. Save the run with GlassBox.save() and load it back with GlassBox.load().

**Rung 3 · Review gate, red-team suite and release gates** (~2 days) — Risky drawers pause for a human with a review package, every Break-It bug becomes a failure test, and a release gate blocks the agent when any authorization or duplicate-save check fails.
  1. Build a review package from the failed GateVerdict reasons and the Glass Box replay.
  2. Re-run run_gates after a human edits a drawer, before it is saved to the catalogue.
  3. Write ten FailureTest cases for the drawer loop: empty INCI, banned ingredient, poisoned page, duplicate save.
  4. Score each eval run with deterministic checks on route, tool calls and escalation.
  5. Add a release gate: pass rate above 0.95 and zero authorization failures.
  6. Add a disable switch and cost budget using memory.py token_estimate().

## You're done when

- Add a fourth tool request the registry does not know, run the drawer agent, and point to the refusal Event in the Glass Box replay.
- Make the gate send a failed drawer back to the model with its reasons, and stop the loop after max_steps with a named status.
- Write five failure tests for the drawer loop (empty INCI, banned ingredient, missing sources, duplicate save, viewer role) and a release gate that blocks on any authorization failure.

*Source: `books-md/learn-ai-agents-by-building-real-applications.md` · chapters: 1 AI Agents: From Chatting to Doing, 2 Inside an AI Agent, 3 Build Your First Real AI Agent, 4 Make Agent Responses Reliable, 5 Give Your Agent Tools, 6 Connect Agents to APIs and Real Systems, 7 Build an Agent That Understands Documents, 8 Give Your Agent Business Data, 9 Build an AI Business Analyst, 10 Memory, State, and Long-Running Work, 11 Automate Real Business Workflows, 12 Human-in-the-Loop AI, 13 Break Your Agent, 14 Test, Secure, Evaluate, and Control Your Agent, 15 Capstone: Build a Production-Ready AI Operations Assistant*
