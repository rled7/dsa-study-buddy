# DSA Study Buddy

An offline coding study buddy for mastering the 16 classic data-structures-and-algorithms
patterns: browse the curriculum, solve practice problems against real test cases in an
in-browser runner, and track your progress — no server, no account, no network required.

This is **v1** of a layered plan. Each version adds one capability without rearchitecting
the last:

| Version | Adds | Status |
|---|---|---|
| **v1** | Curriculum browser, practice problems, in-browser JS test runner, localStorage progress tracking, crash-visibility logging, and a **stubbed** "Ask the Buddy" panel | ✅ this repo |
| **v2** | Wires the buddy panel to a **local LLM via Ollama** (offline, no API keys) so it can actually answer questions about the problem you're looking at | ✅ this repo |
| **v3** | Adds a **growing local RAG brain**: a small distilled knowledge base (textbook → distilled notes → embeddings → local vector DB) the buddy can search before answering, so it gets better over time without needing a bigger model | not started |

## v2 — Ask the Buddy (local LLM via Ollama)

The panel calls Ollama's `/api/chat` endpoint (`http://localhost:11434`) directly from the
browser with `model: "qwen2.5-coder:7b"` and `stream: false`. No server component, no API
key — everything runs on your machine.

**Setup** (one-time):
```bash
brew install ollama
brew services start ollama       # runs as a background daemon, survives reboots
ollama pull qwen2.5-coder:7b     # ~4.7GB, Q4 quantization
```

**What it sends:** a short system prompt (concise, hint-first rather than solution-dump) plus
whatever problem you're currently viewing — pattern, sub-pattern, title, description, and your
current in-editor code — so answers are grounded in what's actually on screen. If you're on the
pattern list instead of a problem page, it just answers generally.

**Error handling:** if Ollama isn't running or the model isn't pulled, the panel shows a plain
error message telling you exactly what to run, rather than hanging or failing silently — same
crash-visibility standard as the rest of this app.

**Why `qwen2.5-coder:7b`:** fits comfortably in this machine's available disk budget (~4.7GB out
of ~18GB free at the time this was built) while still being a real coding-tuned model. If you
have more headroom, a 14B variant is a drop-in `ollama pull`/model-name swap in `src/main.ts`
(`OLLAMA_MODEL` constant) — no other code changes needed.

The v1 UI already had a dedicated "Ask the Buddy" panel, form, and response area wired up as a
stub; v2 replaced the stub handler in `wireBuddyPanelEvents()` (`src/main.ts`) with the real
Ollama call above — no UI rework was needed, as planned.

## What's in v1

- **Curriculum browser** — the full 16-pattern structure (Arrays, String, Hashing, Stack,
  Queue/Deque, Linked List, Trees, Recursion, Heap, Graphs, Trie, Dynamic Programming, Greedy,
  Bit Manipulation, Advanced, Range Structures) with all sub-patterns and a plain-English
  explanation for each. Pattern → sub-pattern → problem list, with a breadcrumb trail.
- **In-browser practice runner** — each seeded problem has a description, a starter function
  signature in a code editor (styled `<textarea>`), a **Run tests** button that evaluates your
  JS with `new Function(...)` against real test cases and shows PASS/FAIL per case with
  input / expected / got, and a **Show solution** reveal.
- **Progress tracking** — solving all test cases for a problem marks it solved in
  `localStorage` (key `dsa_study_buddy_progress_v1`); the sidebar and pattern/sub-pattern
  pages show `solved/total` counts that persist across reloads.
- **Crash-visibility logging** (`src/logger.ts`, installed as the first line of `src/main.ts`)
  — captures uncaught errors, unhandled promise rejections, and mirrored `console.error`/
  `console.warn` calls into a `sessionStorage` ring buffer (key `dsa_study_buddy_log`, capped
  at 100 entries). A footer button lets you trigger a deliberate test error, and another
  exports the buffer as JSON. This app should never crash silently.
- **Ask the Buddy panel** — always visible; as of v2, answers for real via a local LLM (see below).

### Honest content coverage

Real, working practice problems (description + test cases + reference solution) are seeded
for **4 of the 16 patterns** (~2 problems each, 8 total):

- **Arrays**: Subarray Sum Equals K (Prefix Sum), Maximum Sum Subarray of Size K (Sliding Window)
- **String**: Valid Anagram (Anagram/Frequency Count), Valid Palindrome (Palindrome)
- **Hashing**: Two Sum, Group Anagrams
- **Stack**: Valid Parentheses (Balanced Parentheses), Next Greater Element (Next Greater/Smaller)

The other **12 patterns** show their full sub-pattern structure and a plain-English
explanation per sub-pattern, but their problem lists are empty with a "problems coming soon"
placeholder. This is intentional scoping for v1, not a bug — breadth of structure now,
depth of content grows over time by adding entries to one data file.

## How to add a problem

Everything content-related lives in **`src/data/curriculum.ts`** (types are in
`src/data/types.ts`). To add a problem to any sub-pattern (seeded or currently stubbed):

1. Write a `Problem` object:
   ```ts
   const myProblem: Problem = {
     id: "unique-kebab-case-id",
     title: "Problem Title",
     difficulty: "Easy", // "Easy" | "Medium" | "Hard"
     description: "Plain-English statement.\n\nHint about the technique.",
     fnName: "myFunctionName", // must match the function name in starterCode/solution
     starterCode: "function myFunctionName(args) {\n  // your code here\n}",
     testCases: [
       { input: [/* positional args */], expected: /* return value */ },
     ],
     solution: "function myFunctionName(args) {\n  /* reference solution */\n}",
     // Optional: only needed if a correct solution could legally return
     // results in a different order than `expected` (e.g. index order,
     // group order). See sortNums / canonicalGroups near the top of the
     // file for examples.
     normalize: (v) => v,
   };
   ```
2. Push it into the right sub-pattern's `problems` array (find the `Pattern`/`SubPattern` in
   the file — stub patterns are generated by the `stub()` helper near the bottom; you can
   either add a `problems` entry directly to the generated object, or convert that pattern
   from `stub(...)` to an explicit object like `arrays`/`stringPattern`/`hashing`/`stack`).

The runner (`src/runner.ts`), UI (`src/main.ts`), and progress tracking (`src/progress.ts`)
need no changes — they all read from `PATTERNS` generically.

## Local dev

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-checks (tsc) then builds to dist/ with relative asset paths
npm run preview   # serves the production build locally
```

`vite.config.ts` sets `base: './'` so `dist/` can later be dropped into a subpath — e.g.
`remberllc/public/demos/dsa/` — without any base-path reconfiguration.

## Verification (v1)

Built `dist/`, served it with `vite preview`, and drove it with headless Chrome over the
Chrome DevTools Protocol (a Node script using the built-in `WebSocket` client — see
project history for the driver). Confirmed:

1. Navigating to the Two Sum problem renders its description, starter code, and test cases.
2. Injecting a **correct** solution and clicking Run tests → all test cases pass, the
   problem is marked solved (`localStorage['dsa_study_buddy_progress_v1']` includes its id).
3. Injecting a **wrong** solution and clicking Run tests → tests fail with per-case
   input/expected/got detail shown.
4. Reloading the page → solved state persists (both in `localStorage` and as a "Solved"
   badge on the problem page).
5. Clicking "Throw test error (debug)" → the crash logger captures it in
   `sessionStorage['dsa_study_buddy_log']`.

## Verification (v2)

Same headless-Chrome/CDP approach, against a running Ollama instance with `qwen2.5-coder:7b`
pulled. Confirmed:

1. On the Two Sum problem page, asking "What data structure makes this O(n) instead of
   O(n^2)?" shows "Thinking…" (input + button disabled) then a real, relevant, model-generated
   answer ("A hash map (or dictionary) will make it O(n)."), with the button/input re-enabled
   after. Zero console errors during the round trip.
2. With Ollama stopped (`brew services stop ollama`), asking a question surfaces the friendly
   error text (which Ollama command to run) with the `buddy-response--error` style applied,
   and the form re-enables afterward instead of getting stuck — verified before restarting the
   service.

## Notes

- No network calls beyond `localhost` (Ollama), no external dependencies beyond Vite/TypeScript
  tooling and Ollama itself.
- Editor is a plain `<textarea>` for v1 — good enough to write and test short solutions;
  a real code-editor component (syntax highlighting, etc.) is a fair v2+ upgrade if desired.
- This repo is local-only; it has not been pushed to GitHub.
