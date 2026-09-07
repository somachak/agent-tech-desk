# Python AI Programming, Second Edition — cheat sheet

*Patrick J · 257 pages · Formulaite bookshelf book 1 of 14*

**Core idea:** The model is somebody else's problem; the system around it (prompt, schema, retrieval, loop, evals) is entirely yours, and each piece is a few lines of plain Python.

**Read when:** Open it first, before any agent book: it teaches the plain-Python parts every other book assumes you already have.

## Vocabulary

| Term | Means |
|---|---|
| token | A chunk of about four characters; billing and the context window both count in tokens. |
| context window | The token ceiling for one request: system, history and reply together. |
| system | Standing instructions that hold for every turn: who the assistant is and its limits. |
| message list | The whole history, user and assistant alternating, resent on every call. |
| temperature | How adventurously the model samples; 0.0 for data, about 0.7 for fresh wording. |
| prefill | An assistant turn you write ('{' or '1.') that the model continues from. |
| few-shot | Example user and assistant pairs placed before the real question. |
| schema | A Pydantic class that states field names, types, allowed values and defaults once. |
| validation error | Pydantic's report naming the field and the reason; send it back as a correction turn. |
| embedding | A fixed-length list of numbers standing for meaning; close means similar. |
| collection | A vector store (Chroma) holding vectors with ids, wording and metadata. |
| distance threshold | The cut-off beyond which retrieved passages are dropped before the prompt. |
| grounded prompt | Context, plus 'use only this', plus a named fallback, plus a citation rule. |
| chunk | A passage split on paragraph boundaries under a character ceiling, with overlap. |
| tool | A name, a when-to-use description and an input_schema; the model asks, you run it. |
| tool_use | The stop_reason that means run a tool and send the result back by id. |
| agent loop | Call, check for tool_use, run, append the result, repeat, with a step limit. |
| eval case | Input, must_contain, must_avoid, expected_source, blocking. |
| judge | A second, smaller model scoring 1 to 5 against a fixed rubric at temperature 0. |
| span | One traced step with a name, a duration and numeric attributes. |

## The pattern

1. system = who the assistant is and its limits; messages = the facts and the question.
2. Retrieve 3 to 5 passages, number them [n] source, drop anything past the distance threshold.
3. Ask for JSON at temperature 0 with a '{' prefill or a tool schema.
4. Validate with Pydantic; on error, append the report as a turn and retry (3 tries, then raise).
5. If stop_reason is tool_use: run the tool, return the result by id, loop (max 5 steps).
6. Anything that spends money waits for a ticket a human confirms.
7. Run 20 cases before shipping; log prompt version, steps, tokens and cost per request.

## Rules of thumb

| Do | Don't |
|---|---|
| Put constraints last, as numbers (at most three sentences). | Bury the format rule mid-prompt and blame the model. |
| Name the fallback in every grounded prompt. | Leave the model no escape route; it will invent one. |
| Retry only temporary errors (429, 529, network) with backoff and jitter. | Catch everything and retry a 400 four times. |
| Feed the ValidationError text back as a correction turn. | Retry blind with the same prompt. |
| Ship the step limit and the hand-over message in the loop's first version. | Add the ceiling after the first runaway bill. |
| Return a refusal string for an unknown tool or bad arguments. | Let a KeyError crash the run. |
| Split read tools from write tools on day one; writes need a ticket. | Let the model's wording place an order. |
| Record numbers in traces: lengths, counts, tokens, cost. | Put customer wording or supplier text in a span attribute. |
| Score with rules first; calibrate any judge against 20 hand scores. | Trust a 1-to-100 judge scale; it is noise. |
| Repair loader damage only; keep punctuation and case. | Lowercase and strip stopwords before embedding. |

## Skeletons

### Retry with backoff

```python
import random, time
import anthropic

def ask(messages, attempts=4, **options):
    for attempt in range(attempts):
        try:
            return call_model(messages, **options)
        except (anthropic.RateLimitError, anthropic.APIStatusError):
            if attempt == attempts - 1:
                raise
            time.sleep((2 ** attempt) + random.random())
```

### Validating extractor

```python
def extract_order(sentence, attempts=3):
    messages = [{"role": "user", "content": sentence}]
    for attempt in range(attempts):
        raw = "{" + call_model(messages + [{"role": "assistant", "content": "{"}],
                               temperature=0.0, system=ORDER_INSTRUCTIONS)
        try:
            return Order.model_validate_json(raw)
        except (ValidationError, json.JSONDecodeError) as error:
            messages.append({"role": "assistant", "content": raw})
            messages.append({"role": "user", "content": f"That reply failed validation.\n\n{error}\n\nWe return corrected JSON only."})
    raise ValueError("The order could not be validated after three attempts.")
```

### Grounded respond()

```python
DISTANCE_LIMIT = 0.75
def respond(question, n_results=4):
    items = [item for item in retrieve(question, n_results=n_results)
             if item["distance"] <= DISTANCE_LIMIT]
    if not items:
        return "We do not have that in our records, though a colleague at the counter can help."
    prompt = render(GROUNDED_REPLY, question=question, context=format_context(items))
    return ask([{"role": "user", "content": prompt}], temperature=0.0)
```

### Agent loop

```python
def act(question, max_steps=5):
    messages = [{"role": "user", "content": question}]
    for _ in range(max_steps):
        response = client.messages.create(model=MODEL, max_tokens=600, temperature=0.0,
                                          system=SHOP_BRIEF, tools=TOOLS, messages=messages)
        if response.stop_reason != "tool_use":
            return response.content[0].text
        messages.append({"role": "assistant", "content": response.content})
        results = [{"type": "tool_result", "tool_use_id": block.id, "content": run_tool(block.name, block.input)}
                   for block in response.content if block.type == "tool_use"]
        messages.append({"role": "user", "content": results})
    return "We could not complete that. A colleague at the counter can help."
```

## Decisions

| When | Use | Not |
|---|---|---|
| The output is parsed by a program | temperature 0.0, a '{' prefill, Pydantic validation | a warm temperature and json.loads alone |
| The fact is written down somewhere | retrieval over a collection | fine-tuning, which learns the shape of a fact rather than its value |
| The fact changes minute by minute (stock, a live price) | a read tool the model can call | embedding it into the index |
| The action spends money or changes records | prepare plus a single-use confirm ticket | a direct write tool |
| A task has a mechanical metric, a stable definition and volume | DSPy compile against the metric | hand-tuning forever |
| Nothing passes the distance threshold | refuse before calling the model | sending four weak passages and hoping |
| A second application needs the same tools | an MCP server | MCP for one client |
| Batch work (embedding 400 passages, 20 eval cases) | AsyncAnthropic under asyncio.Semaphore(8) | async in the interactive path |

## Before you ship

- [ ] The key lives in .env with chmod 600 and a .gitignore line.
- [ ] Every call records stop_reason, tokens and the prompt version.
- [ ] Every grounded prompt names its fallback, and every citation maps to a passage you sent.
- [ ] The loop has max_steps and a hand-over message; the dispatcher never raises.
- [ ] Write tools need a single-use ticket; read tools are logged with name, arguments and duration.
- [ ] 20 eval cases run as one command; no blocking failure; the pass count may drop by at most one.
- [ ] Traces carry numbers only; PII is redacted before sessions, logs or eval output reach disk.
- [ ] index_all() and the eval gate run in the same deploy step; /health checks the collection is not empty.

## Build ladder

**Rung 1 · One validated Ingredient Drawer** (~half a day) — A single grounded call that returns one ingredient's drawer as a typed object, or a clear refusal.
  1. Load ANTHROPIC_API_KEY from .env and make one client.messages.create call with a system brief.
  2. Paste the catalogue entry for one INCI name into the user message as context, constraints last.
  3. Ask for JSON at temperature 0 with a '{' prefill.
  4. Validate the reply with a Pydantic IngredientDrawer schema built from drawer.py.
  5. On ValidationError, append the error as a new turn and retry up to three times.

**Rung 2 · Ingredient research loop with tools and a gate** (~2 days) — The 15-line agent loop that looks up the catalogue, reads supplier pages by meaning, and fills a drawer the gate accepts.
  1. Describe catalogue_lookup and read_supplier_page as tools with a name, a when-to-use description and an input_schema.
  2. Write the loop: call, check stop_reason, run each tool_use, append tool_result by id, max_steps=5.
  3. Clean and chunk supplier pages, upsert them into a Chroma collection, and drop hits past a distance threshold.
  4. Number every passage [n] source and require the drawer's sources section to cite them.
  5. Run run_gates() on every fill_drawer call and send FAIL reasons back as a tool_result.

**Rung 3 · Evals, tracing and a served research endpoint** (~1 week) — A FastAPI /research endpoint with spans, cost per run, a 20-ingredient eval gate, and tools shared over MCP.
  1. Write 20 eval cases (input INCI, must_contain, must_avoid, expected_source, blocking for banned ingredients).
  2. Score with rules first, then a smaller judge model at temperature 0, calibrated against 20 hand scores.
  3. Add run_evals that appends one JSONL line per run and blocks release on any blocking failure.
  4. Wrap Agent.run in a FastAPI endpoint with spans recording steps, tokens and cost, numbers only.
  5. Serve the tool registry over an MCP server once a second Formulaite client needs it.

## You're done when

- You can write the 15-line agent loop from memory, with max_steps and a hand-over message, and explain why every tool_result carries an id.
- You can take a bad JSON reply, show the ValidationError, and fix it by feeding the error back rather than editing the prompt.
- You can run one command that scores 20 cases, appends a history line, and tells you whether the release is blocked.

*Source: `books-md/python-ai-programming-second-edition.md` · chapters: 1 How AI Works Today?, 2 Working with Models, 3 Prompts that Works, 4 Reliable Outputs and Conversations, 5 Programming Prompts with DSPy, 6 Embeddings and Semantic Search, 7 Retrieval-Augmented Generation, 8 Getting Data Ready, 9 Model Needs Customization, 10 Working with Images and Sound, 11 Tools, Agents and MCP, 12 Examining AI with Evals and Safety Tests, 13 Shipping with FastAPI and OpenTelemetry*
