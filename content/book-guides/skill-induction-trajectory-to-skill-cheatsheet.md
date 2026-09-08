# Skill Induction: Trajectory-to-Skill Learning — cheat sheet

*DeepLearning.AI × Oracle · Building Adaptive AI Agents, Lesson 3 · 6:07 video + L2.ipynb · Agent Tech Desk guide 16 · one source*

**Core idea:** traces in, one reviewed skill out. The engine drafts a skill from one topic's repeated failures; a human approves it with a reason; only then does the agent retrieve it. Approval is the moment behaviour changes.

**Read when:** your agent keeps making the same mistake on the same kind of task and you have recorded traces of it — or you are about to approve a model-drafted skill and want to know what you are actually signing off.

## The loop

| Step | What happens | Where |
|---|---|---|
| 1 Traces | Episodes stored in Oracle Agent Memory, six streams each | cell 3, cell 8 |
| 2 Filter | One topic's episodes only — `run_test_suite` | cell 12 |
| 3 Induce | `_SYSTEM` + `"Topic: …\nEpisodes: …"` → one JSON skill, temperature 0 | cell 12 |
| 4 Checkpoint | `run_dream` → `OracleSaver` → v2 `pending`, outside the agent's working path | cell 13 |
| 5 Review | Human compares v1 / v2, writes a reason, Approve or Reject | cell 15 |
| 6 Payoff | Re-index, search the same task: `before_hit` v1 → `after_hit` v2, 212 passed | cell 17, cell 19 |

## The nine fields of `EnhancedSkillProposal`

| Field | Meaning |
|---|---|
| `name` | snake_case verb phrase |
| `description` | one sentence |
| `when_to_use` | one sentence |
| `steps` | imperative strings |
| `skills_used` | skills consulted on this kind of problem |
| `likely_tools` | tool names this task usually needs |
| `errors_and_fixes` | `{error, fix}` for every mistake seen — carries the mistake forward |
| `provenance` | the `episode_id` values used — makes it auditable |
| `topic` | set by `induce_skill` from the episodes, never by the model |

## The four statuses

| Status | Retrievable? | How you get there |
|---|---|---|
| `pending` | No | `run_dream` proposes it |
| `active` | **Yes — the only one** | `approve_skills`; prior active → superseded; base skill marked promoted so the indexer drops it |
| `superseded` | No | a newer version of the same topic was approved; `demote_from_skill_box` restores it |
| `rejected` | No | declined — the reason goes into the next prompt as `feedback` |

Guards that raise `ValueError`: unknown id · non-latest version · already not pending · mixed topics in one induction call.

## The three risks (slide 3, verbatim)

| Risk | The slide's line | Guard |
|---|---|---|
| BAD SKILLS COMPOUND | an approved mistake is retrieved on every matching task, forever | read v1 beside v2 before approving |
| MEMORY POISONING | incorrect or planted traces must not write themselves into behaviour | the human gate; check `provenance` |
| ACCOUNTABILITY | every active skill has an owner, a reason, and a date | write the reason on approve *and* decline |

## The real v1 → v2 diff

| | v1 `run-the-tests` (BASE_SKILLS) | v2 `run_project_test_suite` (night2.json) |
|---|---|---|
| Steps | find the test command → run it → report the result | 1 Read the Makefile to locate the canonical test command if unknown · 2 Invoke the project's test command (make test), forwarding any filters such as -k · 3 Report the numeric result or failure summary · 4 Never invoke bare pytest or pytest directly on this repository |
| errors_and_fixes | — | 3 entries, one per repeat offence |
| provenance | — | ep-run_test_suite-001 .. -006 |
| Outcome on the fixed task | `ModuleNotFoundError: No module named 'app' (wrong interpreter)` | `212 passed` |

## The notebook, in order

| Cell | Call | Why |
|---|---|---|
| 3 | `ensure_schema()`, `mem, conn = connect_stack()` | open the two stores |
| 6 | `PAYOFF_TASK, episodes = show_recurring_failure()` | fix the task; show the real error |
| 8 | `trace_seed_summary(mem, episodes, LESSON_SKILLS)` | load six streams + five starter skills |
| 10 | `index_active_skills`, `search_skill_box(..., k=1)` → `before_hit` | photograph retrieval before |
| 12 | `engine_contract_html(_SYSTEM)`, `induce_all(run_test_episodes, complete=night)` | show the contract; induce one topic |
| 13 | `run_dream(...)` → `pending` | checkpoint v2 off the agent's path |
| 15 | `build_review_app(pending, mem=mem)` | the human gate |
| 19 | `after_hit`, `retrieval_improvement_html(...)` | prove retrieval changed |

Measured, not marketed: 367 s · 21 cells · 6 trace types · 5 starter skills · 5 topics · 9 fields · 3 repeat episodes · 6 provenance ids · 212 passed · `oci/xai.grok-4.3`, `temperature=0.0`, `response_format={"type": "json_object"}`. The lesson makes no benchmark claims.

## Before you approve

- [ ] The failure repeats across more than one episode on one topic, with the same error string.
- [ ] The induction call was given that topic's episodes only.
- [ ] The draft has all nine fields; `provenance` is non-empty; `errors_and_fixes` quotes the real error.
- [ ] `topic` was set by code, not by the model.
- [ ] I read v1 beside v2, and I have written the reason.
- [ ] After approving I re-indexed and re-ran the same fixed task; `after_hit` differs from `before_hit`.
- [ ] If I declined, I gave a reason — it is the engine's only training signal.
