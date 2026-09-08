/**
 * Agent Tech & Python Desk — Cloudflare Worker.
 *
 * Static pages come from the assets binding. This script handles two things:
 *   1. tidy URLs (/bookshelf, /ide, /guides/<slug>) and readable .md cheat sheets
 *   2. /api/tutor — the model API first, Workers AI if bound, and a local mock otherwise,
 *      so the site is fully usable before any key exists.
 */

const MODEL_URL = "https://api.meta.ai/v1/chat/completions";
const MODEL_NAME = "muse-spark-1.3";
const WORKERS_AI_MODEL = "@cf/meta/llama-3.1-8b-instruct";

const SYSTEM_PROMPT = `You are the tutor on Soma Pym's Agent Tech and Python desk.

Who you are talking to: a creative entrepreneur, about 25 years of professional experience, not a developer. She reads Python and wants to reach intermediate-to-advanced. She is building Formulaite, a cosmetic-formulation app whose agent researches an ingredient, fills an "Ingredient Drawer", passes a deterministic gate written in plain Python, and records a "Glass Box" trace of every step. She has ADHD.

How to answer:
1. Direct answer in the first sentence. No preamble, no "great question".
2. Short sentences, under about fifteen words.
3. Numbered steps for anything with more than one action.
4. Every abstract claim gets a concrete example in the same breath.
5. Introduce a construct before using it. She does not assume shorthand like lambda.
6. Code in a python fenced block, at most about fifteen lines, runnable as-is in a browser Pyodide sandbox (standard library only, no input(), no network).
7. Prefer an example from cosmetic formulation or from the Formulaite agent.
8. British English. No emoji. End when the answer is done — no "hope this helps".

The desk holds fourteen book guides, each with a build ladder, a chapter map, concept cards at foundation, intermediate and advanced level, and a cheat sheet. If a book is named in the context, ground the answer in that book and say which level of card the idea sits at.`;

/* ------------------------------------------------------------------ helpers */

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

function engineFor(env) {
  if (env.MODEL_API_KEY) return "meta:" + MODEL_NAME;
  if (env.AI) return "workers-ai:" + WORKERS_AI_MODEL;
  return "mock";
}

function buildMessages({ messages, book, code }) {
  const context = [];
  if (book) context.push(`The reader is working through the guide: ${book.replace(/-/g, " ")}.`);
  if (code) context.push(`Code currently open in her IDE:\n\n\`\`\`python\n${code.slice(0, 4000)}\n\`\`\``);
  const system = context.length ? `${SYSTEM_PROMPT}\n\nContext for this question:\n${context.join("\n\n")}` : SYSTEM_PROMPT;
  const turns = (messages || [])
    .filter((m) => m && typeof m.content === "string" && (m.role === "user" || m.role === "assistant"))
    .slice(-8)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 6000) }));
  return [{ role: "system", content: system }, ...turns];
}

/* --------------------------------------------------------------- the engines */

async function askModel(env, messages) {
  const res = await fetch(MODEL_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${env.MODEL_API_KEY}`,
    },
    // Muse Spark is a reasoning model: its hidden reasoning tokens are drawn from this
    // same max_tokens budget. Too low and the reasoning consumes the lot — finish_reason
    // comes back "length" and the content is an empty string. Keep this generous.
    body: JSON.stringify({ model: MODEL_NAME, messages, temperature: 0.3, max_tokens: 6000 }),
  });
  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    throw new Error(`The model API replied ${res.status}: ${detail}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function askWorkersAI(env, messages) {
  const data = await env.AI.run(WORKERS_AI_MODEL, { messages, max_tokens: 900 });
  return data.response ?? "";
}

/* ------------------------------------------------------------------- mock */

const MOCK = [
  {
    match: /kwargs|\*\*|star args|\*args/i,
    reply: `\`**kwargs\` collects any leftover \`name=value\` arguments into a dictionary.

1. One star, \`*args\`, gathers loose extra values into a tuple.
2. Two stars, \`**kwargs\`, gathers named extras into a dict.
3. On the calling side the stars do the reverse — they unpack.

This is why the Glass Box can log any event with one signature:

\`\`\`python
def log(kind, *tags, **meta):
    return {"kind": kind, "tags": tags, "meta": meta}

event = log("gate", "glycerin", "retry", passed=False, reasons=["out of range"])
print(event["tags"])   # ('glycerin', 'retry')
print(event["meta"])   # {'passed': False, 'reasons': ['out of range']}
\`\`\`

The trap: the names \`args\` and \`kwargs\` are only convention. The stars do the work.`,
  },
  {
    match: /agent loop|how does the agent|five steps|loop work/i,
    reply: `The agent loop is: ask the model, run whatever tool it asks for, check the result, repeat until a gate passes or the budget runs out.

1. Send the request plus the tool menu to the model.
2. The model replies with either prose or a \`tool_use\` block.
3. If it asked for a tool, run it and send the result back with the same id.
4. When it submits a drawer, a plain-Python gate decides pass or fail.
5. On fail, send the reasons back and loop; on pass, stop.

\`\`\`python
for step in range(1, 9):          # a budget, so it can never run away
    reply = model(messages)
    if not reply.get("tool"):
        break
    messages.append(run_tool(reply["tool"], reply["input"]))
\`\`\`

The rule underneath: the model proposes, plain code decides.`,
  },
  {
    match: /dataclass|drawer|record|class/i,
    reply: `A dataclass is a class that is mostly a bag of fields — Python writes the boilerplate.

1. Decorate the class with \`@dataclass\`.
2. Declare each field with a type hint.
3. Use \`field(default_factory=list)\` for a list, never \`= []\`.

\`\`\`python
from dataclasses import dataclass, field

@dataclass
class IngredientDrawer:
    inci_name: str = ""
    use_level_pct: float | None = None
    sources: list[str] = field(default_factory=list)

print(IngredientDrawer(inci_name="Glycerin", use_level_pct=5.5))
\`\`\`

The trap: a plain \`= []\` default is shared by every instance, so one drawer's sources leak into the next.`,
  },
  {
    match: /build first|where.*start|what should i|order|begin/i,
    reply: `Start with book 1, Python AI Programming — its Foundation cards, then its rung 1.

1. Open the Bookshelf and read book 1's Foundation cards, ticking each one.
2. Build rung 1: one validated Ingredient Drawer from a single model call.
3. Only then open book 2, which adds the loop around that call.

The shelf is ordered on purpose: Foundations, then Building, then Scaling. Each rung 1 is about half a day; the whole Foundation level of a book is roughly twenty-five minutes of reading.`,
  },
];

function mockReply(question) {
  const hit = MOCK.find((m) => m.match.test(question));
  if (hit) return hit.reply;
  return `The full tutor is not connected yet, so this is the offline stand-in.

1. Set a key: \`npx wrangler secret put MODEL_API_KEY\`.
2. Restart the dev server, or redeploy.
3. Ask again — answers then come from Muse Spark 1.3.

Meanwhile the shelf answers most things itself. Open the guide for the book you are on and use its cheat sheet: vocabulary, the pattern, rules of thumb, skeletons, decisions, and a "before you ship" list. Every skeleton runs as-is in the IDE.`;
}

/* ------------------------------------------------------------------ routes */

const PAGES = new Set(["/bookshelf", "/archive", "/ide", "/tutor", "/agent-walkthrough", "/python-constructs"]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === "/api/tutor/health") {
      return json({ engine: engineFor(env) });
    }

    if (pathname === "/api/tutor") {
      if (request.method !== "POST") return json({ error: "POST only" }, 405);
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Send JSON with a messages array." }, 400);
      }
      const messages = buildMessages(body);
      const question = [...(body.messages || [])].reverse().find((m) => m.role === "user")?.content || "";
      const engine = engineFor(env);
      try {
        if (engine.startsWith("meta")) {
          return json({ reply: await askModel(env, messages), engine });
        }
        if (engine.startsWith("workers-ai")) {
          return json({ reply: await askWorkersAI(env, messages), engine });
        }
        return json({
          reply: mockReply(question),
          engine: "mock",
          note: "Offline mock tutor — no MODEL_API_KEY is set, so this answer is a stored one, not a live model.",
        });
      } catch (err) {
        return json({
          reply: mockReply(question),
          engine: "mock (fallback)",
          note: `The live tutor failed, so this is the stored answer. ${String(err.message || err).slice(0, 200)}`,
        });
      }
    }

    // tidy URLs
    if (PAGES.has(pathname)) {
      return env.ASSETS.fetch(new Request(new URL(pathname + ".html", url), request));
    }
    // the Python Constructs course keeps its own file names; these are the tidy ones
    const chapter = pathname.match(/^\/python-constructs\/chapter-(\d+)$/);
    if (chapter) {
      return env.ASSETS.fetch(
        // the assets layer serves these without the .html extension
        new Request(new URL(`/python-constructs/Chapter ${chapter[1]}.dc`, url), request)
      );
    }
    if (pathname === "/python-constructs/course") {
      return env.ASSETS.fetch(new Request(new URL("/python-constructs/Course.dc", url), request));
    }

    if (pathname.startsWith("/guides/") && !/\.[a-z0-9]+$/i.test(pathname)) {
      return env.ASSETS.fetch(new Request(new URL(pathname + ".html", url), request));
    }

    // cheat sheets read in the browser instead of downloading
    if (pathname.endsWith("-cheatsheet.md")) {
      const res = await env.ASSETS.fetch(request);
      if (!res.ok) return res;
      return new Response(res.body, {
        status: res.status,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
