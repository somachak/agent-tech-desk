# Gates: Agent Tech Desk — first runnable slice

OWNS: worker/**, scripts/**, public/**, content/**, package.json, wrangler.jsonc, README.md, .gitignore

Scope: a Cloudflare Workers site serving the attached knowledge base in its own order, with an in-browser Python IDE and a Groq-backed tutor that degrades to a local mock when no key is set; committed on main.

- [x] G1: the build produces every page — home, bookshelf, IDE, tutor, 14 guides, 14 cheat sheets, 2 downloads — and no page references anything from private-do-not-upload or books-md
  CHECK: node scripts/check.mjs build
  EXPECT: build verification passed
  EVIDENCE: automatic-evidence=v1; definition-sha256=4a186b12b8cc2ab7cd96be8b957636dea55fb7cba4b229f9fb0bf149725c2822; exit=0; EXPECT=matched; output-sha256=f9a41e217571a7dfd778ac689ec8a73ac9ab58f361b6c8d5e57782e60535f3bb; output-bytes=107; shell=/bin/sh; cwd=/home/claude/agent-tech-desk; path=9f5e88eb0f22/20 entries

- [x] G2: the bookshelf keeps the attachment's own order and phases, and every guide it links resolves to a file
  CHECK: node scripts/check.mjs order
  EXPECT: order verification passed
  EVIDENCE: automatic-evidence=v1; definition-sha256=1a72f9e28a682f5fa0f39a4ce428c043330e611780179b48ee9066180167f855; exit=0; EXPECT=matched; output-sha256=b74c2ba7ba8cdbaecf4737885299b140928d51b3382e9e01df780a0101245afe; output-bytes=98; shell=/bin/sh; cwd=/home/claude/agent-tech-desk; path=9f5e88eb0f22/20 entries

- [x] G3: the worker serves the home page, the bookshelf and a guide over HTTP, and /api/tutor answers with the mock when GROQ_API_KEY is unset
  CHECK: node scripts/check.mjs serve
  EXPECT: serve verification passed
  EVIDENCE: automatic-evidence=v1; definition-sha256=5cff09b0021f25053c7114b926e474e6ed67096f77afd897f02af6f77eaa3c3b; exit=0; EXPECT=matched; output-sha256=4b8e0bb28949f1365c6819123b3ae63b022bd7d1b9740d96c4da24e7f618c0e7; output-bytes=110; shell=/bin/sh; cwd=/home/claude/agent-tech-desk; path=9f5e88eb0f22/20 entries

- [x] G4: no secret is committed and the ignore rules cover .dev.vars and dist
  CHECK: node scripts/check.mjs secrets
  EXPECT: secrets verification passed
  EVIDENCE: automatic-evidence=v1; definition-sha256=9d7a3996160334fc4f6a9a349660a771170b81bd761224d4e6ce66d08eabb6e4; exit=0; EXPECT=matched; output-sha256=af57f4fdbb69f4a9d397934865179d4dd6ae799952f02da30804683cd189caa8; output-bytes=107; shell=/bin/sh; cwd=/home/claude/agent-tech-desk; path=9f5e88eb0f22/20 entries

- [x] G5: every IDE example runs in the same Pyodide build the browser loads, and prints its expected output
  CHECK: node scripts/check.mjs ide
  EXPECT: ide verification passed
  EVIDENCE: automatic-evidence=v1; definition-sha256=d337c154e29aa53456d9c9d5c8eeb5bcc3b539bd4a69db017d87379c581a81ef; exit=0; EXPECT=matched; output-sha256=f4a275c002559e66b6e28f1a6e887eae77bf6e0f41cbc2d81aad3697f1b38c9e; output-bytes=101; shell=/bin/sh; cwd=/home/claude/agent-tech-desk; path=9f5e88eb0f22/20 entries

- [x] G6: the IDE page wiring was watched in a browser — Run fills the output pane, an error shows as an error
  EVIDENCE: 2026-09-07 headless Chromium against the dev server. With the real CDN build the status read "READY · 3.13.2". With a stub runtime (to keep the container light) pressing Run filled the output pane with the three printed lines, the timing field updated, and running 1/0 showed "ZeroDivisionError: division by zero" in the error colour. No console or page errors. Screenshots at /tmp/w_ide.png, w_home.png, w_shelf.png, w_tutor.png, w_sheet.png.

- [x] G7: committed on main and pushed to Soma's remote
  EVIDENCE: 2026-09-07 pushed to git@github.com:somachak/agent-tech-desk.git — `git ls-remote --heads origin` returns 6bef3cb6e61da1d556a06d508f508a5f24c69fb2 on refs/heads/main, matching local HEAD; branch main tracks origin/main. SSH authenticated as somachak with a new ed25519 key on this Mac.

- [x] G8: deployed to Cloudflare Workers and the live site serves every route
  EVIDENCE: 2026-09-07 `npm run deploy` uploaded 51 assets, version 59cfe2cf-cbd0-4c50-9347-3732a9c9ca84, live at https://agent-tech-desk.pixelartinc.workers.dev — /, /bookshelf, /ide, /tutor, /agent-walkthrough, a guide, a cheat sheet and the source zip all return 200; /api/tutor/health reports the mock engine (no key set yet); /private-do-not-upload/* and /books-md/* return 404.
