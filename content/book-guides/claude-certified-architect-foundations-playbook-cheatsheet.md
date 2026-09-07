# Claude Certified Architect Foundations Playbook — cheat sheet

*J Cook · 148 pages · Formulaite bookshelf book 6 of 14*

**Core idea:** The exam grades architecture, not prompts: every scenario is fixed by naming the layer that changes the system's shape, never by turning a knob.

**Read when:** Open it when you are studying for the CCA-F, or when a Formulaite scenario reads like an exam stem: hallucinating answers, a tool that works on one laptop only, a cost spike, a quiet wrong answer.

## Vocabulary

| Term | Means |
|---|---|
| Hub-and-Spoke | User to coordinator to scoped subagents to a structured answer; the Domain 1 template. |
| Coordinator | The routing agent; must have "Agent" in allowed_tools to delegate. |
| AgentDefinition | A subagent spec: description, prompt, tools, optional model. |
| Structured context passing | Hand a subagent a task-shaped payload, not the raw user question. |
| Batch API | Async endpoint at /v1/messages/batches; fifty percent off input and output, separate rate limits. |
| Prompt caching | cache_control on a long stable block; reads cost ninety percent less, five-minute or one-hour TTL. |
| Structured outputs | output_config.format or messages.parse; schema-valid JSON guaranteed by constrained sampling. |
| Fallback loop | Backoff retry for rate limits, timeouts, refusals; three attempts, 1s 2s 4s. |
| MCP | Open standard connecting agents to tools; transports stdio, HTTP, SSE. |
| mcp__server__tool | The strict MCP tool name; double underscores, never dots. |
| .mcp.json | Server registrations at the project root; loaded only if settingSources includes project. |
| permissionMode | Silences built-in edit tools only; never auto-approves MCP tools. |
| CLAUDE.md scopes | Managed, Project, User, Local; Local wins; only Project ships with the repo. |
| Hook | A non-interactive shell command run on an event such as PostToolUse. |
| Skill versus slash command | Skill is agent-invoked; slash command is human-typed. |
| Harmlessness screen | A Haiku classifier returning is_harmful before input reaches the agent. |
| Silent failure | Output that is valid and wrong; no exception, no red log. |
| Golden set | Pinned inputs with known-correct outputs, diffed in CI on every change. |
| LLM-as-judge | A second cheap model call scoring the first answer; flag under 0.7, refuse under 0.5. |
| Blast radius | What a jailbroken or hallucinating agent could damage with its current permissions. |

## The pattern

1. Read the stem twice; name the pattern: scale, routing, silent, portability, trust.
2. Cross out the knob-turns: bigger model, better prompt, lower temperature.
3. Name the layer that changes the shape: coordinator, schema, scope, screen, detector.
4. Say which order the layers ship in, and why the first one comes first.
5. Check the answer against the wrong-answer cues for that pattern.
6. Build it once in the prep repo so the recognition becomes reflex.

## Rules of thumb

| Do | Don't |
|---|---|
| Put "Agent" in the coordinator's allowed_tools before defining any subagent. | Debug the subagent when the coordinator cannot delegate. |
| Route anything that can wait an hour through the Batch API. | Switch to a cheaper model and call that the cost fix. |
| Pin a schema for shape and add a validator for business rules. | Put minimum, maximum or string length in the schema; they are not supported. |
| Wrap every model and tool call in a backoff loop with a hard cap. | Retry malformed JSON; the schema layer already made it impossible. |
| Use relative paths, a .env.example and the project root for .mcp.json. | Blame the teammate's Claude Code version. |
| Keep team rules in ./CLAUDE.md and personal ones in ~/.claude/CLAUDE.md. | Believe in a plugin scope or a six-tool Claude Code. |
| Screen input with a Haiku classifier before the agent sees it. | Rely on the system prompt as the whole injection defence. |
| Hardcode safety rules in the allow-list or the MCP tool surface. | Put 'never write to production' in a CLAUDE.md file. |
| Keep a golden set and a judge, and run the golden set in CI. | Answer a silent-failure stem with more log verbosity. |
| Log every call, delegation and refusal with a fixed schema. | Treat the audit log as an ops task to add later. |

## Skeletons

### Coordinator with a read-only researcher

```python
options = ClaudeAgentOptions(
    model="claude-opus-4-7",
    allowed_tools=["Read", "Glob", "Grep", "Agent"],
    agents={
        "researcher": AgentDefinition(
            description="Searches project files and returns structured citations.",
            prompt=RESEARCHER_PROMPT, tools=["Read", "Glob", "Grep"], model="claude-haiku-4-5"),
        "synthesizer": AgentDefinition(
            description="Composes a cited final answer from researcher output.",
            prompt=SYNTHESIZER_PROMPT, tools=["Read"], model="claude-haiku-4-5"),
    },
)
```

### Typed output plus validator plus fallback

```python
class ResearcherOutput(BaseModel):
    citations: list[Citation]
    confidence: Literal["low", "medium", "high"]
    refusal_reason: str | None = None
    @field_validator("citations")
    def files_must_exist(cls, v):
        assert all(Path(c.file).exists() for c in v), "citation points nowhere"; return v
async def call_researcher(task: dict) -> ResearcherOutput:
    response = await with_fallback(lambda: client.messages.parse(
        model="claude-haiku-4-5", max_tokens=2048, output_format=ResearcherOutput,
        messages=[{"role": "user", "content": json.dumps(task)}]))
    return response.parsed_output
```

### Portable MCP server tool

```python
# summarizer_server.py
from mcp.server.fastmcp import FastMCP
mcp = FastMCP("summarizer")
@mcp.tool()
def summarize_repo(path: str = ".") -> str:
    """Summarize the repository's README and top-level file structure.
    Does not search file contents; use the filesystem server for content reads.
    """
    ...
if __name__ == "__main__":
    mcp.run(transport="stdio")
```

### Judge gate after the synthesizer

```python
answer = synthesize(question, citations)
verdict = judge(question, str(answer))
box.log("judge", quality=verdict.quality, confidence=verdict.confidence)
if verdict.confidence < 0.5:
    return refuse(question, reason=verdict.reason)   # logged refusal
if verdict.confidence < 0.7:
    return flag_for_review(answer, verdict.reason)
return answer
```

## Decisions

| When | Use | Not |
|---|---|---|
| A user is waiting and p95 under five seconds is in the SLA | synchronous Messages API, cached system prompt | the Batch API |
| The work can wait up to an hour: nightly extraction, evals, bulk classification | the Batch API at fifty percent off | more rate-limit quota or a smaller model |
| The same long block goes out on many calls | cache_control ephemeral, 1h TTL for long sessions | sending it every time or trimming it below the minimum |
| Output is malformed some of the time | output_config.format or messages.parse | temperature zero, regex or retries |
| Output is well-formed but breaks a business rule | a Pydantic field or model validator | a schema constraint the API rejects |
| The call returns data in a known shape | structured outputs | tool use |
| The call must act on an outside system | tool use, with structured outputs on the tool's result | structured outputs alone |
| A rule must be unflippable for safety | the allow-list or the MCP tool surface | CLAUDE.md or a rules file |

## Before you ship

- [ ] Coordinator's allowed_tools includes "Agent"; every subagent's tools list is narrower than the coordinator's.
- [ ] Every model call has a schema or a Pydantic output_format, and a validator for the rules the schema cannot say.
- [ ] Every model and tool call sits inside a backoff loop with a hard cap and, per dependency, a circuit breaker.
- [ ] .mcp.json is at the project root with relative paths, a pinned version and a committed .env.example; a fresh clone runs in CI.
- [ ] MCP tools are on allowedTools per server; permissionMode is not being asked to do that job.
- [ ] Team rules are in ./CLAUDE.md; safety rules are hardcoded in the allow-list, not in any CLAUDE.md.
- [ ] A Haiku harmlessness screen runs before the agent and every refusal is logged with user, input and layer.
- [ ] A golden set runs on every commit and a judge scores live answers; the nightly judge run goes through Batch.

## Build ladder

**Rung 1 · Domain 1 and 4 milestone: the Formulaite research coordinator with a typed drawer and a fallback loop** (~2 hours) — The ingredient-research loop rebuilt as hub-and-spoke: a coordinator, a read-only researcher (catalogue and supplier page), a drawer-filler that can only cite, and a retry wrapper around every model call.
  1. Run `python -m agent_lab` offline on Glycerin and read the Glass Box replay; mark which events are the coordinator, the researcher tools and the fill_drawer answer.
  2. Write two AgentDefinition blocks at the top of agent.py: researcher with catalogue_lookup and read_supplier_page only, synthesizer with fill_drawer only.
  3. Add `confidence` (low, medium, high) and `refusal_reason` to IngredientDrawer and to as_tool_schema so the drawer is the researcher's citations schema.
  4. Wrap ClaudeModel.complete in with_fallback: three attempts, one, two and four second backoff, rate-limit and timeout errors only.
  5. Break it on purpose: remove fill_drawer from the registry and watch the loop hit max_steps; that is the missing-Agent exam stem.

**Rung 2 · Domain 2, 3 and safety milestone: a portable supplier-page MCP server with an injection screen and an operator policy** (~half a day) — The Formulaite tools served over MCP so a teammate's clone works first time, an input screen that refuses injection before the loop starts, and a frozen operator allow-list.
  1. Move catalogue_lookup and read_supplier_page into a FastMCP `formulaite_server.py`; register it in `.mcp.json` at the project root with a relative path.
  2. Commit `.env.example` naming every variable, add a sibling `git worktree`, run `claude` there and confirm mcp__formulaite__* tools all appear.
  3. Send three routing queries (look up, read page, fill drawer) and tighten each tool docstring until the routing is three for three.
  4. Add screen_input on Haiku in front of Agent.run and log every refusal to the Glass Box as a `refusal` event with the reason.
  5. Write `operator_policy.yaml` with read-only mcp__formulaite__* tools, load it into allowed_tools at construction, and put style rules in ./CLAUDE.md instead.

**Rung 3 · Domain 5 and mock-exam milestone: a silent-failure detector, golden set and judge for the drawer** (~2 days) — A detector that flags drawers which pass the gate but are quietly wrong, a pinned golden set that runs in CI, a batched nightly judge, and your own sixty-question mock score by domain.
  1. Pin ten ingredients with known-correct drawers in `samples/golden_set.json` and write golden_set_regression over Agent.run.
  2. Add assertion checks to gates.py that the schema cannot express: the supplier URL appears in `sources`, the use level sits inside the catalogue range.
  3. Write judge(question, drawer) on Haiku returning JudgeVerdict; flag below 0.7, refuse below 0.5, and log the verdict to the Glass Box.
  4. Run the golden set in CI on every push and route the nightly judge over all drawers through the Batch API at half price.
  5. Sit the sixty-question mock in Chapter 12, score each domain, and redo the rung that matches your weakest domain before booking.

## You're done when

- Read a Formulaite incident in one sentence (wrong claim, tool missing on a teammate's laptop, cost spike, quiet wrong drawer, user asks for more access), name its pattern, and say which layer fixes it.
- Run the Formulaite coordinator with a read-only researcher and a drawer that is guaranteed schema-valid, then break delegation by removing the Agent tool and explain the symptom.
- Show a drawer that passes the gate but is wrong, and point to the assertion, golden-set diff or judge verdict in the Glass Box that flagged it.

*Source: `books-md/claude-certified-architect-foundations-playbook.md` · chapters: 1 Chapter 1: What the CCA-F Actually Tests, 2 Chapter 2: How the Exam Actually Works, 3 Chapter 3: The 5 Judgment Patterns the Exam Actually Tests, 4 Chapter 4: Domain 1 Part 1 — Agentic Architecture, 5 Chapter 5: Domain 1 Part 2 — Orchestration, 6 Chapter 6: Domain 2 — Tool Design and MCP Integration, 7 Chapter 7: Domain 3 — Claude Code Configuration and Workflows, 8 Chapter 8: Domain 4 — Prompt Engineering and Structured Output, 9 Chapter 9: Domain 5 — Context Management and Reliability, 10 Chapter 10: Safety, Trust Hierarchy, and Responsible Deployment, 11 Chapter 11: The Money Chapter, 12 Chapter 12: The Launchpad, 13 Appendix A: Resources, Glossary, Domain Cheat Sheets, and the Open Repo*
