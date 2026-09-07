#!/usr/bin/env python3
"""Embed Code/Flow/Trace.dc.html into dc-siblings.js for file:// viewing."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
files = ["Code.dc.html", "Flow.dc.html", "Trace.dc.html"]

parts = [
    "/* Auto-generated: embeds sibling Design Components for file:// viewing */",
    "(function () {",
    "  var resources = {};",
    "  var blobs = {};",
]
for name in files:
    text = (ROOT / name).read_text(encoding="utf-8")
    # JSON string is a valid JS string literal
    lit = json.dumps(text)
    rel = f"./{name}"
    parts.append(f'  resources["{rel}"] = "{rel}";')
    parts.append(f'  blobs["{rel}"] = new Blob([{lit}], {{ type: "text/html" }});')

parts += [
    "  window.__resources = Object.assign(window.__resources || {}, resources);",
    "  window.__resourceBlobs = Object.assign(window.__resourceBlobs || {}, blobs);",
    "})();",
    "",
]
out = ROOT / "dc-siblings.js"
out.write_text("\n".join(parts), encoding="utf-8")
print(f"wrote {out} ({out.stat().st_size} bytes)")
