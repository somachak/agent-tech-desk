#!/usr/bin/env python3
"""Mission Docs chapter / course shell helpers for Python Constructs (Phase 1.2)."""
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DS = "_ds/mission-docs-design-system-7384423c-d52c-4f5b-aea6-df1bdbd9d593"
KEY = "pyconstructs.progress"
COURSE_NAME = "Py Constructs"


def js_const(name: str, obj) -> str:
    return f"const {name} = {json.dumps(obj, ensure_ascii=False, indent=2)};"


def chapter_shell(
    *,
    ch_num: int,
    title: str,
    part_label: str,
    lede: str,
    intro_paras: list[str],
    stats: dict,
    sections_html: str,
    cheat_html: str,
    next_label: str,
    sections: list[dict],
    flows: dict,
    code: dict,
    trace: dict | None,
    total_sections: int | None = None,
) -> str:
    n = ch_num
    nn = f"{n:02d}"
    total = total_sections or len([s for s in sections if s["id"].startswith("s")])
    intro = "\n".join(f"        <p>{p}</p>" for p in intro_paras)
    rail_next = next_label

    script_parts = [
        js_const("SECTIONS", sections),
        js_const("FLOWS", flows),
        js_const("CODE", code),
    ]
    if trace is not None:
        script_parts.append(js_const("TRACE", trace))
    else:
        script_parts.append("const TRACE = null;")
    script_parts.append(f"const KEY = '{KEY}';")
    script = "\n".join(script_parts)

    component = f"""
class Component extends DCLogic {{
  state = {{ seen: {{}}, done: false }};
  componentDidMount() {{
    try {{ const all = JSON.parse(localStorage.getItem(KEY) || '{{}}'); const c = all.ch{n} || {{}}; this.setState({{ seen: c.seen || {{}}, done: !!c.done }}); }} catch (e) {{}}
    if ('IntersectionObserver' in window) {{
      this.io = new IntersectionObserver(es => es.forEach(e => {{ if (e.isIntersecting) this.mark(e.target.getAttribute('data-sec')); }}), {{ threshold: 0.3 }});
      this.obs = setTimeout(() => document.querySelectorAll('[data-sec]').forEach(el => this.io.observe(el)), 1200);
    }}
  }}
  componentWillUnmount() {{ clearTimeout(this.obs); if (this.io) this.io.disconnect(); }}
  save() {{
    try {{ const all = JSON.parse(localStorage.getItem(KEY) || '{{}}'); all.ch{n} = {{ seen: this.state.seen, done: this.state.done, total: {total} }}; localStorage.setItem(KEY, JSON.stringify(all)); }} catch (e) {{}}
  }}
  mark(id) {{ if (!id || this.state.seen[id]) return; this.setState(s => ({{ seen: {{ ...s.seen, [id]: true }} }}), () => this.save()); }}
  complete = () => this.setState(s => ({{ done: !s.done }}), () => this.save());
  goHub = () => {{ window.location.href = 'Course.dc.html'; }};
  renderVals() {{
    const {{ seen, done }} = this.state;
    const nSeen = SECTIONS.filter(s => s.id.startsWith('s') && seen[s.id]).length;
    return {{
      flows: FLOWS, code: CODE, trace: TRACE,
      mt24: {{ marginTop: '24px' }},
      rail: SECTIONS.map(s => ({{ ...s, href: '#' + s.id, tickColor: (s.id === 'cheat' ? done : seen[s.id]) ? 'var(--terra-600)' : 'var(--ink-100)' }})),
      progressLabel: (nSeen + '').padStart(2, '0') + '_{total:02d}',
      doneLabel: done ? '—Chapter complete' : '—End of chapter {nn}',
      completeLabel: done ? 'Completed (undo)' : 'Mark chapter complete',
      complete: this.complete, goHub: this.goHub
    }};
  }}
}}
"""

    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="./dc-siblings.js"></script>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="{DS}/styles.css">
  <script src="{DS}/_ds_bundle.js"></script>
  <style>
    html{{scroll-behavior:smooth}}
    a{{color:var(--text-link);text-decoration:none;border-bottom:1px solid var(--navy-200)}}
    a:hover{{color:var(--text-link-hover);border-bottom-color:var(--terra-400)}}
    li::marker{{color:var(--terra-600);font-family:var(--font-mono);font-size:11px}}
  </style>
</helmet>
<div style="min-height:100vh;background:var(--surface-page);color:var(--text-body);font-family:var(--font-body)">
  <header style="position:sticky;top:0;z-index:10;background:rgba(251,250,247,0.92);border-bottom:1px solid var(--rule-hairline)">
    <div style="max-width:1180px;margin:0 auto;padding:0 32px;height:56px;display:flex;align-items:center;justify-content:space-between;gap:24px">
      <a href="Course.dc.html" style="border:0;font-weight:600;text-transform:uppercase;letter-spacing:-0.012em;color:var(--navy-800);font-size:14px">{COURSE_NAME}</a>
      <div style="display:flex;align-items:center;gap:24px">
        <span style="font-family:var(--font-mono);font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:var(--terra-600)">—Chapter {nn}</span>
        <span style="font-size:13px;color:var(--text-muted)">{title}</span>
        <span style="font-family:var(--font-mono);font-size:10.5px;letter-spacing:0.22em;color:var(--text-muted)">{{{{ progressLabel }}}}</span>
        <a href="Course.dc.html" style="font-size:13px">Course map</a>
      </div>
    </div>
  </header>

  <div style="max-width:1180px;margin:0 auto;padding:48px 32px 96px;display:grid;grid-template-columns:220px minmax(0,780px);gap:56px;align-items:start">
    <nav style="position:sticky;top:88px;display:grid;gap:2px;align-content:start">
      <div style="font-family:var(--font-mono);font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:var(--text-muted);margin-bottom:12px">Contents</div>
      <sc-for list="{{{{ rail }}}}" as="r" hint-placeholder-count="5">
        <a href="{{{{ r.href }}}}" style="border:0;display:grid;grid-template-columns:14px 32px 1fr;gap:6px;align-items:baseline;padding:6px 0;border-top:0.5px solid var(--rule-hairline);color:var(--navy-900);font-size:13px;line-height:1.3">
          <span style="font-family:var(--font-mono);font-size:11px;color:{{{{ r.tickColor }}}}">—</span>
          <span style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.08em;color:var(--terra-600)">{{{{ r.num }}}}</span>
          <span>{{{{ r.title }}}}</span>
        </a>
      </sc-for>
      <div style="margin-top:24px;padding-top:12px;border-top:2px solid var(--rule-strong);display:grid;gap:6px">
        <span style="font-family:var(--font-mono);font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:var(--text-muted)">Up next</span>
        <span style="font-size:13px;color:var(--text-faint)">{rail_next}</span>
      </div>
    </nav>

    <article>
      <div style="margin-bottom:56px">
        <div style="font-family:var(--font-mono);font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:var(--terra-600);margin-bottom:16px">{part_label} · Chapter {nn}</div>
        <h1 style="font-size:48px;font-weight:600;letter-spacing:-0.02em;line-height:1.02;color:var(--navy-900);text-transform:uppercase;margin:0 0 20px;max-width:16ch">{title}</h1>
        <div style="border-top:10px solid var(--navy-800);margin:0 0 24px;width:120px"></div>
        <x-import component-from-global-scope="MissionDocsDesignSystem_738442.Lede" hint-size="100%,80px">{lede}</x-import>
{intro}
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--rule-hairline);border:1px solid var(--rule-hairline);margin-top:24px">
          <div style="background:var(--paper-000);padding:14px 16px"><div style="font-family:var(--font-mono);font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:var(--terra-600);margin-bottom:6px">Sections</div><div style="font-size:23px;font-weight:600;color:var(--navy-900);font-family:var(--font-mono)">{stats.get('sections','05')}</div></div>
          <div style="background:var(--paper-000);padding:14px 16px"><div style="font-family:var(--font-mono);font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:var(--terra-600);margin-bottom:6px">Diagrams</div><div style="font-size:23px;font-weight:600;color:var(--navy-900);font-family:var(--font-mono)">{stats.get('diagrams','02')}</div></div>
          <div style="background:var(--paper-000);padding:14px 16px"><div style="font-family:var(--font-mono);font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:var(--terra-600);margin-bottom:6px">Programs</div><div style="font-size:23px;font-weight:600;color:var(--navy-900);font-family:var(--font-mono)">{stats.get('programs','02')}</div></div>
        </div>
        <x-import component-from-global-scope="MissionDocsDesignSystem_738442.Callout" title="How this page works" tone="quiet" style="{{{{ mt24 }}}}" hint-size="100%,90px">Every diagram is a stepped figure: use ‹ › or Play to walk through it. Every program types itself out as you scroll; the ‹ › buttons on a code block step through notes on specific lines, and Run shows its output. Sections are ticked off in the contents rail as you read them.</x-import>
      </div>

{sections_html}

{cheat_html}

      <div style="margin-top:48px;padding-top:24px;border-top:2px solid var(--rule-strong);display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap">
        <div style="display:grid;gap:4px">
          <span style="font-family:var(--font-mono);font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:var(--text-muted)">{{{{ doneLabel }}}}</span>
          <span style="font-size:13px;color:var(--text-body)">Next: {next_label}</span>
        </div>
        <div style="display:flex;gap:8px">
          <x-import component-from-global-scope="MissionDocsDesignSystem_738442.Button" variant="secondary" onClick="{{{{ goHub }}}}" hint-size="110px,36px">Course map</x-import>
          <x-import component-from-global-scope="MissionDocsDesignSystem_738442.Button" variant="primary" onClick="{{{{ complete }}}}" hint-size="180px,36px">{{{{ completeLabel }}}}</x-import>
        </div>
      </div>
    </article>
  </div>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script>
{script}
{component}
</script>
</body>
</html>
"""


def section(sid, index, title, body, *, summary, exercise=None):
    ex = ""
    if exercise:
        ex = f"""
        <x-import component-from-global-scope="MissionDocsDesignSystem_738442.Callout" title="Try this" tone="quiet" hint-size="100%,140px"><span>{exercise}</span></x-import>"""
    return f"""
      <section id="{sid}" data-screen-label="{index} {title}" style="margin-bottom:72px">
        <x-import component-from-global-scope="MissionDocsDesignSystem_738442.SectionTitle" index="—{index}" title="{title}" hint-size="100%,90px"></x-import>
{body}{ex}
        <div data-sec="{sid}">
          <x-import component-from-global-scope="MissionDocsDesignSystem_738442.Callout" title="Section summary" tone="info" hint-size="100%,120px">{summary}</x-import>
        </div>
      </section>
"""


def h3(t: str) -> str:
    return f'        <h3 style="font-size:18px;font-weight:600;color:var(--navy-800);margin:32px 0 12px">{t}</h3>'


def p(t: str) -> str:
    return f"        <p>{t}</p>"


def flow(key: str, h: str = "420px") -> str:
    return f'        <dc-import name="Flow" spec="{{{{ flows.{key} }}}}" hint-size="100%,{h}"></dc-import>'


def code(key: str, h: str = "320px") -> str:
    return f'        <dc-import name="Code" spec="{{{{ code.{key} }}}}" hint-size="100%,{h}"></dc-import>'


def trace(h: str = "520px") -> str:
    return f'        <dc-import name="Trace" spec="{{{{ trace }}}}" hint-size="100%,{h}"></dc-import>'


def callout(title: str, body: str, tone: str = "accent") -> str:
    return f'        <x-import component-from-global-scope="MissionDocsDesignSystem_738442.Callout" title="{title}" tone="{tone}" hint-size="100%,120px"><span>{body}</span></x-import>'


def pull(t: str) -> str:
    return f'        <x-import component-from-global-scope="MissionDocsDesignSystem_738442.PullQuote" hint-size="100%,80px">{t}</x-import>'


def cheat_sheet(rows: list[tuple[str, str]]) -> str:
    items = "".join(
        f'<div style="display:grid;grid-template-columns:200px 1fr;gap:16px;padding:12px 16px;background:var(--paper-000);border-bottom:1px solid var(--rule-hairline)"><strong style="font-size:13px">{k}</strong><span style="font-size:13px;color:var(--text-body)">{v}</span></div>'
        for k, v in rows
    )
    return f"""
      <section id="cheat" data-screen-label="Cheat sheet" style="margin-bottom:48px">
        <x-import component-from-global-scope="MissionDocsDesignSystem_738442.SectionTitle" index="—" title="Cheat sheet" hint-size="100%,90px"></x-import>
        <div style="border:1px solid var(--rule-hairline);margin-top:8px">{items}</div>
        <div data-sec="cheat"></div>
      </section>
"""


def write(name: str, html: str) -> Path:
    path = ROOT / name
    path.write_text(html, encoding="utf-8")
    print(f"wrote {path} ({len(html)} bytes)")
    return path
