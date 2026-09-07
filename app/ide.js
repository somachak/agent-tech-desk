/* The in-browser Python IDE. Pyodide runs CPython compiled to WebAssembly,
   so nothing is sent to a server and nothing needs installing. */
(() => {
  const $ = (id) => document.getElementById(id);
  const out = $("out");
  const statusEl = $("status");
  const timing = $("timing");
  const SNIP_KEY = "desk.snippets";

  /* ---------------------------------------------------------------- editor */
  const editor = window.CodeMirror
    ? CodeMirror.fromTextArea($("code"), {
        mode: "python",
        lineNumbers: true,
        indentUnit: 4,
        tabSize: 4,
        indentWithTabs: false,
        lineWrapping: true,
        extraKeys: {
          "Ctrl-Enter": () => run(),
          "Cmd-Enter": () => run(),
          Tab: (cm) => cm.replaceSelection("    "),
        },
      })
    : null;
  const getCode = () => (editor ? editor.getValue() : $("code").value);
  const setCode = (v) => (editor ? editor.setValue(v) : ($("code").value = v));

  /* -------------------------------------------------------------- examples */
  let current = window.EXAMPLES[0];
  document.querySelectorAll("#exTabs .ex").forEach((b) => {
    b.onclick = () => {
      current = window.EXAMPLES.find((e) => e.id === b.dataset.id);
      document.querySelectorAll("#exTabs .ex").forEach((x) => x.classList.toggle("on", x === b));
      setCode(current.code);
      $("exNote").textContent = current.note;
      out.textContent = "Press Run.";
      timing.textContent = "";
    };
  });
  $("resetBtn").onclick = () => {
    setCode(current.code);
    out.textContent = "Press Run.";
  };

  /* ---------------------------------------------------------------- pyodide */
  let pyodide = null;
  let loading = null;

  function write(text, cls) {
    const span = document.createElement("span");
    if (cls) span.className = cls;
    span.textContent = text + "\n";
    out.appendChild(span);
    out.scrollTop = out.scrollHeight;
  }

  async function boot() {
    if (pyodide) return pyodide;
    if (loading) return loading;
    loading = (async () => {
      statusEl.textContent = "loading Python…";
      const py = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.28.3/full/" });
      py.setStdout({ batched: (s) => write(s) });
      py.setStderr({ batched: (s) => write(s, "err") });
      pyodide = py;
      statusEl.textContent = "ready · " + py.runPython("import sys; sys.version.split()[0]");
      $("runBtn").disabled = false;
      return py;
    })();
    return loading;
  }

  async function run() {
    const py = await boot();
    out.textContent = "";
    $("runBtn").disabled = true;
    timing.textContent = "running…";
    const t0 = performance.now();
    try {
      const result = await py.runPythonAsync(getCode());
      if (result !== undefined && result !== null) write(String(result));
    } catch (err) {
      write(String(err.message || err), "err");
    } finally {
      timing.textContent = ((performance.now() - t0) / 1000).toFixed(2) + " s";
      $("runBtn").disabled = false;
      if (!out.textContent.trim()) write("(no output — add a print())");
    }
  }
  $("runBtn").onclick = run;

  /* --------------------------------------------------------------- snippets */
  const readSnips = () => {
    try {
      return JSON.parse(localStorage.getItem(SNIP_KEY) || "[]");
    } catch {
      return [];
    }
  };
  const writeSnips = (list) => {
    try {
      localStorage.setItem(SNIP_KEY, JSON.stringify(list.slice(0, 50)));
    } catch {
      /* private window, or storage full — the snippet just is not kept */
    }
  };

  function renderSnips() {
    const list = readSnips();
    const box = $("snipList");
    box.innerHTML = list.length
      ? ""
      : '<p class="small">Nothing saved yet. Press <strong>Save snippet</strong> to keep the code in the editor.</p>';
    list.forEach((s, i) => {
      const el = document.createElement("div");
      el.className = "snip";
      const when = new Date(s.at).toLocaleString("en-GB");
      el.innerHTML = `<strong></strong> <span class="small"></span><pre></pre>
        <button class="load">Load into the editor</button> <button class="del">Delete</button>`;
      el.querySelector("strong").textContent = s.name;
      el.querySelector(".small").textContent = when;
      el.querySelector("pre").textContent = s.code;
      el.querySelector(".load").onclick = () => {
        setCode(s.code);
        window.scrollTo({ top: 0, behavior: "smooth" });
      };
      el.querySelector(".del").onclick = () => {
        const next = readSnips();
        next.splice(i, 1);
        writeSnips(next);
        renderSnips();
      };
      box.appendChild(el);
    });
  }

  $("saveBtn").onclick = () => {
    const name = prompt("Name this snippet", current.name + " — my version");
    if (!name) return;
    const list = readSnips();
    list.unshift({ name, code: getCode(), at: Date.now() });
    writeSnips(list);
    renderSnips();
    $("snips").hidden = false;
    $("snips").scrollIntoView({ behavior: "smooth", block: "start" });
  };
  $("snipBtn").onclick = () => {
    $("snips").hidden = !$("snips").hidden;
    if (!$("snips").hidden) {
      renderSnips();
      $("snips").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  /* ------------------------------------------------------------- ask tutor */
  $("askBtn").onclick = () => {
    try {
      sessionStorage.setItem("desk.code", getCode());
    } catch {}
    const book = new URLSearchParams(location.search).get("book");
    location.href = "/tutor?code=1" + (book ? "&book=" + encodeURIComponent(book) : "");
  };

  /* --------------------------------------------------- arriving from a book */
  const params = new URLSearchParams(location.search);
  const book = params.get("book");
  if (book) {
    const note = document.createElement("p");
    note.className = "small";
    note.innerHTML =
      'Opened from <a href="/guides/' + book + '">' + book.replace(/-/g, " ") + "</a>. " +
      "Paste any skeleton from that book's cheat sheet in here and run it.";
    $("exNote").after(note);
  }
  const saved = sessionStorage.getItem("desk.code");
  if (params.get("code") && saved) setCode(saved);

  boot();
})();
