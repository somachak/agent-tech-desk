# Production AI Engineering: From AI Prototypes to Reliable, Secure, Scalable Systems — cheat sheet

*Sterling Norwood · 632 pages · Formulaite bookshelf book 13 of 14*

**Core idea:** The model proposes; software you can test decides and acts, and every step leaves evidence you can measure.

**Read when:** Open it when the research agent works on your laptop and you need to make it survive real users, flaky suppliers, bad inputs and a budget.

## Vocabulary

| Term | Means |
|---|---|
| Orchestrator | The code that runs the loop: prompt, model, tools, validation. It coordinates, it does not absorb. |
| Tool gateway | The checkpoint between a model's tool request and the real function: validate, authorise, limit, audit. |
| Execution budget | Four caps per run: max time, max model calls, max tool calls, max tokens. |
| Deadline | One end time for the whole request; every downstream call gets only what is left. |
| Transient error | A failure that may vanish if you try again: 429, 502, 503, a timeout on a read. |
| Jitter | Random spread added to retry waits so clients do not all retry in the same second. |
| Circuit breaker | CLOSED, OPEN, HALF-OPEN: stop calling a dependency that keeps failing, probe later. |
| Idempotency key | A stable name for a logical operation so running it twice has one effect. |
| Graceful degradation | Losing capability one rung at a time while staying honest about what is missing. |
| Provenance | Where a memory or claim came from: user, tool result, model inference, imported data. |
| Trajectory | The sequence of tool calls an agent made on the way to its answer. |
| Golden dataset | A curated, versioned, owned set of inputs with expected behaviour, used as the baseline. |
| Groundedness | Whether each generated claim is supported by the evidence the app supplied. |
| Quality gate | A threshold a change must meet before it moves to the next release stage. |
| Admission control | Estimating token demand and checking quota before the model is called. |
| Release manifest | The versions that define behaviour: app, prompt, model, retrieval, tools, eval set, config. |
| Audit trail | Append-only record of who asked, what the model proposed, which policy allowed it, what ran. |
| Cost per workflow | The sum of every call in one request, divided by successful outcomes. |

## The pattern

1. Validate the request and authorise the user before any model call.
2. Set one deadline and one budget: time, model calls, tool calls, tokens.
3. The model proposes: a prose answer or a tool call.
4. The policy layer checks schema, allowlist, arguments and risk; the executor runs the tool.
5. Results go back; the deterministic gate says PASS, or FAIL with reasons.
6. Every step writes an event with request id, versions, tokens and latency.
7. Evals and cost per accepted drawer read the trace and gate the next release.

## Rules of thumb

| Do | Don't |
|---|---|
| Enforce authorisation in code before retrieval or tool execution. | Ask the model whether the user is allowed. |
| Give every network call a timeout derived from the remaining deadline. | Let each layer pick its own timeout. |
| Retry only transient errors, with backoff and jitter, from one layer. | Retry at client, API and SDK at the same time. |
| Cap steps, tool calls, model calls and tokens on every run. | Trust the model to stop on its own. |
| Treat supplier pages and tool results as untrusted data. | Let retrieved text act as an instruction. |
| Test properties and pass rates. | Assert exact model wording. |
| Stamp request id, prompt version, model version and tokens on every event. | Log full prompts and secrets into ordinary logs. |
| Version prompt, model, catalogue and eval set as one release. | Roll back the code and leave the prompt behind. |
| Report cost per accepted drawer and p95 latency. | Report only average cost per request. |

## Skeletons

### Bounded agent loop

```python
def run(agent, inci, budget, deadline):
    convo = Conversation(); convo.add_user(f"Research {inci}")
    for step in range(1, budget.model_calls + 1):
        if deadline.remaining() <= 0:
            return stop("deadline")
        reply = agent.model.complete(system=SYS, messages=convo.as_api(), tools=TOOLS)
        box.log("model_reply", inci, step=step, tokens=reply.usage)
        if not reply.tool_uses: return finish(reply.text)
        convo.add_assistant(blocks(reply))
        convo.add_tool_results([policy_execute(c, deadline) for c in reply.tool_uses])
        if gate_passed(): return finish("accepted")
    return stop("budget")
```

### Protected supplier fetch

```python
breaker = Breaker(threshold=5, cooldown=30.0)

def fetch(url: str, deadline) -> str:
    if not breaker.allow():
        raise ToolError("supplier circuit open")
    try:
        text = retry(lambda: http_get(url, timeout=min(8.0, deadline.remaining())))
        breaker.record(ok=True)
        return text
    except TransientError:
        breaker.record(ok=False)
        raise
```

### Tool policy chain

```python
RISK = {"catalogue_lookup": "read", "read_supplier_page": "read", "fill_drawer": "write"}

def policy_execute(call, user, deadline):
    if call.name not in registry: raise ToolError("unknown tool")
    args = registry[call.name].validate(call.input)
    if not authorised(user, call.name):
        raise ToolError("not authorised")
    if RISK[call.name] == "write" and not approved(call):
        raise ToolError("needs approval")
    result = registry.call(call.name, **args)
    audit(user=user, tool=call.name, args=args, ok=True)
    return result
```

## Decisions

| When | Use | Not |
|---|---|---|
| The task fits in one request and the user is waiting | a synchronous run | a queue and a job id |
| Research runs take minutes or arrive in batches of hundreds | queue + worker + durable job state | one long-open HTTP request |
| The error is 429, 502, 503 or a timeout on a read | a bounded retry with jitter | a retry on 400, 401, 403 or on a wrong answer |
| A supplier site keeps failing | open the circuit and fall back to catalogue-only | keep retrying every request |
| A rule can be written as code: range, banned list, ownership | a deterministic gate | a sentence in the prompt |
| A tool writes, publishes or deletes | risk class + approval fingerprint + audit line | the read-only path |
| Two drawers are worded differently but both correct | property and pass-rate tests | exact string match |
| Cost is rising | measure cost per accepted drawer, then cut calls and context | swap to the cheapest model first |

## Before you ship

- [ ] Every model and tool call has a timeout derived from the run deadline.
- [ ] The run stops by itself at max steps, tool calls or tokens, and logs why.
- [ ] Tool requests pass schema, allowlist, authorisation and parameter checks before execution.
- [ ] Supplier page text and tool results are treated as data, never as instructions.
- [ ] Every Glass Box event carries request id, prompt version, model version and token counts.
- [ ] A golden set with a threshold per dimension runs before any prompt, model or catalogue change.
- [ ] Cost per accepted drawer and p95 latency are on the dashboard, not only averages.
- [ ] Rollback restores prompt, model and catalogue together, and has been rehearsed once.

## Build ladder

**Rung 1 · Ingredient research inside a budget** (~1 hour) — A glass-box research run that fills the drawer, passes the gate, and stops on its own when the step budget runs out.
  1. Run the offline agent for Glycerin and open the Glass Box trace.
  2. Find the gate event and read its PASS or FAIL reasons.
  3. Lower max_steps to 2 and watch the budget_exhausted event appear.
  4. Add a check_has_sources rule to gates.py and re-run.
  5. Write down which event tells you why the run stopped.

**Rung 2 · A drawer pipeline that survives a flaky supplier** (~half a day) — Supplier-page research with a run deadline, retries with jitter, a circuit breaker, and trajectory tests that inject failures.
  1. Create one Deadline per run and pass remaining seconds into every tool call.
  2. Wrap read_supplier_page in a bounded retry with full jitter.
  3. Add a circuit breaker that opens after five supplier failures and falls back to catalogue-only.
  4. Write a trajectory test: catalogue_lookup MUST run before fill_drawer.
  5. Run ScriptedModel(fail_first=True) and assert the run stops safely.

**Rung 3 · Production readiness for the research agent** (~2 days) — A policy layer with risk classes, approval fingerprints and audit lines, a golden eval set with thresholds, cost per accepted drawer, and a release manifest with a GO or NO-GO checklist.
  1. Tag every tool with a risk class and run a policy chain before execution.
  2. Emit tool_requested and tool_completed events with prompt version and token counts.
  3. Build a 50-ingredient golden set and set thresholds for grounded, safe and schema-valid drawers.
  4. Compute cost per accepted drawer from Glass Box token counts.
  5. Write the release manifest and run the readiness checklist to reach GO or NO-GO.

## You're done when

- Run the research agent with a deadline and a four-part budget, and point at the Glass Box event that says why it stopped.
- Inject a supplier timeout and a poisoned supplier page, and show the run degrades to catalogue-only without any unsafe tool call.
- Run a 50-ingredient golden set before and after a prompt change and give a GO or NO-GO from the per-dimension scores and cost per accepted drawer.

*Source: `books-md/production-ai-engineering.md` · chapters: 1 What Is Production AI Engineering?, 2 From AI Prototype to Production System, 3 Anatomy of a Production AI System, 4 Designing AI Systems for Production, 5 Retrieval-Augmented Generation, 6 AI Memory and State, 7 APIs and Service Architecture, 8 Databases and Data Management, 9 Caching AI Applications, 10 Asynchronous AI Systems, 11 Configuration, Secrets, and Environments, 12 Understanding AI Failure Modes, 13 Errors, Retries, Timeouts, and Fallbacks, 14 Reliability and Resilience, 15 Rate Limiting and Resource Protection, 16 Why Testing AI Is Different, 17 Building AI Evaluation Systems, 18 Testing Prompts, RAG, and Agents, 19 Production Quality Assurance, 20 Observability for AI Systems, 21 Monitoring AI Quality, 22 Monitoring Performance and Cost, 23 Incident Management for AI, 24 The AI Security Threat Model, 25 Prompt Injection and AI Attacks, 26 Securing Tools and AI Agents, 27 Data Privacy and Secrets, 28 AI Latency Engineering, 29 Scaling AI Applications, 30 AI Cost Engineering, 31 Containerizing AI Applications, 32 CI/CD for AI Applications, 33 Cloud and GPU Infrastructure, 34 Kubernetes and AI Workloads, 35 Designing the Master Project, 36 Testing and Evaluating the System, 37 Operating the System, 38 The Production Readiness Review*
