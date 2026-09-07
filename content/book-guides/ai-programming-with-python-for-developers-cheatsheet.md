# AI Programming with Python for Developers — cheat sheet

*Henry Bill · 362 pages · Formulaite bookshelf book 4 of 14*

**Core idea:** The model decides what it would like to do; your application decides what it is actually allowed to do.

**Read when:** Open it when you are about to write the loop, the tool dispatcher or the gate yourself and want the plain Python version before any framework.

## Vocabulary

| Term | Means |
|---|---|
| Responses API | OpenAI's current request API: client.responses.create(model=..., input=...). |
| Structured output | The model returns fields that match a Pydantic class instead of prose. |
| Tool call | A JSON request from the model to run one of your registered functions. |
| call_id | The tag that links a tool result back to the call that asked for it. |
| Dispatcher | A dict of name to function; the allowlist of what the model can run. |
| Ingestion | Load, clean, chunk and tag documents before any question is asked. |
| Chunk | One retrieval-sized piece of text carrying its own metadata. |
| Embedding | A vector of numbers that stands for the meaning of a text. |
| Recall@K | Share of questions whose correct source appears in the top K results. |
| Groundedness | Every claim in the answer is supported by the retrieved evidence. |
| Agent loop | Model proposes, app executes, result goes back, repeat until a stop condition. |
| max_steps | The hard budget on loop turns; the loop can never run away. |
| Application state | The dataclass the program needs: findings, completed steps, status. |
| Conversation history | The messages the model sees; context, not data. |
| Checkpoint | State saved after a stage so a run can resume or wait for approval. |
| Handoff | One agent transfers ownership of the task to another agent. |
| MCP | A standard protocol for discovering and calling tools, resources and prompts. |
| Least privilege | Give each agent only the tools its task actually needs. |
| Prompt injection | Untrusted text trying to act as instructions to the model. |
| Trace | Structured events for one request, all carrying the same request_id. |

## The pattern

1. state = new_state(task); messages = [user(task)]
2. for step in range(MAX_STEPS):
3.     reply = model(messages, tools)             # model proposes
4.     if reply.is_final or gate(reply).passed: break
5.     for call in reply.tool_calls:
6.         check_allowed(call); result = execute_tool_safely(call)
7.         trace.record(call, result); messages += [call, result]

## Rules of thumb

| Do | Don't |
|---|---|
| Put every model call behind one function or Protocol. | Import the provider SDK inside business logic. |
| Validate model output with your own rules after parsing. | Trust JSON because the prompt asked for JSON. |
| Look tool names up in a dict and raise on unknown names. | eval() or exec() anything the model wrote. |
| Cap every loop with max_steps and a tool budget. | Write while True around a model. |
| Return a small error dict to the model and log the traceback yourself. | Forward raw exceptions or invent a fake result. |
| Keep state in a dataclass; trim history to summary plus recent turns. | Send the whole transcript on every turn. |
| Retrieve first, then generate; build citations from metadata. | Let the model invent citations. |
| Require user_approved from trusted code for risky tools. | Ask the model whether an action is safe. |
| Change one variable, run evals, compare with the baseline. | Change model, prompt and chunk size in one go. |
| Stamp every event with a request_id. | print('Tool called') and hope. |

## Skeletons

### Bounded agent loop

```python
def run_agent(task: str, max_steps: int = 8) -> str:
    messages = [{"role": "user", "content": task}]
    for _ in range(max_steps):
        response = call_model(messages=messages, tools=TOOLS)
        if response.is_final:
            return response.text
        for tool_call in response.tool_calls:
            result = execute_tool_safely(tool_call.name, tool_call.arguments)
            messages.append(tool_call.as_message())
            messages.append(tool_call.result_message(result))
    raise RuntimeError("Agent exceeded the maximum number of steps.")
```

### Safe dispatcher

```python
TOOLS = {"get_order": get_order, "search_products": search_products}
def execute_tool_safely(name: str, arguments: dict) -> dict:
    tool = TOOLS.get(name)
    if tool is None:
        return {"error": f"Unknown tool: {name}"}
    try:
        return tool(**arguments)
    except (TimeoutError, ValueError) as exc:
        return {"error": str(exc)}
    except Exception:
        logger.exception("Unexpected tool execution failure")
        return {"error": "The requested operation could not be completed."}
```

### Trace object

```python
from dataclasses import dataclass, field
import time, uuid

@dataclass
class Trace:
    request_id: str
    events: list[dict] = field(default_factory=list)
    def record(self, name: str, **data):
        self.events.append({"name": name, "timestamp": time.time(), **data})

trace = Trace(request_id=str(uuid.uuid4()))
```

### Eval runner

```python
def run_evaluation(dataset, application):
    results = []
    for case in dataset:
        result = application.run(case["question"])
        results.append({
            "retrieval_ok": check_sources(result, case.get("expected_sources", [])),
            "tools_ok": check_tools(result, case.get("expected_tools", [])),
            "success": result.status == "completed",
        })
    return results
```

## Decisions

| When | Use | Not |
|---|---|---|
| The result is read by a person | plain text | a schema the app never reads |
| Python needs individual fields | structured output plus your own validate step | regex over prose |
| The stage order is known in advance | a Python workflow list with dependency checks | an autonomous loop |
| The next action cannot be known in advance | a bounded loop with AVAILABLE_ACTIONS | a fixed script |
| Answers are poor | recall_at_k on retrieval first | a bigger model |
| A tool changes or deletes data | a permission tag plus user_approved from trusted code | the same dispatch as a read |
| A run must survive a restart or wait for a human | save_state, return, load_state later | a worker that stays alive |
| Another app needs your tools | an MCP server over your existing service | a second copy of the integration |

## Before you ship

- [ ] max_steps, MAX_TOOL_CALLS and a cost cap are enforced in code, not described in a prompt.
- [ ] Unknown tool names raise; there is no eval or exec anywhere.
- [ ] Every tool failure becomes an error result; no fake record is ever returned.
- [ ] The drawer passes your gate rules, not just the schema shape.
- [ ] Every event carries a request_id and no secrets or raw prompts.
- [ ] evals/dataset.json ran and Recall@K plus groundedness did not drop.
- [ ] Risky tools need user_approved from an authenticated person.
- [ ] Secrets come from the environment, never from tool arguments or the image.

## Build ladder

**Rung 1 · Gated ingredient lookup** (~1 hour) — One model call that returns a typed IngredientDrawer, checked by a plain-Python gate, tested with a fake model.
  1. Put the model call behind ModelClient.complete() in models.py.
  2. Register catalogue_lookup with @registry.tool in formulaite_tools.py.
  3. Make fill_drawer return an IngredientDrawer from drawer.py.
  4. Run run_gates() on the drawer and print the reasons from gates.py.
  5. Run the whole thing with ScriptedModel, no API key.

**Rung 2 · Research loop with Glass Box** (~half a day) — A bounded loop that reads supplier pages, feeds gate failures back to the model, keeps state, and records every event.
  1. Wire Agent.run() with max_steps and the for/else budget in agent.py.
  2. Turn ToolError into an error tool_result in _handle_tool().
  3. Keep Conversation trimmed in memory.py and the drawer as state in drawer.py.
  4. Log request, model_reply, tool_call, gate and run_end events in glassbox.py.
  5. Detect a repeated read_supplier_page call using GlassBox.of_kind().
  6. Swap ScriptedModel for a local Ollama model behind the same Protocol.

**Rung 3 · Evaluated, guarded, shareable agent** (~2 days) — The same agent with an eval set, allowlisted tools, approval before catalogue writes, cost caps, and an MCP door for other Formulaite agents.
  1. Write evals/dataset.json: ingredient, expected supplier page, expected tools.
  2. Add an eval runner that scores recall_at_k and gate pass rate per run.
  3. Add ALLOWED_TOOLS per workflow and one adversarial supplier page test.
  4. Pause with status awaiting_approval before any catalogue commit and save the GlassBox.
  5. Add MAX_REQUEST_COST next to max_steps using Conversation.token_estimate().
  6. Expose catalogue_lookup and read_supplier_page through one MCPServer.

## You're done when

- Run the Agent Lab with ScriptedModel and explain every Glass Box event using the loop from 5.1.
- Add a fourth tool to formulaite_tools.py with a precise schema, and make the gate reject a drawer that misuses it.
- Write five evals/dataset.json cases for ingredients and read recall_at_k plus gate pass rate before and after a prompt change.

*Source: `books-md/ai-programming-with-python-for-developers.md` · chapters: 1 Build Your First AI Application, 2 Build LLM-Powered Applications, 3 Build AI Applications with Tools, 4 Build Production-Ready RAG Systems, 5 Build AI Agents, 6 Connect AI Systems with MCP, 7 Build with Local and Open AI Models, 8 Test, Evaluate, Secure, and Optimize AI Applications, 9 Build and Deploy a Production AI System*
