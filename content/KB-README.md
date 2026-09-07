# Agent Tech Engineering and Python Knowledge Base

Everything built in the Formulaite Agent Lab sessions (7 September 2026), in one folder.

## Open first
- `index.html` — landing page (double-click). Links to the bookshelf, the visual guide and the downloads.
- `ARTIFACT-LINKS.md` — the same 16 pages as live claude.ai artifacts.

## What is where
| Folder / file | What it is |
|---|---|
| `index.html` | Landing page |
| `visual-guide.html` | Interactive lesson: four real agent runs replayed step by step + Python-construct cheat sheets |
| `book-guides/` | 14 book guides (`<slug>.html`), 14 printable cheat sheets (`<slug>-cheatsheet.md`), `index.html` (the bookshelf) |
| `downloads/Formulaite-Agent-Lab-source.zip` | The Python agent project (no book texts) — open this in Cursor |
| `downloads/book-guides-and-cheatsheets.zip` | The guides as files |
| `private-do-not-upload/Formulaite-Agent-Lab-with-books.zip` | Full project INCLUDING the 14 books as Markdown — copyrighted, keep off public sites |
| `archives/` | Every bundle delivered in the chat: `Formulaite-Agent-Lab.tar.gz` (first prototype), `Formulaite-book-guides.tar.gz` (9-book set), `Formulaite-book-guides-14.tar.gz` (14-book set), `Formulaite-Site.zip` (the Cloudflare upload) |

## Publish to Cloudflare Pages
Upload this folder minus `private-do-not-upload/` and `archives/` (Workers & Pages → Create → Pages → Upload assets).

## Run the agent (Cursor or Terminal)
Unzip `downloads/Formulaite-Agent-Lab-source.zip`, then:
    python3 -m agent_lab Glycerin --fail-first
    python3 -m unittest discover -s tests -v
Real Claude: `pip install -r requirements.txt`, set `ANTHROPIC_API_KEY`, add `--brain claude`.
