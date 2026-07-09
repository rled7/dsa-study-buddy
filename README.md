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
| **v3** | Adds a **growing local RAG brain**: paste in notes/excerpts → chunked → embedded locally → stored in-browser, so the buddy can retrieve relevant material before answering, and gets better over time without needing a bigger model | ✅ this repo |
| **v4** | Installable on Android + iOS home screens as a **PWA** (manifest + offline service worker) — first rung of a broader mobile port; see `docs/mobile-approaches.md` for the full Capacitor/React Native/Flutter plan | ✅ this repo |

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

## v3 — Feed the Brain (growing local RAG)

A new **"Feed the Brain"** page (`#/brain`) lets you paste in notes or textbook excerpts. Each
paste is chunked (by paragraph, packed to ~800 chars, falling back to sentence-splitting for long
paragraphs), embedded locally via Ollama's `nomic-embed-text` model, and stored in this browser's
IndexedDB (`dsa_study_buddy_brain` / `chunks` store) — nothing leaves your machine, no server.

When you ask the buddy a question with the new **"Use the brain"** checkbox on, the question
itself gets embedded, compared against every stored chunk via cosine similarity (plain JS, no
vector DB library), and the top 3 matches are injected into the model's prompt ahead of the
current-problem context, with explicit priority framing ("these are the user's own saved notes,
ground truth, take priority over the problem below").

**Deliberate deviation from the original locked spec:** the spec named sqlite-vec/LanceDB for the
vector store. Both need a backend process, which would break this app's static `base: './'`
build (drop `dist/` anywhere, no server, no account). At this app's scale — a personal notes
corpus, not a search engine — IndexedDB + a linear cosine scan is exactly as correct and keeps
the "no server" promise intact. Swap to a real vector DB only if the corpus grows into the
hundreds of thousands of chunks.

**Deliberately NOT LLM-distilled per chunk:** the spec's "distill each chunk" step is skipped for
now — distilling means a full 7B generation call per paragraph (slow for anything but tiny
inputs), and distilling before embedding can strip the exact wording a later query needs to match
on. Raw-but-chunked text is embedded directly. A distilled *display* copy (kept separate from
what's embedded) is a fair future refinement.

**What proves retrieval actually works (not just that "an answer came back"):** a top-K match
returning something doesn't prove the brain contributed anything — the model might answer
correctly from its own training either way. The real test: ingest a fact the base model cannot
possibly know, then ask about it with the toggle off (expect an ignorant/generic answer) and on
(expect the specific ingested detail, verbatim-adjacent). See "Verification (v3)" below — this is
the check that actually discriminates a working RAG loop from a decorative one.

## v4 — Installable on Android + iOS (PWA)

This is the first of several planned mobile paths (see `docs/mobile-approaches.md` for the
full comparison, including Capacitor, React Native, and Flutter, and the on-device-LLM
research needed for the buddy/brain to work without a Mac on the network). A PWA needed no
native toolchain — it's an addition to the existing Vite app, not a separate build.

**What was added:**
- `public/manifest.json` — name, icons (192/512/maskable-512), `display: "standalone"`,
  matching the app's actual dark theme (`#0f1115`) as the background/theme color.
- `public/sw.js` — a hand-written service worker (no Workbox/build-step dependency, matching
  this app's minimal-tooling style elsewhere). Precaches the app shell (`index.html`,
  manifest, icons, favicon) on install, and uses **stale-while-revalidate** for same-origin
  GET requests so the hashed JS/CSS bundle gets cached the first time it's fetched without the
  service worker needing to know its filename ahead of time.
- Registration gated to `import.meta.env.PROD` in `src/main.ts` — never active during
  `npm run dev`, so it can't fight Vite's HMR with stale cached responses.
- iOS-specific `<meta apple-mobile-web-app-*>` tags and an `apple-touch-icon` link in
  `index.html` — iOS ignores the standard manifest for home-screen install styling.
- `public/icons/` — generated from the existing `favicon.svg` logo mark, composited onto a
  square `#0f1115` canvas (68% fill for the two `any`-purpose icons, 40% fill for the
  maskable one, since maskable icons need real safe-zone padding or OS icon masks crop into
  the artwork).

**Deliberately NOT intercepted by the service worker:** anything cross-origin or non-GET —
this matters because v2/v3's Ollama calls (`http://localhost:11434`, all POST) must always
hit the network live, never get cached or served stale. The fetch handler checks
`req.method !== "GET" || url.origin !== self.location.origin` and passes those straight
through untouched.

## v5 — System Design Building Blocks (multi-approach problems)

A 17th pattern, **System Design Building Blocks**, turns 7 terms from the System Design
glossary (`#/concepts`) into real, gradeable coding problems: LRU Cache, Rate Limiter,
Idempotency Key Store, Prefix Autocomplete, Cluster Connectivity (Union-Find), Bloom Filter
Membership, and Top-K Frequent Items.

Two things make these different from the earlier seeded problems:

- **Operations-sequence framing.** The runner (`src/runner.ts`) only supports pure functions —
  no stateful classes. Rather than change the runner, every "system design" problem is
  reframed as a pure function that takes an explicit sequence of operations (e.g.
  `lruCacheOperations(capacity, ops, argsList)`) and returns one result per operation. Zero
  runner changes needed.
- **Multiple ordered solutions.** `Problem.solutions?: SolutionApproach[]` (see
  `src/data/types.ts`) lets a problem list every conceptually distinct way to solve it —
  approach name, time/space complexity, a plain-English explanation, and standalone code —
  ordered fastest-to-slowest by time complexity. `src/main.ts`'s "Show solution" reveal
  renders this list when present, falling back to the legacy single-`<pre>` view otherwise.
  The pre-existing `solution` field is still required and kept in sync (set to the fastest
  approach) since older tooling reads it directly.

All 7 problems' `solution` field and every `solutions[].code` entry are verified to
independently pass that problem's own `testCases` — see "Verification (v5)" below. Test data
for these problems is deliberately engineered so genuinely different algorithms agree exactly
(no ties at Top-K's cutoff, a large gap between bursts for the Rate Limiter so Fixed-Window and
Sliding-Window-Log can't diverge at a boundary, hash positions for the Bloom Filter checked in
real Node.js so the "non-member" query can't collide with either inserted item's bits).

## v6 — Language & Framework Reference

A new sidebar section, **Language & Framework Reference** (`#/reference`), separate from the
17 DSA patterns and the System Design glossary: a curated, leveled (Beginner → Intermediate →
Advanced) reference of core methods and concepts per language/framework.

This is deliberately **curated, not exhaustive**. "List every method for every language" isn't
something to hand-author accurately from memory — signatures get misremembered, coverage is
never really complete, and it doesn't fit the runnable `Problem` model anyway. Instead:

- **`src/data/reference.ts`** defines a small `LanguageRef → RefCategory → RefItem` model (same
  spirit as `architecture.ts`'s glossary). Each `RefItem` has a name, a level, a plain-English
  summary, and an optional short example.
- **All 12 languages/frameworks are seeded** — 475 entries total across JavaScript (108),
  Python (75), Ruby & Rails (58), Java (50), C (46), SQL (34), React (21), Angular (18),
  Flutter (18), GraphQL (16), NoSQL (16), and PostgreSQL (15). Each spans `push()`/`append()`
  basics up through language-specific advanced material (JS `Proxy`/microtask ordering, Python
  MRO/`__slots__`, Java type erasure/Integer caching, C struct padding/pointer arithmetic, Ruby
  metaprogramming, SQL window functions/recursive CTEs, React reconciliation/Suspense, Angular
  change detection, Flutter's `InheritedWidget`, Postgres `pgvector`/GIN indexes, GraphQL
  DataLoader/N+1).
- **Still curated, not exhaustive**, and still scaffolds cleanly: `LanguageRef.categories: []`
  renders the same "coming soon" idiom used elsewhere for unstubbed sub-patterns, so adding a
  13th language later is a non-breaking append.
- **The long tail is the buddy panel, on purpose.** Every reference page points at the
  always-visible "Ask the Buddy" panel for anything not in the curated list — the local LLM can
  answer arbitrary method questions on demand instead of this file trying to enumerate every
  method of every language up front (which would be both unbounded and prone to hallucinated
  signatures if hand-authored from memory).

Verified via two headless-Chrome walkthroughs (31 checks total) — see "Verification (v6)" below.

## v7 — Caching Strategies deep dive

The System Design glossary's "Caching" entry (and its two close relatives, "Edge Caching" and
"Cache Invalidation") were one-line definitions like every other glossary term — too thin for a
topic that's really a family of named strategies. `#/concepts` now links all three to a shared
deep-dive page, `#/concepts/caching`, instead of a plain-text row.

- **`src/data/deepdives.ts`** defines a small `DeepDive → DeepDiveStrategy` model (name,
  description, an ASCII diagram of the request/data flow, and a runnable-shaped code snippet).
  A `Concept` opts in via an optional `deepDiveId` field (`src/data/architecture.ts`); when set,
  `renderConceptsPage` renders that term as a link to `#/concepts/:deepDiveId` instead of plain
  text. The route (`{ view: "deepDive"; id }`) and `renderDeepDivePage` follow the same pattern
  as the language-reference detail page.
- **11 strategies authored**, covering all three angles caching strategies actually vary on —
  *when* the app talks to cache vs. source of truth (Cache-Aside, Read-Through, Write-Through,
  Write-Behind, Write-Around), *when* an entry goes stale (TTL, LRU eviction — cross-referenced
  to this app's own LRU Cache problem in the System Design track, Cache Invalidation-on-write),
  and *where* the cache physically lives (CDN/Edge Caching, Distributed Caching via Redis,
  Browser/HTTP Caching).
- Same curated-not-exhaustive posture as the rest of the reference content: each strategy is
  something confidently correct to hand-author, not a scrape of a caching textbook.

## v8 — Solved-code persistence + deep dives across the System Design page

Two changes bundled together:

- **Solved code now survives a reload.** Previously only a solved/unsolved boolean persisted
  (`src/progress.ts`); the actual passing code lived in an in-memory variable in `main.ts` and
  was lost the moment you navigated away. `src/solutions.ts` mirrors the same
  `localStorage`-per-problem pattern (key `dsa_study_buddy_solutions_v1`, `Record<problemId,
  code>`) and is written whenever a "Run tests" click passes all cases. This is what the
  in-progress GitHub export feature needs to actually have code to export.
- **The caching deep-dive treatment (v7) now covers five more System Design terms** that are
  genuinely "one term, several named strategies" the same way Caching was: **Rate Limiting**
  (Fixed Window Counter, Sliding Window Log, Sliding Window Counter, Token Bucket, Leaky
  Bucket), **Load Balancing** (Round Robin, Weighted Round Robin, Least Connections, IP Hash,
  Consistent Hashing), **Sharding** (Range-Based, Hash-Based, Directory-Based, Geo-Based),
  **Replication** (Leader-Follower, Multi-Leader, Leaderless/Quorum-Based), and **Consistency
  Models** (Strong, Eventual, Causal, Read-Your-Writes — linked from both "CAP Theorem" and
  "Eventual Consistency" in the glossary, since they're the same underlying spectrum). Same data
  model as caching (`DEEP_DIVES` in `src/data/deepdives.ts`), no new UI code needed — `Concept`
  entries just opt in via `deepDiveId`. 9 glossary terms across 6 deep dives now link out instead
  of showing a plain one-line definition; 32 strategies total, each with a description, ASCII
  diagram, and code snippet.

## v9 — Export solved solutions to GitHub

A one-way export: take everything you've solved locally and push it to a real GitHub repo you
own, so your solutions live somewhere permanent and shareable outside `localStorage`.

- **`src/export.ts`** — pure payload builder, no network/DOM. Reads every solved problem's saved
  code (`src/solutions.ts`), groups it by pattern in curriculum order, and generates a
  `README.md` index (`## Arrays`, `## Hashing`, etc., each entry linking to its file) alongside
  one `.js` file per problem (with a header comment naming the problem, pattern, and difficulty).
  A solved id whose problem no longer exists in the curriculum is skipped silently rather than
  crashing the export.
- **`src/export-github.ts`** — `pushExportToGitHub()` pushes that payload to a real repo via the
  GitHub REST Contents API, one commit per file. Resolves the repo's default branch
  automatically unless you specify one, checks each file's existing sha first to decide
  create-vs-update, and isolates per-file failures (one bad path or transient error doesn't
  abort the rest of the push — every file gets its own reported outcome). Content is base64-
  encoded through raw UTF-8 bytes rather than a plain `btoa()` call, so non-Latin1 characters in
  comments (accents, em-dashes, etc.) survive the round trip.
- **`src/github-token.ts`** — a GitHub PAT is entered once and persisted in `localStorage`
  (`dsa_study_buddy_github_token_v1`) so you don't re-enter it every session. This is a
  single-user local app with no server, so there's nowhere more secure to keep it without adding
  a backend that doesn't otherwise exist — same trade-off any locally-run dev CLI makes when it
  caches a token on disk. A **"Forget saved token"** button clears it on demand.
- **New `#/export` page** (sidebar link) — shows how many problems are solved, a form for repo
  owner / repo name / optional branch, and a **Push to GitHub** button that's disabled until at
  least one problem is solved. After pushing, a status panel lists each file's outcome
  (created/updated/failed) and links to the pushed branch.

**Setup note:** the PAT needs a fine-grained GitHub token scoped to just the target repo's
Contents (read + write) — classic tokens with repo scope work too, but fine-grained is
recommended since it can't touch anything outside the one repo you name.

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

**Updated 2026-07-09 — this section originally said 5 of 17 patterns; that's no longer true.**
A dedicated content pass (11 commits, same day) filled in every subpattern that was still
showing the "problems coming soon" placeholder. Verified via `verify/verify-solutions.mjs
--coverage`, which actually runs every `solution` and every `solutions[].code` against that
problem's own test cases rather than trusting the source counts:

```
Checked 71 problems, 214 code blocks (solution + solutions[].code).
Empty subpatterns remaining: 0
ALL PASS
```

**All 16 core patterns** now have a real, working problem (description + test cases +
reference solution, most with 2 solutions of genuinely different time complexity) in every one
of their 51 subpatterns — Arrays, String, Hashing, Stack, Queue/Deque, Linked List, Trees,
Recursion, Heap, Graphs, Trie, Dynamic Programming, Greedy, Bit Manipulation, Advanced, and
Range Structures.

**System Design Building Blocks** (the 17th pattern, added in v5 and expanded 2026-07-08) has
12 problems across its 6 subpattern groups (Caching, Traffic Control, Search, Distributed
Coordination, Probabilistic Structures, Observability) — LRU Cache, Rate Limiter, Idempotency
Key Store, Prefix Autocomplete, Cluster Connectivity, Bloom Filter Membership, Top-K Frequent
Items, and 5 more, each with 2-3 solutions ordered fastest-to-slowest.

There is no longer a "coming soon" placeholder anywhere in the curriculum — the
`stub()` helper that generated it was deleted along with the last empty subpattern.

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
     // Optional: list every conceptually distinct way to solve this problem,
     // ordered fastest-to-slowest by time complexity. When present, the UI
     // shows this list instead of the single `solution` above (which must
     // still be set — use the fastest approach's code). Every approach's
     // `code` must independently pass the SAME `testCases`, so if two
     // algorithms can legally disagree at an edge case (ties, boundaries,
     // false positives), engineer testCases to avoid that edge — see
     // sysdes-rate-limiter / sysdes-bloom-filter / sysdes-top-k-frequent
     // for real examples of this, and verify/sysdes_verify.mjs for how to
     // bulk-check every approach against the real runner before committing.
     solutions: [
       { approach: "...", timeComplexity: "O(...)", spaceComplexity: "O(...)", explanation: "...", code: "..." },
     ],
   };
   ```
2. Push it into the right sub-pattern's `problems` array (find the `Pattern`/`SubPattern` in
   the file — stub patterns are generated by the `stub()` helper near the bottom; you can
   either add a `problems` entry directly to the generated object, or convert that pattern
   from `stub(...)` to an explicit object like `arrays`/`stringPattern`/`hashing`/`stack`).

The runner (`src/runner.ts`), UI (`src/main.ts`), and progress tracking (`src/progress.ts`)
need no changes — they all read from `PATTERNS` generically.

## How to add a reference entry

Everything for the Language & Framework Reference lives in **`src/data/reference.ts`**. To add
an entry to an existing language, or a whole new category, push a `RefItem` into a `RefCategory`:

```ts
{ name: "methodName()", level: "beginner" /* | "intermediate" | "advanced" */,
  summary: "One or two plain-English sentences: what it does and why it matters.",
  example: "optional short usage snippet" },
```

To add a brand-new language/framework, push a `LanguageRef` with `categories: []` into
`LANGUAGE_REFS` — it renders a "coming soon" page pointing at the buddy panel until you fill it
in, same idiom as an empty `problems` array on a stub sub-pattern. No `main.ts`/`style.css`
changes are needed either way — the reference UI reads `LANGUAGE_REFS` generically.

Keep entries curated and confidently accurate rather than exhaustive — this is a hand-authored
reference, not a scrape of official docs, so only add things you (or whoever's contributing)
actually know are correct. Anything not covered is what the buddy panel is for.

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

## Verification (v3)

Same headless-Chrome/CDP approach. First confirmed CORS/shape for Ollama's `/api/embed`
(768-dim vectors from `nomic-embed-text`) via a real in-page `fetch`, not just `curl`. Then the
discriminating test:

1. On `#/brain`, ingested a fabricated, never-published technique ("the Vorlath Sweep" — a
   two-pointer technique that doubles its window on a duplicate and resets to 1 on the next
   unique pair). Confirmed 1 chunk stored, visible in the chunk list.
2. On the Two Sum problem page, asked "What is the Vorlath Sweep technique and how exactly does
   its window size change over time?" with **"Use the brain" unchecked**: the model correctly
   had no idea, called it unrelated to Two Sum, and tried to redirect to the actual problem.
3. Same question with **"Use the brain" checked**: the model correctly described the doubling
   and reset behavior, matching the ingested text almost verbatim (and even generated its own
   consistent example) — proof retrieval actually fed real content into the prompt, not just
   that a plausible-looking answer came back.
4. Captured the actual outgoing `/api/chat` request body over the CDP Network domain to confirm
   the retrieved chunk was really in the prompt (not just an accidental correct guess).
5. Clearing the brain removed the stored chunk (count → 0 in both the chunk list and the sidebar
   badge) and disabled the "Use the brain" checkbox again.

**One tuning note surfaced by this test:** the first attempt at prompt phrasing ("relevant notes
— may or may not be relevant, use judgment") caused the model to ignore the injected fact in
favor of the concurrently-present current-problem context. Reordering the prompt (brain notes
before the current-problem section) and adding explicit priority language ("these take priority
over the problem below") fixed it. Left as a comment in `askBuddy` (`src/main.ts`) since it's a
non-obvious, model-behavior-driven constraint, not just a style choice.

## Verification (v4)

Built `dist/`, served it with `vite preview`, drove it with headless Chrome over CDP —
same approach as v1-v3, but this time the discriminating test is **actual offline reload**,
not just "the files exist":

1. Manifest link resolves and parses: `name`, 3 icon entries, `display: "standalone"`,
   `start_url: "./"` all present as expected.
2. `navigator.serviceWorker.getRegistration()` reaches `active.state === "activated"`
   within ~1s of load, scoped to the app root.
3. `caches.open('dsa-study-buddy-v1')` contains the full app shell **plus** the actual
   hashed bundle filenames (`assets/index-*.js`, `assets/index-*.css`) — proving
   stale-while-revalidate opportunistically cached them on first load, not just the
   hand-picked precache list.
4. **The real test:** used CDP's `Network.emulateNetworkConditions` to force the browser
   fully offline (not just "slow"), then navigated again. The app still rendered its real
   title and a populated `#app` root (~9.5KB of DOM), served entirely from the service
   worker cache with zero network available — this is what "installable and offline"
   actually has to mean, not just a manifest existing.

## Verification (v5)

Two layers, both against the real code (not hand-simulation):

1. **Bulk correctness** — `verify/sysdes_verify.mjs` imports the actual `PATTERNS` from
   `src/data/curriculum.ts` and the actual `runTests` from `src/runner.ts` (Node 22's
   `--experimental-strip-types` loads the `.ts` files directly, no build step) and runs every
   `solutions[].code` entry, plus every legacy `solution` field, through the real runner
   against that problem's own `testCases`. Run: `node --experimental-strip-types
   verify/sysdes_verify.mjs`. Result: **7 problems, 15 solution approaches, all pass.**
2. **Headless-Chrome/CDP walkthrough** — same driver pattern as `verify/dsa_verify.mjs`:
   confirmed "System Design Building Blocks" appears in the pattern list, its 6 sub-patterns
   and 7 problem links render, opening Top-K Frequent Items and clicking "Show solution"
   renders all 3 approaches in fastest-to-slowest order with correct complexity labels, and
   pasting the fastest approach's own code into the editor and clicking "Run tests" passes
   both test cases live in the browser — with zero entries in the crash logger throughout.
5. Checked `sessionStorage['dsa_study_buddy_log']` (the app's own crash logger) after the
   whole flow: `null` — zero errors, same crash-visibility standard as v1-v3.

## Verification (v6)

Two headless-Chrome/CDP walkthroughs, 31 checks total, all pass:

1. **Initial wiring pass (17 checks)**, run when only JavaScript was seeded: sidebar shows the
   new "Language & Framework Reference" entry; `#/reference` lists all 12 language/framework
   cards including JavaScript and Ruby; a then-stub language (Python) rendered its title plus a
   coming-soon message pointing at the buddy panel instead of a dead page; `#/reference/javascript`
   rendered all 10 categories, 108 items, all 3 level badges, the first item's name, and at
   least one example snippet; the buddy panel still rendered alongside the reference page; the
   breadcrumb linked back to the picker; crash log stayed empty.
2. **Full-content pass (14 checks)**, run after all 12 languages were authored: navigated into
   every single language/framework page and confirmed each renders a real title, a non-zero
   `.ref-item` count, and no `.coming-soon` stub marker; confirmed zero `.pattern-card--stub`
   cards remain on the picker (all 12 seeded, none still a placeholder); crash log stayed empty.

## Verification (v7)

Headless-Chrome/CDP walkthrough, 13 checks, all pass:

1. `#/concepts` renders the "Caching" term as a link (not plain text), and exactly 3 terms
   (Caching, Edge Caching, Cache Invalidation) link to the same deep dive.
2. `#/concepts/caching` renders the title, a breadcrumb back to `#/concepts`, and all 11
   strategies — confirmed by counting `.deepdive-strategy` nodes, not assuming the array length.
3. All 11 diagrams and all 11 code panels render with real (>10 char) content, not empty
   placeholders.
4. Spot-checked specific content, not just counts: the first strategy is Cache-Aside, and the
   LRU eviction strategy's description actually cross-references this app's own LRU Cache
   problem (confirms the cross-link text landed, not just that *a* description exists).
5. An unknown deep-dive id (`#/concepts/does-not-exist`) shows a not-found message instead of
   throwing — same "never crash silently" guarantee as the rest of the app.
6. Crash log stayed empty across the whole walkthrough.

## Verification (v8)

Two separate headless-Chrome/CDP passes, run against fresh preview servers + Chrome profiles to
avoid stale-`localStorage` false negatives:

**Solved-code persistence (10 checks):** loaded the Two Sum problem, revealed and ran the real
reference solution (not a hand-typed guess), confirmed all tests passed, confirmed the code
saved under the correct key (`dsa_study_buddy_solutions_v1["hash-two-sum"]`) and matches exactly
what ran — then, the actual point of the change, did a full `Page.reload()` (fresh JS context,
not just a route change) and confirmed the saved code was still there. Also confirmed the
existing solved/unsolved boolean (`progress.ts`) still works unchanged, an unsolved problem has
no entry, and the crash log stayed empty.

**Five new deep dives (31 checks):** confirmed 9 glossary terms now render as links (not plain
text) across the 6 deep dives; for each of the 5 new pages (`rate-limiting`, `load-balancing`,
`sharding`, `replication`, `consistency-models`) confirmed the title, the exact strategy count,
and that every diagram/code panel has real (>10 char) content — counted via DOM queries, not
assumed from the source array length. Spot-checked exact strategy name lists for two of the five
pages against the authored content. Confirmed the original 11-strategy caching deep dive was
unaffected (no regression) and the breadcrumb still links back to `#/concepts`. Crash log stayed
empty.

## Verification (v9)

Two CDP passes, both stubbing `window.fetch` inside an isolated browser context — no real
network call, no real token, ever:

**`verify/export_github_verify.mjs` (7 checks, logic-level):** all-new-files create correctly;
an explicit branch skips the default-branch lookup call entirely; an existing file is updated
with its fetched sha while a genuinely-new file in the same push is still created (not
skipped); one file's request failing doesn't stop the rest of the batch from completing; a
missing/inaccessible repo throws before any per-file call is attempted; a UTF-8 string with
accented characters, a checkmark, and an em-dash round-trips exactly through the
base64 encode/decode.

**`verify/export_ui_verify.mjs` (6 checks, real DOM):** the export page starts with the push
button disabled and no problems solved; seeding a solved problem (via direct module import, no
editor UI involved) enables the button; filling the form and clicking Push triggers the
requests in the correct order (repo lookup → per-file sha checks → PUT); the resulting status
panel shows success with no error styling and lists both pushed files by name; the entered PAT
persists across the flow and "Forget saved token" actually clears it from `localStorage`.

Re-run against the live dev server and the current working-tree code (not just trusted from a
prior run): both scripts reported `allGreen: true`. Not yet done: a real (non-stubbed) push to
an actual GitHub test repo — the stubbed-fetch level is what's verified so far.

## Notes

- No network calls beyond `localhost` (Ollama), no external dependencies beyond Vite/TypeScript
  tooling and Ollama itself.
- Editor is a plain `<textarea>` for v1 — good enough to write and test short solutions;
  a real code-editor component (syntax highlighting, etc.) is a fair v2+ upgrade if desired.
- Pushed to GitHub: [github.com/rled7/dsa-study-buddy](https://github.com/rled7/dsa-study-buddy)
  (public repo).
