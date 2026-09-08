# The Graph Engineering Atlas — cheat sheet

*22 YouTube transcripts, Apr–Aug 2026 · Agent Tech Desk guide 15 · 33 weighted practices*

**Core idea:** an agent with no index answers architecture questions by opening files until it guesses. A graph records what calls what, once, so the question becomes a path lookup. The saving that reproduces is tool calls, not tokens.

**Read when:** your agent burns tool calls exploring a repo, or you are about to pick a code-index tool and want to know which numbers are real.

## Decide first

| Question | If yes | If no |
|---|---|---|
| Repo under ~20 files? | Stop. Read the files. | Continue. |
| Debugging runtime, races or performance? | Stop. The graph is blind to this. | Continue. |
| Does the agent already have the exact files open? | Stop. Nothing to discover. | Continue. |
| Is the question structural — what reaches what? | Graph. | grep is fine. |
| Will you ask it repeatedly, across sessions? | Graph pays back. | One-off; skip. |
| Do docs, PDFs or recordings need to link to code? | Multimodal tool. | Code-only tool. |
| Multi-repo or cross-service impact? | GitNexus-class, licence permitting. | Single-repo tool. |
| Need zero-maintenance freshness? | CodeGraph-class file watcher. | Manual or git hook. |

## Pick the tool by job, not by stars

| Job | Tool shape | Freshness | Licence |
|---|---|---|---|
| Code + docs + PDFs, human-viewable map | Graphify-class | manual or git hook | MIT / Apache 2.0 — sources disagree, check the repo |
| Pure code, fewest tool calls, CI impact tests | CodeGraph-class | OS watcher, 2s debounce | MIT |
| Multi-repo, cross-service blast radius, Cypher | GitNexus-class | manual re-analyse | PolyForm Noncommercial — not shippable at work |
| Wiki/KB reading experience over graph maths | Understand-Anything-class | on commit | not stated in corpus |
| Local-only, intercepts raw grep at the hook layer | codebase-memory-mcp | background watcher | not stated in corpus |
| Expressive queries or a shared team graph | Neo4j / Cypher | whatever feeds it | — |

## Commands

Verify every package name upstream first — automatic transcription mangles them, and four sources stop to warn that one package name carries a doubled letter.

```
# multimodal knowledge graph
graphify install                 # or the platform variant: claude / antigravity / opencode
/graphify .                      # build from the project root
graphify update                  # re-extract changed files only
graphify hook install            # rebuild on commit and branch switch
graphify --cluster-only          # recluster without re-extracting
graphify query "<relationship question>"
graphify path A B --dfs
graphify --obsidian              # one markdown file per node, with backlinks

# code-only index with auto-sync
npx codegraph install            # writes the agent tool config for you
codegraph init                   # local SQLite index under .codegraph/
git diff | codegraph affected    # CI: run only the tests a change can reach

# multi-repo
npx gitnexus analyze
npx gitnexus serve               # local server, port 4747
```

## Thresholds

| Number | Meaning |
|---|---|
| ~20 files | Below this, do not index at all. |
| ~200 files | One tool stops and asks you to scope to subfolders. |
| ~500 files | Scope by hand regardless. |
| 1–3 min | Build time for ~150 files. |
| ~12 min | 357 code files + docs + images → 4,041 nodes, 20,900 edges, 185 communities. |
| <12 min | 70,000 files, 6.4M relationships, on 2 cores and 6GB. |
| 200k–400k tokens | A first build with full image and document extraction. Code-only is free. |
| 2s / ~0.3s | Watcher debounce; resync time for 4,000 files. |
| 1.0 / 0.55–0.95 | Edge confidence: extracted (parser saw it) / inferred (verify before editing). |

## The numbers, honestly

| Claimed | Actually measured | Verdict |
|---|---|---|
| 71.5× fewer tokens | 1,700-token graph read vs 123,000 tokens of 52 pasted files | Baseline nobody uses. A controlled rerun found ~8%. |
| 94% fewer tool calls | 52 file reads → 3 on one repo | Directionally right, vendor-run. |
| 89% calls / 69% tokens / 60% cost | 7 repos, median of 4 runs, revalidated | Most credible — but grep beat it on wall clock on small repos, and one repo cost 3¢ more. |
| 99% token reduction | 80,000 → 500 per structural query | Single source. Treat as a lead. |
| "Unlimited memory" | A persistent file on disk | Context length is unchanged. |
| 40 → 2 tool calls, 17 → 0 files opened | Same question, same repo | **This is the finding that holds everywhere. Benchmark this, not tokens.** |

## Non-negotiables

- [ ] Wire the index into the agent — skill, tool protocol or hook — so structural lookup happens by default.
- [ ] Parse with tree-sitter first: offline, deterministic, free. Spend model tokens only on docs and media.
- [ ] Keep it fresh: manual update, git hook, or file watcher. A stale graph answers confidently about code that no longer exists.
- [ ] Read the god nodes and the generated report before asking anything.
- [ ] Run a blast-radius query before a large refactor, then run the tests anyway.
- [ ] Keep exploration in the agent that holds the index — a sub-agent that greps makes the index pure overhead.
- [ ] Treat inferred and ambiguous edges as leads, never as compile-time truth.
- [ ] Check the licence before standardising anything at work.

## Do not

1. Use blind grep/glob loops as your default architecture strategy.
2. Trust an N× token claim without measuring your own loop.
3. Skip the rebuild after a refactor, branch switch or mass rename.
4. Index a repo small enough to just read.
5. Assume the graph sees runtime, reflection or eval behaviour.
6. Paste a whole corpus into context and call that your "without graph" baseline.
7. Choose by stars or a viral title.
8. Index `node_modules`, `dist` or build artefacts.
9. Confuse a workflow DAG with a code index — different problems, you often need both.

## Workflow DAGs — the other sense of the phrase

Nodes are jobs, edges are real dependencies. **The weight test:** at every edge ask "does this step actually need the result of the one before it?" If not, the edge is fake waiting — run them in parallel.

| Shape | Use for | Fails by | Guardrail |
|---|---|---|---|
| Chain | Everything, at first | One step breaks, all breaks | Ship it, then weight-test every edge |
| Diamond | Fan out, fan back in | Silent duplicate work | Only fan out where an error is cheap |
| Branch | Routing | Unreasonable decision trees | Max five branches |
| Loop | Do → evaluate → repeat | Infinite loops — one cost thousands overnight | Hard maximum iteration count |

Budget for it: a single agent uses roughly 4× the tokens of a plain chat; a multi-agent system roughly 15×. The goal is the smallest graph that improves the work, not the biggest.

## Before you standardise

- [ ] Ran the same three real questions with and without the index, on my own repo.
- [ ] Logged tool calls, not just tokens.
- [ ] Confirmed the licence allows my use.
- [ ] Confirmed the agent actually calls the index instead of grepping.
- [ ] Confirmed a rebuild happens on branch switch.
