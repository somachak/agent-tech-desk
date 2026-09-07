# 30 Agents Every Developer Should Build: A Practical Field Guide — cheat sheet

*Gordon A. Crawford · 695 pages · Formulaite bookshelf book 9 of 14*

**Core idea:** Every agent is the same loop, perceive, reason, plan, act, learn, wrapped in modules that talk through a broker; what changes across the thirty agents is which module gets the hard job.

**Read when:** Open it once the basic tool loop works and you want a catalogue of proven architectures to borrow: retrieval, extraction, validation, recovery, arbitration and monitoring.

## Vocabulary

| Term | Means |
|---|---|
| Cognitive loop | Perceive, reason, plan, act, learn: the cycle every agent runs. |
| Cognition core | The broker that routes state between profile, planning, knowledge, tools and reasoning. |
| Proxy agent | Sanitise, constrain, parse, validate: one input in, one typed object out. |
| Tool schema | Name, description and JSON parameters: the menu the model orders from. |
| Function calling | The model asks for a tool by name; your code runs it and returns the result. |
| Maturity level | 0 manual, 1 rules, 2 tools, 3 planning, 4 learning. |
| Provenance | The source id, timestamp and confidence that travel with every claim. |
| Entity linking | Mapping aliases and trade names to one canonical id before search. |
| Chunking | Splitting a document so the relevant passage can be retrieved on its own. |
| Safe wrapper | Validate input, run under a timeout, validate output, return a structured error. |
| Circuit breaker | Stop calling a failing dependency for a cooldown, then probe once. |
| Fallback chain | A second route to the same goal when the first tool fails. |
| Escalation | A planned handoff to a human with the full context attached. |
| NLI | A model that labels claim versus evidence as entailment, contradiction or neutral. |
| Calibration | A confidence of 0.8 is right about 80 percent of the time. |
| Zero trust | Least privilege, re-verify every call, segment memory, watch the sequence. |
| Tool gating | An allow-list plus per-tool parameter checks, with blocked calls logged. |
| Drift | A metric's distribution moving away from its baseline; a governance event. |

## The pattern

1. Scope: goal, sub-goals, environment, boundaries, metrics, on one page.
2. Constitution: identity, rules, capabilities, output format, hierarchy in the system prompt.
3. Loop: model proposes a tool call; registry validates; safe tool runs; result returns with a source label.
4. Ground: retrieve, augment, generate; provenance runs in parallel.
5. Validate: a deterministic gate checks the draft and returns fix instructions; cap the retries.
6. Escalate: low confidence, out of scope, or conflicting evidence goes to a human with the dossier.
7. Measure: five metrics from the trace; deploy, measure, analyse, modify, re-evaluate.

## Rules of thumb

| Do | Don't |
|---|---|
| Write the tool description as when-to-use, not what-it-is. | Describe a tool as Gets information. |
| Validate arguments before the call and the output after it. | Check only the tool name. |
| Keep a source label on every extracted field. | Add citations from memory at the end. |
| Split a statement into atomic claims before checking it. | Mark a sentence true because one part of it is. |
| Return fix instructions from the validator. | Return only PASS or FAIL. |
| Treat low confidence as a named state that escalates. | Bluff with a polished answer. |
| Name the failure kind before choosing a recovery. | Retry validation errors that can never succeed. |
| Order constraints: safety first, then quality. | Average safety against satisfaction. |
| Route cheap questions to cheap models under a session budget. | Send everything to the biggest model. |
| Log every step so a wrong route is visible as a wrong mapping. | Log only the final answer. |

## Skeletons

### Proxy step: sanitise, parse, check keys

```python
EXPECTED_KEYS = {"inci", "function", "use_level", "sources", "requires_human"}

def build_drawer_payload(page_text: str) -> dict:
    cleaned = re.sub(r"\s+", " ", page_text).strip()
    raw = model.complete(prompt.format(page=cleaned))
    payload = json.loads(raw)
    missing = EXPECTED_KEYS.difference(payload.keys())
    if missing:
        raise ValueError(f"Missing required keys: {sorted(missing)}")
    return payload
```

### Safe tool with a typed contract and a timeout

```python
def safe_tool(input_model, output_model, timeout_seconds=5):
    def decorator(fn):
        @wraps(fn)
        def wrapped(payload):
            validated = input_model.model_validate(payload)
            def run():
                return output_model.model_validate(fn(validated.model_dump())).model_dump()
            with ThreadPoolExecutor(max_workers=1) as executor:
                return executor.submit(run).result(timeout=timeout_seconds)
        return wrapped
    return decorator
```

### Generator and validator loop with a cap

```python
feedback = ""
for attempt in range(MAX_ROUNDS):
    draft = generator.complete(brief, feedback)
    verdict = validate_against_brand(draft, guidelines)
    if verdict["passed"]:
        return draft
    feedback = verdict["instructions"]
return escalate_to_human(brief, draft, verdict)
```

### Failure taxonomy with matching recovery

```python
try:
    result = tool.run(payload)
except ValueError as exc:            # input validation: fix the call, never retry
    return {"ok": False, "kind": "input", "error": str(exc)}
except ToolRuntimeError as exc:      # runtime: bounded retry with backoff
    return {"ok": False, "kind": "runtime", "retryable": True, "error": str(exc)}
except ToolUnavailableError as exc:  # unavailable: open the breaker, try the fallback chain
    breaker.record_failure()
    return {"ok": False, "kind": "unavailable", "error": str(exc)}
```

## Decisions

| When | Use | Not |
|---|---|---|
| The model's output feeds a backend or a gate. | A proxy step: JSON only, parsed and key-checked. | Free text and hope. |
| The question is about facts that change. | Retrieve first, then generate inside the evidence. | The model's training memory. |
| The same substance has several names. | Entity linking to one canonical key before search. | Searching the name the user typed. |
| A tool call fails. | Name the failure kind, then the matching rung of the recovery ladder. | A blanket retry. |
| Two sources disagree. | Weigh by credibility, state the range, or escalate with both. | The first or loudest source. |
| The action changes the outside world. | A safety check for limit, permission and impact, then human approval. | Model confidence. |
| A request is simple and repeated. | A cheap model and a TTL cache under a session budget. | The premium model every time. |
| Values compete, for example safety and speed. | A strict priority order: safety filters first. | A weighted score. |

## Before you ship

- [ ] The system prompt has identity, rules, capabilities, output format and hierarchy, and it is short.
- [ ] Every tool has an input schema, an output schema, a timeout and a logged rejection path.
- [ ] Every drawer field carries a source label and a confidence.
- [ ] Each drawer claim was checked against its cited passage as entailment, not just similarity.
- [ ] The gate returns reasons the model can act on, and retries are capped.
- [ ] Low confidence, out of scope and conflicting evidence each have a named escalation status.
- [ ] Task success, response time, tool latency and fallback frequency are computed from the trace.
- [ ] Gate order puts banned ingredients and use limits before softer quality checks.

## Build ladder

**Rung 1 · A proxy-then-tool-loop drawer filler with a Glass Box** (~2 hours) — An agent with a five-part constitution that picks from a three-tool menu, turns the fill_drawer call into a validated IngredientDrawer, and leaves a readable trace.
  1. Write the system prompt in agent.py as five blocks: identity, rules, capabilities, output format, hierarchy.
  2. Print as_tool_schema() from drawer.py and the registry schema from tools.py; fix any vague description.
  3. Run Agent.run('Glycerin') and watch the loop: model proposes, ToolRegistry.call executes, result returns.
  4. Make IngredientDrawer.from_model_kwargs reject a payload with missing sections instead of accepting it.
  5. Replay the GlassBox and read each Event aloud: input, prompt, tool call, verdict, final action.

**Rung 2 · Supplier-page research with provenance, safe tools and a validator loop** (~half a day) — The agent reads supplier pages through a typed, timed tool contract, resolves trade names to INCI keys, keeps a source label on every field, and the gate sends fix instructions back until the drawer passes or a retry cap is hit.
  1. Wrap read_supplier_page in formulaite_tools.py with input validation, a timeout and typed errors.
  2. Attach a source label to every chunk the tool returns and make check_has_sources in gates.py use it.
  3. Add an alias map to catalogue_lookup so a trade name resolves to the INCI key before lookup.
  4. Make run_gates return reasons the model can act on and cap the fix loop in agent.py at three rounds.
  5. Add a session budget in memory.py using token_estimate() and refuse the big model when it is spent.

**Rung 3 · Fact-checked drawer with zero-trust tools, arbitration and evals** (~2 days) — Each drawer claim is checked against its cited passage, every tool call is re-authorised, conflicting use levels go to an arbiter and then a human, and the Glass Box feeds a five-metric report with a drift detector.
  1. Split each drawer section into atomic claims and add check_claims_supported to gates.py.
  2. Add a per-call permission check in ToolRegistry.call so fill_drawer cannot write for a read-only role.
  3. Flag a supplier-versus-catalogue use-level conflict and route it to a needs_human status with both sources.
  4. Compute task success, response time, tool latency and fallback frequency from saved GlassBox runs.
  5. Order the gates: banned ingredient, use-level limit, forbidden claims, then softer quality checks.
  6. Add a drift detector on the gate-fail rate that logs, tightens oversight, then halts the agent.

## You're done when

- Give the drawer agent a supplier page that uses a trade name only, and point to the Glass Box event where entity linking resolved it to the INCI key before the catalogue lookup.
- Break read_supplier_page with a timeout, and show the run naming the failure kind, retrying once, falling back to the catalogue text, and ending with a named status instead of a crash.
- Take one finished drawer, split its use-level claim and its safety claim, check each against the cited passage, and make the gate fail the drawer when either is contradicted.

*Source: `books-md/30-agents-every-developer-should-build.md` · chapters: 1 Foundations of Agent Engineering, 2 The Agent Engineer's Toolkit, 3 The Art of Agent Prompting, 4 Agent Deployment and Responsible Development, 5 Cognitive Architectures: Autonomy, Planning, and Memory, 6 Retrieval-Augmented Generation and Search Agents, 7 Tool Manipulation and Orchestration Agents, 8 Data Analysis and Reasoning Agents, 9 Software Development Agents, 10 Conversational and Content Creation Agents, 12 Ethical and Explainable Agents, 13 Healthcare and Scientific Agents, 14 Financial and Legal Domain Agents, 15 Education and Collective Intelligence Agents, 17 Epilogue: The Future of Intelligent Agents*
