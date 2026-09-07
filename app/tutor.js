/* The tutor page. Talks to /api/tutor, which calls Groq (or Workers AI after
   deploy) and falls back to a local mock when no key is configured. */
(() => {
  const $ = (id) => document.getElementById(id);
  const thread = $("thread");
  const history = [];

  /* ------------------------------------------------------- tiny md renderer */
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);

  function render(md) {
    const parts = md.split(/```(?:[a-zA-Z]*)\n?/);
    let html = "";
    parts.forEach((part, i) => {
      if (i % 2) {
        html += `<pre><code>${esc(part.replace(/\n$/, ""))}</code></pre>`;
        return;
      }
      const lines = part.split("\n");
      let list = null;
      for (const raw of lines) {
        const line = raw.trimEnd();
        const ol = line.match(/^\s*(\d+)[.)]\s+(.*)$/);
        const ul = line.match(/^\s*[-*]\s+(.*)$/);
        if (ol) {
          if (list !== "ol") {
            html += list ? `</${list}>` : "";
            html += "<ol>";
            list = "ol";
          }
          html += `<li>${inline(ol[2])}</li>`;
        } else if (ul) {
          if (list !== "ul") {
            html += list ? `</${list}>` : "";
            html += "<ul>";
            list = "ul";
          }
          html += `<li>${inline(ul[1])}</li>`;
        } else {
          if (list) {
            html += `</${list}>`;
            list = null;
          }
          if (line.trim()) html += `<p>${inline(line)}</p>`;
        }
      }
      if (list) html += `</${list}>`;
    });
    return html;
  }
  const inline = (s) =>
    esc(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  /* ------------------------------------------------------------------ turns */
  function addTurn(who, md, note) {
    const el = document.createElement("div");
    el.className = "turn " + (who === "You" ? "you" : "tutor");
    el.innerHTML = `<div class="who">${who}</div><div class="bubble">${render(md)}</div>`;
    if (note) {
      const n = document.createElement("div");
      n.className = "note";
      n.textContent = note;
      el.querySelector(".bubble").appendChild(n);
    }
    el.querySelectorAll("pre").forEach((pre) => {
      const b = document.createElement("button");
      b.className = "sendide";
      b.textContent = "Send to the IDE";
      b.onclick = () => {
        try {
          sessionStorage.setItem("desk.code", pre.textContent);
        } catch {}
        location.href = "/ide?code=1";
      };
      pre.after(b);
    });
    thread.appendChild(el);
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    return el;
  }

  /* ------------------------------------------------------------------- ask */
  async function ask(question) {
    if (!question.trim()) return;
    addTurn("You", question);
    history.push({ role: "user", content: question });
    $("q").value = "";
    $("send").disabled = true;
    const pending = addTurn("Tutor", "_thinking…_");
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: history.slice(-8),
          book: $("book").value || null,
          code: sessionStorage.getItem("desk.code") || null,
        }),
      });
      const data = await res.json();
      pending.remove();
      addTurn("Tutor", data.reply || "No answer came back.", data.note || null);
      history.push({ role: "assistant", content: data.reply || "" });
      $("engine").textContent = data.engine ? "answering with " + data.engine : "";
    } catch (err) {
      pending.remove();
      addTurn("Tutor", "The request failed: " + esc(String(err.message || err)) + "\n\nCheck the dev server is running, then ask again.");
    } finally {
      $("send").disabled = false;
      $("q").focus();
    }
  }

  $("ask").onsubmit = (e) => {
    e.preventDefault();
    ask($("q").value);
  };
  $("clear").onclick = () => {
    history.length = 0;
    thread.innerHTML = "";
    try {
      sessionStorage.removeItem("desk.code");
    } catch {}
  };
  document.querySelectorAll(".starters .s").forEach((b) => {
    b.onclick = () => ask(b.textContent);
  });

  /* --------------------------------------------------- arriving from the IDE */
  const params = new URLSearchParams(location.search);
  if (params.get("book")) $("book").value = params.get("book");
  const code = sessionStorage.getItem("desk.code");
  if (params.get("code") && code) {
    addTurn("You", "Here is the code I am working on:\n\n```python\n" + code + "\n```");
    history.push({ role: "user", content: "Here is the code I am working on:\n\n```python\n" + code + "\n```" });
    $("q").value = "What does this do, and what would you change?";
    $("q").focus();
  }

  /* ------------------------------------------------------- which engine? */
  fetch("/api/tutor/health")
    .then((r) => r.json())
    .then((d) => {
      $("engine").textContent = d.engine === "mock"
        ? "offline mock tutor — no key set"
        : "tutor: " + d.engine;
    })
    .catch(() => ($("engine").textContent = ""));
})();
