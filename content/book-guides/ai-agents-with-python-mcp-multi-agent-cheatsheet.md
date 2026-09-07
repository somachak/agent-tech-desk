# AI Agents with Python — cheat sheet

*Williams Moses · 377 pages · Formulaite bookshelf book 2 of 14*

**Core idea:** An agent is a loop your application controls: the model proposes, your code runs the tools, validates the answer, logs every step and decides when to stop.

**Read when:** Open it when you want the whole agent machine drawn in plain boxes and short Python before you touch any framework.

## Vocabulary

| Term | Means |
|---|---|
| agent loop | analyse, decide, act, observe, check the goal, repeat |
| goal | what to achieve, not how; the thing the loop checks against |
| system prompt | the rulebook read before every user message: role, duties, boundaries, format |
| user prompt | task, context, constraints, output format for one request |
| structured output | JSON with named fields instead of prose |
| function calling | the model requests a function; your app decides and runs it |
| tool schema | name, description, typed parameters, required list: the contract the model reads |
| envelope | the fixed shape every tool returns: success, data, message |
| conversation memory | the message list you resend on every call |
| long-term memory | facts saved to a database and loaded next session |
| retrieval (RAG) | chunk, embed, find the closest chunks, send only those |
| embedding | numbers that capture the meaning of a text chunk |
| plan / task decomposition | a big goal as a list of small steps, kept apart from execution |
| workflow state | dict of task, current step, completed steps: the resume point |
| reflection | a review of the draft before it is returned; rule first, model judge later |
| trace | the full ordered record of one request: prompts, tools, replies, time, tokens |
| MCP | a standard for discovering and calling tools; the client asks the server what it has |
| least privilege | each agent gets only the tools it needs |
| prompt injection | text in input or documents that tries to give the model new orders |
| human-in-the-loop | pause and ask a person before an action that cannot be undone |

## The pattern

1. goal = user request; memory = load()
2. for step in range(max_steps):
3.     reply = model(system_prompt, memory, tool_schemas)
4.     if reply asks for a tool: result = app.run(tool)   # envelope; log it
5.     else: draft = reply; if validate(draft): return draft
6.     memory.append(result or failure reasons)   # observe, then loop
7. return 'Maximum reasoning steps reached.'

## Rules of thumb

| Do | Don't |
|---|---|
| Give the model a goal and a loop with a stop rule. | Send one prompt and call it an agent. |
| Ask for valid JSON only, then json.loads and check fields in code. | Treat the model's self-review as the final check. |
| One tool, one task, every parameter described. | A manage_everything() tool with bare parameter names. |
| Retry temporary failures a fixed number of times with a wait. | Retry bad input or an expired key. |
| Keep the conversation list short; summarise old turns. | Resend an hour of chat on every call. |
| Log input, chosen tool, tool output and reply for every step. | Debug from the final answer alone. |
| Treat fetched pages and documents as data, never as instructions. | Put secrets or business rules the model could leak inside the prompt. |
| Change one thing, rerun the same ten prompts, compare with the baseline. | Swap the prompt and the model on the same day. |
| Improve the prompt and the workflow before paying for a bigger model. | Reach for a larger model at the first bad answer. |

## Skeletons

### Tool envelope with bounded retry

```python
import time, requests

def fetch_data(url, retries=3):
    for attempt in range(retries):
        try:
            response = requests.get(url, timeout=5)
            response.raise_for_status()
            return {"success": True, "data": response.json(), "message": ""}
        except requests.RequestException:
            if attempt < retries - 1:
                time.sleep(2)
    return {"success": False, "data": None, "message": "Service unavailable."}
```

### Reasoning loop with a step budget

```python
def reasoning_loop(task, max_steps=5):
    for step in range(max_steps):
        print(f"Reasoning step {step + 1}")
        # think, plan, act, observe ...
        task_completed = check_done()
        if task_completed:
            return "Task completed."
    return "Maximum reasoning steps reached."
```

### Validate JSON, retry with for/else

```python
MAX_RETRIES = 3
for attempt in range(MAX_RETRIES):
    response = client.responses.create(model="gpt-5", input=prompt)
    try:
        data = json.loads(response.output_text)
        if any(f not in data for f in required_fields):
            raise ValueError("Missing field")
        break
    except (json.JSONDecodeError, ValueError):
        print(f"Attempt {attempt + 1} failed.")
else:
    raise RuntimeError("Unable to generate valid JSON.")
```

### Permission-checked tool call

```python
permissions = {"support_agent": ["read_customer"]}

def has_permission(agent, tool):
    return tool in permissions.get(agent, [])

def run_tool(agent, tool, **kwargs):
    if not has_permission(agent, tool):
        return {"success": False, "data": None, "message": "Permission denied."}
    if tool in SENSITIVE and not request_approval(tool):
        return {"success": False, "data": None, "message": "Cancelled."}
    return TOOLS[tool](**kwargs)
```

## Decisions

| When | Use | Not |
|---|---|---|
| The request is one fact or a translation | Answer directly: no plan, no reflection | A five-step plan and three review passes |
| The answer changes hourly or lives outside the model | A tool the app runs | The model's built-in knowledge |
| A fact will still matter next session | Long-term memory (SQLite key and value) | Conversation memory |
| Thousands of documents to search | Retrieval: chunk, embed, send the top matches | Pasting documents into the prompt |
| A tool fails on the network or a server error | Retry up to N times with a wait | Retrying invalid input or auth errors |
| One tool, one prototype | A direct Python function call | An MCP server |
| Many tools shared by several agents | An MCP server with @mcp.tool() | Copy-pasted integration code in each agent |
| An action cannot be undone (email, payment, delete) | request_approval() then act | Letting the model decide |

## Before you ship

- [ ] Every loop has max_steps and a clear stop condition.
- [ ] Every tool returns success, data, message and never raises into the loop.
- [ ] The system prompt has role, duties, boundaries and format, one role only.
- [ ] Output is JSON, parsed and field-checked in code before anything uses it.
- [ ] Every request, tool call, reply, error, latency and token count is logged.
- [ ] Fetched content is scanned and passed as data; secrets live in environment variables.
- [ ] Each agent has a permission list; write actions pause for approval.
- [ ] The ten-prompt evaluation set was rerun and compared with the last baseline.

## Build ladder

**Rung 1 · One-tool ingredient lookup with a log** (~2 hours) — An agent that takes an INCI name, calls catalogue_lookup when the model asks, returns JSON, and prints a log line for every step.
  1. Write the four-part SYSTEM_PROMPT: role, duties, boundaries, JSON-only format.
  2. Describe catalogue_lookup with a schema: name, description, one required parameter.
  3. Loop: send the request, run the tool the model asks for, feed the result back.
  4. Ask for JSON only, then json.loads and check the required drawer fields.
  5. Print a [TAG] line for every request, tool call and answer.

**Rung 2 · Drawer, gate and retry with supplier pages** (~half a day) — The agent reads a supplier page, fills the Ingredient Drawer, and a deterministic gate sends it back with reasons until it passes or the step budget runs out.
  1. Add read_supplier_page that returns the same success, data, message envelope as every tool.
  2. Keep the conversation as a list; append each model reply and each tool result.
  3. Write run_gates: sections filled, use level in range, sources present, no forbidden claims.
  4. On a failed gate, send the reasons back as a tool result and loop again.
  5. Stop at max_steps and record budget_exhausted in the Glass Box.

**Rung 3 · Shared tools, permissions and an eval set** (~2 days) — Formulaite tools exposed through an MCP server, a permission table per agent role, untrusted-page scanning, approval before catalogue writes, and a ten-ingredient regression run with cost logging.
  1. Wrap catalogue_lookup and read_supplier_page in a FastMCP server with @mcp.tool().
  2. Scan every fetched supplier page for injection phrases before it reaches the model.
  3. Add a permissions dict and check it inside ToolRegistry.call before any tool runs.
  4. Require request_approval before any tool that writes to the live catalogue.
  5. Run ten fixed INCI names after every prompt change; diff gate pass rate, steps and tokens.

## You're done when

- Replay one Formulaite run from the Glass Box and say, for each step, why the model chose that tool.
- Write a new deterministic gate check, make it fail on a bad drawer, and watch the agent fix the drawer on the next loop.
- Add a tool to the registry with a schema the model understands, and prove with ten fixed prompts that nothing else regressed.

*Source: `books-md/ai-agents-with-python-mcp-multi-agent.md` · chapters: 1 Build Your First AI Agent, 2 Setting Up Your Agent Development Environment, 3 Prompt Engineering and Structured Outputs, 4 Function Calling and Tool Integration, 5 Memory, Retrieval, and Planning, 6 Building Complete Agent Workflows, 7 Model Context Protocol and Multi-Agent Systems, 8 Testing, Evaluation, and Observability, 9 Security, Guardrails, and Deployment, 10 Building Production-Ready Agentic AI Applications*
