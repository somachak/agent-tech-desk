# Agentic Design Patterns — cheat sheet

*Antonio Gulli · 448 pages · Formulaite bookshelf book 7 of 14*

**Core idea:** An agent is not one clever prompt; it is a handful of named patterns, chained, routed, reflected, gated and remembered, that you compose like bricks.

**Read when:** Open it once you know what an agent loop is and want a name, a shape and a rule of thumb for each piece you are about to add.

## Vocabulary

| Term | Means |
|---|---|
| pattern | a named, reusable shape for one recurring agent problem |
| prompt chaining | one focused prompt per step; output of one is input of the next |
| routing | classify the input, then send it to the right chain, tool or agent |
| parallelization | run independent steps at once, then merge |
| reflection | produce, critique, refine, repeat, with a stop rule |
| producer-critic | one agent writes, a different agent with its own criteria reviews |
| tool use / function calling | the model emits a structured call; your code runs the function |
| planning | invent the ordered steps at run time when the how is unknown |
| multi-agent collaboration | specialised roles handing work to each other or to a supervisor |
| session state | the scratchpad dict for one conversation thread |
| long-term memory | facts, experiences and rules stored outside the context and searched back in |
| RAG | chunk, embed, retrieve the closest chunks, paste them into the prompt |
| embedding | a list of numbers that places a text by meaning |
| MCP | an open standard for a server to expose tools that any client can discover |
| A2A / agent card | agents on any framework talk over HTTP; the card is the JSON identity they publish |
| guardrail | a layer that screens input, output, tool calls or behaviour |
| human-in-the-loop | a person reviews, corrects or approves at a defined escalation point |
| trajectory | the sequence of steps an agent took, compared against an ideal one |
| LLM-as-a-judge | a model scoring another model's output against a written rubric |
| router agent | a first cheap step that decides which model or path a request deserves |

## The pattern

1. plan = planner(goal)                        # Planning: what steps, only if the how is unknown
2. for step in plan:                           # Prompt chaining: one focused prompt each
3.     path = route(step)                      # Routing: tool, model or sub-agent
4.     facts = run_tools(path)                 # Tool use / RAG: grounded, cited facts
5.     draft = produce(facts, state)           # Memory: session state between steps
6.     verdict = critic(draft)                 # Reflection + guardrail + deterministic gate
7.     if not verdict.ok: retry, fall back or escalate   # Exception handling / human in the loop
8. log trajectory, tokens, verdict             # Evaluation and monitoring

## Rules of thumb

| Do | Don't |
|---|---|
| Give each step one focused prompt and pass JSON to the next. | One monolithic prompt that summarises, extracts and drafts at once. |
| Use a separate critic with its own criteria. | Let the writer grade its own work with the same prompt. |
| Use a fixed workflow when the recipe is known. | Give a planning agent a job you could write as five lines. |
| Make tools raise clear errors and tell the agent what to do on failure. | Return 'error: not found' as a string the model may read as data. |
| Update state through tools or events so it is logged and persisted. | Edit session.state directly and hope it sticks. |
| Give each agent the minimum tools and permissions for its task. | Hand every tool to every agent. |
| Layer guardrails: input screen, output check, tool callback, human. | Rely on the system prompt alone to stop injection. |
| Classify first and send simple steps to a cheap model. | Run every step on the biggest model you can afford. |
| Put a max_iterations on every loop and a default branch on every router. | Assume the critic will eventually say perfect. |
| Evaluate the trajectory, tokens and latency, not just the final text. | Grade with an exact string match. |

## Skeletons

### Two-step chain (LangChain LCEL)

```python
extract = ChatPromptTemplate.from_template("Extract specs from:\n{text}")
to_json = ChatPromptTemplate.from_template("As JSON with cpu, memory:\n{specs}")
extraction_chain = extract | llm | StrOutputParser()
full_chain = ({"specs": extraction_chain} | to_json | llm | StrOutputParser())
print(full_chain.invoke({"text": input_text}))
```

### Reflection loop with two exits

```python
history = [HumanMessage(content=task)]
for i in range(max_iterations):
    draft = llm.invoke(history)
    history.append(draft)
    critique = llm.invoke(critic_prompt(task, draft.content)).content
    if "CODE_IS_PERFECT" in critique:
        break
    history.append(HumanMessage(content=f"Critique:\n{critique}"))
```

### Rule-based router with a default

```python
def route(request: str, entry: dict | None) -> str:
    if entry is None:
        return "unclear"        # ask the user, do not guess
    if entry.get("banned"):
        return "stop"
    return "research"
handlers = {"stop": stop_handler, "unclear": clarify_handler,
            "research": agent.run}
handlers[route(request, catalogue_entry(inci))](inci)
```

### Before-tool guardrail (ADK style)

```python
def validate_tool_params(tool, args, tool_context):
    if tool.name not in ALLOWED_TOOLS:
        return {"status": "error", "error_message": "Tool not allowed."}
    if "url" in args and not args["url"].startswith(TRUSTED_PREFIX):
        return {"status": "error", "error_message": "Untrusted url."}
    return None   # allow
root_agent = Agent(name="root_agent", before_tool_callback=validate_tool_params,
                   tools=[catalogue_lookup, read_supplier_page])
```

## Decisions

| When | Use | Not |
|---|---|---|
| each step needs the previous step's output | prompt chaining | parallel branches |
| steps are independent and wait on APIs | parallelization with a merge step | one long sequence |
| inputs come in several kinds | routing with a default branch | one chain that handles everything |
| quality matters more than speed and cost | reflection with a separate critic | a single pass |
| the how is unknown or changes per request | planning | a fixed workflow |
| you have a few fixed tools in one app | function calling | an MCP server |
| agents on different frameworks must cooperate | A2A with agent cards | MCP, which is for tools |
| a mistake is costly or irreversible | human-in-the-loop approval | full autonomy |

## Before you ship

- [ ] Every step's output is JSON that a parser or Pydantic model checks before the next step.
- [ ] A critic or deterministic gate reviews every drawer before it leaves the loop.
- [ ] Every loop has a max_iterations and every router has a default branch.
- [ ] Every tool raises on failure and the agent has a logged fallback path.
- [ ] Tool calls pass an allow-list callback; each agent has only the tools it needs.
- [ ] Retrieved chunks carry their source and the prompt says 'if you don't know, say so'.
- [ ] A fixed eval set runs after every prompt change; trajectory, tokens and latency are logged.
- [ ] A human approval step sits before any irreversible or catalogue-writing action.

## Build ladder

**Rung 1 · Chain, tool, critic: the drawer pipeline** (~2 hours) — A fixed three-step chain (catalogue lookup, supplier page, fill drawer) where every tool is described by its docstring and a deterministic gate plays the critic.
  1. Write the drawer job as a chain in SYSTEM_PROMPT: catalogue_lookup, then read_supplier_page, then fill_drawer.
  2. Register both tools with @registry.tool so the docstring becomes the description the model reads.
  3. Make fill_drawer the only way to answer, so the output is structured, never prose.
  4. Run run_gates on the drawer and send the reasons back as a REJECTED tool_result.
  5. Log every model reply, tool call and verdict in the Glass Box and replay one run.

**Rung 2 · Router, fan-out, state and fallbacks** (~half a day) — A router in front of the loop, three supplier pages fetched at once, a session state dict beside the chat, and a fallback path when a page fails.
  1. Add a rule-based router before Agent.run: banned ingredient stops, unknown asks, known researches.
  2. Fetch three supplier pages with asyncio.gather and merge them into one draft grounded only on those pages.
  3. Keep ingredient, current step and sources found in a state dict, separate from the message list.
  4. On a failed supplier page, fall back to the catalogue and mark the source as catalogue-only.
  5. Turn REQUIRED_SECTIONS into the goal checklist and stop only when it is ticked or max_steps ends.

**Rung 3 · Guardrails, MCP tools, cost routing and evals** (~2 days) — Formulaite tools served over MCP, a before-tool allow-list, a cheap-model pre-screen of supplier pages, model routing by task, a human approval step and a ten-ingredient eval set.
  1. Serve catalogue_lookup and read_supplier_page from a FastMCP server and consume them with a tool_filter.
  2. Screen every supplier page with a small cheap model for injection before it reaches the main model.
  3. Add a before-tool check in ToolRegistry.call that blocks any tool or argument outside the allow-list.
  4. Route simple lookups to the cheap model and full drawers to the strong one; log the model name and tokens.
  5. Require a human approval tool before a drawer is written to the live catalogue.
  6. Build a ten-INCI eval set with the expected tool order; compare trajectory and gate pass rate after every change.

## You're done when

- Draw the Formulaite agent as named boxes (chain, tool use, reflection, gate, memory) and say which chapter each box comes from.
- Put a rule-based router in front of Agent.run that stops a banned ingredient before any tool runs, and prove it from the Glass Box replay.
- Add a before-tool allow-list and a ten-ingredient eval set, then show trajectory, gate pass rate and token cost for one run.

*Source: `books-md/agentic-design-patterns.md` · chapters: 1 Prompt Chaining, 2 Routing, 3 Parallelization, 4 Reflection, 5 Tool Use (Function Calling), 6 Planning, 7 Multi-Agent Collaboration, 8 Memory Management, 9 Learning and Adaptation, 10 Model Context Protocol, 11 Goal Setting and Monitoring, 12 Exception Handling and Recovery, 13 Human-in-the-Loop, 14 Knowledge Retrieval (RAG), 15 Inter-Agent Communication (A2A), 16 Resource-Aware Optimization, 17 Reasoning Techniques, 18 Guardrails/Safety Patterns, 19 Evaluation and Monitoring, 20 Prioritization, 21 Exploration and Discovery, 22 Advanced Prompting Techniques, 24 A Quick Overview of Agentic Frameworks, 29 Conclusion*
