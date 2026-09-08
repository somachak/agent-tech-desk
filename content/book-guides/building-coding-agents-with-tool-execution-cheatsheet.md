# Building Coding Agents with Tool Execution — cheat sheet

DeepLearning.AI × E2B · 10 lessons · ~67 min · guide 17 on the desk.
Companion exercise: `agent_lab.py` (plain Python 3, no API key, no install).

---

## The definition, and the four places it breaks

> An agent is an LLM calling **tools** in a **loop** with **context**.

| Noun | In code | How it goes wrong |
|---|---|---|
| LLM | one function: messages in, reply out | chosen on cost alone; tool-calling reliability is a separate axis |
| Tools | `{name: fn}` plus a JSON schema per tool | a tool per question instead of one that composes |
| Loop | `while` with a hard `max_steps` | no maximum at all |
| Context | a list that only grows | fat tool results, full stack traces |

## The one idea the course is actually about

Give the model **one** tool — `execute_code(code)` — and it can answer questions
nobody anticipated, because it writes the program on the spot. That is the whole
premise, and the whole risk.

```python
def execute_code(code):
    buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf):
            exec(code, {"ROWS": ROWS})
    except Exception as e:
        return f"{type(e).__name__}: {e}"     # short. structured. not a traceback.
    return buf.getvalue().strip()
```

Two lines carry the weight: `redirect_stdout` is what turns "run some code" into
"a tool that returns a value", and the `except` line is the entire error
philosophy — the model reads that string, so it has to be short enough to act on.

## The security fact, stated once

**An agent with a code interpreter has every capability the interpreter has,
whatever else you did or did not register.**

```python
TOOLS = {"execute_code": execute_code}   # one tool. no file access. supposedly.
>>> import os, platform; print(os.getlogin(), platform.system())
somapym Darwin
```

Your tool list describes what you *expect* it to do. It does not bound what it
*can* do. Only the environment does.

## Where the code runs — four levels

| Level | What it is | How far the code reaches |
|---|---|---|
| Local | `exec` on your machine | everything you can reach |
| Container | namespaces, separate filesystem view | the **shared host kernel** |
| gVisor | user-space kernel intercepting syscalls | gVisor — narrower, not closed; costs performance and compatibility |
| microVM | Firecracker / QEMU, **its own guest kernel** | its own kernel, and stops there |

Firecracker runs AWS Lambda and Fargate. A container is **not** a security
boundary. The course's final step — "therefore buy a managed sandbox" — is taught
by a company that sells one; the technical steps before it stand on their own.

## Runtime summarisation — the one algorithm worth stealing

About thirty lines, and the difference between an agent that finishes a long task
and one that degrades halfway through.

1. Pick a token ceiling. The course uses **40,000**. A decision, not a law.
2. When you hit it, select the **oldest 70%** of messages (borrowed from Gemini CLI).
3. Summarise them with a prompt written for *snapshotting a conversation*.
4. Re-inject as **a synthetic user message carrying the snapshot + an assistant
   acknowledgement**, replacing the originals.

Step 4 is the part people get wrong. Keeping the normal user/assistant shape is
what lets everything above the compression layer stay ignorant that it happened.

## The exercise — six steps, no API key

```
python3 agent_lab.py        # all six
python3 agent_lab.py 3      # just step 3
```

| Step | Proves |
|---|---|
| 1 | the registry and the JSON schema are two separate objects |
| 2 | the exit condition is "stopped asking", not "task done" |
| 3 | one `execute_code` replaces the whole tool list |
| 4 | no file tool ≠ no file access — you produce the evidence yourself |
| 5 | context only grows, and tool results are the fat ones |
| 6 | the whole agent, ~40 lines, no framework |

Nine HR rows. Small enough to check every answer by eye — which is the point.
Swap `fake_model` for a real API call and it works. Swap `exec` for a sandbox's
`run_code` and it is the course's lesson-5 agent. One line each.

## Ten pitfalls

1. Assuming no file tool means no file access.
2. Returning raw tool output where one number would do.
3. Returning stack traces to the model.
4. A loop with no maximum step count.
5. Treating a container as a security boundary.
6. Reading SWE-bench standings off a screenshot dated October 2025.
7. Taking "~30k tokens" as measured. It is uncited in the course.
8. Building a tool per question.
9. Skipping the system prompt — lesson 6 changes *only* the prompt.
10. Letting a build-vs-buy decision be made by the side selling one answer.

## Claims worth flagging

| Claim | Verdict |
|---|---|
| gVisor intercepts syscalls in user space, with real overhead | checked, accurate, caveats included |
| Containers share the host kernel | checked, accurate |
| Firecracker powers Lambda and Fargate | checked, accurate |
| "~30k tokens is where agents get reliable" | **uncited** — treat as a rule of thumb |
| 40k ceiling / oldest 70% | implementable as stated; they are one tool's defaults |
| "Therefore use a managed provider" | technically-founded chain, **commercially-interested** last step |

## What to read next on this desk

Guide 2 for the agent loop with fixed tools. Guide 13 for the production controls
this course leaves out — budgets, retries, traces, gates. Guide 12 for token spend.
